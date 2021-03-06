function JSDocumentModule(require, exports, module) {
    "use strict";

    var Inspector = require("LiveDevelopment/Inspector/Inspector");
    var ScriptAgent = require("LiveDevelopment/Agents/ScriptAgent");
    var HighlightAgent = require("LiveDevelopment/Agents/HighlightAgent");

    /** Constructor
     *
     * @param {Document} the source document
     */
    var JSDocument = function JSDocument(doc, editor) {
        this.doc = doc;
        this.editor = editor;
        this.script = ScriptAgent.scriptForURL(this.doc.url);
        this.onHighlight = this.onHighlight.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onCursorActivity = this.onCursorActivity.bind(this);
        Inspector.on("HighlightAgent.highlight", this.onHighlight);
        $(this.editor).on("change", this.onChange);
        $(this.editor).on("cursorActivity", this.onCursorActivity);
        this.onCursorActivity();
    };

    /** Close the document */
    JSDocument.prototype.close = function close() {
        Inspector.off("HighlightAgent.highlight", this.onHighlight);
        $(this.editor).off("change", this.onChange);
        $(this.editor).off("cursorActivity", this.onCursorActivity);
        this.onHighlight();
    };


    /** Event Handlers *******************************************************/

    /** Triggered on cursor activity by the editor */
    JSDocument.prototype.onCursorActivity = function onCursorActivity(event, editor) {
    };

    /** Triggered on change by the editor */
    JSDocument.prototype.onChange = function onChange(event, editor, change) {
        var src = this.doc.getText();
        Inspector.Debugger.setScriptSource(this.script.scriptId, src, function onSetScriptSource(res) {
            Inspector.Runtime.evaluate("if($)$(\"canvas\").each(function(i,e){if(e.rerender)e.rerender()})");
        }.bind(this));
    };

    /** Triggered by the HighlightAgent to highlight a node in the editor */
    JSDocument.prototype.onHighlight = function onHighlight(node) {
        // clear an existing highlight
        var codeMirror = this.editor._codeMirror;
        var i;
        for (i in this._highlight) {
            codeMirror.setLineClass(this._highlight[i]);
        }
        this._highlight = [];
        if (!node || !node.trace) {
            return;
        }

        // go through the trace and find highlight the lines of this script
        var callFrame, line;
        for (i in node.trace) {
            callFrame = node.trace[i];
            if (callFrame.location && callFrame.location.scriptId === this.script.scriptId) {
                line = callFrame.location.lineNumber;
                codeMirror.setLineClass(line, "highlight");
                this._highlight.push(line);
            }
        }
    };

    // Export the class
    module.exports = JSDocument;
}