function(e, data) {
					var node = data.rslt.obj, loadedNodeID = self.find(':input[name=ID]').val(), origEvent = data.args[2], container = $('.cms-container');
					
					// Don't trigger unless coming from a click event.
					// Avoids problems with automated section switches from tree to detail view
					// when JSTree auto-selects elements on first load.
					if(!origEvent) {
						return false;
					}else if($(origEvent.target).hasClass('jstree-icon') || $(origEvent.target).hasClass('jstree-pageicon')){
						// in case the click is not on the node title, ie on pageicon or dragicon, 
						return false;
					}
					
					// Don't allow checking disabled nodes
					if($(node).hasClass('disabled')) return false;

					// Don't allow reloading of currently selected node,
					// mainly to avoid doing an ajax request on initial page load
					if($(node).data('id') == loadedNodeID) return;

					var url = $(node).find('a:first').attr('href');
					if(url && url != '#') {

						// Ensure URL is absolute (important for IE)
						if($.path.isExternal($(node).find('a:first'))) url = url = $.path.makeUrlAbsolute(url, $('base').attr('href'));
						// Retain search parameters
						if(document.location.search) url = $.path.addSearchParams(url, document.location.search.replace(/^\?/, ''));
						// Load new page
						container.loadPanel(url);	
					} else {
						self.removeForm();
					}
				}