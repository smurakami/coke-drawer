// Generated by CoffeeScript 1.9.2
(function() {
  var Main, dist_threshold, max_radius, min_radius, radius_speed;

  min_radius = 4;

  max_radius = 20;

  radius_speed = 1;

  dist_threshold = 10;

  Main = (function() {
    function Main() {
      this.initCanvas();
      this.initCSS();
      this.touching = false;
      this.pos = {
        x: 0,
        y: 0
      };
      this.prev_pos = {
        x: 0,
        y: 0
      };
      this.radius = min_radius;
      this.prev_radius = min_radius;
      this.force = null;
    }

    Main.prototype.initCanvas = function() {
      var height, width;
      width = $(window).width();
      height = $(window).height();
      this.canvas = $('#main_canvas')[0];
      this.canvas.width = width;
      this.canvas.height = height;
      return this.ctx = this.canvas.getContext('2d');
    };

    Main.prototype.initCSS = function() {
      return $('#erase_button').css('margin-top', -44 - 10);
    };

    Main.prototype.update = function() {
      var dist, dx, dy;
      dx = this.pos.x - this.prev_pos.x;
      dy = this.pos.y - this.prev_pos.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < dist_threshold) {
        this.radius += radius_speed;
      } else {
        this.radius -= radius_speed;
      }
      if (this.radius > max_radius) {
        this.radius = max_radius;
      }
      if (this.radius < min_radius) {
        return this.radius = min_radius;
      }
    };

    Main.prototype.draw = function() {
      var dist, dx, dy, ux, uy;
      if (!this.touching) {
        return;
      }
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.moveTo(this.pos.x, this.pos.y);
      this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
      this.ctx.fill();
      dx = this.pos.x - this.prev_pos.x;
      dy = this.pos.y - this.prev_pos.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      ux = -dy / dist;
      uy = dx / dist;
      this.ctx.beginPath();
      this.ctx.moveTo(this.prev_pos.x + ux * this.prev_radius, this.prev_pos.y + uy * this.prev_radius);
      this.ctx.lineTo(this.pos.x + ux * this.radius, this.pos.y + uy * this.radius);
      this.ctx.lineTo(this.pos.x - ux * this.radius, this.pos.y - uy * this.radius);
      this.ctx.lineTo(this.prev_pos.x - ux * this.prev_radius, this.prev_pos.y - uy * this.prev_radius);
      this.ctx.lineTo(this.prev_pos.x + ux * this.prev_radius, this.prev_pos.y + uy * this.prev_radius);
      this.ctx.fill();
      this.prev_pos = {
        x: this.pos.x,
        y: this.pos.y
      };
      return this.prev_radius = this.radius;
    };

    Main.prototype.erase = function() {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    Main.prototype.touchStart = function(e) {
      this.pos.x = e.pageX;
      this.pos.y = e.pageY;
      this.prev_pos = {
        x: this.pos.x,
        y: this.pos.y
      };
      this.touching = true;
      this.force = e.force;
      return this.radius = min_radius;
    };

    Main.prototype.touchMove = function(e) {
      this.pos.x = e.pageX;
      this.pos.y = e.pageY;
      return this.force = e.force;
    };

    Main.prototype.touchEnd = function(e) {
      return this.touching = false;
    };

    return Main;

  })();

  $(function() {
    var _loop, app, convert;
    app = new Main();
    $('#main_canvas').bind('touchstart', function(e) {
      e = convert(e);
      app.touchStart(e);
      return e.preventDefault();
    });
    $('#main_canvas').bind('mousedown', function(e) {
      e = convert(e);
      app.touchStart(e);
      return e.preventDefault();
    });
    $('#main_canvas').bind('touchmove', function(e) {
      e = convert(e);
      console.log(e.force);
      app.touchMove(e);
      return e.preventDefault();
    });
    $('#main_canvas').bind('mousemove', function(e) {
      return app.touchMove(e);
    });
    $('#main_canvas').bind('touchend', function(e) {
      return app.touchEnd(e);
    });
    $('#main_canvas').bind('mouseup', function(e) {
      return app.touchEnd(e);
    });
    $('#erase_button').click(function() {
      return app.erase();
    });
    convert = function(e) {
      if (!e.pageX) {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        e.force = e.originalEvent.changedTouches[0].force;
      } else {
        e.force = null;
      }
      return e;
    };
    _loop = function() {
      app.update();
      app.draw();
      return setTimeout(_loop, 33);
    };
    return _loop();
  });

}).call(this);
