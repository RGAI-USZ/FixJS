function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.ConfigVars = (function() {

    function ConfigVars() {
      this.put_config_vars = __bind(this.put_config_vars, this);

      this.get_config_vars = __bind(this.get_config_vars, this);

      this.delete_config_var = __bind(this.delete_config_var, this);

    }

    ConfigVars.prototype.delete_config_var = function(app, key, fn) {
      return this.request({
        method: "DELETE",
        path: "/apps/" + app + "/config_vars/" + key
      }, fn);
    };

    ConfigVars.prototype.get_config_vars = function(app, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/config_vars"
      }, fn);
    };

    ConfigVars.prototype.put_config_vars = function(app, vars, fn) {
      return this.request({
        method: "PUT",
        path: "/apps/" + app + "/config_vars",
        query: {
          body: JSON.stringify(vars)
        }
      }, fn);
    };

    return ConfigVars;

  })();

}