function( editor )

	{

		var pluginName = 'simpleimage';



		// Register the dialog.

		CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/simpleimage.js' );



		// Register the command.

		editor.addCommand( pluginName, new CKEDITOR.dialogCommand( pluginName ) );



		// Register the toolbar button.

		editor.ui.addButton( 'Image',

			{

				label : editor.lang.common.image,

				command : pluginName

			});



		editor.on( 'doubleclick', function( evt )

			{

				var element = evt.data.element;



				if ( element.is( 'img' ) && !element.getAttribute( '_cke_realelement' ) )

					evt.data.dialog = 'simpleimage';

			});



		// Clean up text pasted into caption

		editor.on( 'paste', function( evt )

		{

			var selection = editor.getSelection();

			var element = selection.getStartElement();

			var frame = jQuery(element.$).closest('.image_frame');

			if(element && frame.length)

			{

				editor.plugins['domcleanup'].removeBlocks = true;

				editor.plugins['domcleanup'].customAllowedTags = ['a', 'br', 'strong', 'em'];

				var cleanHtml = editor.dataProcessor.toHtml( evt.data.html );

				var fragment = CKEDITOR.htmlParser.fragment.fromHtml(cleanHtml);

				var writer = new CKEDITOR.htmlWriter();

				var range = selection.getRanges()[0];

				range.deleteContents();

				jQuery.each(fragment.children, function(index, child) {

					var writer = new CKEDITOR.htmlWriter();

					child.writeHtml(writer);

					range.insertNode(CKEDITOR.dom.element.createFromHtml(writer.getHtml()));

					range.collapse(false);

					selection.selectRanges([range]);

				});

				evt.stop();

			}

		}, null, null, 1);

		

		editor.on( 'paste', function( evt ) {

			editor.plugins['domcleanup'].removeBlocks = false;

			editor.plugins['domcleanup'].customAllowedTags = false;

		}, null, null, 99999);



		// outerHTML plugin for jQuery

		jQuery.fn.outerHTML = function(s) {

		return (s)

		? this.before(s).remove()

		: jQuery('<p>').append(this.eq(0).clone()).html();

		};

		var showCaption = function (img) {

		    var frame = img.getAscendant('span');

		    if(frame)

		    {

		        if(jQuery(frame.$).find('span.image_caption').length)

		        {

		            caption = jQuery(frame.$).find('span.image_caption');

		            return;

		        }

		        var caption = jQuery('<span class="image_caption editor_temp">' + 

                    gettext('Add a caption') + '</span>');

                // Set caption width to the image width.

                caption.css('width', CKEDITOR.tools.cssLength(jQuery(img.$).width()));

		        caption.mousedown(function(){ jQuery(caption).removeClass('editor_temp'); });

		        jQuery(frame.$).append(caption);

		    }

		}

		

        var set_img_cleanup_events = function( evt )

        {

			var editor = evt.editor;

			

		    // click on image -> add placeholder caption

		    editor.document.on('mousedown', function(evt){

		        var element = evt.data.getTarget();

		        if(element.is('img'))

		        {

		          showCaption(element);

		        }

		        else if(!element.is('span'))

		        {

		          jQuery(evt.sender.$).find('.editor_temp').remove();

		        }

		    });

		    // resize caption when image resized using handles (FF, IE)

			jQuery('span.image_frame', editor.document.$.body).live('mousedown', function(evt){

				var frame = this;

				jQuery(editor.document.$).one('mouseup', function(evt){

					var caption = jQuery(frame).css({'width':'', 'height':''}).find('span.image_caption');

					var img = jQuery(frame).find('img');

					caption.css({'width':img.css('width'), 'height':''});

					jQuery(window).resize();

				});

			});

            jQuery(editor.document.$.body).bind('dragstart', function(evt){

                editor.fire('saveSnapshot');

                var savedImages = {};

                jQuery('span.image_frame', editor.document.$).each(function(index){

                   savedImages[index] = jQuery(this).html();

                   jQuery(this).attr('cke_saved_id', index); 

                });

                var restoreImages = function(){

                    jQuery('span.image_frame', editor.document.$).each(function(index){

                        var me = jQuery(this);

                        var saved_id = me.attr('cke_saved_id');

                        if(savedImages[saved_id])

                        {

                            me.html(savedImages[saved_id]);

                            delete savedImages[saved_id];

                        }

                        else me.remove();

                    }).removeAttr('cke_saved_id');

                };

            	var img = jQuery(evt.target);

            	if(!img.is('img'))

            		return;

            	var oldFrame = img.parent('span.image_frame');

            	var oldHtml = oldFrame.length ? oldFrame.outerHTML() : img.outerHTML();

            	img.addClass('cke_moved');

            	oldFrame.addClass('cke_moved');

            	var floated = oldFrame.hasClass('image_right') || oldFrame.hasClass('image_left');

            	var moveImage = function(evt){

                    oldFrame.remove();

            		var moved_image = jQuery('img.cke_moved', editor.document.$);

            		if(moved_image.length == 0)

            		{

            		    restoreImages();

            		    return;

            		}

            		var moved_frame = jQuery('span.cke_moved', editor.document.$);

            		var moved_element = moved_frame.length ? moved_frame : moved_image;

            		var outerFrame = moved_element.parent().closest('span.image_frame');

            		if(outerFrame.length)

            		{

            		    // was dropped inside another frame

            		    var images = jQuery('img', outerFrame[0]);

            		    // dropped before image or after?

            		    if(images.length && images[0] == moved_image[0])

            		        outerFrame.before(oldHtml);

            		    else outerFrame.after(oldHtml);

            		} else {

                        where_to_drop = moved_element;

            		    if(floated)

            		    {

            		        top_level = moved_element.parentsUntil('body,td,th').last();

            		        where_to_drop = top_level;

            		    }

            		    where_to_drop.before(oldHtml);

            		}

            		// fix the cursor position

            		var selection = editor.getSelection();

            		var range = selection.getRanges()[0];

            		var ckelement = new CKEDITOR.dom.element(moved_element[0]);

            		ckelement.getParent().appendBogus();

            		range.setStartBefore(ckelement);

            		range.setEndBefore(ckelement);

            		selection.selectRanges([range]);

            		moved_image.remove();

            		moved_frame.remove();

            		restoreImages();

            		jQuery(window).resize();

            		return false;

            	};

            	jQuery(evt.target).one('dragend', moveImage)

            			 .parent().one('dragend', moveImage);

            });

            

            // delete image -> delete its parent frame

            editor.document.on( 'keydown', function( evt )

            {

                var keyCode = evt.data.getKeystroke();

                // Backspace OR Delete.

                if ( keyCode in { 8 : 1, 46 : 1 } )

                {

					var sel = editor.getSelection(),

						element = sel.getStartElement();

                    if ( element && element.is('img'))

                    {

                        element = element.getAscendant('span', true);

                        if(!element)

                            return;

                        // Make undo snapshot.

                        editor.fire( 'saveSnapshot' );

                        var range = sel.getRanges()[ 0 ];

                        range.setStartBefore(element);

                        range.setEndBefore(element);

                        var bookmark = range.createBookmark();



                        element.remove();

                        sel.selectBookmarks( [ bookmark ] );

                        editor.fire( 'saveSnapshot' );

                        evt.data.preventDefault();

                    }

                }

            }, null, null, 1); // make sure we get first dibs

		}



		editor.on('instanceReady', set_img_cleanup_events);

        /* Pressing the "view source" button and then un-pressing it

         * should re-register this, as view source clears out

         * editor.document.body, which is where we attach various events

        */

		editor.on('viewSourceUnloaded', function () {

                editor.on('contentDom', set_img_cleanup_events);

        });



		// If the "menu" plugin is loaded, register the menu items.

		if ( editor.addMenuItems )

		{

			editor.addMenuItems(

				{

					image :

					{

						label : editor.lang.image.menu,

						command : 'simpleimage',

						group : 'image'

					}

				});

		}



		// If the "contextmenu" plugin is loaded, register the listeners.

		// if ( editor.contextMenu )

		// {

		// 	editor.contextMenu.addListener( function( element, selection )

		// 		{

		// 			if ( !element || !element.is( 'img' ) || element.getAttribute( '_cke_realelement' ) || element.isReadOnly() )

		// 				return null;

		// 

		// 			return { image : CKEDITOR.TRISTATE_OFF };

		// 		});

		// }

	}