function(){
			// style toolbar 1 & 2 drop menu
			sdNav.tb1.add(sdNav.tb2)
				.find('ul ul').addClass('radiusBottom boxShadowDropDown').css('min-width',sdNav.tb1.add(sdNav.tb2).find('ul ul').parent().outerWidth(true))
				.find('ul').removeClass('radiusBottom').addClass('radiusAll')
				.find('li:first-child, li:first-child > a').addClass('radiusTop')
				.end().end().find('li:last-child, li:last-child > a').addClass('radiusBottom')
				.end().end().find('li:last-child, li:only-child > a').removeClass('radiusTop radiusBottom').addClass('radiusAll');

			// set min-width of drop down to width of parent
			sdNav.tb1.find(' ul ul').add(sdNav.tb2.find(' ul ul')).each(function(){
				$(this).css('min-width',$(this).parent().outerWidth(true));
			});

			// style toolbar 2 corners
			sdNav.tb2.find(' > ul > li:first-child').addClass('radiusLeft'); 
			// if IE9
			if (sdNav.IE9 == true) {
				// mask bleed of gradient items with radius
				(function($){$.fn.ie9gradius=function(){$(this).each(function(){if((parseInt($(this).css("borderTopLeftRadius"))>0||parseInt($(this).css("borderTopRightRadius"))>0||parseInt($(this).css("borderBottomLeftRadius"))>0||parseInt($(this).css("borderBottomRightRadius"))>0)&&$(this).css("filter")!=""&&$(this).css("filter").match(/DXImageTransform\.Microsoft\.gradient/i)!=null){var s="border-top-left-radius: "+parseInt($(this).css("borderTopLeftRadius"))+"px;";s+="border-top-right-radius: "+parseInt($(this).css("borderTopRightRadius"))+"px;";s+="border-bottom-left-radius: "+parseInt($(this).css("borderBottomLeftRadius"))+"px;";s+="border-bottom-right-radius: "+parseInt($(this).css("borderBottomRightRadius"))+"px;";var c1=$(this).css("filter").match(/startcolorstr\=\"?\'?\#([0-9a-fA-F]{6})\'?\"?/i);var c2=$(this).css("filter").match(/endcolorstr\=\"?\'?\#([0-9a-fA-F]{6})\'?\"?/i);if(c1!=null){if(c1.length==2){c1=c1[1]}else{c1=null}}if(c2!=null){if(c2.length==2){c2=c2[1]}else{c2=null}}if(c1==null&&c2!=null){c1=c2}else{if(c2==null&&c1!=null){c2=c1}}var g="";if(c1!=null){var g="filter: progid:DXImageTransform.Microsoft.gradient(startColorStr='#"+c1+"', EndColorStr='#"+c2+"');"}var id="ie9gradius_"+parseInt(Math.random()*100000);$(this).css("filter","").css("position","relative");$(this).mouseenter(function(){$("#"+id).addClass("gradiusover")}).mouseleave(function(){$("#"+id).removeClass("gradiusover")});$(this).find("> *:not(ul)").css("position","relative");$(this).prepend('	            <div style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;"> 	                <div style="'+s+' height: 100%; overflow: hidden;"> 	                    <div id="'+id+'" style="'+g+' height: 100%; width: 100%;"> 	                    </div></div></div>')}});return $(this)}})(jQuery);
				sdNav.tb2.ie9gradius();
				sdNav.tb2.find(' > ul > li:first-child').ie9gradius();
			}
		}