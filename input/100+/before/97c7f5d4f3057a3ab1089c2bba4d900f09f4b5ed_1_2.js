function(b){null!=b&&(b=b.which,a.handleKeyPress(b),null!=l[b]&&clearTimeout(l[b]))}a.keyup)};c.prototype.removeEvents=function(){var a;a=this.events;this.options.disableResize||this.win.unbind("resize",a.resize);this.slider.unbind("mousedown",a.down);this.pane.unbind("mousedown",a.panedown).unbind("mousewheel",a.wheel).unbind("DOMMouseScroll",a.wheel);this.content.unbind("mousewheel",a.scroll).unbind("DOMMouseScroll",a.scroll).unbind("touchmove",a.scroll).unbind("keydown",a.keydown).unbind("keyup",a.keyup)};c.prototype.generate=function(){var a,b,c,i,d;c=this.options;i=c.paneClass;