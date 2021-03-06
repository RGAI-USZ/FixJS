function(element, xoffset, yoffset, callback) {
	
	var data = {};
	
	if (typeof element == "string" && typeof element != "function" ) {
		data.element = element;
	}else if (typeof element == "function") {
		callback = element;
	}
	
	if (typeof xoffset == "number" && typeof xoffset != "function" ) {
		data.xoffset = xoffset;
	}else if (typeof xoffset == "function") {
		callback = xoffset;
	}
	
	if (typeof yoffset == "number" && typeof yoffset != "function" ) {
		data.yoffset = yoffset;
	}else if (typeof yoffset == "function") {
		callback = yoffset;
	}
	
	var commandOptions =  {
		path: "/session/:sessionId/moveto",
		method: "POST"
	}
		
	this.executeProtocolCommand(
		commandOptions, 
		this.proxyResponse(callback), 
		data
	);
}