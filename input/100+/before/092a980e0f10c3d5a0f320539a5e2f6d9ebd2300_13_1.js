function HTMLDocumentModule(require, exports, module) {
    'use strict';

    var Inspector = require("LiveDevelopment/Inspector/Inspector");
    var DOMAgent = require("LiveDevelopment/Agents/DOMAgent");
    var HighlightAgent = require("LiveDevelopment/Agents/HighlightAgent");

    /** Constructor
     *
     * @param Document the source document from Brackets
     */
    var HTMLDocument = function HTMLDocument(doc, editor) {
        this.doc = doc;
        this.editor = editor;
        this.onHighlight = this.onHighlight.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onCursorActivity = this.onCursorActivity.bind(this);
        Inspector.on("HighlightAgent.highlight", this.onHighlight);
        $(this.editor).on("change", this.onChange);
        $(this.editor).on("cursorActivity", this.onCursorActivity);
        this.onCursorActivity();
    };

    /** Close the document */
    HTMLDocument.prototype.close = function close() {
        Inspector.off("HighlightAgent.highlight", this.onHighlight);
        $(this.editor).off("change", this.onChange);
        $(this.editor).off("cursorActivity", this.onCursorActivity);
        this.onHighlight();
    };


    /** Event Handlers *******************************************************/

    /** Triggered on cursor activity by the editor */
    HTMLDocument.prototype.onCursorActivity = function onCursorActivity(event, editor) {
        var codeMirror = this.editor._codeMirror;
        if (Inspector.config.highlight) {
            var location = codeMirror.indexFromPos(codeMirror.getCursor());
            var node = DOMAgent.allNodesAtLocation(location).pop();
            HighlightAgent.node(node);
        }
    };

    /** Triggered on change by the editor */
    HTMLDocument.prototype.onChange = function onChange(event, editor, change) {
        var codeMirror = this.editor._codeMirror;
        while (change) {
            var from = codeMirror.indexFromPos(change.from);
            var to = codeMirror.indexFromPos(change.to);
            var text = change.text.join("\n");
            DOMAgent.applyChange(from, to, text);
            change = change.next;
        }
    };

    /** Triggered by the HighlightAgent to highlight a node in the editor */
    HTMLDocument.prototype.onHighlight = function onHighlight(node) {
        if (!node || !node.location) {
            if (this._highlight) {
                this._highlight.clear();
                delete this._highlight;
            }
            return;
        }
        var codeMirror = this.editor._codeMirror;
        var to, from = codeMirror.posFromIndex(node.location);
        if (node.closeLocation) {
            to = node.closeLocation + node.closeLength;
        } else {
            to = node.location + node.length;
        }
        to = codeMirror.posFromIndex(to);
        if (this._highlight) {
            this._highlight.clear();
        }
        this._highlight = codeMirror.markText(from, to, "highlight");
    };

    // Export the class
    module.exports = HTMLDocument;
}