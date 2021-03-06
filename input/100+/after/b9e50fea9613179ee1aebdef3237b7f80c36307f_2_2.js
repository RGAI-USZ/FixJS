function () {
			var
				scope = 'Aloha.continuoustext',
				that = this;

			// reset
			this.buttons = {};

			// collect the multisplit items here
			this.multiSplitItems = [];

			//iterate configuration array an push buttons to buttons array
			jQuery.each(this.availableButtons, function( j, button ) {
				switch( button ) {
					// text level semantics:
					case 'u':
					case 'em':
					case 'strong':
					case 'b':
					case 'i':
					case 'q':
					case 'code':
					case 'del':
					case 's':
					case 'sub':
					case 'sup':
						that.buttons[button] = {'button' : new Aloha.ui.Button({
							'name' : button,
							'iconClass' : 'aloha-button aloha-button-' + button,
							'size' : 'small',
							'onclick' : function () {
								var
									markup = jQuery('<'+button+'></'+button+'>'),
									rangeObject = Aloha.Selection.rangeObject,
									foundMarkup,
									selectedCells = jQuery('.aloha-cell-selected');

								// formating workaround for table plugin
								if ( selectedCells.length > 0 ) {
									var cellMarkupCounter = 0;
									selectedCells.each( function () {
										var cellContent = jQuery(this).find('div'),
											cellMarkup = cellContent.find(button);

										if ( cellMarkup.length > 0 ) {
											// unwrap all found markup text
											// <td><b>text</b> foo <b>bar</b></td>
											// and wrap the whole contents of the <td> into <b> tags
											// <td><b>text foo bar</b></td>
											cellMarkup.contents().unwrap();
											cellMarkupCounter++;
										}
										cellContent.contents().wrap('<'+button+'></'+button+'>');
									});

									// remove all markup if all cells have markup
									if ( cellMarkupCounter == selectedCells.length ) {
										selectedCells.find(button).contents().unwrap();
									}
									return false;
								}
								// formating workaround for table plugin

								// check whether the markup is found in the range (at the start of the range)
								foundMarkup = rangeObject.findMarkup(function() {
									return this.nodeName.toLowerCase() == markup.get(0).nodeName.toLowerCase();
								}, Aloha.activeEditable.obj);

								if ( foundMarkup ) {
									// remove the markup
									if (rangeObject.isCollapsed()) {
										// when the range is collapsed, we remove exactly the one DOM element
										GENTICS.Utils.Dom.removeFromDOM(foundMarkup, rangeObject, true);
									} else {
										// the range is not collapsed, so we remove the markup from the range
										GENTICS.Utils.Dom.removeMarkup(rangeObject, markup, Aloha.activeEditable.obj);
									}
								} else {
									// when the range is collapsed, extend it to a word
									if (rangeObject.isCollapsed()) {
										GENTICS.Utils.Dom.extendToWord(rangeObject);
									}

									// add the markup
									GENTICS.Utils.Dom.addMarkup(rangeObject, markup);
								}
								// select the modified range
								rangeObject.select();
								
								// update Button toggle state. We take 'Aloha.Selection.getRangeObject()'
								// because rangeObject is not up-to-date
								onSelectionChanged(that, Aloha.Selection.getRangeObject());
								
								return false;
							},
							'tooltip' : i18n.t('button.' + button + '.tooltip'),
							'toggle' : true
						}), 'markup' : jQuery('<'+button+'></'+button+'>')};

						FloatingMenu.addButton(
							scope,
							that.buttons[button].button,
							i18nCore.t('floatingmenu.tab.format'),
							1
						);
						break;

					case 'p':
					case 'h1':
					case 'h2':
					case 'h3':
					case 'h4':
					case 'h5':
					case 'h6':
					case 'pre':
						that.multiSplitItems.push({
							'name' : button,
							'tooltip' : i18n.t('button.' + button + '.tooltip'),
							'iconClass' : 'aloha-button ' + i18n.t('aloha-button-' + button),
							'markup' : jQuery('<'+button+'></'+button+'>'),
							'click' : function() {
								var selectedCells = jQuery('.aloha-cell-selected');
								// formating workaround for table plugin
								if ( selectedCells.length > 0 ) {
									var cellMarkupCounter = 0;
									selectedCells.each( function () {
										var cellContent = jQuery(this).find('div'),
											cellMarkup = cellContent.find(button);
										
										if ( cellMarkup.length > 0 ) {
											// unwrap all found markup text
											// <td><b>text</b> foo <b>bar</b></td>
											// and wrap the whole contents of the <td> into <b> tags
											// <td><b>text foo bar</b></td>
											cellMarkup.contents().unwrap();
											cellMarkupCounter++;
										}
										cellContent.contents().wrap('<'+button+'></'+button+'>');
									});

									// remove all markup if all cells have markup
									if ( cellMarkupCounter == selectedCells.length ) {
										selectedCells.find(button).contents().unwrap();
									}
									return false;
								}
								// formating workaround for table plugin
								
								Aloha.Selection.changeMarkupOnSelection(jQuery('<' + button + '></' + button + '>'));

								// setting the focus is needed for mozilla to have a working rangeObject.select()
								if (Aloha.activeEditable
									&& jQuery.browser.mozilla) {
									Aloha.activeEditable.obj.focus();
								}
								
								// triggered for numerated-headers plugin
								if (Aloha.activeEditable) {
									Aloha.trigger( 'aloha-format-block' );
								}
							}
						});
						break;

					// wide multisplit buttons
					case 'removeFormat':
						that.multiSplitItems.push({
							'name' : button,
							'text' : i18n.t('button.' + button + '.text'),
							'tooltip' : i18n.t('button.' + button + '.tooltip'),
							'iconClass' : 'aloha-button aloha-button-' + button,
							'wide' : true,
							'click' : function() {
								that.removeFormat();
							}
						});
						break;
					//no button defined
					default:
						Aloha.log('warn', this, 'Button "' + button + '" is not defined');
						break;
				}
			});

			if (this.multiSplitItems.length > 0) {
				this.multiSplitButton = new Aloha.ui.MultiSplitButton({
					'name' : 'phrasing',
					'items' : this.multiSplitItems
				});
				FloatingMenu.addButton(
					scope,
					this.multiSplitButton,
					i18nCore.t('floatingmenu.tab.format'),
					3
				);
			}

			// add the event handler for context selection change
			PubSub.sub('aloha.selection.context-change', function(message) {
				onSelectionChanged(that, message.range);
			});

		}