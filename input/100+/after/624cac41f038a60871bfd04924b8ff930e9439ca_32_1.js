function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM identifiers
        var rootel = $("#" + tuid);
        var uploadLink = ".upload_link";
        var fileuploadContainer = "#fileupload_container";
        var dataErrorMsg = "#mycontent_data_error";
        var contentList = "#mycontent_list";
        var listTemplate = "#mycontent_list_template";
        var ellipsisContainer = ".mycontent_ellipsis_container";


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Parses an individual JSON search result (returned from the
         * /var/search/pool/me/manager.json data feed) to be displayed in
         * mycontent.html.
         * @param {Object} result - individual result object from JSON data feed
         * @return {Object} object containing item.name, item.path, item.type (mimetype)
         *   and item.type_img_url (URL for mimetype icon) for the given result
         */
        var parseDataResult = function(result) {
            // initialize parsed item with default values
            var item = {
                name: result["sakai:pooled-content-file-name"],
                path: "/p/" + result["_path"],
                type: sakai.api.i18n.getValueForKey(sakai.config.MimeTypes.other.description),
                type_img_url: sakai.config.MimeTypes.other.URL,
                size: "",
                mimeType: sakai.api.Content.getMimeType(result),
                thumbnail: sakai.api.Content.getThumbnail(result),
                "_mimeType/page1-small": result["_mimeType/page1-small"],
                "_path": result["_path"]
            };

            // set the mimetype and corresponding image
            if(item.mimeType && sakai.config.MimeTypes[item.mimeType]) {
                // we have a recognized file type - set the description and img URL
                item.type = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes[item.mimeType].description);
                item.type_img_url = sakai.config.MimeTypes[item.mimeType].URL;
            }

            // set file name without the extension
            // be aware that links don't have an extension
            item.fullname = item.name;
            item.name = sakai.api.Util.applyThreeDots(item.name, $(".mycontent_widget .s3d-widget-content").width() - 80, {max_rows: 1,whole_word: false}, "s3d-bold");

            // set the file size
            if(result.hasOwnProperty("_length") && result["_length"]) {
                item.size = "(" + sakai.api.Util.convertToHumanReadableFileSize(result["_length"]) + ")";
            }

            return item;
        };

        /**
         * This AJAX callback function handles the search result data returned from
         * /var/search/pool/me/manager.json.  If the call was successful, up to 5 of
         * the most recently created files are presented to the user.
         * @param {Object} success - indicates the status of the AJAX call
         * @param {Object} data - JSON data from /var/search/pool/me/manager.json
         * @return None
         */
        var handleContentData = function(success, data) {
            if(success) {
                // parse & render data
                // build array of up to five items; reverse chronological order
                var contentjson = {
                    items: []
                };
                for(var i = 0; i < data.total && i < 5; i++) {
                    if (data.results[i]){
                        contentjson.items.push(parseDataResult(data.results[i]));
                    }
                }
                // pass the array to HTML view
                contentjson.sakai = sakai;
                $(contentList, rootel).html(sakai.api.Util.TemplateRenderer($(listTemplate), contentjson));

                $(".add_content_button", rootel).click(function (ev) {
                    $(window).trigger("init.newaddcontent.sakai");
                    return false;
                });

                $(contentList, rootel).show();
            } else {
                // display something useful to the user
                $(dataErrorMsg, rootel).show();
            }
            $(window).trigger("ready.mycontent.sakai");
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        $(document).on('done.newaddcontent.sakai', init);

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initiates fetching content data to be displayed in the My Content widget
         * @return None
         */
        var init = function() {
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);

            // get list of content items
            $.ajax({
                url: sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                cache: false,
                data: {
                    userid: sakai.data.me.user.userid,
                    page: 0,
                    items: 5,
                    sortOn: "_lastModified",
                    sortOrder: "desc"
                },
                success: function(data){
                    handleContentData(true, data);
                },
                error: function(data){
                    handleContentData(false);
                }
            });
        };

        // run init() function when sakai.content object loads
        init();
    }