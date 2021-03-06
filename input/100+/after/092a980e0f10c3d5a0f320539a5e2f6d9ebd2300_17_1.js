function main(require, exports, module) {
    "use strict";

    var DocumentManager = require("document/DocumentManager"),
        Commands        = require("command/Commands"),
        LiveDevelopment = require("LiveDevelopment/LiveDevelopment"),
        Inspector       = require("LiveDevelopment/Inspector/Inspector"),
        CommandManager  = require("command/CommandManager"),
        Strings = require("strings");

    var config = {
        debug: true, // enable debug output and helpers
        autoconnect: false, // go live automatically after startup?
        highlight: false, // enable highlighting?
        highlightConfig: { // the highlight configuration for the Inspector
            borderColor:  {r: 255, g: 229, b: 153, a: 0.66},
            contentColor: {r: 111, g: 168, b: 220, a: 0.55},
            marginColor:  {r: 246, g: 178, b: 107, a: 0.66},
            paddingColor: {r: 147, g: 196, b: 125, a: 0.66},
            showInfo: true
        }
    };
    var _checkMark = "✓"; // Check mark character
    // Status labels/styles are ordered: error, not connected, progress1, progress2, connected.
    var _statusTooltip = [Strings.LIVE_DEV_STATUS_TIP_NOT_CONNECTED, Strings.LIVE_DEV_STATUS_TIP_NOT_CONNECTED, Strings.LIVE_DEV_STATUS_TIP_PROGRESS1,
                          Strings.LIVE_DEV_STATUS_TIP_PROGRESS2, Strings.LIVE_DEV_STATUS_TIP_CONNECTED];  // Status indicator tooltip
    var _statusStyle = ["warning", "", "info", "info", "success"];  // Status indicator's CSS class
    var _allStatusStyles = _statusStyle.join(" ");
    
    var _$btnGoLive; // reference to the GoLive button
    var _$btnHighlight; // reference to the HighlightButton

    /** Load Live Development LESS Style */
    function _loadStyles() {
        var request = new XMLHttpRequest();
        request.open("GET", "LiveDevelopment/main.less", true);
        request.onload = function onLoad(event) {
            var parser = new less.Parser();
            parser.parse(request.responseText, function onParse(err, tree) {
                console.assert(!err, err);
                $("<style>" + tree.toCSS() + "</style>")
                    .appendTo(window.document.head);
            });
        };
        request.send(null);
    }

    /**
     * Change the appearance of a button. Omit text to remove any extra text; omit style to return to default styling;
     * omit tooltip to leave tooltip unchanged.
     */
    function _setLabel($btn, text, style, tooltip) {
        // Clear text/styles from previous status
        $("span", $btn).remove();
        $btn.removeClass(_allStatusStyles);
        
        // Set text/styles for new status
        if (text && text.length > 0) {
            $("<span class=\"label\">")
                .addClass(style)
                .text(text)
                .appendTo($btn);
        } else {
            $btn.addClass(style);
        }
        
        if (tooltip) {
            $btn.attr("title", tooltip);
        }
    }

    /** Toggles LiveDevelopment and synchronizes the state of UI elements that reports LiveDevelopment status */
    function _handleGoLiveCommand() {
        if (LiveDevelopment.status > 0) {
            LiveDevelopment.close();
            // TODO Ty: when checkmark support lands, remove checkmark
        } else {
            LiveDevelopment.open();
            // TODO Ty: when checkmark support lands, add checkmark
        }
    }

    /** Create the menu item "Go Live" */
    function _setupGoLiveButton() {
        _$btnGoLive = $("#toolbar-go-live");
        _$btnGoLive.click(function onGoLive() {
            _handleGoLiveCommand();
        });
        $(LiveDevelopment).on("statusChange", function statusChange(event, status) {
            // status starts at -1 (error), so add one when looking up name and style
            // See the comments at the top of LiveDevelopment.js for details on the 
            // various status codes.
            _setLabel(_$btnGoLive, null, _statusStyle[status + 1], _statusTooltip[status + 1]);
        });
        
        // Initialize tooltip for 'not connected' state
        _setLabel(_$btnGoLive, null, _statusStyle[1], _statusTooltip[1]);
    }

    /** Create the menu item "Highlight" */
    function _setupHighlightButton() {
        // TODO: this should be moved into index.html like the Go Live button once it's re-enabled
        _$btnHighlight = $("<a href=\"#\">Highlight </a>");
        $(".nav").append($("<li>").append(_$btnHighlight));
        _$btnHighlight.click(function onClick() {
            config.highlight = !config.highlight;
            if (config.highlight) {
                _setLabel(_$btnHighlight, _checkMark, "success");
            } else {
                _setLabel(_$btnHighlight);
                LiveDevelopment.hideHighlight();
            }
        });
        if (config.highlight) {
            _setLabel(_$btnHighlight, _checkMark, "success");
        }
    }

    /** Setup window references to useful LiveDevelopment modules */
    function _setupDebugHelpers() {
        window.ld = LiveDevelopment;
        window.i = Inspector;
        window.report = function report(params) { window.params = params; console.info(params); };
    }

    /** Initialize LiveDevelopment */
    function init() {
        Inspector.init(config);
        LiveDevelopment.init(config);
        _loadStyles();
        _setupGoLiveButton();
        /* _setupHighlightButton(); FUTURE - Highlight button */
        if (config.debug) {
            _setupDebugHelpers();
        }
    }
    window.setTimeout(init);

    CommandManager.register(Strings.CMD_LIVE_FILE_PREVIEW,  Commands.FILE_LIVE_FILE_PREVIEW, _handleGoLiveCommand);

    // Export public functions
    exports.init = init;
}