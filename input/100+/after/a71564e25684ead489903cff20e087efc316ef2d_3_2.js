function() {

    function setCSRFToken() {
      var element = document.getElementById("csrf_token_id");
      if ( element ) {
        csrf_token = element.value;
      }
    }

    var csrf_token;

    if ( document.readyState === "complete" ) {
      setCSRFToken();
    } else {
      document.addEventListener( "DOMContentLoaded", setCSRFToken, false );
    }

    var XHR = {
      "get": function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = callback;
        xhr.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
        xhr.send(null);
      },
      "post": function(url, data, callback, type) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.onreadystatechange = callback;
        xhr.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
        if ( csrf_token ) {
          xhr.setRequestHeader( "X-CSRFToken", csrf_token );
        }
        if ( !type ) {
          xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
          xhr.send( parameterize( data ));
        } else {
          xhr.setRequestHeader( "Content-Type", type );
          xhr.send( data );
        }
      }
    };

    return XHR;

  }