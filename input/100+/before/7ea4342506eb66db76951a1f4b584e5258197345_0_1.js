function(d) {
		var success	= false,
			media	= {
				type:		"unknown",
				id:			"",
				link:		"",
				lang:		"",
				uniqueid:	VMM.Util.unique_ID(6)
			};
		
		if (d.match("div class='twitter'")) {
			media.type = "twitter-ready";
		    media.id = d;
		    success = true;
		} else if (d.match('(www.)?youtube|youtu\.be')) {
			if (d.match('v=')) {
				media.id = VMM.Util.getUrlVars(d)["v"];
			} else if (d.match('\/embed\/')) {
				media.id = d.split("embed\/")[1].split(/[?&]/)[0];
			} else {
				media.id = d.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0];
			}
		    media.type = "youtube";
		    success = true;
		} else if (d.match('(player.)?vimeo\.com')) {
		    media.type = "vimeo";
		    media.id = d.split(/video\/|\/\/vimeo\.com\//)[1].split(/[?&]/)[0];;
		    success = true;
	    } else if (d.match('(www.)?dailymotion\.com')) {
			media.id = d.split(/video\/|\/\/dailymotion\.com\//)[1];
			media.type = "dailymotion";
			success = true;
		} else if (d.match('(player.)?soundcloud\.com')) {
			media.type = "soundcloud";
			media.id = d;
			success = true;
		} else if (d.match('(www.)?twitter\.com') && d.match('status') ) {
			if (d.match("status\/")) {
				media.id = d.split("status\/")[1];
			} else if (d.match("statuses\/")) {
				media.id = d.split("statuses\/")[1];
			} else {
				media.id = "";
			}
			media.type = "twitter";
			success = true;
		} else if (d.match("maps.google") && !d.match("staticmap")) {
			media.type = "google-map";
		    media.id = d.split(/src=['|"][^'|"]*?['|"]/gi);
			success = true;
		} else if (d.match("plus.google")) {
			media.type = "googleplus";
		    media.id = d.split("/posts/")[1];
			//https://plus.google.com/u/0/112374836634096795698/posts/bRJSvCb5mUU
			//https://plus.google.com/107096716333816995401/posts/J5iMpEDHWNL
			if (d.split("/posts/")[0].match("u/0/")) {
				media.user = d.split("u/0/")[1].split("/posts")[0];
			} else {
				media.user = d.split("google.com/")[1].split("/posts/")[0];
			}
			success = true;
		} else if (d.match("flickr.com/photos")) {
			media.type = "flickr";
			media.id = d.split("photos\/")[1].split("/")[1];
			media.link = d;
			success = true;
		} else if (d.match("instagr.am/p/")) {
			media.type = "instagram";
			media.link = d;
			media.id = d.split("\/p\/")[1].split("/")[0];
			success = true;
		} else if (d.match(/jpg|jpeg|png|gif/i) || d.match("staticmap") || d.match("yfrog.com") || d.match("twitpic.com")) {
			media.type = "image";
			media.id = d;
			success = true;
		} else if (VMM.FileExtention.googleDocType(d)) {
			media.type = "googledoc";
			media.id = d;
			success = true;
		} else if (d.match('(www.)?wikipedia\.org')) {
			media.type = "wikipedia";
			//media.id = d.split("wiki\/")[1];
			var wiki_id = d.split("wiki\/")[1].split("#")[0].replace("_", " ");
			media.id = wiki_id.replace(" ", "%20");
			media.lang = d.split("//")[1].split(".wikipedia")[0];
			success = true;
		} else if (d.indexOf('http://') == 0) {
			media.type = "website";
			media.id = d;
			success = true;
		} else if (d.match('storify')) {
			media.type = "storify";
			media.id = d;
			success = true;
		} else if (d.match('blockquote')) {
			media.type = "quote";
			media.id = d;
			success = true;
		} else {
			trace("unknown media");  
			media.type = "unknown";
			media.id = d;
			success = true;
		}
		
		if (success) { 
			return media;
		} else {
			trace("No valid media id detected");
			trace(d);
		}
		return false;
	}