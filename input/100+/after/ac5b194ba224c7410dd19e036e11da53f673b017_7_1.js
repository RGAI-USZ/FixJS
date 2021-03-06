function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.Logs = (function() {

    function Logs() {
      this.get_logs = __bind(this.get_logs, this);

    }

    Logs.prototype.get_logs = function(app, options, fn) {
      if (fn == null) {
        fn = options;
        options = {};
      }
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/logs",
        query: options
      }, fn);
    };

    return Logs;

  })();

}