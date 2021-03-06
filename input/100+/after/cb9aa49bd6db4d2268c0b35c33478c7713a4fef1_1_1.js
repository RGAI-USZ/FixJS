f	
	function _initUpld(wgt) {
		zWatch.listen({onShow: wgt});
		var v;
		if (v = wgt._upload)
			wgt._uplder = new zul.Upload(wgt, null, v);
	}
	
	function _cleanUpld(wgt) {
		var v;
		if (v = wgt._uplder) {
			zWatch.unlisten({onShow: wgt});
			wgt._uplder = null;
			v.destroy();
		}
	}
	
/**
 * A toolbar button.
 *
 * <p>Non-xul extension: Toolbarbutton supports {@link #getHref}. If {@link #getHref}
 * is not null, the onClick handler is ignored and this element is degenerated
 * to HTML's A tag.
 *
 * <p>Default {@link #getZclass}: z-toolbarbutton.
 */
zul.wgt.Toolbarbutton = zk.$extends(zul.LabelImageWidget, {
	_orient: "horizontal",
	_dir: "normal",
	_mode:"default",
	_checked: false,
	//_tabindex: 0,

	$define: {
		/**
		 * Returns the mode.
		 * @return String
		 */
		/**
		 * Sets the mode. (default/toggle)
		 * @param String mode
		 */
		mode: function(mode) {
			this.rerender();
		},
		/** Returns whether it is checked. (Note:It's only available in toggle mode.)
		 * <p>Default: false.
		 * @return boolean
		 */
		/** Sets whether it is checked. (Note:It's only available in toggle mode.)
		 * @param boolean val
		 */
		checked: function(val) {
			if (this.desktop && this._mode == "toggle")
				jq(this.$n())[val ? 'addClass' : 'removeClass'](this.getZclass() + '-ck');
		},
		/** Returns whether it is disabled.
		 * <p>Default: false.
		 * @return boolean
		 */
		/** Sets whether it is disabled.
		 * @param boolean disabled
		 */
		disabled: [
			//B60-ZK-1176
			// Autodisable should not re-enable when setDisabled(true) is called during onClick 
			function (v, opts) {
		    	if (opts && opts.adbs)
		    		// called from zul.wgt.ADBS.autodisable
		    		this._adbs = true;	// Start autodisabling  
		    	else if (!opts || opts.adbs === undefined)
		    		// called somewhere else (including server-side)
		    		this._adbs = false;	// Stop autodisabling
		    	if (!v) {
		    		if (this._adbs)
		    			// autodisable is still active, enable allowed
		    			this._adbs = false;
		    		else if (opts && !opts.adbs)
		    			// ignore re-enable by autodisable mechanism
		    			return this._disabled;
		    	}
		    	return v;
			}, 
			function () {
				this.rerender(); //bind and unbind
			}
		],
		/** Returns the href that the browser shall jump to, if an user clicks
		 * this button.
		 * <p>Default: null. If null, the button has no function unless you
		 * specify the onClick event listener.
		 * <p>If it is not null, the onClick event won't be sent.
		 * @return String
		 */
		/** Sets the href.
		 * @param String href
		 */
		href: null,
		/** Returns the target frame or window.
		 *
		 * <p>Note: it is useful only if href ({@link #setHref}) is specified
		 * (i.e., use the onClick listener).
		 *
		 * <p>Default: null.
		 * @return String
		 */
		/** Sets the target frame or window.
		 * @param String target the name of the frame or window to hyperlink.
		 */
		target: null,
		/** Returns the direction.
		 * <p>Default: "normal".
		 * @return String
		 */
		/** Sets the direction.
		 * @param String dir either "normal" or "reverse".
		 */
		dir: _zkf = function () {
			this.updateDomContent_();
		},
		/** Returns the orient.
		 * <p>Default: "horizontal".
		 * @return String
		 */
		/** Sets the orient.
		 * @param String orient either "horizontal" or "vertical".
		 */
		orient: _zkf,
		/** Returns the tab order of this component.
		 * <p>Default: -1 (means the same as browser's default).
		 * @return int
		 */
		/** Sets the tab order of this component.
		 * @param int tabindex
		 */
		tabindex: function (v) {
			var n = this.$n();
			if (n) n.tabIndex = v||'';
		},
		/** Returns a list of component IDs that shall be disabled when the user
		 * clicks this button.
		 *
		 * <p>To represent the button itself, the developer can specify <code>self</code>.
		 * For example, 
		 * <pre><code>
		 * button.setId('ok');
		 * wgt.setAutodisable('self,cancel');
		 * </code></pre>
		 * is the same as
		 * <pre><code>
		 * button.setId('ok');
		 * wgt.setAutodisable('ok,cancel');
		 * </code></pre>
		 * that will disable
		 * both the ok and cancel buttons when an user clicks it.
		 *
		 * <p>The button being disabled will be enabled automatically
		 * once the client receives a response from the server.
		 * In other words, the server doesn't notice if a button is disabled
		 * with this method.
		 *
		 * <p>However, if you prefer to enable them later manually, you can
		 * prefix with '+'. For example,
		 * <pre><code>
		 * button.setId('ok');
		 * wgt.setAutodisable('+self,+cancel');
		 * </code></pre>
		 *
		 * <p>Then, you have to enable them manually such as
		 * <pre><code>if (something_happened){
		 *  ok.setDisabled(false);
		 *  cancel.setDisabled(false);
		 *</code></pre>
		 *
		 * <p>Default: null.
		 * @return String
		 */
		/** Sets whether to disable the button after the user clicks it.
		 * @param String autodisable
		 */
		autodisable: null,
		/** Returns non-null if this button is used for file upload, or null otherwise.
		 * Refer to {@link #setUpload} for more details.
		 * @return String
		 */
		/** Sets the JavaScript class at the client to handle the upload if this
		 * button is used for file upload.
		 * <p>Default: null.
		 *
		 * <p>For example, the following example declares a button for file upload:
		 * <pre><code>
		 * button.setLabel('Upload');
		 * button.setUpload('true');
		 * </code></pre>
		 *
		 * <p>If you want to customize the handling of the file upload at
		 * the client, you can specify a JavaScript class when calling
		 * this method:
		 * <code>button.setUpload('foo.Upload');</code>
		 *
		 * <p> Another options for the upload can be specified as follows:
		 *  <pre><code>button.setUpload('true,maxsize=-1,native');</code></pre>
		 *  <ul>
		 *  <li>maxsize: the maximal allowed upload size of the component, in kilobytes, or 
		 * a negative value if no limit.</li>
		 *  <li>native: treating the uploaded file(s) as binary, i.e., not to convert it to
		 * image, audio or text files.</li>
		 *  </ul>
		 *  
		 * @param String upload a JavaScript class to handle the file upload
		 * at the client, or "true" if the default class is used,
		 * or null or "false" to disable the file download (and then
		 * this button behaves like a normal button).
		 */
		upload: function (v) {
			var n = this.$n();
			if (n) {
				_cleanUpld(this);
				if (v && v != 'false' && !this._disabled)
					_initUpld(this);
			}
		}
	},

	// super//
	getZclass: function(){
		var zcls = this._zclass;
		return zcls ? zcls : "z-toolbarbutton";
	},
	getTextNode: function () {
		return this.$n().firstChild.firstChild;
	},
	bind_: function(){
		this.$supers(zul.wgt.Toolbarbutton, 'bind_', arguments);
		if (!this._disabled) {
			var n = this.$n();
			this.domListen_(n, "onFocus", "doFocus_")
				.domListen_(n, "onBlur", "doBlur_");
		}
		if (!this._disabled && this._upload) _initUpld(this);
	},
	unbind_: function(){
		_cleanUpld(this);
		var n = this.$n();
		this.domUnlisten_(n, "onFocus", "doFocus_")
			.domUnlisten_(n, "onBlur", "doBlur_");

		this.$supers(zul.wgt.Toolbarbutton, 'unbind_', arguments);
	},
	domContent_: function(){
		var label = zUtl.encodeXML(this.getLabel()), img = this.getImage();
		if (!img)
			return label;

		img = '<img src="' + img + '" align="absmiddle" />';
		// B50-ZK-640: toolbarbutton with no label will display larger width blur box
		var space = label? "vertical" == this.getOrient() ? '<br/>' : '&nbsp;' : '';
		return this.getDir() == 'reverse' ? label + space + img : img + space + label;
	},
	domClass_: function(no){
		var scls = [this.$supers('domClass_', arguments)], 
			zcls = this.getZclass(),
			nozcls = (!no || !no.zclass);
		
		if (this._disabled && nozcls && zcls) {
				scls.push(' ' , zcls , '-disd');
		}
		
		if(this._mode == "toggle" && this._checked && nozcls && zcls ) {
			scls.push(' ',zcls,'-ck');
		}
		
		return scls.join("");
	},
	domAttrs_: function(no){
		var attr = this.$supers('domAttrs_', arguments),
			v = this.getTabindex();
		if (v)
			attr += ' tabIndex="' + v + '"';
		return attr;
	},
	onShow: function () {
		if (this._uplder)
			this._uplder.sync();
	},
	doClick_: function(evt){
		if (!this._disabled) {
			if (!this._upload)
				zul.wgt.ADBS.autodisable(this);
			this.fireX(evt);
			
			if (!evt.stopped) {
				var href = this._href;
				if (href)
					zUtl.go(href, {target: this._target || (evt.data.ctrlKey ? '_blank' : '')});
				this.$super('doClick_', evt, true);
				
				if (this._mode == "toggle") {
					this.setChecked(!this.isChecked());
					this.fire('onCheck', this.isChecked());
				}
			}
		}
	},
	doMouseOver_: function (evt) {
		if (!this._disabled) {
			jq(this).addClass(this.getZclass() + '-over');
			this.$supers('doMouseOver_', arguments);
		}
	},
	doMouseOut_: function (evt) {
		if (!this._disabled) {
			jq(this).removeClass(this.getZclass() + '-over');
			this.$supers('doMouseOut_', arguments);
		}
	}
});
})();