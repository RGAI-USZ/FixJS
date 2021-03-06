function(
    Backbone, 
    Handlebars,
    Activity,
    Corpus,
    Comment,
    Comments,
    CommentEditView,
    DataList,
    DataLists,
    DataListReadView,
    DatumField,
    DatumFieldEditView,
    DatumState,
    DatumStates,
    DatumStateEditView,
    Permission,
    Permissions,
    PermissionEditView,
    Session,
    Sessions,
    SessionReadView,
    UpdatingCollectionView
) {
  var CorpusEditView = Backbone.View.extend(
  /** @lends CorpusReadFullScreenView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * 
     * @property {String} format Must be set when the CorpusEditView is
     * initialized. Valid values are "centreWell" and
     * "fullscreen" and "leftSide" and "modal"
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS DETAILS init: " + this.el);
      this.changeViewsOfInternalModels();
     
      
      // If the model changes, re-render
      this.model.bind('change', this.showEditable, this);
    },

    /**
     * The underlying model of the CorpusReadFullScreenView is a Corpus.
     */    
    model : Corpus,
   
    /**
     * Events that the CorpusReadFullScreenView is listening to and their handlers.
     */
    events : {
      "click .icon-book": "showReadonly",
      //Add button inserts new Comment
      "click .add-comment" : 'insertNewComment',
    	
      //Add button inserts new Datum State
      "click .add_datum_state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add_datum_field" : 'insertNewDatumField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      
      //corpus menu buttons
      "click .new-datum" : "newDatum",
      "click .new-data-list" : "newDataList",
      "click .new-session" : "newSession",
      "click .new-corpus" : "newCorpus",
      
      //text areas in the edit view
      "blur .corpus-title-input" : "updateTitle",
      "blur .corpus-description-input" : "updateDescription",
        
      "click .save-corpus" : "updatePouch",
      "blur .save-corpus-blur" : "updatePouch"
    },

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    templateFullscreen : Handlebars.templates.corpus_edit_fullscreen,
    
    /**
     * The Handlebars template rendered as the CorpusWellView.
     */
    templateCentreWell : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary
     */
    templateSummary : Handlebars.templates.corpus_summary_edit_embedded,
    
    
    templateNewCorpus : Handlebars.templates.corpus_edit_new_modal,
    /**
     * Renders the CorpusReadFullScreenView and all of its child Views.
     */
    render : function() {
      if (this.format == "centreWell") {
        Utils.debug("CORPUS READ FULLSCREEN render: " + this.el);
        if (this.model != undefined) {
          // Display the CorpusReadFullScreenView
          this.setElement($("#corpus-embedded"));
          $(this.el).html(this.templateCentreWell(this.model.toJSON()));
          
          // Display the CommentEditView
          this.commentEditView.el = this.$('.comments');
          this.commentEditView.render();
          
          // Display the DataListsView
         this.dataListsView.el = this.$('.datalists-updating-collection'); 
         this.dataListsView.render();
          
         // Display the SessionsView
         this.sessionsView.el = this.$('.sessions-updating-collection'); 
         this.sessionsView.render();
         
         // Display the PermissionsView
         this.permissionsView.el = this.$('.permissions-updating-collection');
         this.permissionsView.render();
         
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$('.datum_field_settings');
          this.datumFieldsView.render();
          
          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();
   
        } else {
          Utils.debug("\tCorpus model was undefined.");
        }
      } else if (this.format == "fullscreen") {
        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));

        // Display the CommentEditView
        this.commentEditView.el = this.$('.comments');
        this.commentEditView.render();
        
        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
        
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); //TODO do not use such ambiguous class names, compare this with datum_field_settings below.  there is a highlyily hood that the sesson module will be using the same class name and will overwrite your renders.
        this.sessionsView.render();
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions-updating-collection');
        this.permissionsView.render();

        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

      } else if (this.format == "leftSide"){
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
      }else if (this.format == "modal"){
        this.setElement($("#new-corpus-modal"));
        $(this.el).html(this.templateNewCorpus(this.model.toJSON()));
      }else {
        throw("You have not specified a format that the CorpusEditView can understand.");
      }
        
      return this;
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentEditView     
      this.commentEditView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentEditView,
        childViewTagName     : 'li'
      });
      
      // Create a DataList List
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.get("dataLists"),
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });
      
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.get("permissions"),
        childViewConstructor : PermissionEditView,
        childViewTagName     : 'li',
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      

      //Create a DatumFieldsView     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });
          
      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });
      
    },
    
    updateTitle: function(){
      this.model.set("title",this.$el.find(".corpus-title-input").val());
    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".corpus-description-input").val());
    },
   
    //Functions assoicate with the corpus menu
    newDatum : function() {
      appView.datumsView.newDatum();
      app.router.showDashboard();
    },
    
    newDataList : function() {
      //take the user to the search so they can create a data list using the search feature.
      app.router.showEmbeddedSearch();
    },
    
    newSession : function() {
      $("#new-session-modal").modal("show");
      //Save the current session just in case
      window.app.get("currentSession").save();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.sessionModalView.model = window.app.get("currentSession").clone();
      //Give it a null id so that pouch will save it as a new model.
      //WARNING this might not be a good idea, if you find strange side effects in sessions in the future, it might be due to this way of creating (duplicating) a session.
      window.appView.sessionModalView.model.id = undefined;
      window.appView.sessionModalView.model.rev = undefined;
      window.appView.sessionModalView.model.set("_id", undefined);
      window.appView.sessionModalView.model.set("_rev", undefined);
      window.appView.sessionModalView.render();
    },
    
    newCorpus : function(){
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      window.app.get("corpus").save();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.corpusNewModalView.model = window.app.get("corpus").clone(); //MUST be a new model, other wise it wont save in a new pouch.
      //Give it a null id so that pouch will save it as a new model.
      window.appView.corpusNewModalView.model.id = undefined;
      window.appView.corpusNewModalView.model.rev = undefined;
      window.appView.corpusNewModalView.model.set("_id", undefined);
      //WARNING this might not be a good idea, if you find strange side effects in corpora in the future, it might be due to this way of creating (duplicating) a corpus. However with a corpus it is a good idea to duplicate the permissions and settings so that the user won't have to redo them.
      window.appView.corpusNewModalView.model.set("title", window.app.get("corpus").get("title")+ " copy");
      window.appView.corpusNewModalView.model.set("titleAsUrl", window.app.get("corpus").get("titleAsUrl")+"Copy");
      window.appView.corpusNewModalView.model.set("corpusname", window.app.get("corpus").get("corpusname")+"copy");
      window.appView.corpusNewModalView.model.get("couchConnection").corpusname = window.app.get("corpus").get("corpusname")+"copy";
      window.appView.corpusNewModalView.model.set("description", "Copy of: "+window.app.get("corpus").get("description"));
      window.appView.corpusNewModalView.model.set("dataLists", new DataLists());
      window.appView.corpusNewModalView.model.set("sessions", new Sessions());
      window.appView.corpusNewModalView.render();
    },
      
    

     //Insert functions associate the values chosen with a new
    // model in the collection, adding it to the collection, which in turn
    // triggers a view thats added to
    // the ul
    
    //TODO this function needs to mean "save" ie insert new comment in the db, not add an empty comment on the screen. 
