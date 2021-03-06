function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.Processes = (function() {

    function Processes() {
      this.put_workers = __bind(this.put_workers, this);

      this.post_ps_stop = __bind(this.post_ps_stop, this);

      this.post_ps_scale = __bind(this.post_ps_scale, this);

      this.post_ps_restart = __bind(this.post_ps_restart, this);

      this.post_ps = __bind(this.post_ps, this);

      this.get_ps = __bind(this.get_ps, this);

    }

    Processes.prototype.get_ps = function(app, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/ps"
      }, fn);
    };

    Processes.prototype.post_ps = function(app, command, attach, fn) {
      if (fn == null) {
        fn = attach;
        attach = false;
      }
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/ps",
        query: {
          attach: attach,
          command: command
        }
      }, fn);
    };

    Processes.prototype.post_ps_restart = function(app, options, fn) {
      if (fn == null) {
        fn = options;
        options = {};
      }
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/ps/restart",
        query: options
      }, fn);
    };

    Processes.prototype.post_ps_scale = function(app, type, quantity, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/ps/scale",
        query: {
          type: type,
          qty: quantity
        }
      }, fn);
    };

    Processes.prototype.post_ps_stop = function(app, options, fn) {
      if (fn == null) {
        fn = options;
        options = {};
      }
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/ps/stop",
        query: options
      }, fn);
    };

    Processes.prototype.put_dynos = function(app, dynos, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/dynos",
        query: {
          dynos: dynos
        }
      }, fn);
    };

    Processes.prototype.put_workers = function(app, workers, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/workers",
        query: {
          workers: workers
        }
      }, fn);
    };

    return Processes;

  })();

}