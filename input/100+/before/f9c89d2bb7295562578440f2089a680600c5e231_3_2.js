function( id, pluginOptions ){
    pluginOptions = pluginOptions || {};

    var _id = "plugin" + id,
        _this = this,
        _name = pluginOptions.type,
        _path = pluginOptions.path,
        _manifest = {},
        _type = pluginOptions.type,
        _helper = document.getElementById( _this.type + "-icon" ) ||
                  document.getElementById( "default-icon" );

    // before we try and add the plugins script, make sure we have a path to it and we haven't already included it
    if( _path && !Popcorn.manifest[ _type ] ) {
      var head = document.getElementsByTagName( "HEAD" )[ 0 ],
          script = document.createElement( "script" );

      script.src = _path;
      head.appendChild( script );
    } //if

    Object.defineProperties( this, {
      id: {
        enumerable: true,
        get: function() {
          return _id;
        }
      },
      name: {
        enumerable: true,
        get: function() {
          return _name;
        }
      },
      path: {
        enumerable: true,
        get: function() {
          return _path;
        }
      },
      manifest: {
        enumerable: true,
        get: function() {
          return _manifest;
        },
        set: function( manifest ) {
          _manifest = manifest;
        }
      },
      type: {
        enumerable: true,
        get: function() {
          return _type;
        }
      },
      helper: {
        enumerable: true,
        get: function(){
          return _helper;
        }
      }
    });

    _helper = document.getElementById( _this.type + "-icon" ) || document.getElementById( "default-icon" );
    if( _helper ) { _helper = _helper.cloneNode( false ); }

    this.createElement = function ( butter, pattern ) {
      var pluginElement;
      if ( !pattern ) {
        pluginElement = document.createElement( "span" );
        pluginElement.innerHTML = _this.type + " ";
      }
      else {
        var patternInstance = pattern.replace( /\$type/g, _this.type );
        pluginElement = LangUtils.domFragment( patternInstance );
      }
      pluginElement.id = PLUGIN_ELEMENT_PREFIX + _this.type;
      pluginElement.setAttribute( "data-popcorn-plugin-type", _this.type );
      pluginElement.setAttribute( "data-butter-draggable-type", "plugin" );
      DragNDrop.helper( pluginElement, {
        image: _helper,
        start: function(){
          var targets = butter.targets,
              media = butter.currentMedia;
          media.view.blink();
          for( var i=0, l=targets.length; i<l; ++i ){
            targets[ i ].view.blink();
          }
        },
        stop: function(){
        }
      });
      this.element = pluginElement;
      return pluginElement;
    }; //createElement

  }