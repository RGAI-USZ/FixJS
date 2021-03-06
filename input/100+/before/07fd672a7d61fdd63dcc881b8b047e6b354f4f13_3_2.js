function(
    Backbone,
    Handlebars,
    datumContainerEmbeddedTemplate,
    datumContainerFullscreenTemplate,
    Datum,
    Datums,
    DatumEditView,
    DatumTags,
    UpdatingCollectionView
) {
  var DatumContainerEditView = Backbone.View.extend(
  /** @lends DatumContainerEditView.prototype */
  {
    /**
     * @class The area where Datum appear. The number of datum that appear
     * is in UserPreference.
     * 
     * @property {String} format Valid values are "centreWell" or "fullscreen".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.datums = new Datums();
      
      // Create a DatumTagView
      this.datumsView = new UpdatingCollectionView({
        collection           : this.datums,
        childViewConstructor : DatumEditView,
        childViewTagName     : "li",
        childViewClass       : "well"
      });
      
      this.updateDatums();
      
      // Listen for changes in the number of Datum to display
      app.get("authentication").get("user").get("prefs").bind("change:numVisibleDatum", this.updateDatums, this);
    },
    
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen"
    },
    
    templateEmbedded : Handlebars.compile(datumContainerEmbeddedTemplate),
    
    templateFullscreen : Handlebars.compile(datumContainerFullscreenTemplate),
    
    render : function() {
      if (this.format == "centreWell") {
        // Display the DatumContainerEditView
        this.setElement($("#datums-embedded"));
        $(this.el).html(this.templateEmbedded({}));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".datum-embedded-ul");
        this.datumsView.render();
      } else if (this.format == "fullscreen") {
        // Display the DatumContainerEditView
        this.setElement($("#datum-container-fullscreen"));
        $(this.el).html(this.templateFullscreen({}));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".datum-embedded-ul");
        this.datumsView.render();
      }
    },
    
    /**
     * Saves the Datum pages (if necessary) after a timeout.
     */
    saveScreen : function() {
      for (var i in this.datumsView._childViews) {
        this.datumsView._childViews[i].saveScreen();
      }
    },
    
    resizeSmall : function() {
      this.format = "centreWell";
      this.render();
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function() {
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenDatumContainer();
    },
    
    updateDatums : function() {
      var previousNumberOfDatum = this.datums.length;
      var nextNumberOfDatum = app.get("authentication").get("user").get("prefs").get("numVisibleDatum");
      
      if (nextNumberOfDatum > previousNumberOfDatum) {
        for (var i = previousNumberOfDatum; i < nextNumberOfDatum; i++) {
          this.datums.add(new Datum({
          datumFields : app.get("corpus").get("datumFields").clone(),
          datumStates : app.get("corpus").get("datumStates").clone(),
          datumTags : new DatumTags()
        }));
        }
      } else if (nextNumberOfDatum < previousNumberOfDatum) {
        for (var i = nextNumberOfDatum; i < previousNumberOfDatum; i++) {
          this.datums.pop();
        }
      }
    }
  });
  
  return DatumContainerEditView;
}