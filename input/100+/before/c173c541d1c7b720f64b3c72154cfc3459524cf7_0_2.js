function() {

	var format = function(formatStr, args, functionName) {
		var throwFormatError = function() {
			functionName = functionName || '#<procedure>';
			var matches = formatStr.match(new RegExp('~[sSaA]', 'g'));
			var expectedNumberOfArgs = matches == null ? 0 : matches.length;
			var errorStrBuffer = [functionName + ': format string requires ' + expectedNumberOfArgs
						+ ' arguments, given ' + args.length + '; arguments were:',
					      types.toWrittenString(formatStr)];
			for (var i = 0; i < args.length; i++) {
				errorStrBuffer.push( types.toWrittenString(args[i]) );
			}

			raise( types.incompleteExn(types.exnFailContract, errorStrBuffer.join(' '), []) );
		}

		var pattern = new RegExp("~[sSaAn%~]", "g");
		var buffer = args.slice(0);;
		function f(s) {
			if (s == "~~") {
				return "~";
			} else if (s == '~n' || s == '~%') {
				return "\n";
			} else if (s == '~s' || s == "~S") {
				if (buffer.length == 0) {
					throwFormatError();
				}
				return types.toWrittenString(buffer.shift());
			} else if (s == '~a' || s == "~A") {
				if (buffer.length == 0) {
					throwFormatError();
				}
				return types.toDisplayedString(buffer.shift());
			} else {
				throw types.internalError('format: string.replace matched invalid regexp', false);
			}
		}
		var result = formatStr.replace(pattern, f);
		if (buffer.length > 0) {
			throwFormatError();
		}
		return result;
	};


	// forEachK: CPS( array CPS(array -> void) (error -> void) -> void )
	// Iterates through an array and applies f to each element using CPS
	// If an error is thrown, it catches the error and calls f_error on it
	var forEachK = function(a, f, f_error, k) {
		var forEachHelp = function(i) {
			if( i >= a.length ) {
				if (k) { k(); }
				return;
			}

			try {
				f(a[i], function() { forEachHelp(i+1); });
			} catch (e) {
				f_error(e);
			}
		};
		forEachHelp(0);
	};


	// reportError: (or exception string) -> void
	// Reports an error to the user, either at the console
	// if the console exists, or as alerts otherwise.
	var reportError = function(e) {
		var reporter;
		if (typeof(console) != 'undefined' && 
			typeof(console.log) != 'undefined') {
			reporter = (function(x) { console.log(x); });
		} else {
			reporter = (function(x) { alert(x); });
		}
		if (typeof e == 'string') {
			reporter(e);
		} else if ( types.isSchemeError(e) ) {
			if ( types.isExn(e.val) ) {
				reporter( ''+types.exnMessage(e.val) );
			}
			else {
				reporter(e.val);
			}
		} else if (e.message) {
			reporter(e.message);
		} else {
			reporter(e.toString());
		}
//		if (plt.Kernel.lastLoc) {
//			var loc = plt.Kernel.lastLoc;
//			if (typeof(loc) === 'string') {
//			reporter("Error was raised around " + loc);
//			} else if (typeof(loc) !== 'undefined' &&
//				   typeof(loc.line) !== 'undefined') {
//			reporter("Error was raised around: "
//				 + plt.Kernel.locToString(loc));
//			}
//		}
	};


	var raise = function(v) {
		throw types.schemeError(v);
	};


	var procArityContains = function(n) {
		return function(proc) {
			var singleCase = function(aCase) {
				if ( aCase instanceof types.ContinuationClosureValue ) {
					return true;
				}
				return (aCase.numParams == n ||
					(aCase.isRest && aCase.numParams <= n));
			};

			var cases = [];
			if ( proc instanceof types.ContinuationClosureValue ||
			     proc instanceof types.ClosureValue ||
			     proc instanceof types.PrimProc ) {
				return singleCase(proc);
			}
			else if (proc instanceof types.CasePrimitive) {
				cases = proc.cases;
			}
			else if (proc instanceof types.CaseLambdaValue) {
				cases = proc.closures;
			}

			for (var i = 0; i < cases.length; i++) {
				if ( singleCase(cases[i]) )
					return true;
			}
			return false;
		}
	};

	var throwCheckError = function(aState, details, pos, args) {
		if(aState === undefined) {
			var errorFormatStr;
			if (args && args.length > 1) {
				var errorFormatStrBuffer = ['~a: expects type <~a> as ~a arguments, given: ~s; other arguments were:'];
				for (var i = 0; i < args.length; i++) {
					if ( i != pos-1 ) {
						errorFormatStrBuffer.push( types.toWrittenString(args[i]) );
					}
				}
				errorFormatStr = errorFormatStrBuffer.join(' ');
			}
			else {
				errorFormatStr = "~a: expects argument of type <~a>, given: ~s";
				details.splice(2, 1);
			}

			raise( types.incompleteExn(types.exnFailContract,
						   helpers.format(errorFormatStr, details),
						   []) );
		}
		else {
			var positionStack = 
        		state.captureCurrentContinuationMarks(aState).ref(
            		types.symbol('moby-application-position-key'));
        
       		var locationList = positionStack[positionStack.length - 1];



       		var getArgColoredParts = function(locations) {
				var argColoredParts = [];
				var locs = locations;
				if (args.length > 0) {
					for (var i = 0; i < args.length; i++) {
						if(i != pos -1) { 
							argColoredParts.push(new types.ColoredPart(args[i]+" ", locs.first()));  //LOCATIONS OFF!!!
						}
						locs = locs.rest();
					}
				}
				return argColoredParts;
			}
			var getLocation = function(pos) {
				var locs = locationList;
				var toReturn;
				for(var i = 0; i < args.length; i++) {
					if(i === pos){
						toReturn = locs.first();
					} 
					locs = locs.rest();
				}
				return toReturn;
			}

			var argColoredParts = getArgColoredParts(locationList);


			raise( types.incompleteExn(types.exnFailContract,
						   new types.Message([
						   		new types.ColoredPart(details[0], locationList.first()),
						   		": expects type <",
						   		details[1],
						   		"> as ",
						   		details[2], 
						   		" argument, given: ",
						   		new types.ColoredPart(details[3], getLocation(pos)),
						   		"; other arguments were: ",
						   		new types.GradientPart(argColoredParts)
						   	]),
						   []) );



		}
	};
	//HACK HACK HACK
	var check = function(aState, x, f, functionName, typeName, position, args) {
		console.log("aState:", aState, ", x:", x, ", f:" , f);
		if ( !f(x) ) {
			throwCheckError(aState, 
					[functionName,
					 typeName,
					 helpers.ordinalize(position),
					 x],
					position,
					args);
		}
	};

        var isList = function(x) {
	    if (x === types.EMPTY) { return true; }
	    while (types.isPair(x)) {
		x = x.rest();
	    }
	    return (x === types.EMPTY);
	};




    var isList = function(x) {
        var tortoise, hare;
        tortoise = hare = x;
        if (hare === types.EMPTY) { 
            return true; 
        }
        while (true) {
            if (!(types.isPair(hare))) { return false; }
            if (types.isPair(tortoise)) { 
                // optimization to get amortized linear time isList.
                if (tortoise._isList === true) { return true; } 
                tortoise = tortoise.rest(); 
            }
            hare = hare.rest();
            if (types.isPair(hare)) { 
                if (hare._isList) { tortoise._isList = true; return true; }
                hare = hare.rest(); 
                if (types.isPair(hare) && hare._isList) { tortoise._isList = true; return true; }
            }
            if (hare === types.EMPTY) { 
                // optimization to get amortized linear time isList.
                tortoise._isList = true;
                return true; 
            }
            if (tortoise === hare) { return false; }
        }
    };


	var isListOf = function(x, f) {
            if (! isList(x)) { return false; }
	    while (types.isPair(x)) {
		if (! f(x.first())) { return false; }
		x = x.rest();
	    }
	    return (x === types.EMPTY);
	};

	var checkListOf = function(lst, f, functionName, typeName, position, args) {
		if ( !isListOf(lst, f) ) {
			helpers.throwCheckError([functionName,
						 'list of ' + typeName,
						 helpers.ordinalize(position),
						 lst],
						position,
						args);
		}
	};


//	// remove: array any -> array
//	// removes the first instance of v in a
//	// or returns a copy of a if v does not exist
//	var remove = function(a, v) {
//		for (var i = 0; i < a.length; i++) {
//			if (a[i] === v) {
//				return a.slice(0, i).concat( a.slice(i+1, a.length) );
//			}
//		}
//		return a.slice(0);
//	};

	// map: array (any -> any) -> array
	// applies f to each element of a and returns the result
	// as a new array
	var map = function(f, a) {
		var b = new Array(a.length);
		for (var i = 0; i < a.length; i++) {
			b[i] = f(a[i]);
		}
		return b;
	};


	var schemeListToArray = function(lst) {
		var result = [];
		while ( !lst.isEmpty() ) {
			result.push(lst.first());
			lst = lst.rest();
		}
		return result;
	}

	// deepListToArray: any -> any
	// Converts list structure to array structure.
	var deepListToArray = function(x) {
		var thing = x;
		if (thing === types.EMPTY) {
			return [];
		} else if (types.isPair(thing)) {
			var result = [];
			while (!thing.isEmpty()) {
				result.push(deepListToArray(thing.first()));
				thing = thing.rest();
			}
			return result;
		} else {
			return x;
		}
	}


	var flattenSchemeListToArray = function(x) {
		if ( !isList(x) ) {
			return [x];
		}

		var ret = [];
		while ( !x.isEmpty() ) {
			ret = ret.concat( flattenSchemeListToArray(x.first()) );
			x = x.rest();
		}
		return ret;
	};


	// assocListToHash: (listof (list X Y)) -> (hashof X Y)
	var assocListToHash = function(lst) {
		var result = {};
		while ( !lst.isEmpty() ) {
			var key = lst.first().first();
			var val = lst.first().rest().first();
			result[key] = val;
			lst = lst.rest();
		}
		return result;
	};


	var ordinalize = function(n) {
		// special case for 11th:
		if ( n % 100 == 11 ) {
			return n + 'th';
		}
		var res = n;
		switch( n % 10 ) {
			case 1: res += 'st'; break;
			case 2: res += 'nd'; break;
			case 3: res += 'rd'; break;
			default: res += 'th'; break;
		}
		return res;
	}


	var wrapJsObject = function(x) {
		if (x === undefined) {
			return types.jsObject('undefined', x);
		}
		else if (x === null) {
			return types.jsObject('null', x);
		}
		else if (typeof(x) == 'function') {
			return types.jsObject('function', x);
		}
		else if ( x instanceof Array ) {
			return types.jsObject('array', x);
		}
		else if ( typeof(x) == 'string' ) {
			return types.jsObject("'" + x.toString() + "'", x);
		}
		else {
			return types.jsObject(x.toString(), x);
		}
	};


	var getKeyCodeName = function(e) {
	    var code = e.charCode || e.keyCode;
	    var keyname;
	    switch(code) {
		case 16: keyname = "shift"; break;
		case 17: keyname = "control"; break;
		case 19: keyname = "pause"; break;
		case 27: keyname = "escape"; break;
		case 33: keyname = "prior"; break;
		case 34: keyname = "next"; break;
		case 35: keyname = "end"; break;
		case 36: keyname = "home"; break;
		case 37: keyname = "left"; break;
		case 38: keyname = "up"; break;
		case 39: keyname = "right"; break;
		case 40: keyname = "down"; break;
		case 42: keyname = "print"; break;
		case 45: keyname = "insert"; break;
		case 46: keyname = String.fromCharCode(127); break;
		case 106: keyname = "*"; break;
		case 107: keyname = "+"; break;
		case 109: keyname = "-"; break;
		case 110: keyname = "."; break;
		case 111: keyname = "/"; break;
		case 144: keyname = "numlock"; break;
		case 145: keyname = "scroll"; break;
		case 186: keyname = ";"; break;
		case 187: keyname = "="; break;
		case 188: keyname = ","; break;
		case 189: keyname = "-"; break;
		case 190: keyname = "."; break;
		case 191: keyname = "/"; break;
		case 192: keyname = "`"; break;
		case 219: keyname = "["; break;
		case 220: keyname = "\\"; break;
		case 221: keyname = "]"; break;
		case 222: keyname = "'"; break;
		default: if (code >= 96 && code <= 105) {
				 keyname = (code - 96).toString();
			 }
			 else if (code >= 112 && code <= 123) {
				 keyname = "f" + (code - 111);
			 }
			 else {
				 keyname = String.fromCharCode(code).toLowerCase();
			 }
			 break;
	    }
	    return keyname;
	};





        // maybeCallAfterAttach: dom-node -> void
        // walk the tree rooted at aNode, and call afterAttach if the element has
        // such a method.
        var maybeCallAfterAttach = function(aNode) {
	    var stack = [aNode];
	    while (stack.length !== 0) {
		var nextNode = stack.pop();
		if (nextNode.afterAttach) {
		    nextNode.afterAttach(nextNode);
		}
		if (nextNode.hasChildNodes && nextNode.hasChildNodes()) {
		    var children = nextNode.childNodes;
		    for (var i = 0; i < children.length; i++) {
			stack.push(children[i]);
		    }
		}
	    }
	};








    // makeLocationDom: location -> dom
    // Dom type that has special support in the editor through the print hook.
    // The print hook is expected to look at the printing of dom values with
    // this particular structure.  In the context of WeScheme, the environment
    // will rewrite these to be clickable links.
    var makeLocationDom = function(aLocation) {
	var locationSpan = document.createElement("span");
	var idSpan = document.createElement("span");
	var offsetSpan = document.createElement("span");
	var lineSpan = document.createElement("span");
	var columnSpan = document.createElement("span");
	var spanSpan = document.createElement("span");

	locationSpan['className'] = 'location-reference';
	idSpan['className'] = 'location-id';
	offsetSpan['className'] = 'location-offset';
	lineSpan['className'] = 'location-line';
	columnSpan['className'] = 'location-column';
	spanSpan['className'] = 'location-span';

	idSpan.appendChild(document.createTextNode(aLocation.id + ''));
	offsetSpan.appendChild(document.createTextNode(aLocation.offset + ''));
	lineSpan.appendChild(document.createTextNode(aLocation.line + ''));
	columnSpan.appendChild(document.createTextNode(aLocation.column + ''));
	spanSpan.appendChild(document.createTextNode(aLocation.span + ''));

	locationSpan.appendChild(idSpan);
	locationSpan.appendChild(offsetSpan);
	locationSpan.appendChild(lineSpan);
	locationSpan.appendChild(columnSpan);   
	locationSpan.appendChild(spanSpan);

	return locationSpan;
    };


    var isLocationDom = function(thing) {
	return (thing
		&&
		(thing.nodeType === Node.TEXT_NODE ||
		 thing.nodeType === Node.ELEMENT_NODE)
		&&
		thing['className'] === 'location-reference');
    };





	////////////////////////////////////////////////

	helpers.format = format;
	helpers.forEachK = forEachK;
	helpers.reportError = reportError;
	helpers.raise = raise;

	helpers.procArityContains = procArityContains;
	helpers.throwCheckError = throwCheckError;
	helpers.isList = isList;
	helpers.isListOf = isListOf;
	helpers.check = check;
	helpers.checkListOf = checkListOf;
	
//	helpers.remove = remove;
	helpers.map = map;
	helpers.schemeListToArray = schemeListToArray;
	helpers.deepListToArray = deepListToArray;
	helpers.flattenSchemeListToArray = flattenSchemeListToArray;
	helpers.assocListToHash = assocListToHash;

	helpers.ordinalize = ordinalize;
	helpers.wrapJsObject = wrapJsObject;

	helpers.getKeyCodeName = getKeyCodeName;

        helpers.maybeCallAfterAttach = maybeCallAfterAttach;

        helpers.makeLocationDom = makeLocationDom;
        helpers.isLocationDom = isLocationDom;

}