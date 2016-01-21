# ================================================================
# Usage:
# Place canvas#wave_canvas in background of page
# ================================================================

SharedInfo =
  gravity: {x: 0, y: -10, z: 0}
  accel: {x: 0, y: 0, z: 0}
  wave_height: 0.9

window.SharedInfo = SharedInfo

class WaveComponent
  constructor: ->
    @y = 0
    @a = 0
    @v = 0
    @next = null
    @prev = null
  connect: (prev, next) ->
    @prev = prev
    @next = next
  update: ->
    k_u = 1.0
    k_b = 0.1
    friction = 0.12
    @a = - @y * k_u - @v * friction
    if @prev
      @a -= (@y - @prev.y) * k_b
    if @next
      @a -= (@y - @next.y) * k_b
    @v += @a
    @y += @v

class Wave
  constructor: (canvas, ctx) ->
    wave_len = 7
    @array = (new WaveComponent for i in [0...wave_len])
    @connectWaveComponents()
    @canvas = canvas
    @ctx = ctx
    @fillStyle = "#E6040A"

  connectWaveComponents: ->
    for i in [0...@array.length]
      prev = next = null
      if i != 0
        prev = @array[i - 1]
      if i != @array.length - 1
        next = @array[i + 1]
      @array[i].connect(prev, next)

  update: ->
    @giveAccel(SharedInfo.accel)
    @array.map (c) -> c.update()

  draw: ->
    gravity = SharedInfo.gravity
    @ctx.lineWidth = 2
    @ctx.fillStyle = @fillStyle
    size = Math.sqrt(Math.pow(@canvas.width, 2) + Math.pow(@canvas.height, 2))
    margin = (size - @canvas.width)/2
    defalult_y = @canvas.height * (1 - SharedInfo.wave_height)
    @ctx.beginPath()
    @ctx.save()
    @ctx.translate(@canvas.width/2, @canvas.height/2)
    @ctx.rotate(Math.atan2(-gravity.x, -gravity.y))
    @ctx.translate(-@canvas.width/2, -@canvas.height/2)
    delta_x = size / (@array.length - 1)
    theta_array = []
    for c in @array
      prev_y = next_y = c.y
      if c.prev
        prev_y = c.prev.y
      if c.next
        next_y = c.next.y
      theta_array.push (Math.atan2(next_y - prev_y, delta_x))
    cp_len = delta_x * 0.5

    for i in [0...@array.length]
      c = @array[i]
      x = delta_x * i - margin
      y = @array[i].y + defalult_y
      if i == 0
        @ctx.moveTo(x, y)
      else
        cp1_x = x - delta_x + Math.cos(theta_array[i-1]) * cp_len
        cp1_y = c.prev.y + defalult_y + Math.sin(theta_array[i-1]) * cp_len
        cp2_x = x - Math.cos(theta_array[i]) * cp_len
        cp2_y = y - Math.sin(theta_array[i]) * cp_len

        @ctx.bezierCurveTo(cp1_x, cp1_y, cp2_x, cp2_y, x, y)
    @ctx.lineTo(@canvas.width + margin, @canvas.height + margin)
    @ctx.lineTo(-margin, @canvas.height + margin)
    @ctx.closePath()
    @ctx.fill()
    @ctx.restore()

  giveAccel: (accel) ->
    a = 8
    if accel.x > 0
      @givePulse( 0, a *  accel.x)
    else
      @givePulse(-1, a * -accel.x)

  givePulse: (i, v) ->
    while i < 0
      i += @array.length
    @array[i].v = v

class ShadowWave
  constructor: (canvas, ctx, wave) ->
    delay = 10
    @wave = wave
    @queue_array = ((0 for i in [0...delay]) for _ in wave.array)
    @y_array = (0 for _ in wave.array)
    @canvas = canvas
    @ctx = ctx
    @fillStyle = "white"

  update: ->
    for i in [0...@queue_array.length]
      @queue_array[i].push(@wave.array[i].y)
      @y_array[i] = @queue_array[i].shift()

  draw: ->
    gravity = SharedInfo.gravity
    @ctx.lineWidth = 2
    @ctx.fillStyle = @fillStyle
    size = Math.sqrt(Math.pow(@canvas.width, 2) + Math.pow(@canvas.height, 2))
    margin = (size - @canvas.width)/2
    defalult_y = @canvas.height * (1 - SharedInfo.wave_height) - 10
    @ctx.beginPath()
    @ctx.save()
    @ctx.translate(@canvas.width/2, @canvas.height/2)
    @ctx.rotate(Math.atan2(-gravity.x, -gravity.y))
    @ctx.translate(-@canvas.width/2, -@canvas.height/2)
    delta_x = size / (@y_array.length - 1)
    theta_array = []
    for y, i in @y_array
      prev_y = next_y = y
      if i > 0
        prev_y = @y_array[i - 1]
      if i < @y_array.length - 1
        next_y = @y_array[i + 1]
      theta_array.push (Math.atan2(next_y - prev_y, delta_x))
    cp_len = delta_x * 0.5

    for i in [0...@y_array.length]
      c = @y_array[i]
      x = delta_x * i - margin
      y = @y_array[i] + defalult_y
      if i == 0
        @ctx.moveTo(x, y)
      else
        cp1_x = x - delta_x + Math.cos(theta_array[i-1]) * cp_len
        cp1_y = @y_array[i - 1] + defalult_y + Math.sin(theta_array[i-1]) * cp_len
        cp2_x = x - Math.cos(theta_array[i]) * cp_len
        cp2_y = y - Math.sin(theta_array[i]) * cp_len

        @ctx.bezierCurveTo(cp1_x, cp1_y, cp2_x, cp2_y, x, y)
    @ctx.lineTo(@canvas.width + margin, @canvas.height + margin)
    @ctx.lineTo(-margin, @canvas.height + margin)
    @ctx.closePath()
    @ctx.fill()
    @ctx.restore()


