function( state ){

    if( !__container ){
      __container = document.createElement( "div" );
      __container.id = "butter-modal-container";
      __container.setAttribute( "data-butter-exclude", true );
      document.body.appendChild( __container );
    } //if

    var _element = document.createElement( "div" );

    _element.className = "layer";

    if( state && typeof( state ) === "string" ){
      _element.className += state;
    } //if

    __container.appendChild( _element );

    // need to wait an event-loop cycle to apply this class
    // ow, opacity transition fails to render
    setTimeout( function(){
      _element.className += " fade-in";
    }, 10 );

    this.destroy = function(){
      __container.removeChild( _element );
    }; //destroy

    Object.defineProperties( this, {
      element: {
        enumerable: true,
        get: function(){
          return _element;
        }
      }
    });

  }