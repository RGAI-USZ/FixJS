function (conf) {

	/**
	* Reference to a internal component instance, saves all the information and configuration properties.
	* @private
	* @name ch.Dropdown#that
	* @type object
	*/
	var that = this;

	conf = ch.clon(conf);
	
	conf.reposition = ch.utils.hasOwn(conf, "reposition") ? conf.reposition : true;
	
	that.conf = conf;

/**
*	Inheritance
*/

	that = ch.navs.call(that);
	that.parent = ch.clon(that);

/**
*  Private Members
*/
	/**
	* Adds keyboard events.
	* @private
	* @function
	* @name ch.Dropdown#shortcuts
	*/
	var shortcuts = function (items) {

		// Keyboard support
		var selected = 0;

		// Item selected by mouseover
		// TODO: It's over keyboard selection and it is generating double selection.
		$.each(items, function (i, e) {
			$(e).bind("mouseenter", function () {
				selected = i;
				items.eq(selected).focus();
			});
		});

		var selectItem = function (arrow, event) {
			that.prevent(event);

			if (selected === (arrow === "bottom" ? items.length - 1 : 0)) { return; }

			items.eq(selected).blur();

			if (arrow === "bottom") { selected += 1; } else { selected -= 1; }
			
			items.eq(selected).focus();
		};
		
		// Arrows
		ch.utils.document.bind(ch.events.KEY.UP_ARROW, function (x, event) { selectItem("up", event); });
		ch.utils.document.bind(ch.events.KEY.DOWN_ARROW, function (x, event) { selectItem("bottom", event); });
	};


/**
*  Protected Members
*/
	/**
	* The component's trigger.
	* @protected
	* @name ch.Dropdown#$trigger
	* @type jQuery
	*/
	that.$trigger = (function () {
		
		var $el = that.$trigger;
		
		if (!that.$element.hasClass("secondary") || !that.$element.hasClass("ch-dropdown-skin")) { $el.addClass("ch-btn-skin ch-btn-small"); }
		
		return $el;
		
	}());

	/**
	* The component's content.
	* @protected
	* @name ch.Dropdown#$content
	* @type jQuery
	*/
	that.$content = (function () {
		
		// jQuery Object
		var $content = that.$content
		// Prevent click on content (except links)
			.bind("click", function(event) {
				if ((event.target || event.srcElement).tagName === "A") {
					that.innerHide();
				}
				event.stopPropagation();
			})
		// WAI-ARIA properties
			.attr({ "role": "menu", "aria-hidden": "true" });
		
		// WAI-ARIA for items into content
		$content.children("a").attr("role", "menuitem");

		// Position
		that.position = ch.positioner({
			"element": $content,
			"context": that.$trigger,
			"points": (conf.points || "lt lb"),
			"offset": "0 -1",
			"reposition": conf.reposition
		});
		
		return $content;
	}());

	/**
	* Shows component's content.
	* @protected
	* @function
	* @name ch.Dropdown#innerShow
	* @returns itself
	*/
	that.innerShow = function (event) {
		
		// Stop propagation
		that.prevent(event);
		
		// Z-index of content
		that.$content.css("z-index", ch.utils.zIndex += 1).attr("aria-hidden", "false");
		
		// Z-index of trigger over content (secondary / skin dropdown)
		if (that.$element.hasClass("secondary") ||??that.$element.hasClass("ch-dropdown-skin")) { that.$trigger.css("z-index", ch.utils.zIndex += 1); }
		
		// Inheritance innerShow
		that.parent.innerShow(event);
		
		// Refresh position
		that.position("refresh");

		// Reset all dropdowns except itself
		$.each(ch.instances.dropdown, function (i, e) { 
			if (e.uid !== that.uid) { e.hide(); }
		});

		// Close events
		ch.utils.document.one("click " + ch.events.KEY.ESC, function () { that.innerHide();??});

		// Keyboard support
		var items = that.$content.find("a");
		// Select first anchor child by default
			items.eq(0).focus();

		if (items.length > 1) { shortcuts(items); };

		return that;
	};

	/**
	* Hides component's content.
	* @protected
	* @function
	* @name ch.Dropdown#innerHide
	* @returns itself
	*/
	that.innerHide = function (event) {

		that.parent.innerHide(event);
		
		that.$content.attr("aria-hidden", "true");

		// Unbind events
		ch.utils.document.unbind(ch.events.KEY.ESC + " " + ch.events.KEY.UP_ARROW + " " + ch.events.KEY.DOWN_ARROW);

		return that;
	};
	
/**
*  Public Members
*/
 
	/**
	* @borrows ch.Object#uid as ch.Menu#uid
	*/	
	
	/**
	* @borrows ch.Object#element as ch.Menu#element
	*/

	/**
	* @borrows ch.Object#type as ch.Menu#type
	*/
	
	/**
	* @borrows ch.Navs#show as ch.Dropdown#type
	*/

	/**
	* @borrows ch.Navs#hide as ch.Dropdown#hide
	*/
	
	/**
	* Positioning configuration.
	* @public
	* @name ch.Dropdown#position
	* @function
	*/
	that["public"].position = that.position;

/** 
*  Default event delegation
*/			

	ch.utils.avoidTextSelection(that.$trigger);
	
	/**
	* Triggers when the component is ready to use (Since 0.8.0).
	* @name ch.Dropdown#ready
	* @event
	* @public
	* @since 0.8.0
	* @exampleDescription Following the first example, using <code>widget</code> as dropdown's instance controller:
	* @example
	* widget.on("ready",function () {
	*	this.show();
	* });
	*/
	setTimeout(function(){ that.trigger("ready")}, 50);

	return that;
}