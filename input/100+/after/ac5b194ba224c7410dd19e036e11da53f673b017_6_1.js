function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.Keys = (function() {

    function Keys() {
      this.post_key = __bind(this.post_key, this);

      this.get_keys = __bind(this.get_keys, this);

      this.delete_keys = __bind(this.delete_keys, this);

      this.delete_key = __bind(this.delete_key, this);

    }

    Keys.prototype.delete_key = function(key, fn) {
      return this.request({
        method: "DELETE",
        path: "/user/keys/" + (CGI.escape(key))
      }, fn);
    };

    Keys.prototype.delete_keys = function(fn) {
      return this.request({
        method: "DELETE",
        path: "/user/keys"
      }, fn);
    };

    Keys.prototype.get_keys = function(fn) {
      return this.request({
        method: "GET",
        path: "/user/keys"
      }, fn);
    };

    Keys.prototype.post_key = function(key, fn) {
      return this.request({
        method: "POST",
        path: "/user/keys",
        query: {
          body: key
        }
      }, fn);
    };

    return Keys;

  })();

}