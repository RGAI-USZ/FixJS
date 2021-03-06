function(el, options, i){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("nudgenudge", base);

        base.init = function(){

            base.options = $.extend({},$.nudgenudge.defaultOptions, options);

            // Put your initialization code here
        };

        base.addCloseEventHandlers = function(i){
        	$(options.closeEvent.el).bind(options.closeEvent.event, function(){
        		$('#nudgenudge_' + i).hide();
        	});
        };
        base.removeArrow = function(i) {
        	$('#nudgenudge_' + i).remove();
        };
        base.addNudgeAnimation = function(){
        
        	
        	// get offset of element
        	var offset = $(base.el).offset();
        	var el_left = offset.left;
        	var el_top = offset.top;
        	var el_height = $(base.el).outerHeight();
        	var el_width = $(base.el).outerWidth();

        	var n_left = 0;
        	var n_top = 0;
        	
        	n_top = (el_top + (el_height/2)) + options.offsetY - 30;
        	
        	var dir = "";
        	
        	if (options.placement === 'left') {
        		n_left = el_left + options.offsetX - 200;
        		dir = "nudgenudge_left";
        	} else if (options.placement === 'right') {
        		n_left = el_left + options.offsetX + el_width;
        		dir = "nudgenudge_right";
        	}
        
        	$('body').append('<div id="nudgenudge_'+i+'" class="nudgenudge_wrap intensity_'+options.intensity+'" style="top:'+n_top+'px;left:'+n_left+'px;"><img class="nudgenudge '+dir+'" src="'+options.arrow+'" alt="" /></div>');
        	
        	if (options.hideAfter > 0){
	        	var one_nudge_duration = 0;
	        	switch (options.intensity) {
	        		case "low":
	        			one_nudge_duration = 2000;
	        			break;
	        		case "medium":
	        			one_nudge_duration = 1000;
	        			break;
	        		case "high":
	        			one_nudge_duration = 800;
	        			break;
	        	}
	        	if (one_nudge_duration > 0) {
	        		var fade_time = 200;
	        		var timeout = (options.hideAfter * one_nudge_duration) - fade_time;
	        		setTimeout("$('#nudgenudge_"+i+"').fadeOut("+fade_time+");", timeout)
	        	}
        	}
        };

        // Run initializer
        base.init();
        
        
        base.addNudgeAnimation();
        base.addCloseEventHandlers(i);
        
        $(window).resize(function(){
        	base.removeArrow(i);
        	base.addNudgeAnimation();
        });
        
    }