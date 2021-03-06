function($, window, document) {
  "use strict";

  var BROWSER_IS_IE7, BROWSER_SCROLLBAR_WIDTH, DOMSCROLL, DOWN, DRAG, KEYDOWN, KEYS, KEYSTATES, KEYUP, MOUSEDOWN, MOUSEMOVE, MOUSEUP, MOUSEWHEEL, NanoScroll, PANEDOWN, RESIZE, SCROLL, SCROLLBAR, TOUCHMOVE, UP, WHEEL, defaults, getBrowserScrollbarWidth;
  defaults = {
    paneClass: 'pane',
    sliderClass: 'slider',
    sliderMinHeight: 20,
    contentClass: 'content',
    iOSNativeScrolling: false,
    preventPageScrolling: false,
    disableResize: false,
    alwaysVisible: false,
    flashDelay: 1500
  };
  SCROLLBAR = 'scrollbar';
  SCROLL = 'scroll';
  MOUSEDOWN = 'mousedown';
  MOUSEMOVE = 'mousemove';
  MOUSEWHEEL = 'mousewheel';
  MOUSEUP = 'mouseup';
  RESIZE = 'resize';
  DRAG = 'drag';
  UP = 'up';
  PANEDOWN = 'panedown';
  DOMSCROLL = 'DOMMouseScroll';
  DOWN = 'down';
  WHEEL = 'wheel';
  KEYDOWN = 'keydown';
  KEYUP = 'keyup';
  TOUCHMOVE = 'touchmove';
  BROWSER_IS_IE7 = window.navigator.appName === 'Microsoft Internet Explorer' && /msie 7./i.test(window.navigator.appVersion) && window.ActiveXObject;
  BROWSER_SCROLLBAR_WIDTH = null;
  KEYSTATES = {};
  KEYS = {
    up: 38,
    down: 40,
    pgup: 33,
    pgdown: 34,
    home: 36,
    end: 35
  };
  getBrowserScrollbarWidth = function() {
    var outer, outerStyle, scrollbarWidth;
    outer = document.createElement('div');
    outerStyle = outer.style;
    outerStyle.position = 'absolute';
    outerStyle.width = '100px';
    outerStyle.height = '100px';
    outerStyle.overflow = SCROLL;
    outerStyle.top = '-9999px';
    document.body.appendChild(outer);
    scrollbarWidth = outer.offsetWidth - outer.clientWidth;
    document.body.removeChild(outer);
    return scrollbarWidth;
  };
  NanoScroll = (function() {

    function NanoScroll(el, options) {
      this.options = options;
      BROWSER_SCROLLBAR_WIDTH || (BROWSER_SCROLLBAR_WIDTH = getBrowserScrollbarWidth());
      this.el = $(el);
      this.doc = $(document);
      this.win = $(window);
      this.generate();
      this.createEvents();
      this.addEvents();
      this.reset();
    }

    NanoScroll.prototype.preventScrolling = function(e, direction) {
      if (e.type === DOMSCROLL) {
        if (direction === DOWN && e.originalEvent.detail > 0 || direction === UP && e.originalEvent.detail < 0) {
          e.preventDefault();
        }
      } else if (e.type === MOUSEWHEEL) {
        if (!e.originalEvent || !e.originalEvent.wheelDelta) {
          return;
        }
        if (direction === DOWN && e.originalEvent.wheelDelta < 0 || direction === UP && e.originalEvent.wheelDelta > 0) {
          e.preventDefault();
        }
      }
    };

    NanoScroll.prototype.updateScrollValues = function() {
      var content;
      content = this.content[0];
      this.maxScrollTop = content.scrollHeight - content.clientHeight;
      this.contentScrollTop = content.scrollTop;
      this.maxSliderTop = this.paneHeight - this.sliderHeight;
      this.sliderTop = this.contentScrollTop * this.maxSliderTop / this.maxScrollTop;
    };

    NanoScroll.prototype.handleKeyPress = function(key) {
      var percentage, scrollLength, sliderY;
      if (key === KEYS.up || key === KEYS.pgup || key === KEYS.down || key === KEYS.pgdown) {
        scrollLength = key === KEYS.up || key === KEYS.down ? 40 : this.paneHeight * 0.9;
        percentage = scrollLength / (this.contentHeight - this.paneHeight) * 100;
        sliderY = (percentage * this.maxSliderTop) / 100;
        this.sliderY = key === KEYS.up || key === KEYS.pgup ? this.sliderY - sliderY : this.sliderY + sliderY;
        this.scroll();
      } else if (key === KEYS.home || key === KEYS.end) {
        this.sliderY = key === KEYS.home ? 0 : this.maxSliderTop;
        this.scroll();
      }
    };

    NanoScroll.prototype.createEvents = function() {
      var _this = this;
      this.events = {
        down: function(e) {
          _this.isBeingDragged = true;
          _this.offsetY = e.pageY - _this.slider.offset().top;
          _this.pane.addClass('active');
          _this.doc.bind(MOUSEMOVE, _this.events[DRAG]).bind(MOUSEUP, _this.events[UP]);
          return false;
        },
        drag: function(e) {
          _this.sliderY = e.pageY - _this.el.offset().top - _this.offsetY;
          _this.scroll();
          _this.updateScrollValues();
          if (_this.contentScrollTop >= _this.maxScrollTop) {
            _this.el.trigger('scrollend');
          } else if (_this.contentScrollTop === 0) {
            _this.el.trigger('scrolltop');
          }
          return false;
        },
        up: function(e) {
          _this.isBeingDragged = false;
          _this.pane.removeClass('active');
          _this.doc.unbind(MOUSEMOVE, _this.events[DRAG]).unbind(MOUSEUP, _this.events[UP]);
          return false;
        },
        resize: function(e) {
          _this.reset();
        },
        panedown: function(e) {
          _this.sliderY = (e.offsetY || e.originalEvent.layerY) - (_this.sliderHeight * 0.5);
          _this.scroll();
          _this.events.down(e);
          return false;
        },
        scroll: function(e) {
          if (_this.isBeingDragged) {
            return;
          }
          _this.updateScrollValues();
          _this.sliderY = _this.sliderTop;
          _this.slider.css({
            top: _this.sliderTop
          });
          if (e == null) {
            return;
          }
          if (_this.contentScrollTop >= _this.maxScrollTop) {
            if (_this.options.preventPageScrolling) {
              _this.preventScrolling(e, DOWN);
            }
            _this.el.trigger('scrollend');
          } else if (_this.contentScrollTop === 0) {
            if (_this.options.preventPageScrolling) {
              _this.preventScrolling(e, UP);
            }
            _this.el.trigger('scrolltop');
          }
        },
        wheel: function(e) {
          if (e == null) {
            return;
          }
          _this.sliderY += -e.wheelDeltaY || -e.delta;
          _this.scroll();
          return false;
        },
        keydown: function(e) {
          var key;
          if (e == null) {
            return;
          }
          key = e.which;
          if (key === KEYS.up || key === KEYS.pgup || key === KEYS.down || key === KEYS.pgdown || key === KEYS.home || key === KEYS.end) {
            _this.sliderY = isNaN(_this.sliderY) ? 0 : _this.sliderY;
            KEYSTATES[key] = setTimeout(function() {
              _this.handleKeyPress(key);
            }, 100);
            e.preventDefault();
          }
        },
        keyup: function(e) {
          var key;
          if (e == null) {
            return;
          }
          key = e.which;
          _this.handleKeyPress(key);
          if (KEYSTATES[key] != null) {
            clearTimeout(KEYSTATES[key]);
          }
        }
      };
    };

    NanoScroll.prototype.addEvents = function() {
      var events;
      events = this.events;
      if (!this.options.disableResize) {
        this.win.bind(RESIZE, events[RESIZE]);
      }
      this.slider.bind(MOUSEDOWN, events[DOWN]);
      this.pane.bind(MOUSEDOWN, events[PANEDOWN]).bind("" + MOUSEWHEEL + " " + DOMSCROLL, events[WHEEL]);
      this.content.bind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]).bind(KEYDOWN, events[KEYDOWN]).bind(KEYUP, events[KEYUP]);
    };

    NanoScroll.prototype.removeEvents = function() {
      var events;
      events = this.events;
      if (!this.options.disableResize) {
        this.win.unbind(RESIZE, events[RESIZE]);
      }
      this.slider.unbind(MOUSEDOWN, events[DOWN]);
      this.pane.unbind(MOUSEDOWN, events[PANEDOWN]).unbind("" + MOUSEWHEEL + " " + DOMSCROLL, events[WHEEL]);
      this.content.unbind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]).unbind(KEYDOWN, events[KEYDOWN]).unbind(KEYUP, events[KEYUP]);
    };

    NanoScroll.prototype.generate = function() {
      var contentClass, cssRule, options, paneClass, sliderClass;
      options = this.options;
      paneClass = options.paneClass, sliderClass = options.sliderClass, contentClass = options.contentClass;
      this.el.append("<div class=\"" + paneClass + "\"><div class=\"" + sliderClass + "\" /></div>");
      this.content = this.el.children("." + contentClass);
      this.content.attr('tabindex', 0);
      this.slider = this.el.find("." + sliderClass);
      this.pane = this.el.find("." + paneClass);
      if (BROWSER_SCROLLBAR_WIDTH) {
        cssRule = {
          right: -BROWSER_SCROLLBAR_WIDTH
        };
        this.el.addClass('has-scrollbar');
      }
      if (options.iOSNativeScrolling) {
        if (cssRule == null) {
          cssRule = {};
        }
        cssRule.WebkitOverflowScrolling = 'touch';
      }
      if (cssRule != null) {
        this.content.css(cssRule);
      }
      if (options.alwaysVisible) {
        this.pane.css({
          opacity: 1,
          visibility: 'visible'
        });
      }
      return this;
    };

    NanoScroll.prototype.restore = function() {
      this.stopped = false;
      this.pane.show();
      return this.addEvents();
    };

    NanoScroll.prototype.reset = function() {
      var content, contentHeight, contentStyle, contentStyleOverflowY, paneBottom, paneHeight, paneOuterHeight, paneTop, sliderHeight;
      if (!this.el.find("." + this.options.paneClass).length) {
        this.generate().stop();
      }
      if (this.stopped) {
        this.restore();
      }
      content = this.content[0];
      contentStyle = content.style;
      contentStyleOverflowY = contentStyle.overflowY;
      if (BROWSER_IS_IE7) {
        this.content.css({
          height: this.content.height()
        });
      }
      contentHeight = content.scrollHeight + BROWSER_SCROLLBAR_WIDTH;
      paneHeight = this.pane.outerHeight();
      paneTop = parseInt(this.pane.css('top'), 10);
      paneBottom = parseInt(this.pane.css('bottom'), 10);
      paneOuterHeight = paneHeight + paneTop + paneBottom;
      sliderHeight = Math.round(paneOuterHeight / contentHeight * paneOuterHeight);
      sliderHeight = sliderHeight > this.options.sliderMinHeight ? sliderHeight : this.options.sliderMinHeight;
      if (contentStyleOverflowY === SCROLL && contentStyle.overflowX !== SCROLL) {
        sliderHeight += BROWSER_SCROLLBAR_WIDTH;
      }
      this.maxSliderTop = paneOuterHeight - sliderHeight;
      this.contentHeight = contentHeight;
      this.paneHeight = paneHeight;
      this.paneOuterHeight = paneOuterHeight;
      this.sliderHeight = sliderHeight;
      this.slider.height(sliderHeight);
      this.events.scroll();
      this.pane.show();
      if (this.paneOuterHeight >= content.scrollHeight && contentStyleOverflowY !== SCROLL) {
        this.pane.hide();
      } else if (this.el.height() === content.scrollHeight && contentStyleOverflowY === SCROLL) {
        this.slider.hide();
      } else {
        this.slider.show();
      }
      return this;
    };

    NanoScroll.prototype.scroll = function() {
      this.sliderY = Math.max(0, this.sliderY);
      this.sliderY = Math.min(this.maxSliderTop, this.sliderY);
      this.content.scrollTop((this.paneHeight - this.contentHeight + BROWSER_SCROLLBAR_WIDTH) * this.sliderY / this.maxSliderTop * -1);
      this.slider.css({
        top: this.sliderY
      });
      return this;
    };

    NanoScroll.prototype.scrollBottom = function(offsetY) {
      this.reset();
      this.content.scrollTop(this.contentHeight - this.content.height() - offsetY).trigger(MOUSEWHEEL);
      return this;
    };

    NanoScroll.prototype.scrollTop = function(offsetY) {
      this.reset();
      this.content.scrollTop(+offsetY).trigger(MOUSEWHEEL);
      return this;
    };

    NanoScroll.prototype.scrollTo = function(node) {
      var fraction, new_slider, offset;
      this.reset();
      offset = $(node).offset().top;
      if (offset > this.maxSliderTop) {
        fraction = offset / this.contentHeight;
        new_slider = this.maxSliderTop * fraction;
        this.sliderY = new_slider;
        this.scroll();
      }
      return this;
    };

    NanoScroll.prototype.stop = function() {
      this.stopped = true;
      this.removeEvents();
      this.pane.hide();
      return this;
    };

    NanoScroll.prototype.flash = function() {
      var _this = this;
      this.pane.addClass('flashed');
      setTimeout(function() {
        _this.pane.removeClass('flashed');
      }, this.options.flashDelay);
      return this;
    };

    return NanoScroll;

  })();
  $.fn.nanoScroller = function(settings) {
    var flash, options, scroll, scrollBottom, scrollTo, scrollTop, stop;
    if (settings != null) {
      scrollBottom = settings.scrollBottom, scrollTop = settings.scrollTop, scrollTo = settings.scrollTo, scroll = settings.scroll, stop = settings.stop, flash = settings.flash;
    }
    options = $.extend({}, defaults, settings);
    this.each(function() {
      var me, scrollbar;
      me = this;
      scrollbar = $.data(me, SCROLLBAR);
      if (!scrollbar) {
        scrollbar = new NanoScroll(me, options);
        $.data(me, SCROLLBAR, scrollbar);
      } else {
        $.extend(scrollbar.options, settings);
      }
      if (scrollBottom) {
        return scrollbar.scrollBottom(scrollBottom);
      }
      if (scrollTop) {
        return scrollbar.scrollTop(scrollTop);
      }
      if (scrollTo) {
        return scrollbar.scrollTo(scrollTo);
      }
      if (scroll === 'bottom') {
        return scrollbar.scrollBottom(0);
      }
      if (scroll === 'top') {
        return scrollbar.scrollTop(0);
      }
      if (scroll instanceof $) {
        return scrollbar.scrollTo(scroll);
      }
      if (stop) {
        return scrollbar.stop();
      }
      if (flash) {
        return scrollbar.flash();
      }
      return scrollbar.reset();
    });
  };
}