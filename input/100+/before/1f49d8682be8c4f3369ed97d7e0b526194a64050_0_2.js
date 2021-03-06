function ($) {
    function init() {
        var $body = $('body');

        $('select.enable-if-js').removeAttr('disabled');

        initPrepopulatedSlugs();
        initDetailsTags();

        if ($body.is('.document')) {  // Document page


            // Put last search query into search box
            $('#support-search input[name=q]')
                .val(k.unquote($.cookie('last_search')));

            ShowFor.initForTags();
            addReferrerAndQueryToVoteForm();
            new k.AjaxVote('.document-vote form', {
                positionMessage: true
            });
            initAOABanner();
        } else if ($body.is('.review')) { // Review pages
            ShowFor.initForTags();
            initNeedsChange();

            $('img.lazy').loadnow();

            // We can enable the buttons now.
            $('#actions input').removeAttr('disabled');
        }

        if ($body.is('.edit, .new, .translate')) { // Document form page
            // Submit form
            $('#id_comment').keypress(function(e) {
                if(e.which == 13) {
                    $(this).blur();
                    $(this).closest('form').find('input[type=submit]').focus().click();
                    return false;
                }
            });

            initArticlePreview();
            initTitleAndSlugCheck();
            initPreValidation();
            initNeedsChange();

            $('img.lazy').loadnow();

            // We can enable the buttons now.
            $('.submit input').removeAttr('disabled');
        }

        initEditingTools();

        initL10nTest();
        initDiffPicker();
        initDiffToggle();

        Marky.createFullToolbar('.editor-tools', '#id_content');

        initReadyForL10n();

        $('img.lazy').lazyload();
    }

    // Make <summary> and <details> tags work even if the browser doesn't support them.
    // From http://mathiasbynens.be/notes/html5-details-jquery
    function initDetailsTags() {
        // Note <details> tag support. Modernizr doesn't do this properly as of 1.5; it thinks Firefox 4 can do it, even though the tag has no "open" attr.
        if (!('open' in document.createElement('details'))) {
            document.documentElement.className += ' no-details';
        }

        // Execute the fallback only if there's no native `details` support
        if (!('open' in document.createElement('details'))) {
            // Loop through all `details` elements
            $('details').each(function() {
                // Store a reference to the current `details` element in a variable
                var $details = $(this),
                    // Store a reference to the `summary` element of the current `details` element (if any) in a variable
                    $detailsSummary = $('summary', $details),
                    // Do the same for the info within the `details` element
                    $detailsNotSummary = $details.children(':not(summary)'),
                    // This will be used later to look for direct child text nodes
                    $detailsNotSummaryContents = $details.contents(':not(summary)');

                // If there is no `summary` in the current `details` element...
                if (!$detailsSummary.length) {
                    // ...create one with default text
                    $detailsSummary = $(document.createElement('summary')).text('Details').prependTo($details);
                }

                // Look for direct child text nodes
                if ($detailsNotSummary.length !== $detailsNotSummaryContents.length) {
                    // Wrap child text nodes in a `span` element
                    $detailsNotSummaryContents.filter(function() {
                        // Only keep the node in the collection if it's a text node containing more than only whitespace
                        return (this.nodeType === 3) && (/[^\t\n\r ]/.test(this.data));
                    }).wrap('<span>');
                    // There are now no direct child text nodes anymore -- they're wrapped in `span` elements
                    $detailsNotSummary = $details.children(':not(summary)');
                }

                // Hide content unless there's an `open` attribute
                if (typeof $details.attr('open') !== 'undefined') {
                    $details.addClass('open');
                    $detailsNotSummary.show();
                } else {
                    $detailsNotSummary.hide();
                }

                // Set the `tabindex` attribute of the `summary` element to 0 to make it keyboard accessible
                $detailsSummary.attr('tabindex', 0).click(function() {
                    // Focus on the `summary` element
                    $detailsSummary.focus();
                    // Toggle the `open` attribute of the `details` element
                    if (typeof $details.attr('open') !== 'undefined') {
                        $details.removeAttr('open');
                    }
                    else {
                        $details.attr('open', 'open');
                    }
                    // Toggle the additional information in the `details` element
                    $detailsNotSummary.slideToggle();
                    $details.toggleClass('open');
                }).keyup(function(event) {
                    if (13 === event.keyCode || 32 === event.keyCode) {
                        // Enter or Space is pressed -- trigger the `click` event on the `summary` element
                        // Opera already seems to trigger the `click` event when Enter is pressed
                        if (!($.browser.opera && 13 === event.keyCode)) {
                            event.preventDefault();
                            $detailsSummary.click();
                        }
                    }
                });
            });
        }
    }

    // Return the browser and version that appears to be running. Possible
    // values resemble {fx4, fx35, m1, m11}. Return undefined if the currently
    // running browser can't be identified.
    function detectBrowser() {
        function getVersionGroup(browser, version) {
            if ((browser === undefined) || (version === undefined) || !VERSIONS[browser]) {
                return;
            }

            for (var i = 0; i < VERSIONS[browser].length; i++) {
                if (version < VERSIONS[browser][i][0]) {
                    return browser + VERSIONS[browser][i][1];
                }
            }
        }
        return getVersionGroup(BrowserDetect.browser, BrowserDetect.version);
    }

    function initPrepopulatedSlugs() {
        var fields = {
            title: {
                id: '#id_slug',
                dependency_ids: ['#id_title'],
                dependency_list: ['#id_title'],
                maxLength: 50
            }
        };

        $.each(fields, function(i, field) {
            $(field.id).addClass('prepopulated_field');
            $(field.id).data('dependency_list', field.dependency_list)
                   .prepopulate($(field.dependency_ids.join(',')),
                                field.maxLength);
        });
    }

    /*
     * Initialize the article preview functionality.
     */
    function initArticlePreview() {
        var $preview = $('#preview'),
            $previewBottom = $('#preview-bottom'),
            preview = new k.AjaxPreview($('.btn-preview'), {
            contentElement: $('#id_content'),
            previewElement: $preview
        });
        $(preview).bind('done', function(e, success){
            if (success) {
                $previewBottom.show();
                ShowFor.initForTags();
                $preview.find('select.enable-if-js').removeAttr('disabled');
                $preview.find('.kbox').kbox();
                k.initVideo();
            }
        });
    }

    function initTitleAndSlugCheck() {
        $('#id_title').change(function() {
            var $this = $(this),
                $form = $this.closest('form'),
                title = $this.val(),
                slug = $('#id_slug').val();
            verifyTitleUnique(title, $form);
            // Check slug too, since it auto-updates and doesn't seem to fire
            // off change event.
            verifySlugUnique(slug, $form);
        });
        $('#id_slug').change(function() {
            var $this = $(this),
                $form = $this.closest('form'),
                slug = $('#id_slug').val();
            verifySlugUnique(slug, $form);
        });

        function verifyTitleUnique(title, $form) {
            var errorMsg = gettext('A document with this title already exists in this locale.');
            verifyUnique('title', title, $('#id_title'), $form, errorMsg);
        }

        function verifySlugUnique(slug, $form) {
            var errorMsg = gettext('A document with this slug already exists in this locale.');
            verifyUnique('slug', slug, $('#id_slug'), $form, errorMsg);
        }

        function verifyUnique(fieldname, value, $field, $form, errorMsg) {
            $field.removeClass('error');
            $field.parent().find('ul.errorlist').remove();
            var data = {};
            data[fieldname] = value;
            $.ajax({
                url: $form.data('json-url'),
                type: 'GET',
                data: data,
                dataType: 'json',
                success: function(json) {
                    // Success means we found an existing doc
                    var docId = $form.data('document-id');
                    if (!docId || (json.id && json.id !== parseInt(docId))) {
                        // Collision !!
                        $field.addClass('error');
                        $field.before(
                            $('<ul class="errorlist"><li/></ul>')
                                .find('li').text(errorMsg).end()
                        );
                    }
                },
                error: function(xhr, error) {
                    if(xhr.status === 404) {
                        // We are good!!
                    } else {
                        // Something went wrong, just fallback to server-side
                        // validation.
                    }
                }
            });
        }
    }

    // If the Customer Care banner is present, animate it and handle closing.
    function initAOABanner() {
        var $banner = $('#banner'),
            cssFrom = { top: -100 },
            cssTo = { top: -10 };
        if ($banner.length > 0) {
            setTimeout(function() {
                $banner
                    .css({ display: 'block' })
                    .css(cssFrom)
                    .animate(cssTo, 500)
                    .find('a.close').click(function(e) {
                        e.preventDefault();
                        $banner.animate(cssFrom, 500, 'swing', function() {
                            $banner.css({ display: 'none' });
                        });
                    });
            }, 500);
        }
    }

    // On document edit/translate/new pages, run validation before opening the
    // submit modal.
    function initPreValidation() {
        var $modal = $('#submit-modal'),
            kbox = $modal.data('kbox');
        kbox.updateOptions({
            preOpen: function() {
                var form = $('input.btn-submit').closest('form')[0];
                if (form.checkValidity && !form.checkValidity()) {
                    // If form isn't valid, click the modal submit button
                    // so the validation error is shown. (I couldn't find a
                    // better way to trigger this.)
                    $modal.find('input[type="submit"]').click();
                    return false;
                }
                // Add this here because the "Submit for Review" button is
                // a submit button that triggers validation and fails
                // because the modal hasn't been displayed yet.
                $modal.find('#id_comment').attr('required', true);
                return true;
            }
        });
    }

    // The diff revision picker
    function initDiffPicker() {
        $('div.revision-diff').each(function() {
            var $diff = $(this);
            $diff.find('div.picker a').unbind().click(function(ev) {
                ev.preventDefault();
                $.ajax({
                    url: $(this).attr('href'),
                    type: 'GET',
                    dataType: 'html',
                    success: function(html) {
                        var kbox = new KBox(html, {
                            modal: true,
                            id: 'diff-picker-kbox',
                            closeOnOutClick: true,
                            destroy: true,
                            title: gettext('Choose revisions to compare')
                        });
                        kbox.open();
                        ajaxifyDiffPicker(kbox.$kbox.find('form'), kbox, $diff);
                    },
                    error: function() {
                        var message = gettext('There was an error.');
                        alert(message);
                    }
                });
            });
        });
    }

    function ajaxifyDiffPicker($form, kbox, $diff) {
        $form.submit(function(ev) {
            ev.preventDefault();
            $.ajax({
                url: $form.attr('action'),
                type: 'GET',
                data: $form.serialize(),
                dataType: 'html',
                success: function(html) {
                    var $container = $diff.parent();
                    kbox.close();
                    $diff.replaceWith(html);
                    initDiffPicker();
                    initDiffToggle($container);
                }
            });
        });
    }

    // Add ability to switch the diff to full screen + fluid.
    function initDiffToggle($container) {
        $('table.diff', $container).each(function() {
            var $table = $(this),
                $link = $table.before('<a class="toggle-diff" href="#"></a>').prev(),
                fullWidth = false, // Are we full width?
                $clone, // A clone of the table.
                $placeholder; // A placeholder that fills in height behind
                              // overlayed table.
            $link.text(gettext('Toggle Diff'));

            $link.click(function(ev){
                var top;
                ev.preventDefault();
                if (fullWidth) {
                    $placeholder.remove();
                    $table.show();
                    $clone.remove();
                    $(window).unbind('resize', syncHeight);
                } else {
                    top = $table.offset().top;
                    $clone = $table.clone().addClass('full');
                    $clone.css('top', top + 'px');
                    $('body').append($clone);
                    $placeholder = $table.before('<section/>').prev();
                    syncHeight();
                    $table.hide();
                    $(window).resize(syncHeight);
                }
                fullWidth = !fullWidth;
            });
            function syncHeight() {
                $placeholder.height($clone.outerHeight() + 40);
            }
        });
    }

    // Add ability to move translation next to the diff.
    function initL10nTest($container) {
        if (!$('body').is('.translate')) {
            return;
        }

        $('table.diff', $container).each(function() {
            var $table = $(this),
                $l10n = $('#content-fields .localized'),
                position = $table.position(),
                $link = $table.before('<a class="toggle-l10n" style="float: right;" href="#"></a>').prev(),
                moved = false;
            $link.text(gettext('Toggle L10n'));

            $link.click(function(ev){
                var top;
                ev.preventDefault();
                if (moved) {
                    $l10n.css({
                        position: 'static'
                    });
                } else {
                    $l10n.css({
                        position: 'absolute',
                        top: position.top - 110,
                        left: position.left + $table.width() + 15
                    });

                    $l10n.find('textarea').height($table.height());
                }
                moved = !moved;
            });
        });
    }


    function initReadyForL10n() {
        var $watchDiv = $("#revision-list div.l10n"),
            post_url, checkbox_id;

        $watchDiv.find("a.markasready").click(function() {
            var $check = $(this);
            post_url = $check.data("url");
            checkbox_id = $check.attr("id");
            $("#ready-for-l10n-modal span.revtime").html("("+$check.data("revdate")+")");
        });

        $("#ready-for-l10n-modal input[type=submit]").click(function() {
            var csrf = $("#ready-for-l10n-modal input[name=csrfmiddlewaretoken]").val(),
            kbox = $("#ready-for-l10n-modal").data("kbox");
            if(post_url != undefined && checkbox_id != undefined) {
                $.ajax({
                    type: "POST",
                    url: post_url,
                    data: {csrfmiddlewaretoken: csrf},
                    success: function(response) {
                        $("#" + checkbox_id).removeClass("markasready").addClass("yes");
                        $("#" + checkbox_id).unbind("click");
                        kbox.close();
                    },
                    error: function() {
                        kbox.close();
                    }
                });
            }
        });
    }

    function addReferrerAndQueryToVoteForm() {
        // Add the source/referrer and query terms to the helpful vote form
        var urlParams = k.getQueryParamsAsDict(),
            referrer = k.getReferrer(urlParams),
            query = k.getSearchQuery(urlParams, referrer);
        $('.document-vote form')
            .append($('<input type="hidden" name="referrer"/>')
                .attr('value', referrer))
            .append($('<input type="hidden" name="query"/>')
                .attr('value', query));
    }

    function initNeedsChange() {
        // Hide and show the comment box based on the status of the
        // "Needs change" checkbox. Also, make the textarea required
        // when checked.
        var $checkbox = $('#id_needs_change'),
            $comment = $('#document-form li.comment,#approve-modal div.comment');

        if ($checkbox.length > 0) {
            updateComment();
            $checkbox.change(updateComment);
        }

        function updateComment() {
            if ($checkbox.is(':checked')) {
                $comment.slideDown();
                $comment.find('textarea').attr('required', 'required');
            } else {
                $comment.hide();
                $comment.find('textarea').removeAttr('required');
            }
        }
    }

    function watchDiscussion() {
        // For a thread on the all discussions for a locale.
        $('.watch-form').click(function() {
            var form = $(this);
            $.post(form.attr('action'), form.serialize(), function() {
                form.find('.watchtoggle').toggleClass('on')
            }).error(function() {
                // error growl
            });
            return false
        });
    }

    function initEditingTools() {
        // Init the show/hide links for editing tools
        $('#quick-links .edit a').click(function(ev) {
            ev.preventDefault();
            $('#doc-tabs').slideToggle('fast', function() {
                $('body').toggleClass('show-editing-tools');
            });

            if ($(this).is('.show')) {
                $.cookie('show-editing-tools', 1, {path: '/'});
            } else {
                $.cookie('show-editing-tools', null, {path: '/'});
            }
        });
    }

    $(document).ready(init);

}