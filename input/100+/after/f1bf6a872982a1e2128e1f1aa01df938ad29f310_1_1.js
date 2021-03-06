function(
      Backbone, 
      Handlebars,
      Permission
) {
  var PermissionReadView = Backbone.View.extend(
  /** @lends PermissionEditView.prototype */
  {
    /**
     * @class This is the view of the Permission Model. The Permission combination of a couchdb user, and their corpusspecific role
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("PERMISSION init");
    },
    
    /**
     * The underlying model of the PermissionEditView is a Permission.
     */
    model : Permission,
    
    /**
     * Events that the PermissionEditView is listening to and their handlers.
     */
    events : {
    },

    /**
     * The Handlebars template rendered as the PermissionEditView.
     */
    template : Handlebars.templates.permissions_read_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      Utils.debug("PERMISSION render");
//      var JSONtorender = {};
//      if ( typeof this.model != undefined){
//        JSONtorender.timestamp = this.model.timestamp.toString();
//        JSONtorender.username = this.model.username;
//      }
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updatePermission : function() {
     // this.model.set("value", this.$el.children(".comment_input").val());
    }
  });

  return PermissionReadView;
}