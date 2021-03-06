function(){

    // unobstrusively clear form fields on focus and restore afterwards
    // http://bassistance.de/2007/01/23/unobtrusive-clear-searchfield-on-focus/
    $.fn.search = function() {
        return this.focus(function() {
            if( this.value == this.defaultValue ) {
                this.value = "";
            }
        }).blur(function() {
            if( !this.value.length ) {
                this.value = this.defaultValue;
            }
        });
    };

    // Focus the next logical input field (according to the DOM)
    // based on http://jqueryminute.com/set-focus-to-the-next-input-field-with-jquery/
    $.fn.focusInputField = function(direction) {
        return this.each(function() {
            var fields = $(this).parents('body').find(':input[type=text], :input[type=password]');
            var index = fields.index( this );
            if ( index > -1 && ( index + 1 ) < fields.length ) {
                if(direction == 'prev') {
                    fields.eq( index - 1 ).focus();
                }
                else {
                    fields.eq( index + 1 ).focus();
                }
            }
            return false;
        });
    };

    // fancybox <3
    var fancyoverlay = '#171717';
    var fancyopacity = 0.8;
    $("a.fancy").livequery(function() {
        $(this).fancybox({
            'overlayColor':     fancyoverlay,
            'overlayOpacity':   fancyopacity,
            'transitionIn':     'fade',
            'transitionOut':    'fade',
            'speedIn':          600, 
            'speedOut':         200,
            'href':             $(this).attr('href'),
            'type':             'image',
            'title':            $(this).attr('data-htmltitle'),
            'paginatenext':     function() {
                if ($('div#pagination .next a').length) {
                    window.location.href = $('div#pagination .next a').attr('href') + '&autoload=first';
                } else {
                    alert ("That's it for now!");
                }
            },
            'paginateprev':     function() {
                if ($('div#pagination .previous a').length) {
                    window.location.href = $('div#pagination .previous a').attr('href') + '&autoload=last';
                } else {
                    alert ("That's it for now!");
                }
            },
        });
        return false;
    });

    $("a.embed").livequery(function() {
        $(this).fancybox({
            'overlayColor':     fancyoverlay,
            'overlayOpacity':   fancyopacity,
            'showNavArrows':    false,
            'href':             '/embed',
            'title':            $(this).attr('data-htmltitle'),
            ajax:       {
                        type:   "POST",
                        data:   { 'url': this.href }
            }
        });
        return false;
    });

     $("a.fancynav").click(function() {
        $.fancybox({
            'overlayColor':     fancyoverlay,
            'overlayOpacity':   fancyopacity,
            'href':     this.href,
            ajax:       {
                        type:   "GET",
            }
        });
        return false;
    });
        
    // limit default tag list length on index view
    $('.taglist').livequery(function() {
        $(this).expander({
            collapseTimer:  5000,
            slicePoint:     300,
            expandPrefix:   '',
            expandText:     '&raquo;',
            userCollapse:   false,
            collapseTimer:  '10000',
            afterExpand:    function($element) {
                $element.parent().css({'overflow': 'visible', 'height': 'auto'});
            },
            onCollapse:     function($element) {
                $element.parent().css({'overflow': 'hidden', 'height': '25px'});
            }
        });
    });

    // Search
    $.ajaxSetup({ type: 'post' });
    // hide submit button
    $('input#searchsubmit').hide();
    // autofocus input field
    $('input#searchquery').livequery(function() {
        $(this).focus()
    });
    // redirect tab to focus next/previous input[type=text] field
    $(':input').keydown(function(e) {
        var keycode = e.keycode || e.which;
        // shift+tab
        if(keycode == 9 && e.shiftKey) {
            e.preventDefault();
            $(this).focusInputField('prev');
        }
        // only tab
        else if(keycode == 9) {
            e.preventDefault();
            $(this).focusInputField('next');
        }
    });
    // hide default value on focus
    $('input#searchquery').livequery(function() {
        $(this).search();
    });

    // autocomplete for search form and add/remove tags form,
    //   can display suggestions for tagnames, title and source urls
    $(':input.autocomplete').livequery(function () {
        $(this).autocomplete({
            source: function (request, response) {
                // look for search type radio buttons and use their value,
                // otherwise its not a search form but a tag add autocomplete
                var elem = $('#searchtype input[name="type"]:checked');
                var type = (elem.length > 0) ? elem.val() : 'tags';
                $.ajax({
                    url: '/search', // via GET (default)
                    type: 'GET',
                    data: {q: request.term, type: type},
                    dataType: 'json',
                    success: function (data) {
                        var prop;
                        if (data.type == 'source') {
                            data = data.items;
                            prop = 'source';
                        }
                        else if (data.type == 'title') {
                            data = data.items;
                            prop = 'title';
                        }
                        else {
                            data = data.tags;
                            prop = 'tagname';
                        }
                        response($.map(data, function(item) {
                            return {
                                label: item[prop],
                                value: item[prop]
                            }
                        }));
                    }
                });
            },
            minLength: 2,
            select: function (event, ui) {
                $(this).parent().submit();
            }
        });
    });

    // Tag Form
    $('form.tag').livequery(function() {
        $(this).submit(function() {

            // detect -tags and move them into del_tags:
            var add_tags = $('input[name="add_tags"]', this),
                del_tags = $('input[name="del_tags"]', this),
                taglist = add_tags.val().split(','),
                add_taglist = [], del_taglist = [];
            $.each(taglist, function (i, tag) {
                tag = tag.replace(/^\s+|\s+$/g, ''); // trims the tag
                if (/^-.*/.test(tag)) {
                    del_taglist.push(tag.substr(1));
                }
                else {
                    add_taglist.push(tag);
                }
            });
            add_tags.val(add_taglist.join(','));
            del_tags.val(del_taglist.join(','));

            var Id = $(this).attr("id");
            var tagtarget = '#' + Id.replace(/formfor/, 'tagsfor')
            var options = {
                target:     tagtarget,
                dataType:   'json',
                success:    function(data) {
                    var taglist = $(tagtarget);

                    // reset
                    taglist.html('');
                    $.each(data.item.tags, function (i, tag) {
                        var tagname = tag.tagname.replace(/[\<\>\/~\^,+]/gi, '');
                        var tagshort = tagname.substr(0, 11) + (tagname.length > 11 ? '...' : '');
                        taglist.append('<li><a href="/show/tag/' + escape(tagname) + '">' + tagshort + '</a></li>');
                    });
                },
                resetForm:  true,
                clearForm:  true
            };

        $(this).ajaxSubmit(options);
        return false;
        });
    });

    // Notifications (http://www.red-team-design.com/cool-notification-messages-with-css3-jquery)
    var myMessages = ['info', 'warning', 'error', 'success'];

    function hideAllMessages() {
        var messagesHeights = new Array(); // this array will store height for each

        for (i=0; i<myMessages.length; i++) {
            messagesHeights[i] = $('.' + myMessages[i]).outerHeight(); // fill array
            $('.' + myMessages[i]).css('top', -messagesHeights[i]); //move element outside viewport
            }
    }

    function showMessage(type) {
        $('.'+ type +'-trigger').click(function() {
            hideAllMessages();
            $('.'+type).animate({top:"0"}, 500);
        });
    }

    // Initially, hide them all
    //hideAllMessages();

    // Show message
    for(var i=0;i<myMessages.length;i++) {
        showMessage(myMessages[i]);
    }

    $('.message').each(function() {
        $('header').addClass('dragged');
    });

    // When message is clicked, hide it
    $('.message').click(function() {
        $(this).animate({top: -$(this).outerHeight()}, 500).queue(function() {
            $('header').removeClass('dragged');
        });
    });            

}