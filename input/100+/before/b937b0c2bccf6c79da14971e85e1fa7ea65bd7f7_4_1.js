function(
    App,
    AppView,
    AppRouter,
    Corpus,
    DataList,
    Datum,
    Session,
    User,
    UserWelcomeView,
    Handlebars,
    compiledTemplates,
    Backbone,
    forcingpouchtoloadonbackboneearly
) {
  
  
  /**
   * This function is the only place that starts the app, notably the app view and app router. 
   * It is called either by the main.js or by the UserWelcomeView.js
   */
  window.startApp = function(a, callback){
    window.app = a;

    // Create and display the AppView and its dependents
    window.appView = new AppView({model: a}); 
    window.appView.render();
    
    // Start the Router
    app.router = new AppRouter();
    Backbone.history.start();
    
    if(typeof callback == "function"){
      callback();
    }
    
  };
  /*
   * Start the pub sub hub
   */
  window.hub = {};
  Utils.makePublisher(window.hub);
  
  /*
   * Clear the app completely
   * TODO this doesnt work any more because each corpus is in a different pouch.
   */
//  Pouch.destroy('idb://db');
//  Pouch.destroy('idb://dbdefault');
//    Pouch.destroy('idb://dbsapir-firstcorpus');
//    localStorage.clear();
//  localStorage.removeItem("appids");
//  localStorage.removeItem("corpusname");
//  ids.corpusid = "4C1A0D9F-D548-491D-AEE5-19028ED85F2B";
//  ids.sessionid = "1423B167-D728-4315-80DE-A10D28D8C4AE";
//  ids.datalistid = "1C1F1187-329F-4473-BBC9-3B15D01D6A11";
  
  // Load the App from localStorage
  var appjson = localStorage.getItem("appids");
  if (appjson) {
    Utils.debug("Loading app from localStorage");
    appjson = JSON.parse(appjson);
    a = new App(); 
    var corpusname = null;
    var couchConnection = null;
    if(localStorage.getItem("mostRecentCouchConnection")){
      corpusname = JSON.parse(localStorage.getItem("mostRecentCouchConnection")).corpusname;
      couchConnection = JSON.parse(localStorage.getItem("mostRecentCouchConnection"));
    }
    a.createAppBackboneObjects(corpusname ,function(){
      a.loadBackboneObjectsById(couchConnection, appjson, function(){
        window.startApp(a);
      });
    });
  } else {
    Utils.debug("Loading fresh app");
    $(".testcss").html("changing it dynamically");
    // Create a UserWelcomeView modal
    var welcomeUserView = new UserWelcomeView();
    welcomeUserView.render();
    $('#user-welcome-modal').modal("show");
  }
  
}