// Generated by CoffeeScript 1.9.2
(function() {
  var Bubble, BubbleComponent, Main, ShadowWave, SharedInfo, Wave, WaveComponent, __TIMER;

  SharedInfo = {
    gravity: {
      x: 0,
      y: -10,
      z: 0
    },
    accel: {
      x: 0,
      y: 0,
      z: 0
    },
    wave_height: 0.85
  };

  window.SharedInfo = SharedInfo;

  WaveComponent = (function() {
    function WaveComponent() {
      this.y = 0;
      this.a = 0;
      this.v = 0;
      this.next = null;
      this.prev = null;
    }

    WaveComponent.prototype.connect = function(prev, next) {
      this.prev = prev;
      return this.next = next;
    };

    WaveComponent.prototype.update = function() {
      var friction, k_b, k_u;
      k_u = 1.0;
      k_b = 0.1;
      friction = 0.12;
      this.a = -this.y * k_u - this.v * friction;
      if (this.prev) {
        this.a -= (this.y - this.prev.y) * k_b;
      }
      if (this.next) {
        this.a -= (this.y - this.next.y) * k_b;
      }
      this.v += this.a;
      return this.y += this.v;
    };

    return WaveComponent;

  })();

  Wave = (function() {
    function Wave(canvas, ctx) {
      var i, wave_len;
      wave_len = 7;
      this.array = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = wave_len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(new WaveComponent);
        }
        return results;
      })();
      this.connectWaveComponents();
      this.canvas = canvas;
      this.ctx = ctx;
      this.fillStyle = "#E6040A";
    }

    Wave.prototype.connectWaveComponents = function() {
      var i, j, next, prev, ref, results;
      results = [];
      for (i = j = 0, ref = this.array.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        prev = next = null;
        if (i !== 0) {
          prev = this.array[i - 1];
        }
        if (i !== this.array.length - 1) {
          next = this.array[i + 1];
        }
        results.push(this.array[i].connect(prev, next));
      }
      return results;
    };

    Wave.prototype.update = function() {
      this.giveAccel(SharedInfo.accel);
      return this.array.map(function(c) {
        return c.update();
      });
    };

    Wave.prototype.draw = function() {
      var c, cp1_x, cp1_y, cp2_x, cp2_y, cp_len, defalult_y, delta_x, gravity, i, j, k, len, margin, next_y, prev_y, ref, ref1, size, theta_array, x, y;
      gravity = SharedInfo.gravity;
      this.ctx.lineWidth = 2;
      this.ctx.fillStyle = this.fillStyle;
      size = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2));
      margin = (size - this.canvas.width) / 2;
      defalult_y = this.canvas.height * (1 - SharedInfo.wave_height);
      this.ctx.beginPath();
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate(Math.atan2(-gravity.x, -gravity.y));
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
      delta_x = size / (this.array.length - 1);
      theta_array = [];
      ref = this.array;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        prev_y = next_y = c.y;
        if (c.prev) {
          prev_y = c.prev.y;
        }
        if (c.next) {
          next_y = c.next.y;
        }
        theta_array.push(Math.atan2(next_y - prev_y, delta_x));
      }
      cp_len = delta_x * 0.5;
      for (i = k = 0, ref1 = this.array.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        c = this.array[i];
        x = delta_x * i - margin;
        y = this.array[i].y + defalult_y;
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          cp1_x = x - delta_x + Math.cos(theta_array[i - 1]) * cp_len;
          cp1_y = c.prev.y + defalult_y + Math.sin(theta_array[i - 1]) * cp_len;
          cp2_x = x - Math.cos(theta_array[i]) * cp_len;
          cp2_y = y - Math.sin(theta_array[i]) * cp_len;
          this.ctx.bezierCurveTo(cp1_x, cp1_y, cp2_x, cp2_y, x, y);
        }
      }
      this.ctx.lineTo(this.canvas.width + margin, this.canvas.height + margin);
      this.ctx.lineTo(-margin, this.canvas.height + margin);
      this.ctx.closePath();
      this.ctx.fill();
      return this.ctx.restore();
    };

    Wave.prototype.giveAccel = function(accel) {
      var a;
      a = 8;
      if (accel.x > 0) {
        return this.givePulse(0, a * accel.x);
      } else {
        return this.givePulse(-1, a * -accel.x);
      }
    };

    Wave.prototype.givePulse = function(i, v) {
      while (i < 0) {
        i += this.array.length;
      }
      return this.array[i].v = v;
    };

    return Wave;

  })();

  ShadowWave = (function() {
    function ShadowWave(canvas, ctx, wave) {
      var _, delay, i;
      delay = 10;
      this.wave = wave;
      this.queue_array = (function() {
        var j, len, ref, results;
        ref = wave.array;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          _ = ref[j];
          results.push((function() {
            var k, ref1, results1;
            results1 = [];
            for (i = k = 0, ref1 = delay; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
              results1.push(0);
            }
            return results1;
          })());
        }
        return results;
      })();
      this.y_array = (function() {
        var j, len, ref, results;
        ref = wave.array;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          _ = ref[j];
          results.push(0);
        }
        return results;
      })();
      this.canvas = canvas;
      this.ctx = ctx;
      this.fillStyle = "white";
    }

    ShadowWave.prototype.update = function() {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = this.queue_array.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.queue_array[i].push(this.wave.array[i].y);
        results.push(this.y_array[i] = this.queue_array[i].shift());
      }
      return results;
    };

    ShadowWave.prototype.draw = function() {
      var c, cp1_x, cp1_y, cp2_x, cp2_y, cp_len, defalult_y, delta_x, gravity, i, j, k, len, margin, next_y, prev_y, ref, ref1, size, theta_array, x, y;
      gravity = SharedInfo.gravity;
      this.ctx.lineWidth = 2;
      this.ctx.fillStyle = this.fillStyle;
      size = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2));
      margin = (size - this.canvas.width) / 2;
      defalult_y = this.canvas.height * (1 - SharedInfo.wave_height) - 10;
      this.ctx.beginPath();
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate(Math.atan2(-gravity.x, -gravity.y));
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
      delta_x = size / (this.y_array.length - 1);
      theta_array = [];
      ref = this.y_array;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        y = ref[i];
        prev_y = next_y = y;
        if (i > 0) {
          prev_y = this.y_array[i - 1];
        }
        if (i < this.y_array.length - 1) {
          next_y = this.y_array[i + 1];
        }
        theta_array.push(Math.atan2(next_y - prev_y, delta_x));
      }
      cp_len = delta_x * 0.5;
      for (i = k = 0, ref1 = this.y_array.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        c = this.y_array[i];
        x = delta_x * i - margin;
        y = this.y_array[i] + defalult_y;
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          cp1_x = x - delta_x + Math.cos(theta_array[i - 1]) * cp_len;
          cp1_y = this.y_array[i - 1] + defalult_y + Math.sin(theta_array[i - 1]) * cp_len;
          cp2_x = x - Math.cos(theta_array[i]) * cp_len;
          cp2_y = y - Math.sin(theta_array[i]) * cp_len;
          this.ctx.bezierCurveTo(cp1_x, cp1_y, cp2_x, cp2_y, x, y);
        }
      }
      this.ctx.lineTo(this.canvas.width + margin, this.canvas.height + margin);
      this.ctx.lineTo(-margin, this.canvas.height + margin);
      this.ctx.closePath();
      this.ctx.fill();
      return this.ctx.restore();
    };

    return ShadowWave;

  })();

  BubbleComponent = (function() {
    function BubbleComponent() {
      this.init();
      this.y = Math.random();
      this.hidden = true;
    }

    BubbleComponent.prototype.init = function() {
      this.x = Math.random();
      this.x_wave = 0;
      this.y = 0;
      this.vx = (Math.random() - 0.5) * 0.01;
      this.vy = 0.001 * (1 + Math.random());
      this.size = 5 + Math.random() * 2.5;
      this.counter = Math.floor(Math.random() * 1000);
      this.amp = 0.005;
      return this.hidden = SharedInfo.wave_height < 0.3;
    };

    BubbleComponent.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.x_wave = this.amp * Math.sin(this.counter * 1.0);
      this.vy += 0.001;
      if (this.x > 1) {
        this.x -= 1;
      }
      if (this.x < 0) {
        this.x += 1;
      }
      if (this.y > 1) {
        this.init();
      }
      return this.counter++;
    };

    return BubbleComponent;

  })();

  Bubble = (function() {
    function Bubble(canvas, ctx) {
      var bubble_num, i;
      this.canvas = canvas;
      this.ctx = ctx;
      bubble_num = 40;
      this.array = (function() {
        var j, results;
        results = [];
        for (i = j = 0; j < 20; i = ++j) {
          results.push(new BubbleComponent);
        }
        return results;
      })();
      this.fillStyle = "rgba(255, 255, 255, 0.2)";
      this.strokeStyle = "rgba(255, 255, 255, 0.7)";
    }

    Bubble.prototype.update = function() {
      return this.array.map(function(c) {
        return c.update();
      });
    };

    Bubble.prototype.draw = function() {
      var c, i, j, margin, ref, size, x, y;
      size = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2));
      margin = (size - this.canvas.width) / 2;
      this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate(Math.atan2(-SharedInfo.gravity.x, -SharedInfo.gravity.y));
      this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
      this.ctx.lineWidth = 1;
      this.ctx.fillStyle = this.fillStyle;
      this.ctx.strokeStyle = this.strokeStyle;
      for (i = j = 0, ref = this.array.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.array[i].hidden) {
          continue;
        }
        c = this.array[i];
        x = (c.x + c.x_wave) * size - margin;
        y = this.canvas.height * (1 - SharedInfo.wave_height * c.y);
        this.ctx.beginPath();
        this.ctx.arc(x, y, c.size, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();
      }
      return this.ctx.restore();
    };

    return Bubble;

  })();

  Main = (function() {
    function Main() {
      this.initCanvas();
      this.wave = new Wave(this.canvas, this.ctx);
      this.shadow = new ShadowWave(this.canvas, this.ctx, this.wave);
      this.bubble = new Bubble(this.canvas, this.ctx);
      this.counter = 0;
      this.draw_bubble = true;
      this.arrow_gravity = true;
    }

    Main.prototype.initCanvas = function() {
      var c, ctx;
      c = document.getElementById("wave_canvas");
      c.width = $(window).width();
      if (window.location.href.match(/\/profile\/edit$/)) {
        c.height = $(window).height();
      } else {
        c.height = screen.height;
      }
      $('#wave_canvas').css('width', c.width);
      $('#wave_canvas').css('height', c.height);
      ctx = c.getContext("2d");
      this.canvas = c;
      return this.ctx = ctx;
    };

    Main.prototype.update = function() {
      var pos;
      this.wave.update();
      if (this.draw_bubble) {
        this.bubble.update();
      }
      this.shadow.update();
      this.counter += 1;
      if (this.counter % 10 === 0) {
        pos = Math.floor(this.wave.array.length * Math.random());
        return this.wave.givePulse(pos, 10);
      }
    };

    Main.prototype.draw = function() {
      this.ctx.fillStyle = '#E6040A';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.shadow.draw();
      this.wave.draw();
      if (this.draw_bubble) {
        return this.bubble.draw();
      }
    };

    Main.prototype.devicemotionHandler = function(event) {
      var gravity;
      SharedInfo.accel.x = event.acceleration.x;
      SharedInfo.accel.y = event.acceleration.y;
      SharedInfo.accel.z = event.acceleration.z;
      if (window.wave_canvas.arrow_gravity) {
        gravity = {
          x: 0,
          y: 0,
          z: 0
        };
        gravity.x = event.accelerationIncludingGravity.x - SharedInfo.accel.x;
        gravity.y = event.accelerationIncludingGravity.y - SharedInfo.accel.y;
        gravity.z = event.accelerationIncludingGravity.z - SharedInfo.accel.z;
        gravity.y -= Math.abs(gravity.z);
      } else {
        gravity = {
          x: 0,
          y: -10,
          z: 0
        };
      }
      if (gravity.x !== 0 && gravity.y !== 0 && gravity.z !== 0) {
        return SharedInfo.gravity = gravity;
      }
    };

    Main.prototype.drawAccel = function() {
      var ctx, h, max, w, x, y, z;
      ctx = this.ctx;
      x = this.accel.x;
      y = this.accel.y;
      z = this.accel.z;
      h = this.canvas.height;
      w = this.canvas.width;
      max = 10;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FF0000";
      ctx.fillStyle = "#FF0000";
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + x / max * w / 2, h / 2 + y / max * h / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2 + x / max * w / 2, h / 2 + y / max * h / 2, 8, 0, 2 * Math.PI, false);
      return ctx.fill();
    };

    return Main;

  })();

  window.myevent = null;

  __TIMER = null;

  $(function() {
    var wave_canvas;
    wave_canvas = new Main;
    window.wave_canvas = wave_canvas;
    window.addEventListener("devicemotion", function(event) {
      return wave_canvas.devicemotionHandler(event);
    });
    return __TIMER = setInterval(function() {
      wave_canvas.update();
      return wave_canvas.draw();
    }, 33);
  });

}).call(this);
