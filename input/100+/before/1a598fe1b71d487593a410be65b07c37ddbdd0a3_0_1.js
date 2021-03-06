function () {

	var ua = navigator.userAgent.toLowerCase(),

		ie = !!window.ActiveXObject,

		webkit = ua.indexOf("webkit") !== -1,

		gecko = ua.indexOf("gecko") !== -1,

		mobile = typeof orientation !== 'undefined' ? true : false,

		android = ua.indexOf("android") !== -1,

		opera = window.opera;



	L.Browser = {

		ie: ie,

		ie6: ie && !window.XMLHttpRequest,



		webkit: webkit,

		webkit3d: webkit && ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()),



		gecko: gecko,

		gecko3d: gecko && ('MozPerspective' in document.createElement('div').style),



		opera: opera,

		opera3d: opera && ('OTransition' in document.createElement('div').style),



		android: android,

		mobileWebkit: mobile && webkit,

		mobileOpera: mobile && opera,



		mobile: mobile,

		touch: (function () {

			var touchSupported = false,

				startName = 'ontouchstart';



			// WebKit, etc

			if (startName in document.documentElement) {

				return true;

			}



			// Firefox/Gecko

			var e = document.createElement('div');



			// If no support for basic event stuff, unlikely to have touch support

			if (!e.setAttribute || !e.removeAttribute) {

				return false;

			}



			e.setAttribute(startName, 'return;');

			if (typeof e[startName] === 'function') {

				touchSupported = true;

			}



			e.removeAttribute(startName);

			e = null;



			return touchSupported;

		}())

	};

	L.Browser.any3d = !!L.Browser.webkit3d || !!L.Browser.gecko3d || !!L.Browser.opera3d;

		

}