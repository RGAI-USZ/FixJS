function( butter, options ){

    options = options || {};

    var _rootElement = Lang.domFragment( HEADER_TEMPLATE ),
        _title,
        _saveButton,
        _sourceButton,
        _shareButton,
        _authButton;

    _title = _rootElement.querySelector(".butter-name");
    _title.innerHTML = options.value( "title" ) || "Popcorn Maker";

    _rootElement = document.body.insertBefore( _rootElement, document.body.firstChild );

    _saveButton = document.getElementById( "butter-header-save" );
    _sourceButton = document.getElementById( "butter-header-source" );
    _shareButton = document.getElementById( "butter-header-share" );
    _authButton = document.getElementById( "butter-header-auth" );

    document.body.classList.add( "butter-header-spacing" );

    _sourceButton.addEventListener( "click", function( e ){

      var exportPackage = {
        html: butter.getHTML(),
        json: butter.exportProject()
      };

      Dialog.spawn( "export", {
        data: exportPackage,
      }).open();

    }, false );

    function authenticationRequired( successCallback, errorCallback ){
      if ( butter.cornfield.authenticated() && successCallback && typeof successCallback === "function" ) {
        successCallback();
        return;
      }

      butter.cornfield.login(function( response ){
        if ( !response.error ) {
          butter.cornfield.list(function( listResponse ) {
            loginDisplay();
            if ( successCallback && typeof successCallback === "function" ) {
              successCallback();
            }
          });
        }
        else{
          showErrorDialog( "There was an error logging in. Please try again." );
          if( errorCallback ){
            errorCallback();
          }
        }
      });
    }

    _authButton.addEventListener( "click", authenticationRequired, false );

    function showErrorDialog( message, callback ){
      var dialog = Dialog.spawn( "error-message", {
        data: message,
        events: {
          cancel: function( e ){
            dialog.close();
            if( callback ){
              callback();
            }
          }
        }
      });
      dialog.open();
    }

    _shareButton.addEventListener( "click", function( e ){
      function publish(){
        butter.cornfield.publish( butter.project.id, function( e ){
          if( e.error !== "okay" ){
            showErrorDialog( "There was a problem saving your project. Please try again." );
            return;
          }
          else{
            var url = e.url;
            Dialog.spawn( "share", {
              data: url
            }).open();
          }
        });
      }

      function prepare(){
        // (Re-)Save first, and publish
        doSave( publish );
      }

      authenticationRequired( prepare );
    }, false );

    function doSave( callback ){

      function execute(){
        butter.project.html = butter.getHTML();
        butter.project.data = butter.exportProject();
        var saveString = JSON.stringify( butter.project, null, 4 );
        butter.ui.loadIndicator.start();
        butter.cornfield.save( butter.project.id, saveString, function( e ){
          butter.ui.loadIndicator.stop();
          if( e.error !== "okay" || !e.project || !e.project._id ){
            showErrorDialog( "There was a problem saving your project. Please try again." );
            return;
          }
          butter.project.id = e.project._id;
          if( callback ){
            callback();
          }
        });
      }

      if( !butter.project.name ){
        var dialog = Dialog.spawn( "save-as", {
          events: {
            submit: function( e ){
              butter.project.name = e.data;
              dialog.close();
              execute();
            }
          }
        });
        dialog.open();
      }
      else{
        execute();
      }
    }

    _saveButton.addEventListener( "click", function( e ){
      authenticationRequired( doSave );
    }, false );

    function doLogout() {
      butter.cornfield.logout( logoutDisplay );
    }

    function loginDisplay() {
      _authButton.removeEventListener( "click", authenticationRequired, false );
      _authButton.innerHTML = "<span class='icon-user'></span> " + butter.cornfield.name();
      _authButton.title = "This is you!";
      _authButton.addEventListener( "click", doLogout, false );
    }

    function logoutDisplay() {
      _authButton.removeEventListener( "click", doLogout, false );
      _authButton.innerHTML = DEFAULT_AUTH_BUTTON_TEXT;
      _authButton.title = DEFAULT_AUTH_BUTTON_TITLE;
      _authButton.addEventListener( "click", authenticationRequired, false );
    }

    if ( butter.cornfield.authenticated() ) {
      loginDisplay();
    } else {
      logoutDisplay();
      butter.listen( "autologinsucceeded", function onAutoLoginSucceeded( e ) {
        butter.unlisten( "autologinsucceeded", onAutoLoginSucceeded );
        loginDisplay();
      });
    }

  }