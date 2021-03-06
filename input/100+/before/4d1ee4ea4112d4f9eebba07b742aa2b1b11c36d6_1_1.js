function(ed, url) {
			var t = this, tbId = ed.getParam('wordpress_adv_toolbar', 'toolbar2'), last = 0, moreHTML, nextpageHTML, closeOnClick;
			moreHTML = '<img src="' + url + '/img/trans.gif" class="mceWPmore mceItemNoResize" title="'+ed.getLang('wordpress.wp_more_alt')+'" />';
			nextpageHTML = '<img src="' + url + '/img/trans.gif" class="mceWPnextpage mceItemNoResize" title="'+ed.getLang('wordpress.wp_page_alt')+'" />';

			if ( getUserSetting('hidetb', '0') == '1' )
				ed.settings.wordpress_adv_hidden = 0;

			// Hides the specified toolbar and resizes the iframe
			ed.onPostRender.add(function() {
				var adv_toolbar = ed.controlManager.get(tbId);
				if ( ed.getParam('wordpress_adv_hidden', 1) && adv_toolbar ) {
					DOM.hide(adv_toolbar.id);
					t._resizeIframe(ed, tbId, 28);
				}
			});

			// Register commands
			ed.addCommand('WP_More', function() {
				ed.execCommand('mceInsertContent', 0, moreHTML);
			});

			ed.addCommand('WP_Page', function() {
				ed.execCommand('mceInsertContent', 0, nextpageHTML);
			});

			ed.addCommand('WP_Help', function() {
				ed.windowManager.open({
					url : tinymce.baseURL + '/wp-mce-help.php',
					width : 450,
					height : 420,
					inline : 1
				});
			});

			ed.addCommand('WP_Adv', function() {
				var cm = ed.controlManager, id = cm.get(tbId).id;

				if ( 'undefined' == id )
					return;

				if ( DOM.isHidden(id) ) {
					cm.setActive('wp_adv', 1);
					DOM.show(id);
					t._resizeIframe(ed, tbId, -28);
					ed.settings.wordpress_adv_hidden = 0;
					setUserSetting('hidetb', '1');
				} else {
					cm.setActive('wp_adv', 0);
					DOM.hide(id);
					t._resizeIframe(ed, tbId, 28);
					ed.settings.wordpress_adv_hidden = 1;
					setUserSetting('hidetb', '0');
				}
			});

			ed.addCommand('WP_Medialib', function() {
				var id = ed.getParam('wp_fullscreen_editor_id') || ed.getParam('fullscreen_editor_id') || ed.id,
					link = tinymce.DOM.select('#wp-' + id + '-media-buttons a.thickbox');

				if ( link && link[0] )
					link = link[0];
				else
					return;

				tb_show('', link.href);
				tinymce.DOM.setStyle( ['TB_overlay','TB_window','TB_load'], 'z-index', '999999' );
			});

			// Register buttons
			ed.addButton('wp_more', {
				title : 'wordpress.wp_more_desc',
				cmd : 'WP_More'
			});

			ed.addButton('wp_page', {
				title : 'wordpress.wp_page_desc',
				image : url + '/img/page.gif',
				cmd : 'WP_Page'
			});

			ed.addButton('wp_help', {
				title : 'wordpress.wp_help_desc',
				cmd : 'WP_Help'
			});

			ed.addButton('wp_adv', {
				title : 'wordpress.wp_adv_desc',
				cmd : 'WP_Adv'
			});

			// Add Media button
			ed.addButton('add_media', {
				title : 'wordpress.add_media',
				image : url + '/img/image.gif',
				cmd : 'WP_Medialib'
			});

			// Add Media buttons to fullscreen and handle align buttons for image captions
			ed.onBeforeExecCommand.add(function(ed, cmd, ui, val, o) {
				var DOM = tinymce.DOM, n, DL, DIV, cls, a, align;
				if ( 'mceFullScreen' == cmd ) {
					if ( 'mce_fullscreen' != ed.id && DOM.select('a.thickbox').length )
						ed.settings.theme_advanced_buttons1 += ',|,add_media';
				}

				if ( 'JustifyLeft' == cmd || 'JustifyRight' == cmd || 'JustifyCenter' == cmd ) {
					n = ed.selection.getNode();

					if ( n.nodeName == 'IMG' ) {
						align = cmd.substr(7).toLowerCase();
						a = 'align' + align;
						DL = ed.dom.getParent(n, 'dl.wp-caption');
						DIV = ed.dom.getParent(n, 'div.mceTemp');

						if ( DL && DIV ) {
							cls = ed.dom.hasClass(DL, a) ? 'alignnone' : a;
							DL.className = DL.className.replace(/align[^ '"]+\s?/g, '');
							ed.dom.addClass(DL, cls);

							if (cls == 'aligncenter')
								ed.dom.addClass(DIV, 'mceIEcenter');
							else
								ed.dom.removeClass(DIV, 'mceIEcenter');

							o.terminate = true;
							ed.execCommand('mceRepaint');
						} else {
							if ( ed.dom.hasClass(n, a) )
								ed.dom.addClass(n, 'alignnone');
							else
								ed.dom.removeClass(n, 'alignnone');
						}
					}
				}
			});

			ed.onInit.add(function(ed) {
				var bodyClass = ed.getParam('body_class', ''), body = ed.getBody();

				// add body classes
				if ( bodyClass )
					bodyClass = bodyClass.split(' ');
				else
					bodyClass = [];

				if ( ed.getParam('directionality', '') == 'rtl' )
					bodyClass.push('rtl');

				if ( tinymce.isIE9 )
					bodyClass.push('ie9');
				else if ( tinymce.isIE8 )
					bodyClass.push('ie8');
				else if ( tinymce.isIE7 )
					bodyClass.push('ie7');

				if ( ed.id != 'wp_mce_fullscreen' && ed.id != 'mce_fullscreen' )
					bodyClass.push('wp-editor');
				else if ( ed.id == 'mce_fullscreen' )
					bodyClass.push('mce-fullscreen');

				tinymce.each( bodyClass, function(cls){
					if ( cls )
						ed.dom.addClass(body, cls);
				});

				// make sure these run last
				ed.onNodeChange.add( function(ed, cm, e) {
					var DL;

					if ( e.nodeName == 'IMG' ) {
						DL = ed.dom.getParent(e, 'dl.wp-caption');
					} else if ( e.nodeName == 'DIV' && ed.dom.hasClass(e, 'mceTemp') ) {
						DL = e.firstChild;

						if ( ! ed.dom.hasClass(DL, 'wp-caption') )
							DL = false;
					}

					if ( DL ) {
						if ( ed.dom.hasClass(DL, 'alignleft') )
							cm.setActive('justifyleft', 1);
						else if ( ed.dom.hasClass(DL, 'alignright') )
							cm.setActive('justifyright', 1);
						else if ( ed.dom.hasClass(DL, 'aligncenter') )
							cm.setActive('justifycenter', 1);
					}
				});

				// remove invalid parent paragraphs when pasting HTML and/or switching to the HTML editor and back
				ed.onBeforeSetContent.add(function(ed, o) {
					if ( o.content ) {
						o.content = o.content.replace(/<p>\s*<(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre|address)( [^>]*)?>/gi, '<$1$2>');
						o.content = o.content.replace(/<\/(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre|address)>\s*<\/p>/gi, '</$1>');
					}
				});
			});

			// Word count
			if ( 'undefined' != typeof(jQuery) ) {
				ed.onKeyUp.add(function(ed, e) {
					var k = e.keyCode || e.charCode;

					if ( k == last )
						return;

					if ( 13 == k || 8 == last || 46 == last )
						jQuery(document).triggerHandler('wpcountwords', [ ed.getContent({format : 'raw'}) ]);

					last = k;
				});
			};

			// keep empty paragraphs :(
			ed.onSaveContent.addToTop(function(ed, o) {
				o.content = o.content.replace(/<p>(<br ?\/?>|\u00a0|\uFEFF)?<\/p>/g, '<p>&nbsp;</p>');
			});

			ed.onSaveContent.add(function(ed, o) {
				if ( ed.getParam('wpautop', true) && typeof(switchEditors) == 'object' ) {
					if ( ed.isHidden() )
						o.content = o.element.value;
					else
						o.content = switchEditors.pre_wpautop(o.content);
				}
			});

			/* disable for now
			ed.onBeforeSetContent.add(function(ed, o) {
				o.content = t._setEmbed(o.content);
			});

			ed.onPostProcess.add(function(ed, o) {
				if ( o.get )
					o.content = t._getEmbed(o.content);
			});
			*/

			// Add listeners to handle more break
			t._handleMoreBreak(ed, url);

			// Add custom shortcuts
			ed.addShortcut('alt+shift+c', ed.getLang('justifycenter_desc'), 'JustifyCenter');
			ed.addShortcut('alt+shift+r', ed.getLang('justifyright_desc'), 'JustifyRight');
			ed.addShortcut('alt+shift+l', ed.getLang('justifyleft_desc'), 'JustifyLeft');
			ed.addShortcut('alt+shift+j', ed.getLang('justifyfull_desc'), 'JustifyFull');
			ed.addShortcut('alt+shift+q', ed.getLang('blockquote_desc'), 'mceBlockQuote');
			ed.addShortcut('alt+shift+u', ed.getLang('bullist_desc'), 'InsertUnorderedList');
			ed.addShortcut('alt+shift+o', ed.getLang('numlist_desc'), 'InsertOrderedList');
			ed.addShortcut('alt+shift+d', ed.getLang('striketrough_desc'), 'Strikethrough');
			ed.addShortcut('alt+shift+n', ed.getLang('spellchecker.desc'), 'mceSpellCheck');
			ed.addShortcut('alt+shift+a', ed.getLang('link_desc'), 'mceLink');
			ed.addShortcut('alt+shift+s', ed.getLang('unlink_desc'), 'unlink');
			ed.addShortcut('alt+shift+m', ed.getLang('image_desc'), 'WP_Medialib');
			ed.addShortcut('alt+shift+g', ed.getLang('fullscreen.desc'), 'mceFullScreen');
			ed.addShortcut('alt+shift+z', ed.getLang('wp_adv_desc'), 'WP_Adv');
			ed.addShortcut('alt+shift+h', ed.getLang('help_desc'), 'WP_Help');
			ed.addShortcut('alt+shift+t', ed.getLang('wp_more_desc'), 'WP_More');
			ed.addShortcut('alt+shift+p', ed.getLang('wp_page_desc'), 'WP_Page');
			ed.addShortcut('ctrl+s', ed.getLang('save_desc'), function(){if('function'==typeof autosave)autosave();});

			if ( tinymce.isWebKit ) {
				ed.addShortcut('alt+shift+b', ed.getLang('bold_desc'), 'Bold');
				ed.addShortcut('alt+shift+i', ed.getLang('italic_desc'), 'Italic');
			}

			ed.onInit.add(function(ed) {
				tinymce.dom.Event.add(ed.getWin(), 'scroll', function(e) {
					ed.plugins.wordpress._hideButtons();
				});
				tinymce.dom.Event.add(ed.getBody(), 'dragstart', function(e) {
					ed.plugins.wordpress._hideButtons();
				});
			});

			ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
				ed.plugins.wordpress._hideButtons();
			});

			ed.onSaveContent.add(function(ed, o) {
				ed.plugins.wordpress._hideButtons();
			});

			ed.onMouseDown.add(function(ed, e) {
				if ( e.target.nodeName != 'IMG' )
					ed.plugins.wordpress._hideButtons();
			});

			closeOnClick = function(e){
				var id;

				if ( e.target.id == 'mceModalBlocker' || e.target.className == 'ui-widget-overlay' ) {
					for ( id in ed.windowManager.windows ) {
						ed.windowManager.close(null, id);
					}
				}
			}

			// close popups when clicking on the background
			tinymce.dom.Event.remove(document.body, 'click', closeOnClick);
			tinymce.dom.Event.add(document.body, 'click', closeOnClick);
		}