function (require, exports, module) {
    'use strict';
    
    // Load dependent modules
    var HTMLUtils     = require("language/HTMLUtils"),
        EditorManager = require("editor/EditorManager");
    
    /**
     * @private
     * Test functions to see if the hinting is working
     * @param {CodeMirror} editor An instance of a CodeMirror editor
     */
    function _triggerClassHint(editor, pos, tagInfo) {
        //console.log("_triggerClassHint called for tag: " + tagInfo.tagName + " and attr value: " + tagInfo.attr.value);
    }
    
    function _triggerIdHint(editor, pos, tagInfo) {
        //console.log("_triggerIdHint called for tag: " + tagInfo.tagName + " and attr value: " + tagInfo.attr.value);
    }
    
    /**
     * @private
     * Checks to see if this is an attribute value we can hint
     * @param {CodeMirror} editor An instance of a CodeMirror editor
     */
    function _checkForHint(editor) {
        var pos = editor.getCursor();
        var tagInfo = HTMLUtils.getTagInfo(editor, pos);
        if (tagInfo.position.type === HTMLUtils.ATTR_VALUE) {
            if (tagInfo.attr.name === "class") {
                _triggerClassHint(editor, pos, tagInfo);
            } else if (tagInfo.attr.name === "id") {
                _triggerIdHint(editor, pos, tagInfo);
            }
        }
    }
    
    /**
     * @private
     * Called whenever a CodeMirror editor gets a key event
     * @param {object} event the jQuery event for onKeyEvent
     * @param {CodeMirror} editor An instance of a CodeMirror editor
     * @param {object} keyboardEvent  the raw keyboard event that CM is handling
     */
    function _onKeyEvent(event, editor, keyboardEvent) {
        if (keyboardEvent.type !== "keypress") {
            return;
        }
        window.setTimeout(function () { _checkForHint(editor); }, 40);
    }
    
    // Register our listeners
    // Commenting out the code hinting for now. Uncomment this line to re-enable.
    // NOTE: this has gone stale a bit; individual Editors now dispatch a keyEvent event; there is
    // no global EditorManager event
    //$(EditorManager).on("onKeyEvent", _onKeyEvent);
    
    // Define public API
}