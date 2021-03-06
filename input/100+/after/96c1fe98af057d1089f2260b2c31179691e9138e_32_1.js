function (require, exports, module) {
    'use strict';
    
    var Commands                = require("command/Commands"),
        CommandManager          = require("command/CommandManager"),
        Strings                 = require("strings"),
        ProjectManager          = require("project/ProjectManager"),
        EditorManager           = require("editor/EditorManager");
        
    /**
     * @private
     * Increases or decreases the editor's font size.
     * @param {number} -1 to make the font smaller; 1 to make it bigger.
     */
    function _adjustFontSize(direction) {
        var styleId = "codemirror-dynamic-fonts";

        var fs = $(".CodeMirror-scroll").css("font-size");
        var lh = $(".CodeMirror-scroll").css("line-height");

        var validFont = /^[\d\.]+(px|em)$/;
        
        // Make sure the font size and line height are expressed in terms
        // we can handle (px or em). If not, simply bail.
        if (fs.search(validFont) === -1 || lh.search(validFont) === -1) {
            return;
        }
        
        // Guaranteed to work by the validation above.
        var fsUnits = fs.substring(fs.length - 2, fs.length);
        var lhUnits = lh.substring(lh.length - 2, lh.length);

        fs = fs.substring(0, fs.length - 2);
        lh = lh.substring(0, lh.length - 2);

        var fsDelta = (fsUnits === "px") ? 1 : 0.1;
        var lhDelta = (lhUnits === "px") ? 1 : 0.1;

        if (direction === -1) {
            fsDelta *= -1;
            lhDelta *= -1;
        }

        var fsStr = (parseFloat(fs) + fsDelta) + fsUnits;
        var lhStr = (parseFloat(lh) + lhDelta) + lhUnits;

        // Don't let the fonts get too small.
        if (direction === -1 && ((fsUnits === "px" && fs <= 1) || (fsUnits === "em" && fs <= 0.1))) {
            return;
        }

        // It's necessary to inject a new rule to address all editors.
        $("#" + styleId).remove();
        var style = $("<style type='text/css'></style>").attr("id", styleId);
        style.html(".CodeMirror-scroll {" +
                   "font-size: "   + fsStr + " !important;" +
                   "line-height: " + lhStr + " !important;}");
        $("head").append(style);

        EditorManager.getCurrentFullEditor().refreshAll();
    }

    function _handleIncreaseFontSize() {
        _adjustFontSize(1);
    }

    function _handleDecreaseFontSize() {
        _adjustFontSize(-1);
    }
    
    
    CommandManager.register(Strings.CMD_INCREASE_FONT_SIZE, Commands.VIEW_INCREASE_FONT_SIZE, _handleIncreaseFontSize);
    CommandManager.register(Strings.CMD_DECREASE_FONT_SIZE, Commands.VIEW_DECREASE_FONT_SIZE, _handleDecreaseFontSize);
}