function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.Releases = (function() {

    function Releases() {
      this.post_release = __bind(this.post_release, this);

      this.get_release = __bind(this.get_release, this);

      this.get_releases = __bind(this.get_releases, this);

    }

    Releases.prototype.get_releases = function(app, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/releases"
      }, fn);
    };

    Releases.prototype.get_release = function(app, release, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/releases/" + release
      }, fn);
    };

    Releases.prototype.post_release = function(app, release, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/releases",
        query: {
          rollback: release
        }
      }, fn);
    };

    return Releases;

  })();

}