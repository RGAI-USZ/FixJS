function($) {
    
    function fixTitle($ele) {
        if ($ele.attr('title') || typeof($ele.attr('original-title')) != 'string') {
            $ele.attr('original-title', $ele.attr('title') || '').removeAttr('title');
        }
    }
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        fixTitle(this.$element);
    }
    
    Tipsy.prototype = {
        enter: function() {
            var tipsy = this;
            var options = this.options;
            
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        },
        
        leave: function() {
            var tipsy = this;
            var options = this.options;
            
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        },
        
        update: function(){
            this.show(true);
        },
        show: function(isUpdate) {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                
                if(!isUpdate){
                    $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);
                }
                
                var pos = $.extend({}, this.$element.offset());
                
                // Adds SVG support.
                // Modified from https://github.com/logical42/tipsy-svg--for-rails
                if (this.$element[0].nearestViewportElement) {
                    var rect = this.$element[0].getBoundingClientRect();
                    pos.width  = rect.width;
                    pos.height = rect.height;
                } else {
                    pos.width  = this.$element[0].offsetWidth  || 0;
                    pos.height = this.$element[0].offsetHeight || 0;
                }
                
                var tipOffset = this.options.offset,
                    useCorners = this.options.corners,
                    showArrow  = this.options.arrow,
                    actualWidth  = $tip[0].offsetWidth, 
                    actualHeight = $tip[0].offsetHeight;
                
                if(!showArrow){
                    // More or less the padding reserved for the arrow
                    tipOffset -= 4;
                }
                
                function calcPosition(gravity){
                    var tp;
                    switch (gravity.charAt(0)) {
                        case 'n':
                            tp = {top: pos.top + pos.height + tipOffset, left: pos.left + pos.width / 2 - actualWidth / 2};
                            break;
                        case 's':
                            tp = {top: pos.top - actualHeight - tipOffset, left: pos.left + pos.width / 2 - actualWidth / 2};
                            break;
                        case 'e':
                            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - tipOffset};
                            break;
                        case 'w':
                            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + tipOffset};
                            break;
                    }
                    
                    if (gravity.length === 2) {
                        if (gravity.charAt(1) == 'w') {
                            tp.left = useCorners ? 
                                        pos.left + pos.width + tipOffset:
                                        pos.left + pos.width / 2 - 15;
                        } else {
                            tp.left = useCorners ? 
                                        pos.left - actualWidth - tipOffset : 
                                        pos.left + pos.width / 2 - actualWidth + 15;
                        }
                    }
                    
                    return tp;
                }
                
                var gravity = (typeof this.options.gravity == 'function')
                                ? this.options.gravity.call(this.$element[0], {width: actualWidth, height: actualHeight}, calcPosition)
                                : this.options.gravity;
                
                var tp = calcPosition(gravity);
                
                // Add a duplicate w/e char at the end when using corners
                $tip.css(tp).addClass('tipsy-' + gravity + (useCorners && gravity.length > 1 ? gravity.charAt(1) : ''));
                
                if(showArrow){
                    var hideArrow = useCorners && gravity.length === 2;
                    // If corner, hide the arrow, cause arrow styles don't support corners nicely
                    $tip.find('.tipsy-arrow')[hideArrow ? 'hide' : 'show']();
                }
                
                if (this.options.fade && (!isUpdate || !this._prevGravity || (this._prevGravity !== gravity))) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
                
                this._prevGravity = gravity;
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            fixTitle($e);
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>');
                if(this.options.arrow){
                    this.$tip.html('<div class="tipsy-arrow"></div><div class="tipsy-inner"/></div>');
                } else {
                    this.$tip.html('<div class="tipsy-inner"/></div>');
                }
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            return this.data('tipsy')[options]();
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        if(options.arrow == null){
            options.arrow = !options.corners;
        }
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            get(this).enter();
        }
        
        function leave() {
            get(this).leave();
        }
        
        if (!options.live) this.each(function() { get(this); });
        
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn,  enter)
                [binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover',
        corners: false, // use corners in nw, ne and sw, se gravities
        arrow:   null   // show or hide the arrow (default is !corners)
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
}