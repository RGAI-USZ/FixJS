function () {
			var conselt = document.createElement("div");
			conselt.setAttribute("id", "statusPanel");
			conselt.setAttribute("style", "display: none; z-index: 99; top: 294.5px; left: 490px;");
			conselt.innerHTML = "... Loading ...";
			document.getElementsByTagName("body")[0].appendChild(conselt);
			XsltForms_browser.dialog.show('statusPanel');
			if (!(document.documentElement.childNodes[0].nodeType === 8 || (XsltForms_browser.isIE && document.documentElement.childNodes[0].childNodes[1] && document.documentElement.childNodes[0].childNodes[1].nodeType === 8))) {
				var comment = document.createComment("HTML elements and Javascript instructions generated by XSLTForms r" + XsltForms_globals.fileVersion + " - Copyright (C) 2008-2012 <agenceXML> - Alain COUTHURES - http://www.agencexml.com");
				document.documentElement.insertBefore(comment, document.documentElement.firstChild);
			}
			var initelts = document.getElementsByTagName("script");
			var elts = [];
			var i, l;
			for (i = 0, l = initelts.length; i < l; i++) {
				elts[i] = initelts[i];
			}
			initelts = null;
			var res;
			for (i = 0, l = elts.length; i < l; i++) {
				if (elts[i].type === "text/xforms") {
					var dbefore = new Date();
					res = XsltForms_browser.transformText('<html xmlns="http://www.w3.org/1999/xhtml"><body>' + elts[i].text + '</body></html>', root + "xsltforms.xsl", false);
					var dafter = new Date();
					XsltForms_globals.transformtime = dafter - dbefore;
					var sp = XsltForms_globals.stringSplit(res, "XsltForms_MagicSeparator");
					var mainjs = "xsltforms_d0 = new Date(); /* xsltforms-mainform " + sp[1] + sp[2] + " xsltforms-mainform */ }";
					newelt = document.createElement("script");
					newelt.setAttribute("id", "xsltforms-generated-script");
					newelt.setAttribute("type", "text/javascript");
					if (XsltForms_browser.isIE) {
						newelt.text = mainjs;
					} else {
						var scripttxt = document.createTextNode(mainjs);
						newelt.appendChild(scripttxt);
					}
					var panel = document.getElementById("statusPanel");
					panel.parentNode.removeChild(panel);
					document.getElementsByTagName("body")[0].appendChild(newelt);
					var subbody = "<!-- xsltforms-mainform " + sp[4] + " xsltforms-mainform -->";
					elts[i].outerHTML = subbody;
				}
			}		}
