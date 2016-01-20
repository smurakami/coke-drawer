min_radius = 4
max_radius = 20
radius_speed = 1
dist_threshold = 10

class Main
    constructor:  ->
        @initCanvas()
        @touching = false
        @pos = {x: 0, y: 0}
        @prev_pos = {x: 0, y: 0}
        @radius = min_radius
        @prev_radius = min_radius

    initCanvas: ->
        width = $(window).width()
        height = $(window).height()
        @canvas =  $('#main_canvas')[0]
        @canvas.width = width
        @canvas.height = height
        @ctx = @canvas.getContext('2d')

    update: ->
        dx = @pos.x - @prev_pos.x
        dy = @pos.y - @prev_pos.y
        dist = Math.sqrt(dx * dx + dy * dy)
        if dist < dist_threshold
            @radius += radius_speed
        else
            @radius -= radius_speed

        if @radius > max_radius
            @radius = max_radius
        if @radius < min_radius
            @radius = min_radius

    draw: ->
        if not @touching
            return
        @ctx.fillStyle = 'white'
        @ctx.moveTo(@pos.x, @pos.y)
        @ctx.arc(@pos.x, @pos.y, @radius, 0, Math.PI * 2, true)
        @ctx.fill()

        dx = @pos.x - @prev_pos.x
        dy = @pos.y - @prev_pos.y
        dist = Math.sqrt(dx * dx + dy * dy)
        ux = -dy / dist
        uy = dx / dist

        @ctx.moveTo(@prev_pos.x + ux * @prev_radius, @prev_pos.y + uy * @prev_radius)
        @ctx.lineTo(@pos.x + ux * @radius, @pos.y + uy * @radius)
        @ctx.lineTo(@pos.x - ux * @radius, @pos.y - uy * @radius)
        @ctx.lineTo(@prev_pos.x - ux * @prev_radius, @prev_pos.y - uy * @prev_radius)
        @ctx.lineTo(@prev_pos.x + ux * @prev_radius, @prev_pos.y + uy * @prev_radius)
        @ctx.fill()

        @prev_pos = {x: @pos.x, y: @pos.y}
        @prev_radius = @radius

    touchStart: (e) ->
        @pos.x =  e.pageX
        @pos.y = e.pageY
        @prev_pos = {x: @pos.x, y: @pos.y}
        @touching = true
    touchMove: (e) ->
        @pos.x =  e.pageX
        @pos.y = e.pageY
    touchEnd: (e) ->
        @touching = false

$ ->
    app = new Main()
    $('#main_canvas').bind 'touchstart', (e) ->
        app.touchStart(e)
    $('#main_canvas').bind 'mousedown', (e) ->
        app.touchStart(e)
    $('#main_canvas').bind 'touchmove', (e) ->
        app.touchMove(e)
    $('#main_canvas').bind 'mousemove', (e) ->
        app.touchMove(e)
    $('#main_canvas').bind 'touchend', (e) ->
        app.touchEnd(e)
    $('#main_canvas').bind 'mouseup', (e) ->
        app.touchEnd(e)

    _loop = ->
        app.update()
        app.draw()
        setTimeout _loop, 33

    _loop()