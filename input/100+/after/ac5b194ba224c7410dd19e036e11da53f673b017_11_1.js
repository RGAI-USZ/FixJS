function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.Stacks = (function() {

    function Stacks() {
      this.put_stack = __bind(this.put_stack, this);

      this.get_stack = __bind(this.get_stack, this);

    }

    Stacks.prototype.get_stack = function(app, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/stack"
      }, fn);
    };

    Stacks.prototype.put_stack = function(app, stack, fn) {
      return this.request({
        method: "PUT",
        path: "/apps/" + app + "/stack",
        query: {
          body: stack
        }
      }, fn);
    };

    return Stacks;

  })();

}