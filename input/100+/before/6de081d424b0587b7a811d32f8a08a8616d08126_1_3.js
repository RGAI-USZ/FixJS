function(tuid, showSettings){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $('#' + tuid);
        var json = false;
        var isAdvancedSettingsVisible = false;

        // Default values
        var defaultWidth = 100;
        var defaultWidthUnit = '%';
        var defaultHeight = 200;

        // Links and labels
        var basiclti = '#basiclti';
        var basicltiSettings = basiclti + '_settings';
        var basicltiSettingsAdvanced = basicltiSettings + '_advanced';
        var basicltiSettingsAdvancedDown = basicltiSettingsAdvanced + '_down';
        var basicltiSettingsAdvancedToggleSettings = basicltiSettingsAdvanced + '_toggle_settings';
        var basicltiSettingsAdvancedUp = basicltiSettingsAdvanced + '_up';
        var basicltiSettingsBorders = basicltiSettings + '_borders';
        var basicltiSettingsCancel = basicltiSettings + '_cancel';
        var basicltiSettingsColorContainer = basicltiSettings + '_color_container';
        var basicltiSettingsHeight = basicltiSettings + '_frame_height';
        var basicltiSettingsInsert = basicltiSettings + '_insert';
        var basicltiSettingsPreview = basicltiSettings + '_preview';
        var basicltiSettingsPreviewId = tuid + '_frame';
        var basicltiSettingsPreviewFrame = '#' + basicltiSettingsPreviewId;
        var basicltiSettingsLtiUrl = basicltiSettings + '_ltiurl';
        var basicltiSettingsLtiKey = basicltiSettings + '_ltikey';
        var basicltiSettingsLtiSecret = basicltiSettings + '_ltisecret';
        var basicltiSettingsWidth = basicltiSettings + '_width';
        var basicltiSettingsDebug = basicltiSettings + '_debug';

        // Containers
        var basicltiMainContainer = basiclti + '_main_container';

        // Classes
        var basicltiSettingsWidthUnitClass = '.basiclti_settings_width_unit';
        var basicltiSettingsWidthUnitSelectedClass = 'basiclti_settings_width_unit_selected';

        // Templates
        var $basicltiSettingsColorContainerTemplate = $('#basiclti_settings_color_container_template', $rootel);
        var $basicltiSettingsTemplate = $('#basiclti_settings_template', $rootel);
        var $basicltiSettingsPreviewTemplate = $('#basiclti_settings_preview_template', $rootel);

        // see: http://www.ietf.org/rfc/rfc2396.txt Appendix B
        var urlRegExp = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?');


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Check if the value is a decimal or not
         * @param {Object} value Value that needs to be checked
         * @return {Boolean}
         *     true: is a decimal
         *     false: is not a decimal
         */
        var isDecimal = function(value){
            return (/^\d+$/).test(value);
        };

        /**
         * Check if the input url is in fact an url or not
         * @param {String} url Url that needs to be tested
         * @return {Boolean}
         *     true: is an url
         *     false: is not an url
         */
        var isUrl = function(url) {
            var matches = urlRegExp.exec(url);
            // e.g. if('http:' && 'localhost')
            if (matches[1] && matches[4]) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Check to see if both URLs are in the same origin. See: http://en.wikipedia.org/wiki/Same_origin_policy.
         * @param {String} url1
         * @param {String} url2
         * @return {Boolean}
         *     true: in the same origin policy
         *     false: NOT in the same origin policy
         */
        var isSameOriginPolicy = function(url1, url2) {
            if (url1 == url2) {
                return true;
            }
            // i.e. protocol, domain (and optional port numbers) must match
            if ((urlRegExp.exec(url1)[2] == urlRegExp.exec(url2)[2]) &&
               (urlRegExp.exec(url1)[4] == urlRegExp.exec(url2)[4])) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Called when the data has been saved to the JCR.
         */
        var savedDataToJCR = function() {
            displayRemoteContent(json);
            sakai.api.Widgets.Container.informFinish(tuid, 'basiclti');
        };


        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the iframe for the widget in settings mode
         * @param {Boolean} complete Render the preview completely or only adjust values
         */
        var renderIframeSettings = function(complete) {
            if (complete) { 
                json.launchDataUrl = sakai.config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + '/_widgets').replace(/__TUID__/, tuid).replace(/__NAME__/, 'basiclti') + '.launch.html';               
                $(basicltiSettingsPreview, $rootel).html(sakai.api.Util.TemplateRenderer($basicltiSettingsPreviewTemplate, json));
            } else {
                $(basicltiSettingsPreviewFrame, $rootel).attr('style', 'border: ' + json.border_size + 'px #' + json.border_color + ' solid');
            }
        };

        /**
         * Render the iframe for the widget
         */
        var renderIframe = function() {
            if (json) {
                json.tuidFrame = basicltiSettingsPreviewId;
                $(basicltiMainContainer, $rootel).html(sakai.api.Util.TemplateRenderer($basicltiSettingsPreviewTemplate, json));
                json.launchDataUrl = sakai.api.Widgets.getWidgetDataStorageURL(tuid) + '.launch.html';
                $('#' + json.tuidFrame, $rootel).attr('src', json.launchDataUrl);

                // resize the iframe to match inner body height if in the same origin (i.e. same protocol/domain/port)
                if (isSameOriginPolicy(window.location.href, json.ltiurl)) {
                    $(basicltiSettingsPreviewFrame, $rootel).load(function() {
                        $(this).height($(this).contents().find('body').height() + 15); // add 10px for IE and 5px more for Gradebook weirdness
                    });
                }

                // SAKIII-314 We need to show the container, otherwise the second item won't be shown.
                $(basicltiMainContainer, $rootel).show();
            }
        };

        /**
         * Render the html of the basicltisettings
         */
        var renderRemoteContentSettings = function() {
            if (json) {
                $(basicltiSettings, $rootel).html(sakai.api.Util.TemplateRenderer($basicltiSettingsTemplate, json));
            }
        };

        /**
         * Render the color container
         */
        var renderColorContainer = function() {
            if (json) {
                $(basicltiSettingsColorContainer, $rootel).html(sakai.api.Util.TemplateRenderer($basicltiSettingsColorContainerTemplate, json));
            }
        };


        //////////////////////
        // Global functions //
        //////////////////////

        /**
         * Display the iframe in normal mode
         * @param {Object} parameters JSON object that contains the necessary information for the iframe
         */
        var displayRemoteContent = function(parameters) {
            // default to some reasonable vaules if the settings node does not have them (maybe a legacy node)
            if (parameters.border_size === null) {
                parameters.border_size = 0;
            }
            if (parameters.border_color === null) {
                parameters.border_color = 'cccccc';
            }
            if (parameters.width === null) {
                parameters.width = defaultWidth;
            }
            if (parameters.width_unit === null) {
                parameters.width_unit = defaultWidthUnit;
            }
            if (parameters.frame_height === null) {
                parameters.frame_height = defaultHeight;
            }
            json = parameters;
            renderIframe();
        };

        var saveContentAjax = function(savedata) {
            $.ajax({
                type: 'POST',
                url: sakai.api.Widgets.getWidgetDataStorageURL(tuid),
                data: savedata,
                success: function(data) {
                    savedDataToJCR(true, data);
                }
            });
        };

        /**
         * Save the basiclti to the jcr
         */
        var saveRemoteContent = function(){
 
            if (json.ltiurl !== '') {

                var savejson = {
                    ':operation': 'basiclti',
                    ':contentType': 'json',
                    ':replace': true,
                    ':replaceProperties': true,
                    '_charset_': 'utf-8'
                };

                var dbg = $(basicltiSettingsDebug + ':checked', $rootel).val();
                var savejson_content = {
                    'sling:resourceType': 'sakai/basiclti',
                    'ltiurl': $(basicltiSettingsLtiUrl, $rootel).val() || '',
                    'ltikey': $(basicltiSettingsLtiKey, $rootel).val() || '',
                    'ltisecret': $(basicltiSettingsLtiSecret, $rootel).val() || '',
                    'debug@TypeHint': 'Boolean',
                    'debug': dbg !== undefined  && dbg !== null,
                    'release_names@TypeHint': 'Boolean',
                    'release_names': $('#basiclti_settings_release_names:checked', $rootel).val() !== null,
                    'release_principal_name@TypeHint': 'Boolean',
                    'release_principal_name': $('#basiclti_settings_release_principal_name:checked', $rootel).val() !== null,
                    'release_email@TypeHint': 'Boolean',
                    'release_email': $('#basiclti_settings_release_email:checked', $rootel).val() !== null,
                    'launchDataUrl': '', // does not need to be persisted
                    'tuidFrame': '', // does not need to be persisted
                    'defined': '' // what the heck is this? Where does it come from?
                };
                savejson_content = $.extend({}, json, savejson_content);
                json = savejson_content;
                savejson[':content'] = JSON.stringify(savejson_content);
                saveContentAjax(savejson);
            } else {
                sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('PLEASE_SPECIFY_A_URL', 'basiclti'),
                                                 sakai.api.Util.notification.type.ERROR);
            }
        };

        /**
         * Change the direction (up/down) of the arrow for the advanced settings
         */
        var changeAdvancedSettingsArrow = function() {
            if (isAdvancedSettingsVisible) {
                $(basicltiSettingsAdvancedDown, $rootel).hide();
                $(basicltiSettingsAdvancedUp, $rootel).show();
            } else {
                $(basicltiSettingsAdvancedUp, $rootel).hide();
                $(basicltiSettingsAdvancedDown, $rootel).show();
            }
        };


        //////////////
        // Bindings //
        //////////////

        /*
         * Add binding to all the elements
         */
        var addBinding = function() {
            // Change the url for the iFrame
            $(basicltiSettingsLtiUrl, $rootel).on('change', function(){
                var urlValue = $(this).val();
                if (urlValue !== '') {
                    // Check if someone already wrote http inside the url
                    if (!isUrl(urlValue)) {
                        urlValue = 'http://' + urlValue;
                    }
                    json.ltiurl = urlValue;
                    //renderIframeSettings(true); // LDS disabled preview
                }
            });

            // Change the iframe width
            $(basicltiSettingsWidth, $rootel).on('change', function(){
                var widthValue = $(basicltiSettingsWidth, $rootel).val();

                if (isDecimal(widthValue)) {
                    json.width = widthValue;
                }
                renderIframeSettings(false);
            });

            // Change the iframe height
            $(basicltiSettingsHeight, $rootel).on('change', function(){
                var heightValue = $(basicltiSettingsHeight, $rootel).val();
                if (isDecimal(heightValue)) {
                    json.frame_height = heightValue;
                }
                renderIframeSettings(false);
            });

            // Change the border width
            $(basicltiSettingsBorders, $rootel).on('change', function() {
                var borderValue = $(basicltiSettingsBorders, $rootel).val();
                if (isDecimal(borderValue)) {
                    json.border_size = borderValue;
                    renderIframeSettings(false);
                }
            });

            // Toggle the advanced view
            $(basicltiSettingsAdvancedToggleSettings, $rootel).on('click', function() {
                $('#basiclti_settings_advanced', $rootel).toggle();
                isAdvancedSettingsVisible = !isAdvancedSettingsVisible;
                changeAdvancedSettingsArrow();
            });

            // When you click on one of the width units (px or percentage)
            $(basicltiSettingsWidthUnitClass, $rootel).on('click', function() {
                var widthUnitValue = $(this).attr('id').split('_')[$(this).attr('id').split('_').length - 1];
                if (widthUnitValue === 'px') {
                    json.width_unit = widthUnitValue;
                } else {
                    json.width_unit = '%';
                }
                $(basicltiSettingsWidthUnitClass, $rootel).removeClass(basicltiSettingsWidthUnitSelectedClass);
                $(this).addClass(basicltiSettingsWidthUnitSelectedClass);
                renderIframeSettings(false);
            });

            // Save the settings
            $(basicltiSettingsInsert, $rootel).on('click', function() {
                saveRemoteContent();
            });

            // Cancel the settings
            $(basicltiSettingsCancel, $rootel).on('click', function() {
                sakai.api.Widgets.Container.informCancel(tuid, 'basiclti');
            });

            $('.basiclti_settings_color', $rootel).on('click', function() {
                json.border_color = $(this).attr('id').split('_')[$(this).attr('id').split('_').length - 1];
                renderIframeSettings(false);
                renderColorContainer();
            });
        };


        ///////////////////////
        // Initial functions //
        ///////////////////////

        /**
         * Function that fills in the input fields in the settings tab.
         * @param {Object} parameters A JSON object that contains the necessary information.
         * @param {Boolean} exists Does there exist a previous basiclti
         */
        var displaySettings = function(parameters, exists) {
            if (exists && parameters.ltiurl) {
                if (parameters[':content']){
                    json = $.parseJSON(parameters[':content']);
                } else {
                    json = parameters;
                }
            } else { // use default values
                json = {
                    ltiurl: '',
                    ltikey: '',
                    ltisecret: '',
                    release_names: true,
                    release_principal_name: true,
                    release_email: true,
                    border_size: 0,
                    border_color: 'ccc',
                    frame_height: defaultHeight,
                    width: defaultWidth,
                    width_unit: defaultWidthUnit,
                    debug: false
                };
            }
            renderRemoteContentSettings();
            renderColorContainer();
            addBinding();
            changeAdvancedSettingsArrow();
            $(basicltiSettings, $rootel).show();
        };

        /**
         * Will fetch the URL and other parameters from the JCR and according to which
         * view we are in, fill in the settings or display an iframe.
         */
        var getRemoteContent = function() {
            sakai.api.Widgets.loadWidgetData(tuid, function(success,data){
                if (success) {
                    if (showSettings) {
                        displaySettings(data,true);
                    } else {
                        displayRemoteContent(data);
                    }
                } else {
                    displaySettings(null, false);
                }
            }, false);
        };

        /*
         * Is the widget in settings mode or not
         */
        if (showSettings) {
            $(basicltiMainContainer, $rootel).hide();
            $(basicltiSettings, $rootel).show();
        } else {
            $(basicltiSettings, $rootel).hide();
            $(basicltiMainContainer, $rootel).show();
        }

        getRemoteContent();
    }