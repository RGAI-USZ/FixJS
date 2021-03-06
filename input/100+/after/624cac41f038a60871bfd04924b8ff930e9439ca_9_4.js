function($, sakai_serv, sakai_util, sakai_i18n, sakai_user, sakai_config, sakai_widgets_config) {

    $.extend(true, sakai_widgets_config, sakai_config.WidgetSettings);

    var sakai = {
        widgets: sakai_widgets_config
    };
    var oldState = false;
    var sakaiWidgetsAPI = {
        /**
         * @class Container
         *
         * @description
         * This will expose 2 funcions that can be called by widgets to inform
         * the container that the widget has finished doing things in its settings
         * mode. The container can then do whatever it needs to do according to the
         * context it's in (f.e.: if in the personal dashboard environment, the container
         * will want to render the view mode of that widget, in a site page edit context
         * the container will want to insert the widget into the WYSIWYG editor).
         *
         * This will also allow the container to register 2 functions related to widget
         * settings mode. First of all, the container can register a finish function,
         * which will be executed when a widget notifies the container that it has
         * successfully finished its settings mode. It can also register a cancel
         * function, which will be executed when a widget notifies the container that
         * its settings mode has been cancelled.
         *
         * @namespace
         * Widget container functions
         *
         */

        Container : {

            toCallOnFinish : false,
            toCallOnCancel : false,

            /**
             * The container can use this to register a function to be executed when a widget notifies the container
             * that its settings mode has been successfully completed.
             * @param {Object} callback
             *  Function that needs to be executed when a widget notifies the container
             *  that its settings mode has been successfully completed.
             */
            registerFinishFunction : function(callback) {
                if (callback){
                    this.toCallOnFinish = callback;
                }
            },

            /**
             * The container can use this to register a function to be executed when a widget notifies the container
             * that its settings mode has been cancelled.
             * @param {Object} callback
             *  Function that needs to be executed when a widget notifies the container
             *  that its settings mode has been cancelled.
             */
            registerCancelFunction : function(callback) {
                if (callback){
                    this.toCallOnCancel = callback;
                }
            },

            /**
             * Function that can be called by a widget to notify the container that it
             * has successfully completed its settings mode
             * @param {Object} tuid
             *  Unique id (= id of the container this widget is in) of the widget
             * @param {Object} widgetname
             *     Name of the widget as registered in the widget config file(e.g. sites, myprofile, video, ...)
             */
            informFinish : function(tuid, widgetname) {
                if (this.toCallOnFinish){
                    this.toCallOnFinish(tuid, widgetname);
                }
            },

            /**
             * Function that can be called by a widget to notify the container that its
             * settings mode has been cancelled
             * @param {Object} tuid
             *  Unique id (= id of the container this widget is in) of the widget
             * @param {Object} widgetname
             *     Name of the widget as registered in the widget config file(e.g. sites, myprofile, video, ...)
             */
            informCancel : function(tuid, widgetname) {
                if (this.toCallOnCancel) {
                    this.toCallOnCancel(tuid, widgetname);
                }
            },

            readyToLoad : false,
            toLoad : [],

            registerForLoad : function(id) {
                this.toLoad[this.toLoad.length] = id.replace("sakai.", "");
                if (this.readyToLoad) {
                    this.performLoad();
                }
            },

            performLoad : function() {
                var i;
                for (i = 0, il = this.toLoad.length; i<il; i++){
                    var fct = window.sakai_global[this.toLoad[i]];
                    if ($.isFunction(fct)) {
                        fct();
                    } else {
                        debug.error("sakai magic - sakai.api.Widgets.Container.performLoad - The function couldn't execute correctly: '" + fct + "'");
                    }
                }
                this.toLoad = [];
            },

            setReadyToLoad : function(set) {
                this.readyToLoad = set;
                if (set) {
                    this.performLoad();
                }
            }

        },

        /**
         * Load the preference settings or data for a widget
         * @param {String} id The unique id of the widget
         * @param {Function} callback Callback function that gets executed after the load is complete
         * @param {Boolean} Determines whether or not the json tree descends down all the nodes. True by default.
         */
        loadWidgetData : function(id, callback, infinity) {
            // Get the URL from the widgetloader
            var url = sakaiWidgetsAPI.widgetLoader.widgets[id] ? sakaiWidgetsAPI.widgetLoader.widgets[id].placement : false;
            if (infinity === false) {
                url += ".json";
            }
            // Send a GET request to get the data for the widget
            sakai_serv.loadJSON(url, callback);
        },

        /**
         * Get the URL from which a widget should load its widget data and to which
         * it should store its widget data
         * @param {String} id   The unique id of the widget
         */
        getWidgetDataStorageURL : function(id) {
            if (id && sakaiWidgetsAPI.widgetLoader.widgets[id] && sakaiWidgetsAPI.widgetLoader.widgets[id].placement) {
                return sakaiWidgetsAPI.widgetLoader.widgets[id].placement;
            } else {
                debug.error("The widget with unique id " + id + " could not be found");
                return false;
            }
        },

        /**
         * Will be used for detecting widget declerations inside the page and load those
         * widgets into the page
         */
        cssCache : {},

        /**
         * @name sakai.api.Widgets.widgetLoader
         */
        widgetLoader : {

            loaded : [],
            widgets : {},

            /**
             * Function that can be called by the container. This will looks for widget declarations
             * within the specified container and will load the widgets in the requested mode (view - settings)
             * @param {Object} id
             *  Id of the HTML container in which we want to look for widget declarations
             * @param {Object} showSettings
             *  true  : render the settings mode of the widget
             *  false : render the view mode of the widget
             */
            insertWidgets : function(id, showSettings, context, widgetData, widgetDataPassthrough, callback) {
                var obj = this.loadWidgets(id, showSettings, context, widgetData, widgetDataPassthrough, callback);
                this.loaded.push(obj);
            },

            /**
             * Load the actual widgets
             * @param {String} id The id of the widget
             * @param {Boolean} showSettings
             *  true  : render the settings mode of the widget
             *  false : render the view mode of the widget
             * @param {String} context The context of the widget (e.g. siteid)
             */
            loadWidgets : function(id, showSettings, context, widgetData, widgetDataPassthrough, callback) {
                // Configuration variables
                var widgetNameSpace = "sakai_global";
                var widgetSelector = ".widget_inline";

                // Help variables
                var widgetsInternal = {}, settings = false;
                widgetData = widgetData || {};

                /**
                 * Inform the widget that is is loaded and execute the main JavaScript function
                 * If the widget name is "createsite", then the function sakai.createsite will be executed.
                 * @param {String} widgetname The name of the widget
                 */
                var informOnLoad = function(widgetname){
                    var doDelete;
                    // Check if the name of the widget is inside the widgets object.
                    if (widgetsInternal[widgetname] && widgetsInternal[widgetname].length > 0){

                        // Run through all the widgets with a specific name
                        for (var i = 0, j = widgetsInternal[widgetname].length; i<j; i++){
                            widgetsInternal[widgetname][i].done++;

                            if (widgetsInternal[widgetname][i].done === widgetsInternal[widgetname][i].todo){
                                // Save the placement in the widgets variable
                                sakaiWidgetsAPI.widgetLoader.widgets[widgetsInternal[widgetname][i].uid] = {
                                    "placement": widgetsInternal[widgetname][i].placement + widgetsInternal[widgetname][i].uid + "/" + widgetname,
                                    "name" : widgetname,
                                    "widgetData": widgetsInternal[widgetname][i].widgetData
                                };
                                // Run the widget's main JS function
                                var initfunction = window[widgetNameSpace][widgetname];
                                var historyState = sakaiWidgetsAPI.handleHashChange(widgetname);
                                initfunction(widgetsInternal[widgetname][i].uid, settings, widgetsInternal[widgetname][i].widgetData ? $.extend(true, {}, widgetsInternal[widgetname][i].widgetData) : false, historyState);
                                if ($.isFunction(widgetsInternal[widgetname][i].callback)) {
                                    widgetsInternal[widgetname][i].callback();
                                }

                                // Send out a "loaded" event for this widget
                                $(window).trigger(widgetname + "_loaded", [widgetsInternal[widgetname][i].uid]);

                                doDelete = true;
                            }
                        }

                        // Remove the widget from the widgets object (clean up)
                        if (doDelete){
                            delete widgetsInternal[widgetname];
                        }
                    }
                };

                /**
                 * Locate a tag and remove it from the content
                 * @param {String} content The complete content of a file (e.g. <div>...)
                 * @param {String} tagName The name of the tag you want to remove (link/script)
                 * @param {String} URLIdentifier The part that identifies the URL (href/src)
                 */
                var locateTagAndRemove = function(content, tagName, URLIdentifier){
                    var returnObject = {
                        URL : [],
                        content : content
                    };
                    var regexp = new RegExp('<'+tagName+'.*?'+URLIdentifier+'\\s?=\\s?["|'+'\''+']([^"]*)["|'+'\''+'].*/.*?>', "gi");
                    var regexp_match_result = regexp.exec(content);
                    while (regexp_match_result !== null) {
                        returnObject.URL[returnObject.URL.length] = regexp_match_result[1]; // value of URLIdentifier attrib
                        returnObject.content = returnObject.content.replace(regexp_match_result[0],""); // whole tag
                        regexp_match_result = regexp.exec(content);
                    }
                    return returnObject;
                };

                var sethtmlover = function(content,widgets,widgetname){

                    var CSSTags = locateTagAndRemove(content, "link", "href");
                    content = CSSTags.content;
                    var stylesheets = [];

                    for (var i = 0, j = CSSTags.URL.length; i<j; i++) {
                        // SAKIII-1524 - Instead of loading all of the widget CSS files independtly,
                        // we collect all CSS file declarations from all widgets in the current pass
                        // of the WidgetLoader. These will then be loaded in 1 go.
                        if ($.browser.msie && !sakaiWidgetsAPI.cssCache[CSSTags.URL[i]]) {
                            stylesheets.push(CSSTags.URL[i]);
                            sakaiWidgetsAPI.cssCache[CSSTags.URL[i]] = true;
                        } else {
                            sakai_util.include.css(CSSTags.URL[i]);
                        }
                    }

                    var JSTags = locateTagAndRemove(content, "script", "src");
                    content = JSTags.content;

                    for (var widget = 0, k = widgetsInternal[widgetname].length; widget < k; widget++){
                        var container = $("<div>");
                        container.html(content);
                        $("#" + widgetsInternal[widgetname][widget].uid).append(container);

                        // Set up draggable/droppable containers in the widget HTML if there are any
                        if($(".s3d-droppable-container", container).length){
                            sakai_util.Droppable.setupDroppable({}, container);
                        }
                        if($(".s3d-draggable-container", container).length){
                            sakai_util.Draggable.setupDraggable({}, container);
                        }

                        widgetsInternal[widgetname][widget].todo = JSTags.URL.length;
                        widgetsInternal[widgetname][widget].done = 0;
                    }

                    for (var JSURL = 0, l = JSTags.URL.length; JSURL < l; JSURL++){
                        sakai_util.include.js(JSTags.URL[JSURL]);
                    }

                    return stylesheets;

                };

                /**
                 * Load the files that the widget needs (HTML/CSS and JavaScript)
                 * @param {Object} widgets
                 * @param {Object} batchWidgets A list of all the widgets that need to load
                 */
                var loadWidgetFiles = function(widgetsInternal2, batchWidgets){
                    var urls = [];
                    var requestedURLsResults = [];
                    var requestedBundlesResults = [];

                    for(var k in batchWidgets){
                        if(batchWidgets.hasOwnProperty(k)){
                            var urlItem = {
                                "url" : k,
                                "method" : "GET"
                            };
                            urls[urls.length] = urlItem;
                        }
                    }

                    if(urls.length > 0){
                        var current_locale_string = sakai_i18n.getUserLocale();
                        var bundles = [];
                        for (var i = 0, j = urls.length; i<j; i++) {
                            var jsonpath = urls[i].url;
                            var widgetname = batchWidgets[jsonpath];
                            if ($.isPlainObject(sakai.widgets[widgetname].i18n)) {
                                if (sakai.widgets[widgetname].i18n["default"]){
                                    var bundleItem = {
                                        "url" : sakai.widgets[widgetname].i18n["default"].bundle,
                                        "method" : "GET"
                                    };
                                    bundles.push(bundleItem);
                                }
                                if (sakai.widgets[widgetname].i18n[current_locale_string]) {
                                    var item1 = {
                                        "url" : sakai.widgets[widgetname].i18n[current_locale_string].bundle,
                                        "method" : "GET"
                                    };
                                    bundles.push(item1);
                                }
                            }
                        }

                        var urlsAndBundles = urls.concat(bundles);
                        sakai_serv.batch(urlsAndBundles, function(success, data) {
                            if (success) {
                                // sort widget html and bundles into separate arrays
                                for (var h in data.results) {
                                    if (data.results.hasOwnProperty(h)) {
                                        for (var hh in urls) {
                                            if (data.results[h].url && urls[hh].url && data.results[h].url === urls[hh].url) {
                                                requestedURLsResults.push(data.results[h]);
                                            }
                                        }
                                        for (var hhh in bundles) {
                                            if (data.results[h].url && bundles[hhh].url && data.results[h].url === bundles[hhh].url) {
                                                requestedBundlesResults.push(data.results[h]);
                                            }
                                        }
                                    }
                                }

                                var stylesheets = [];
                                for (var i = 0, j = requestedURLsResults.length; i < j; i++) {
                                    // Current widget name
                                    var widgetName = requestedURLsResults[i].url.split("/")[2];
                                    // Check if widget has bundles
                                    var hasBundles = false;
                                    // Array containing language bundles
                                    var bundleArr = [];
                                    // Local and default bundle
                                    for (var ii = 0, jj = requestedBundlesResults.length; ii < jj; ii++) {
                                        if (widgetName === requestedBundlesResults[ii].url.split("/")[2]) {
                                            hasBundles = true;
                                            if (requestedBundlesResults[ii].url === sakai.widgets[widgetName].i18n['default'].bundle) {
                                                sakai_i18n.data.widgets[widgetName] = sakai_i18n.data.widgets[widgetName] || {};
                                                sakai_i18n.data.widgets[widgetName]["default"] = sakai_i18n.changeToJSON(requestedBundlesResults[ii].body);
                                            } else {
                                                sakai_i18n.data.widgets[widgetName] = sakai_i18n.data.widgets[widgetName] || {};
                                                sakai_i18n.data.widgets[widgetName][current_locale_string] = sakai_i18n.changeToJSON(requestedBundlesResults[ii].body);
                                            }
                                        }
                                    }

                                    // Change messages
                                    var translated_content = "", lastend = 0;
                                    if (hasBundles) {
                                        var expression = new RegExp(".{1}__MSG__(.*?)__", "gm");
                                        while (expression.test(requestedURLsResults[i].body)) {
                                            var replace = RegExp.lastMatch;
                                            var lastParen = RegExp.lastParen;
                                            var quotes = "";

                                            // need to add quotations marks if key is adjacent to an equals sign which means its probably missing quotes - IE
                                            if (replace.substr(0, 2) !== "__") {
                                                if (replace.substr(0, 1) === "=") {
                                                    quotes = '"';
                                                }
                                                replace = replace.substr(1, replace.length);
                                            }
                                            var toreplace;
                                            // check for i18n debug
                                            if (sakai_config.displayDebugInfo === true && sakai_user.data.me.user.locale && sakai_user.data.me.user.locale.language === "lu" && sakai_user.data.me.user.locale.country === "GB") {
                                                toreplace = quotes + replace.substr(7, replace.length - 9) + quotes;
                                                translated_content += requestedURLsResults[i].body.substring(lastend, expression.lastIndex - replace.length) + toreplace;
                                                lastend = expression.lastIndex;
                                            } else {
                                                toreplace = quotes + sakai_i18n.getValueForKey(lastParen, widgetName) + quotes;
                                                translated_content += requestedURLsResults[i].body.substring(lastend, expression.lastIndex - replace.length) + toreplace;
                                                lastend = expression.lastIndex;
                                            }
                                        }
                                        translated_content += requestedURLsResults[i].body.substring(lastend);
                                    } else {
                                        translated_content = sakai_i18n.General.process(requestedURLsResults[i].body, sakai_user.data.me);
                                    }
                                    var ss = sethtmlover(translated_content, widgetsInternal2, widgetName);
                                    for (var s = 0; s < ss.length; s++) {
                                        stylesheets.push(ss[s]);
                                    }
                                }
                                // SAKIII-1524 - IE has a limit of maximum 32 CSS files (link or style tags). When
                                // a lot of widgets are loaded into 1 page, we can easily hit that limit. Therefore,
                                // we adjust the widgetloader to load all CSS files of 1 WidgetLoader pass in 1 style
                                // tag filled with import statements
                                if ($.browser.msie && stylesheets.length > 0) {
                                    var numberCSS = $("head style, head link").length;
                                    // If we have more than 30 stylesheets, we will merge all of the previous style
                                    // tags we have created into the lowest possible number
                                    if (numberCSS >= 30) {
                                        $("head style").each(function(index){
                                            if ($(this).attr("title") && $(this).attr("title") === "sakai_widgetloader") {
                                                $(this).remove();
                                            }
                                        });
                                    }
                                    var allSS = [];
                                    var newSS = document.createStyleSheet();
                                    newSS.title = "sakai_widgetloader";
                                    var totalImportsInCurrentSS = 0;
                                    // Merge in the previously created style tags
                                    if (numberCSS >= 30) {
                                        for (var k in sakaiWidgetsAPI.cssCache) {
                                            if (sakaiWidgetsAPI.cssCache.hasOwnProperty(k)) {
                                                if (totalImportsInCurrentSS >= 30) {
                                                    allSS.push(newSS);
                                                    newSS = document.createStyleSheet();
                                                    newSS.title = "sakai_widgetloader";
                                                    totalImportsInCurrentSS = 0;
                                                }
                                                newSS.addImport(k);
                                                totalImportsInCurrentSS++;
                                            }
                                        }
                                    }
                                    // Add in the stylesheets declared in the widgets loaded
                                    // in the current pass of the WidgetLoader
                                    for (var m = 0, mm = stylesheets.length; m < mm; m++) {
                                        if (totalImportsInCurrentSS >= 30) {
                                            allSS.push(newSS);
                                            newSS = document.createStyleSheet();
                                            newSS.title = "sakai_widgetloader";
                                            totalImportsInCurrentSS = 0;
                                        }
                                        newSS.addImport(stylesheets[m]);
                                    }
                                    allSS.push(newSS);
                                    // Add the style tags to the document
                                    for (var z = 0; z < allSS.length; z++) {
                                        $("head").append(allSS[z]);
                                    }
                                }
                            }
                        });
                    }
                };

                /**
                 * Insert the widgets into the page
                 * @param {String} containerId The id of the container element
                 * @param {Boolean} showSettings Show the settings for the widget
                 * @param {Object} widgetData Widget data associated to the loaded widgets
                 * @param {String} context The context of the widget (e.g. siteid)
                 */
                var locateWidgets = function(containerId, showSettings, widgetData, context, callback) {

                    // Use document.getElementById() to avoid jQuery selector escaping issues with '/'
                    var el = containerId ? document.getElementById(containerId) : $(document.body);

                    // Array of jQuery objects that contains all the elements in the with the widget selector class.
                    var divarray = $(widgetSelector, el);

                    // Check if the showSettings variable is set, if not set the settings variable to false
                    settings = showSettings || false;

                    // Array that will contain all the URLs + names of the widgets that need to be fetched with batch get
                    var batchWidgets = [];

                    // Run over all the elements and load them
                    for (var i = 0, j = divarray.length; i < j; i++){
                        var id = divarray[i].id;
                        var split = id.split("_");
                        var widgetname = split[1];

                        // Set the id for the container of the widget
                        var widgetid;
                        if (split[2]){
                            widgetid = split[2];
                        } else if(widgetname) {
                            widgetid = widgetname + "container" + Math.round(Math.random() * 10000000);
                        }

                        // Check if the widget is an iframe widget
                        if (sakai.widgets[widgetname]) {

                            // Set the placement for the widget
                            var placement = "";
                            if (split[3] !== undefined){
                                var length = split[0].length + 1 + widgetname.length + 1 + widgetid.length + 1;
                                placement = id.substring(length);
                            } else if (context){
                                placement = context;
                            }

                            // Check if the widget exists
                            if (!widgetsInternal[widgetname]){
                                widgetsInternal[widgetname] = [];
                            }

                            // Set the initial properties for the widget
                            var index = widgetsInternal[widgetname].length;
                            widgetsInternal[widgetname][index] = {
                                uid : widgetid,
                                placement : placement,
                                id : id,
                                widgetData: widgetData[widgetid] || false,
                                callback: callback
                            };

                            var floating = "inline_class_widget_nofloat";
                            if ($(divarray[i]).hasClass("block_image_left")){
                                floating = "inline_class_widget_leftfloat";
                            } else if ($(divarray[i]).hasClass("block_image_right")){
                                floating = "inline_class_widget_rightfloat";
                            }

                            widgetsInternal[widgetname][index].floating = floating;
                            
                        }
                    }

                    for (i in widgetsInternal){
                        if (widgetsInternal.hasOwnProperty(i)) {
                            for (var ii = 0, jj = widgetsInternal[i].length; ii<jj; ii++) {

                                // Replace all the widgets with id "widget_" to widgets with new id's
                                // and add set the appropriate float class
                                $(document.getElementById(widgetsInternal[i][ii].id)).replaceWith($('<div id="'+widgetsInternal[i][ii].uid+'" class="' + widgetsInternal[i][ii].floating + '"></div>'));
                            }

                            var url = sakai.widgets[i].url;
                            batchWidgets[url] = i; //i is the widgetname
                        }
                    }

                    // Load the HTML files for the widgets
                    loadWidgetFiles(widgetsInternal, batchWidgets);

                };

                locateWidgets(id, showSettings, widgetData, context, callback);

                return {
                    "informOnLoad" : informOnLoad
                };
            },

            informOnLoad : function(widgetname){
                // Inform the widgets that they have been loaded
                for (var i = 0, j = sakaiWidgetsAPI.widgetLoader.loaded.length; i<j; i++){
                    sakaiWidgetsAPI.widgetLoader.loaded[i].informOnLoad(widgetname);
                }
            }

        },
        

        /**
         * Save the preference settings or data for a widget
         *
         * @param {String} id The unique id of the widget
         * @param {Object} content A JSON object that contains the data for the widget
         * @param {Function} callback Callback function that gets executed after the save is complete
         * @param {Boolean} removeTree If we should replace the entire tree of saved data or just update it
         * @return {Void}
         */
        saveWidgetData : function(id, content, callback, removeTree) {
            // Get the URL from the widgetloader
            var url = sakaiWidgetsAPI.widgetLoader.widgets[id].placement,
                widget = sakai_widgets_config[sakaiWidgetsAPI.widgetLoader.widgets[id].name],
                indexFields = false;

            if (widget && widget.indexFields) {
                indexFields = widget.indexFields;
            }
            sakaiWidgetsAPI.widgetLoader.widgets[id].widgetData = {};
            sakaiWidgetsAPI.widgetLoader.widgets[id].widgetData[sakaiWidgetsAPI.widgetLoader.widgets[id].name] = $.extend(true, {}, content);
            sakaiWidgetsAPI.widgetLoader.widgets[id].isStoringWidgetData = true;
            // Send a POST request to update/save the data for the widget
            sakai_serv.saveJSON(url, content, function(success, data){
                if ($.isFunction(callback)) {
                    callback(success, data);
                }
                sakaiWidgetsAPI.widgetLoader.widgets[id].isStoringWidgetData = false;
            }, removeTree, indexFields);
        },

        /**
         * Remove the preference settings or data for a widget
         *
         * @param {String} id The unique id of the widget
         * @param {Function} callback Callback function that gets executed after the delete is complete
         * @return {Void}
         */
        removeWidgetData : function(id, callback) {

            // Get the URL from the widgetloader
            var url = sakaiWidgetsAPI.widgetLoader.widgets[id].placement;

            // Send a DELETE request to remove the data for the widget
            sakai_serv.removeJSON(url, callback);

        },

        /**
         * Change the given widget's title
         *
         * @param {String} tuid The tuid of the widget
         * @param {String} title The title to change to
         */
        changeWidgetTitle : function(tuid, title) {
            title = sakai_util.applyThreeDots(title, $("#"+tuid).parent("div").siblings("div.fl-widget-titlebar").width() - 70, {max_rows:4}, "s3d-bold");
            $("#"+tuid).parent("div").siblings("div.fl-widget-titlebar").find("h2.widget_title").text(title);
        },

        /**
         * Check if a widget is on a dashboard
         *
         * @param {String} tuid The tuid of the widget
         * @return {Boolean} true if on a dashboard, false if not (for example, on a page)
         */
        isOnDashboard : function(tuid) {
            if ($("#"+tuid).parent("div").siblings("div.fl-widget-titlebar").find("h2.widget_title").length > 0) {
                return true;
            } else {
                return false;
            }
        },

        canEditContainer: function(widgetData, tuid) {
            if (widgetData &&
                widgetData.data &&
                widgetData.data.currentPageShown &&
                widgetData.data.currentPageShown.canEdit &&
                !widgetData.data.currentPageShown.nonEditable) {
                return true;
            } else if (!widgetData && tuid) {
                var ref = $("#" + tuid).parents("#s3d-page-container").children("div").attr("id");
                var canEdit = $("li[data-sakai-ref='"+ ref +"']").data("sakai-manage");
                return canEdit;
            } else {
                return false;
            }
        },

        /**
         * Notify widgets when they have been shown or hidden, given a root element
         *
         * @param {String} selector the root selector ("#theid") for the page which could house the widgets to nofity
         * @param {Boolean} showing true if we are showing the widget, false if it is about to be hidden
         */
        nofityWidgetShown : function(selector, showing) {
            var elts = $(selector).find("div[class^='inline_class_widget']");
            $.each(elts, function(i,elt) {
                var tuid = $(elt).attr("id");
                $(window).trigger(tuid + ".shown.sakai", [showing]);
            });
        },

        /**
         * This binds to any links with a hash URL and handles the
         * pushState for them
         */
        bindToHash : function() {
            $("a[href^='#']").live("click", function(e) {
                var $target = $(e.currentTarget),
                    args = $target.attr("href"),
                    replace = $target.data("reset-hash"),
                    remove = $target.data("remove-params"),
                    stateToAdd = {}, currentState = {}, newState = {};
                // new state to push
                stateToAdd = $.deparam.fragment(args, true);
                // current window.location.hash
                currentState = $.deparam.fragment();
                // the link wants to remove params from the url
                if (remove) {
                    // data-remove-params is a comma-delimited attribute
                    remove = remove.split(',');
                    $.each(remove, function(i,val) {
                        val = $.trim(val);
                        if (currentState[val]) {
                            delete currentState[val];
                        }
                    });
                }
                // replace means we should replace the state entirely with the new state from the link
                if (replace) {
                    newState = stateToAdd;
                } else {
                    // otherwise we merge the currentState with the stateToAdd
                    // note that any params in stateToAdd will override those in currentState
                    newState = $.extend({}, currentState, stateToAdd);
                }
                // Always push with the 2 argument as newState contains the entire state we want
                $.bbq.pushState(newState, 2);
                e.preventDefault();
            });
            oldState = $.bbq.getState();
            $(window).bind("hashchange", sakaiWidgetsAPI.handleHashChange);
            $(window).trigger("hashchange");
        },

        /**
         * This function is used for creating href's to link to a
         * hash change
         * @param {Object} paramsObject The object containing key value pairs
         *                              to add to the URL
         * @param {String} url          The url you want to add hash parameters
         *                              to. If not provided, the system will use
         *                              the current page URL.
         */
        createHashURL : function(paramsObject, url) {
            return $.param.fragment(url || window.location.hash, paramsObject);
        },

        /**
         * Handle the hash change and dispatch the hashchange event
         * to each widget that has the changed parameter
         * @param {Object} e The hashchange event object
         */
        handleHashChange : function(e) {
            var widgetHashes = {};
            // get the changed params
            var currentState = $.bbq.getState();

            /** 
             * construct the changedParams object which contains a map like this:
             * widgetHashes = { "widgetid" : { "changed": {"property": "value"}, "deleted": {}}};
             */
            if (!$.isEmptyObject(sakai_widgets_config)) {
                $.each(sakai_widgets_config, function(id, obj) {
                    if (obj.hasOwnProperty('hashParams')) {
                        // iterate over each of the params that the widet watches
                        $.each(obj.hashParams, function(i, val) {
                            // If the current history state has this value
                            if (currentState.hasOwnProperty(val)) {
                                widgetHashes[id] = widgetHashes[id] || {changed:{}, deleted:{}, all: {}};
                                // and the oldState value exists and isn't the same as the new value
                                // or the oldState didn't have the value
                                if ((oldState.hasOwnProperty(val) && oldState[val] !== currentState[val]) ||
                                    !oldState.hasOwnProperty(val)) {

                                    widgetHashes[id].changed[val] = currentState[val];
                                }
                                widgetHashes[id].all[val] = currentState[val];

                            // Check if the property was in the history state previously,
                            // indicating that it was deleted from the currentState
                            } else if (oldState.hasOwnProperty(val)) {
                                widgetHashes[id] = widgetHashes[id] || {changed:{}, deleted:{}, all: {}};
                                widgetHashes[id].deleted[val] = oldState[val];
                            }
                        });
                    }
                });
                if (e.currentTarget) {
                    // Fire an event to each widget that has the hash params in it
                    $.each(widgetHashes, function(widgetID, hashObj) {
                        $(window).trigger("hashchanged." + widgetID + ".sakai", [hashObj.changed || {}, hashObj.deleted || {}, hashObj.all || {}, currentState || {}]);
                    });

                    // Reset the oldState to the currentState
                    oldState = currentState;
                    return true;
                } else {
                    return widgetHashes[e];
                }
            } else {
                return null;
            }
        },

        /**
         * This function will return widget configuration for a specific widget
         * @param {Object} widgetid     id of the widget as specified in the widget's config file
         */
        getWidget: function(widgetid) {
            if (sakai.widgets[widgetid]) {
                return sakai.widgets[widgetid];
            } else {
                debug.error('A config file was not found for the following widget: ' + widgetid);
                return false;
            }
        },

        /**
         * This function will return the name of a widget in the current user's language
         * @param {Object} widgetid  id of the widget as specified in the widget's config file
         */
        getWidgetTitle: function(widgetid){
            // Get the user's current locale from the me object
            var locale = sakai_i18n.getUserLocale();
            if (locale === "lu_GB") {
                return widgetid.toUpperCase();
            } else {
                if (sakai.widgets[widgetid]){
                    if (sakai.widgets[widgetid].i18n[locale] && sakai.widgets[widgetid].i18n[locale].name){
                        return sakai.widgets[widgetid].i18n[locale].name;
                    } else {
                        return sakai.widgets[widgetid].i18n["default"].name;
                    }
                } else {
                    debug.error("A config file was not found for the following widget: " + widgetid);
                }
            }
        },

        /**
         * This function will return the description of a widget in the current user's language
         * @param {Object} widgetid  id of the widget as specified in the widget's config file
         */
        getWidgetDescription: function(widgetid){
            // Get the user's current locale from the me object
            var locale = sakai_i18n.getUserLocale();
            if (locale === "lu_GB") {
                return widgetid.toUpperCase();
            } else {
                if (sakai.widgets[widgetid]){
                    if (sakai.widgets[widgetid].i18n[locale] && sakai.widgets[widgetid].i18n[locale].description){
                        return sakai.widgets[widgetid].i18n[locale].description;
                    } else {
                        return sakai.widgets[widgetid].i18n["default"].description;
                    }
                } else {
                    debug.error("A config file was not found for the following widget: " + widgetid);
                }
            }
        },

        /**
         * Add the widgets that need to be present at all time on all pages
         */
        insertOnLoadWidgets: function() {
            if (sakai.widgets) {
                var onloadWidgets = '';
                $.each(sakai.widgets, function(widgetid, widget) {
                    if (widget.trigger && widget.trigger.onLoad) {
                        onloadWidgets += '<div id="widget_' + widgetid + '" class="widget_inline"></div>';
                    }
                });
                if (onloadWidgets) {
                    $('body').prepend(onloadWidgets);
                }
            }
        },

        /**
         * This function will register all widgets that require lazy loading
         */
        registerLazyLoading: function() {
            if (sakai.widgets) {
                $.each(sakai.widgets, function(widgetid, widget) {
                    if (widget.trigger && !widget.trigger.onLoad) {
    
                        // Convert all of the properties to an array
                        if (widget.trigger.events && widget.trigger.events.length) {
                            if (!$.isArray(widget.trigger.events)) {
                                widget.trigger.events = [widget.trigger.events];
                            }
                        }
                        widget.trigger.events = widget.trigger.events || [];
    
                        if (widget.trigger.selectors && widget.trigger.selectors.length) {
                            if (!$.isArray(widget.trigger.selectors)) {
                                widget.trigger.selectors = [widget.trigger.selectors];
                            }
                        }
                        widget.trigger.selectors = widget.trigger.selectors || [];
    
                        var lazyLoadWidget = function(finishCallBack) {
                            // Unbind the event
                            $.each(widget.trigger.events, function(index, eventid) {
                                $(document).off(eventid);
                            });
                            // Also kill the click events associated to this widget
                            $.each(widget.trigger.selectors, function(index, selector) {
                                $(document).off('click', selector);
                            });
    
                            $('body').prepend('<div id="widget_' + widgetid + '" class="widget_inline"></div>');
                            sakaiWidgetsAPI.widgetLoader.insertWidgets(null, false, null, null, null, finishCallBack);
                        }
    
                        // Check whether this needs to bind to an event
                        $.each(widget.trigger.events, function(index, eventid) {
                            // a, b, c, ..., i, j is a list of possible parameters that can be passed
                            // in when the event is called. As we have no idea how many will come through,
                            // we generically catch them and pass them back on when we re-call the event
                            $(document).on(eventid, function(ev, a, b, c, d, e, f, g, h, i, j) {
                                lazyLoadWidget(function() {
                                    $(document).trigger(eventid, [a, b, c, d, e, f, g, h, i, j]);
                                });
                            });
                        });
    
                        // Check whether this needs to bind to a selector
                        $.each(widget.trigger.selectors, function(index, selector) {
                            $(document).on('click', selector, function(event, ui) {
                                lazyLoadWidget(function() {
                                    $(event.target).trigger('click', [event, ui]);
                                });
                            });
                        });
    
                    }
                });
            }
        },

        initialLoad : function() {
            sakaiWidgetsAPI.bindToHash();
            sakaiWidgetsAPI.Container.setReadyToLoad(true);

            sakaiWidgetsAPI.insertOnLoadWidgets();
            sakaiWidgetsAPI.widgetLoader.insertWidgets(null, false);

            sakaiWidgetsAPI.registerLazyLoading();

            // Set up draggable/droppable containers for the main page if there are any
            if($(".s3d-droppable-container", $("body")).length){
                sakai_util.Droppable.setupDroppable({}, $("body"));
            }
            if($(".s3d-draggable-container", $("body")).length){
                sakai_util.Draggable.setupDraggable({}, $("body"));
            }
        },

        /**
         * Check to see if a widget is embeddded inside itself
         *
         * @param {jQuery} $rootel The rootel of the widget
         * @param {String} poolID The pool id of the widget
         * @param {String} ref The _ref of the widget
         *
         * @return {Boolean} if it is safe to embed the widget
         */
        isRecursivelyEmbedded: function($rootel, poolID, ref) {
            return $rootel && poolID && ref &&
                $rootel.parents('#' + poolID + '-' + ref + ', #' + ref).length !== 0;
        }
    };

    return sakaiWidgetsAPI;
}