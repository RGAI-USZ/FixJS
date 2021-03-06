function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.AddOns = (function() {

    function AddOns() {
      this.put_addon = __bind(this.put_addon, this);

      this.post_addon = __bind(this.post_addon, this);

      this.get_addons = __bind(this.get_addons, this);

      this.delete_addon = __bind(this.delete_addon, this);

    }

    AddOns.prototype.delete_addon = function(app, addon, fn) {
      return this.request({
        mathod: "DELETE",
        path: "/apps/" + app + "/addons/" + addon
      }, fn);
    };

    AddOns.prototype.get_addons = function(app, fn) {
      var path;
      if (fn != null) {
        path = "/apps/" + app + "/addons";
      } else {
        fn = app;
        path = "/addons";
      }
      return this.request({
        method: "GET",
        path: path
      }, fn);
    };

    AddOns.prototype.post_addon = function(app, addon, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/addons/" + addon
      }, fn);
    };

    AddOns.prototype.put_addon = function(app, addon, fn) {
      return this.request({
        method: "PUT",
        path: "/apps/" + app + "/addons/" + addon
      }, fn);
    };

    return AddOns;

  })();

}