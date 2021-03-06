function() {
  var app_params,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  app_params = function(params) {
    var key, ret, value;
    ret = {};
    for (value in params) {
      key = params[value];
      ret["app[" + key + "]"] = value;
    }
    return ret;
  };

  module.exports.Apps = (function() {

    function Apps() {
      this.post_app_database_reset = __bind(this.post_app_database_reset, this);

      this.put_app = __bind(this.put_app, this);

      this.post_app_server_maintenance = __bind(this.post_app_server_maintenance, this);

      this.post_app = __bind(this.post_app, this);

      this.get_app = __bind(this.get_app, this);

      this.get_apps = __bind(this.get_apps, this);

      this.delete_app = __bind(this.delete_app, this);

    }

    Apps.prototype.delete_app = function(app, fn) {
      return this.request({
        method: "DELETE",
        path: "/apps/" + app
      }, fn);
    };

    Apps.prototype.get_apps = function(fn) {
      return this.request({
        method: "GET",
        path: "/apps"
      }, fn);
    };

    Apps.prototype.get_app = function(app, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app
      }, fn);
    };

    Apps.prototype.post_app = function(params, fn) {
      if (fn == null) {
        fn = params;
        params = {};
      }
      return this.request({
        expects: 202,
        method: "POST",
        path: "/apps",
        query: app_params(params)
      }, fn);
    };

    Apps.prototype.post_app_server_maintenance = function(app, new_server_maintenance, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/server/maintenance",
        query: {
          maintenance_mode: maintenance_mode
        }
      }, fn);
    };

    Apps.prototype.put_app = function(app, params, fn) {
      return this.request({
        method: "PUT",
        path: "/apps/" + app,
        query: app_params(params)
      }, fn);
    };

    Apps.prototype.post_app_database_reset = function(app, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/database/reset",
        query: {}
      }, fn);
    };

    return Apps;

  })();

}