//    this a confusion of the pattern in the datumfilds view where exsting fields are in the  updating collection (just 
//    like extisting comments are in the updating collection) and there is a blank one in the 
//    corpus_edit_embedded corpus_edit_fullscreen handlebars

    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      var m = new Comment({
//        "label" : this.$el.children(".comment_input").val(),
     });
      this.model.get("comments").add(m);
    },
    
    // This the function called by the add button, it adds a new datum field both to the 
    // collection and the model
    insertNewDatumField : function() {
      // Remember if the encryption check box was checked
      var checked = this.$el.find(".add_encrypted").is(':checked') ? "checked" : "";
      
      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_"),
        "encrypted" : checked,
        "help" : this.$el.find(".add_help").val()
      });

      // Add the new DatumField to the Corpus' list for datumFields
      this.model.get("datumFields").add(m);
      
      // Reset the line with the add button
      this.$el.find(".choose_add_field").val("");//.children("option:eq(0)").attr("selected", true);
      this.$el.find(".add_help").val("");
    },
    
    //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewDatumState : function() {
      var m = new DatumField({
        "state" : this.$el.find(".add_input").val(),
        "color" : this.$el.find(".add_color_chooser").val()
      });
      this.model.get("datumStates").add(m);
    },
    resizeSmall : function(){
      window.app.router.showEmbeddedCorpus();
    },
    resizeFullscreen : function(){
      window.app.router.showFullscreenCorpus();
    },
    //This is the function that is  bound to the book button
    showReadonly : function(){
      window.app.router.showReadonlyCorpus();
    },
    //This is the function that is bound to changes
    showEditable :function(){
      //If the model has changed, then change the views of the internal models because they are no longer connected with this corpus's models
      this.changeViewsOfInternalModels();
      window.appView.renderEditableCorpusViews();
    },
    /**
     * saves the current corpus to pouch, if the corpus id doesnt match the
     * corpus in the app, It attempts to save it to to its pouch, and create new
     * session and data lists, and then save them to pouch. The new session and
     * datalist are set to the current ones, but the views are not reloaded yet,
     * then the corpus and session and data lists are saved via the
     * app.storeCurrentDashboardIdsToLocalStorage function. after that the app
     * needs to be reloaded entirely (page refresh), or we can attempt to attach
     * the views to these new models.
     */
    updatePouch : function() {
      Utils.debug("Saving the Corpus");
      var self = this;
      if(this.model.id == undefined){
        this.model.set("corpusname", window.app.get("authentication").get("userPrivate").get("username")
          +"-"+encodeURIComponent(this.model.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")) );
        this.model.get("couchConnection").corpusname = window.app.get("authentication").get("userPrivate").get("username")
          +"-"+encodeURIComponent(this.model.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")) ;
      }
      this.model.changeCorpus(window.app.get("authentication").get("userPrivate").get("username")
          +"-"+encodeURIComponent(this.model.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")), function(){
        self.model.save(null, {
          success : function(model, response) {
            Utils.debug('Corpus save success');
//            try{
              if(window.app.get("corpus").id != model.id){
                //add corpus to user
                model.set("titleAsUrl", encodeURIComponent(model.get("title")));
                window.app.get("authentication").get("userPrivate").get("corpuses").unshift(model.get("couchConnection"));
                window.appView.activityFeedView.model.get("activities").add(
                    new Activity({
                      verb : "added",
                      directobject : "a corpus",
                      indirectobject : "",
                      context : "via Offline App",
                      user: window.app.get("authentication").get("userPublic")
                    }));
                //create the first session and datalist for this corpus.
                var s = new Session({
                  corpusname : model.get("corpusname"),
                  sessionFields : model.get("sessionFields").clone()
                }); //MUST be a new model, other wise it wont save in a new pouch.
                s.get("sessionFields").where({label: "user"})[0].set("value", window.app.get("authentication").get("userPrivate").get("username") );
                s.get("sessionFields").where({label: "consultants"})[0].set("value", "AA");
                s.get("sessionFields").where({label: "goal"})[0].set("value", "To explore the app and try entering/importing data");
                s.get("sessionFields").where({label: "dateSEntered"})[0].set("value", new Date());
                s.get("sessionFields").where({label: "dateElicited"})[0].set("value", "A few months ago, probably on a Monday night.");
                s.set("corpusname", model.get("corpusname"));
                s.changeCorpus(model.get("corpusname"));
                model.get("sessions").add(s);
                app.set("currentSession", s);//TODO this will probably require the appView to reinitialize.
                window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;

                var dl = new DataList({
                  corpusname : model.get("corpusname")}); //MUST be a new model, other wise it wont save in a new pouch.
                dl.set({
                  "title" : "Default Data List",
                  "dateCreated" : (new Date()).toDateString(),
                  "description" : "This is the default data list for this corpus. " +
                    "Any new datum you create is added here. " +
                    "Data lists can be used to create handouts, prepare for sessions with consultants, " +
                    "export to LaTeX, or share with collaborators.",
                  "corpusname" : model.get("corpusname")
                });
                dl.changeCorpus(model.get("corpusname"));
                model.get("dataLists").add(dl);
                window.app.set("currentDataList", dl);
                window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.id;
                window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.id;
                window.app.set("corpus", model);
                window.app.storeCurrentDashboardIdsToLocalStorage(function(){
                  //force the app to reload with the new corpus as the main corpus, this is require dbecause otherwise we cannot garentee that the new models will end up in the right pouches and in the right views will let go of the old models. 
                  //another alternative would be to implement switchSession and switchDataList functions in the appView
                  window.location.redirect("/");
                });
              }
              window.app.set("corpus", model);
              window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.id;
//            }catch(e){
//              Utils.debug("Couldnt save the corpus somewhere"+e);
//            }
            if(this.format == "modal"){
              $("#new-corpus-modal").modal("hide");
              window.app.router.showFullscreenCorpus();
              alert("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
            }
          },
          error : function(e) {
            Alert('Corpus save error' + e);
            if(this.format == "modal"){
              $("#new-corpus-modal").modal("hide");
              window.app.router.showFullscreenCorpus();
              alert("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
            }
          }
        });
      });
    },  
  });

  return CorpusEditView;
}