class BubbleComponent
  constructor: ->
    @init()
    @y = Math.random()
    @hidden = true
  init: ->
    @x = Math.random()
    @x_wave = 0
    @y = 0
    @vx = (Math.random() - 0.5) * 0.01
    @vy = 0.001 * (1 + Math.random())
    @size = 5 + Math.random() * 2.5
    @counter = Math.floor(Math.random() * 1000)
    @amp = 0.005
    @hidden = SharedInfo.wave_height < 0.3
  update: ->
    @x += @vx
    @y += @vy
    @x_wave = @amp * Math.sin(@counter * 1.0)
    @vy += 0.001
    if @x > 1
      @x -= 1
    if @x < 0
      @x += 1
    if @y > 1
      @init()
    @counter++

class Bubble
  constructor: (canvas, ctx) ->
    @canvas = canvas
    @ctx = ctx
    bubble_num = 40
    @array = (new BubbleComponent for i in [0...20])
    @fillStyle = "rgba(255, 255, 255, 0.2)"
    @strokeStyle = "rgba(255, 255, 255, 0.7)"
  update: ->
    @array.map (c) -> c.update()
  draw: ->
    size = Math.sqrt(Math.pow(@canvas.width, 2) + Math.pow(@canvas.height, 2))
    margin = (size - @canvas.width)/2
    @ctx.save()
    @ctx.translate(@canvas.width/2, @canvas.height/2)
    @ctx.rotate(Math.atan2(-SharedInfo.gravity.x, -SharedInfo.gravity.y))
    @ctx.translate(-@canvas.width/2, -@canvas.height/2)
    @ctx.lineWidth = 1
    @ctx.fillStyle = @fillStyle
    @ctx.strokeStyle = @strokeStyle
    for i in [0...@array.length]
      if @array[i].hidden
        continue
      c = @array[i]
      x = (c.x + c.x_wave) * size - margin
      y = @canvas.height * (1 - c.y)
      @ctx.beginPath()
      @ctx.arc(x, y,
        c.size, 0, 2 * Math.PI, false)
      @ctx.fill()
      @ctx.stroke()
    @ctx.restore()


class Main
  constructor: ->
    @initCanvas()
    @wave = new Wave(@canvas, @ctx)
    @shadow = new ShadowWave(@canvas, @ctx, @wave)
    @bubble = new Bubble(@canvas, @ctx)
    @counter = 0
    @draw_bubble = true
    @arrow_gravity = true
  initCanvas: ->
    c = document.getElementById("wave_canvas");
    c.width = $(window).width()
    if window.location.href.match(/\/profile\/edit$/)
      # 縦スクロールなし
      c.height = $(window).height()
    else
      c.height = screen.height
    $('#wave_canvas').css('width', c.width)
    $('#wave_canvas').css('height', c.height)
    ctx = c.getContext("2d");
    @canvas = c
    @ctx = ctx

  update: ->
    @wave.update()
    if @draw_bubble
      @bubble.update()
    @shadow.update()
    @counter += 1
    if @counter % 10 == 0
      # make random wave
      pos = Math.floor(@wave.array.length * Math.random())
      @wave.givePulse(pos, 10)

  draw: ->
    @ctx.fillStyle = '#E6040A'
    @ctx.fillRect(0, 0, @canvas.width, @canvas.height)
    @shadow.draw()
    @wave.draw()
    if @draw_bubble
      @bubble.draw()

  devicemotionHandler: (event) ->
    SharedInfo.accel.x = event.acceleration.x
    SharedInfo.accel.y = event.acceleration.y
    SharedInfo.accel.z = event.acceleration.z
    if window.wave_canvas.arrow_gravity
      gravity = {x: 0, y: 0, z: 0}
      gravity.x = event.accelerationIncludingGravity.x - SharedInfo.accel.x
      gravity.y = event.accelerationIncludingGravity.y - SharedInfo.accel.y
      gravity.z = event.accelerationIncludingGravity.z - SharedInfo.accel.z
      gravity.y -= Math.abs(gravity.z)
    else
      gravity = {x: 0, y: -10, z: 0}

    if gravity.x != 0 and gravity.y != 0 and gravity.z != 0
      SharedInfo.gravity = gravity

  drawAccel: ->
    ctx = @ctx
    x = @accel.x
    y = @accel.y
    z = @accel.z
    h = @canvas.height
    w = @canvas.width
    max = 10
    ctx.lineWidth = 2
    ctx.strokeStyle = "#FF0000"
    ctx.fillStyle   = "#FF0000";

    ctx.beginPath()
    ctx.moveTo(w/2, h/2);
    ctx.lineTo(w/2 + x/max * w/2, h/2 + y/max * h/2);
    ctx.stroke();

    ctx.beginPath()
    ctx.arc(
      w/2 + x/max * w/2,
      h/2 + y/max * h/2,
      8, 0, 2 * Math.PI, false)
    ctx.fill()


window.myevent = null

__TIMER = null

$ ->
  wave_canvas = new Main
  window.wave_canvas = wave_canvas

  window.addEventListener "devicemotion", (event) ->
    wave_canvas.devicemotionHandler(event)


  __TIMER = setInterval ->
    wave_canvas.update()
    wave_canvas.draw()
  , 33
