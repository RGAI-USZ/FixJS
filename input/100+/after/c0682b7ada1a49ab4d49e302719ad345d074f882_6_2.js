function Editor( butter, source, type, parentElement, options ){
    options = options || {};

    var _type = type,
        _dims = DEFAULT_DIMS.slice(),
        _dialog,
        _dialogOptions = {
          url: source,
          parent: parentElement
        },
        _currentTarget,
        _currentTrackEvent,
        _this = this;

    EventManagerWrapper( _this );

    _dims[ 0 ] = options.width || _dims[ 0 ];
    _dims[ 1 ] = options.height || _dims[ 1 ];

    function blinkTarget(){
      if( _currentTarget === butter.currentMedia.target ){
        butter.currentMedia.view.blink();
      }
      else{
        var target = butter.getTargetByType( "elementID", _currentTarget );
        if( target ){
          target.view.blink();
        } //if
      } //if
    }

    function onTrackEventUpdated( e ){
      var popcornData = _currentTrackEvent.popcornOptions;
      if( popcornData.target !== _currentTarget ){
        _currentTarget = popcornData.target;
        blinkTarget();
      } //if
      _dialog.send( "trackeventupdated", _currentTrackEvent.popcornOptions );
    } //onTrackEventUpdated

    function onTrackEventUpdateFailed( e ){
      _dialog.send( "trackeventupdatefailed", e.data );
    } //onTrackEventUpdateFailed

    function onClose(){
      _dialog = null;
      _currentTrackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
      _currentTrackEvent.unlisten( "trackeventupdatefailed", onTrackEventUpdateFailed );
      _this.dispatch( "close" );
    }

    this.open = function( trackEvent ) {
      if( !_dialog ){
        _dialog = new IFrame( _dialogOptions );
      }

      if( !_dialog.closed && _dialog.focus ){
        _dialog.focus();
        return;
      }

      _currentTrackEvent = trackEvent;

      _dialog.open({
        open: function( e ){
          var targets = [],
              media = {
                name: butter.currentMedia.name,
                target: butter.currentMedia.target
              };
          for( var i = 0, l = butter.targets.length; i < l; i++ ) {
            targets.push( butter.targets[ i ].element.id );
          }
          var corn = trackEvent.popcornOptions;
          _dialog.send( "trackeventdata", {
            manifest: Popcorn.manifest[ trackEvent.type ],
            popcornOptions: corn,
            targets: targets,
            media: media
          });
          _currentTarget = corn.target;
          blinkTarget();
          trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
          trackEvent.listen( "trackeventupdatefailed", onTrackEventUpdateFailed );
          _this.dispatch( "open" );
        },
        submit: function( e ){
          var popcornData = e.data.eventData,
              alsoClose = e.data.alsoClose;
          if( popcornData ){
            trackEvent.update( popcornData );
            if( alsoClose ){
              _dialog.close();
            } //if
          } //if
        },
        close: function( e ){
          onClose();
        }
      });
    }; //open

    this.close = function(){
      if( _currentTrackEvent && _dialog ){
        _dialog.close();
      }
    };

    Object.defineProperties( _this, {
      isOpen: {
        enumerable: true,
        get: function(){
          return !!_dialog;
        }
      },
      type: {
        enumerable: true,
        get: function(){
          return _type;
        }
      },
      size: {
        enumerable: true,
        get: function(){
          return { width: _dims[ 0 ], height: _dims[ 1 ] };
        },
        set: function( val ){
          val = val || {};
          _dims[ 0 ] = val.width || _dims[ 0 ];
          _dims[ 1 ] = val.height || _dims[ 1 ];
        }
      }
    });

  }