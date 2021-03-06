function( mw, $ ) {



	/**

	 * Enables javascript modules and pages to target a "interfaces ready" state.

	 *

	 * This is different from jQuery(document).ready() ( jQuery ready is not

	 * friendly with dynamic includes and not friendly with core interface

	 * asynchronous build out. ) This allows core interface components to do async conditional

	 * load calls, and trigger a ready event once the javascript interface build out is complete

	 *

	 * For example making <video> tags on the page have a video api even if the browser

	 * does not support html5 requires dynamic loading that can only happen once the page dom is

	 * ready

	 *

	 * @param {Function}

	 *            callback Function to run once DOM and jQuery are ready

	 */

	// mw.interfacesReadyFlag ( set to true once interfaces are ready )

	mw.interfacesReadyFlag = false;



	mw.ready = function( callback ) {

		if( mw.interfacesReadyFlag  === false ) {

			// Add the callbcak to the onLoad function stack

			$( mw ).bind( 'InterfacesReady', callback );

		} else {

			// If mwReadyFlag is already "true" issue the callback directly:

			callback();

		}

	};

	

	// Check for pre-mwEmbed ready functions

	if( typeof window.preMwEmbedReady != 'undefined'){

		while( window.preMwEmbedReady.length ){

			mw.ready( window.preMwEmbedReady.pop() );

		}

	}

	

	/**

	 * Aliased functions

	 *

	 * Wrap mediaWiki functionality while we port over the libraries

	 */

	window.gM = function(){

		return mw.msg.apply(this, $.makeArray( arguments ) );

	};



	mw.setConfig = function( name, value ){

		mediaWiki.config.set( name, value );

	};

	mw.getConfig = function( name, value ){

		return mediaWiki.config.get( name, value );

	};

	mw.setDefaultConfig = function( name, value ){

		if( mediaWiki.config.get( name ) === null ){

			mediaWiki.config.set( name, value );

		}

	};

	mw.mergeConfig = function( name, value ){

		if( mw.getConfig( name ) != null ){

			var value = $.extend( {}, mw.getConfig( name ), value );

		}

		return mw.setConfig( name, value );

	};

	/**

	 * Set any pre-mwEmbed embed configuration

	 */

	if( typeof window.preMwEmbedConfig != 'undefined') {

		mw.setConfig( window.preMwEmbedConfig );

	}



	

	/**

	 * Aliased load function

	 */

	mw.load = function( resources, callback ){

		mediaWiki.loader.using( resources, callback, function(){

			// failed to load

			mw.log("Failed to load resources:"  + resources );

		});

	};



	/**

	 * legacy support to get the mwEmbed resource path:

	 */

	mw.getMwEmbedPath = function(){

		if ( mediaWiki.config.get( 'wgLoadScript' ) ){

			return mediaWiki.config.get( 'wgLoadScript' ).replace('load.php', '');

		}

		return false;

	};



	/**

	 * Merge in a configuration value:

	 */

	mw.mergeConfig = function( name, value ){

		if( typeof name == 'object' ) {

			$j.each( name, function( inx, val) {

				mw.mergeConfig( inx, val );

			});

			return ;

		}

		var existingValue = mediaWiki.config.get( name );

		if( !existingValue || typeof existingValue == 'string'){

			mw.setConfig( name, value );

			return ;

		}

		if( typeof mediaWiki.config.get( name ) == 'object' ){

			if( $.isArray( existingValue) && $.isArray( value ) ){

				for( var i =0; i <  value.length ; i ++ ){

					existingValue.push( value[i] );

				}

				mw.setConfig( name, $.unique( existingValue ) );

			} else {

				mw.setConfig( name, $.extend( {}, existingValue, value) );

			}

			return ;

		}

	};



	/**

	 * Simple inheritance. We will move to something like 

	 * http://javascriptmvc.com/docs.html#&who=jQuery.Class 

	 * in the near future. This is just a stop gap. 

	 */

	mw.inherit = function( _this, inhertParent ){ 

		for ( var method in inhertParent ) {

			if ( _this[ method ] ) {

				_this['parent_' + method] = inhertParent[method];

			} else {

				_this[ method ] = inhertParent[method];

			}

		}

	};





	/**

	 * Utility Functions

	 */



	/**

	 * Checks if a string is a url ( parsed success by mw.Uri )

	 * @param {String}

	 * 		Url url version to be checked with mw.Uri    

	 */

	mw.isUrl = function( url ){

		try {

			new mw.Uri( url );

			return true;

		} catch ( e ){

			// no error

		}

		return false;

	};

	

	/**

	 * A version comparison utility function Handles version of types

	 * {Major}.{MinorN}.{Patch}

	 *

	 * Note this just handles version numbers not patch letters.

	 *

	 * @param {String}

	 *            minVersion Minimum version needed

	 * @param {String}

	 *            clientVersion Client version to be checked

	 *

	 * @return true if the version is at least of minVersion false if the

	 *         version is less than minVersion

	 */

	mw.versionIsAtLeast = function( minVersion, clientVersion ) {

		var minVersionParts = minVersion.split('.');

		var clientVersionParts = clientVersion.split('.');

		for( var i =0; i < minVersionParts.length; i++ ) {

			if( parseInt( clientVersionParts[i] ) > parseInt( minVersionParts[i] ) ) {

				return true;

			}

			if( parseInt( clientVersionParts[i] ) < parseInt( minVersionParts[i] ) ) {

				return false;

			}

		}

		// Same version:

		return true;

	};





	/**

	 * addLoaderDialog small helper for displaying a loading dialog

	 *

	 * @param {String}

	 *            dialogHtml text Html of the loader msg

	 */

	mw.addLoaderDialog = function( dialogHtml ) {

		if( !dialogHtml ){

			dialogHtml = gM('mwe-loading');

		}

		$dialog = mw.addDialog({

			'title' : dialogHtml,

			'content' : dialogHtml + '<br>' +

				$('<div />')

				.loadingSpinner()

				.html()

		});

		return $dialog;

	};







	/**

	 * Add a dialog window:

	 *

	 * @param {Object} with following keys:

	 *            title: {String} Title string for the dialog

	 *            content: {String} to be inserted in msg box

	 *            buttons: {Object} A button object for the dialog Can be a string

	 *            				for the close button

	 * 			  any jquery.ui.dialog option

	 */

	mw.addDialog = function ( options ) {

		// Remove any other dialog

		$( '#mweDialog' ).remove();



		if( !options){

			options = {};

		}



		// Extend the default options with provided options

		var options = $j.extend({

			'bgiframe': true,

			'draggable': true,

			'resizable': false,

			'modal': true

		}, options );



		if( ! options.title || ! options.content ){

			mw.log("Error: mwEmbed addDialog missing required options ( title, content ) ");

		}



		// Append the dialog div on top:

		$( 'body' ).append(

			$('<div />')

			.attr( {

				'id' : "mweDialog",

				'title' : options.title

			})

			.css({

				'display': 'none'

			})

			.append( options.content )

		);



		// Build the uiRequest

		var uiRequest = [ 'jquery.ui.dialog' ];

		if( options.draggable ){

			uiRequest.push( 'jquery.ui.draggable' );

		}

		if( options.resizable ){

			uiRequest.push( 'jquery.ui.resizable' );

		}



		// Special button string

		if ( typeof options.buttons == 'string' ) {

			var buttonMsg = options.buttons;

			buttons = { };

			options.buttons[ buttonMsg ] = function() {

				$( this ).dialog( 'close' );

			};

		}



		// Load the dialog resources

		mw.load( uiRequest, function() {

			$( '#mweDialog' ).dialog( options );

		} );

		return $( '#mweDialog' );

	};



	/**

	 * Close the loader dialog created with addLoaderDialog

	 */

	mw.closeLoaderDialog = function() {

		$( '#mweDialog' ).dialog( 'destroy' ).remove();

	};



	// An event once mwEmbedSupport is Ready,

	$( mw ).trigger( 'MwEmbedSupportReady' );

	

	// Once interfaces are ready update the mwReadyFlag

	$( mw ).bind( 'InterfacesReady', function(){ mw.interfacesReadyFlag  = true; } );



	// Once the DOM is ready start setting up interfaces

	$( document ).ready( function(){

		$( mw ).triggerQueueCallback( 'SetupInterface', function(){

			// All interfaces have been setup trigger InterfacesReady event

			$( mw ).trigger( 'InterfacesReady' );

		});

	});

	

	/**

	 * Convert Hexadecimal string to HTML color code

	 *

	 * @param {String} Color code in hexadecimal notation

	 */

	mw.getHexColor = function( color ) {

		if( typeof color == 'string' && color.substr(0,2) == "0x" ) {

			return color.replace('0x', '#');

		} else {

			color = parseInt( color );

			color = color.toString(16);

			var len = 6 - color.length;

			if( len > 0 ) {

				var pre = '';

				for( var i=0; i<len; i++) {

					pre += '0';

				}

				color = pre + color;

			}

			return '#' + color;

		}

	};

	

	/*

	 * Send beacon ( used by ads and analytics plugins )

	 * @param {String} Beacon URL to load

	 */

	mw.sendBeaconUrl = function( beaconUrl ){

		var beacon = new Image();

		beacon.src = beaconUrl;

	};



}