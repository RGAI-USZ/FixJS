function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports.Collaborators = (function() {

    function Collaborators() {
      this.post_collaborator = __bind(this.post_collaborator, this);

      this.get_collaborators = __bind(this.get_collaborators, this);

      this.delete_collaborator = __bind(this.delete_collaborator, this);

    }

    Collaborators.prototype.delete_collaborator = function(app, email, fn) {
      return this.request({
        method: DELETE,
        path: "/apps/" + app + "/collaborators/" + email
      }, fn);
    };

    Collaborators.prototype.get_collaborators = function(app, fn) {
      return this.request({
        method: "GET",
        path: "/apps/" + app + "/collaborators"
      }, fn);
    };

    Collaborators.prototype.post_collaborator = function(app, email, fn) {
      return this.request({
        method: "POST",
        path: "/apps/" + app + "/collaborators",
        expects: 201,
        query: {
          collaborator: {
            email: email
          }
        }
      }, fn);
    };

    return Collaborators;

  })();

}