function() {
	/** @type {Element} */
	var elem = goog.dom.createElement('video');
	/** @type {boolean|!Boolean} */
	var bool = false;

	// IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
	try {
		bool = !!elem.canPlayType;

		if (bool) {
			bool = new Boolean(bool);
			bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
			// Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
			bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');
			bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
		}
	} catch(e) { }

	return !!bool;
}