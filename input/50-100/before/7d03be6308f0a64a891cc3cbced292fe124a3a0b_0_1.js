function(Backbone, Activity) {
  var Activities = Backbone.Collection.extend(
  /** @lends Activities.prototype */
  {
    /**
     * @class The Activity Collection is used by the activity feed to keep track
     *        of activities. It is also in every user generic to keep track of
     *        their activities. It is primarily housed on an external server. It
     *        allows users to go back in time and see track their team's
     *        actions.
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        // TODO Handle validation errors
      });

      
      model : Activity;

    },

  //  model : Activity


  });

  return Activities;
}