f    'use strict';
    
    var KeyBindingManager = require("command/KeyBindingManager");

    var DIALOG_BTN_CANCEL = "cancel",
        DIALOG_BTN_OK = "ok",
        DIALOG_BTN_DONTSAVE = "dontsave",
        DIALOG_CANCELED = "_canceled";
    
    // TODO: (issue #258) In future, we should templatize the HTML for the dialogs rather than having 
    // it live directly in the HTML.
    var DIALOG_ID_ERROR = "error-dialog",
        DIALOG_ID_SAVE_CLOSE = "save-close-dialog",
        DIALOG_ID_EXT_CHANGED = "ext-changed-dialog",
        DIALOG_ID_EXT_DELETED = "ext-deleted-dialog",
        DIALOG_ID_LIVE_DEVELOPMENT = "live-development-error-dialog",
        DIALOG_ID_ABOUT = "about-dialog";

    function _dismissDialog(dlg, buttonId) {
        dlg.data("buttonId", buttonId);
        dlg.modal(true).hide();
    }
    
    function _hasButton(dlg, buttonId) {
        return dlg.find("[data-button-id='" + buttonId + "']");
    }

    var _handleKeyDown = function (e) {
        var primaryBtn = this.find(".primary"),
            buttonId = null,
            which = String.fromCharCode(e.which);
        
        if (e.which === 13) {
            // Click primary button
            if (primaryBtn) {
                buttonId = primaryBtn.attr("data-button-id");
            }
        } else if (e.which === 32) {
            // Space bar on focused button
            this.find(".dialog-button:focus").click();
        } else if (brackets.platform === "mac") {
            // CMD+D Don't Save
            if (e.metaKey && (which === 'D')) {
                if (_hasButton(this, DIALOG_BTN_DONTSAVE)) {
                    buttonId = DIALOG_BTN_DONTSAVE;
                }
            // FIXME (issue #418) CMD+. Cancel swallowed by native shell
            } else if (e.metaKey && (e.which === 190)) {
                buttonId = DIALOG_BTN_CANCEL;
            }
        } else { // if (brackets.platform === "win") {
            // 'N' Don't Save
            if (which === 'N') {
                if (_hasButton(this, DIALOG_BTN_DONTSAVE)) {
                    buttonId = DIALOG_BTN_DONTSAVE;
                }
            }
        }
        
        if (buttonId) {
            _dismissDialog(this, buttonId);
        } else if (!($.contains(this.get(0), e.target)) ||
                  (this.filter(":input").length === 0)) {
            // Stop the event if the target is not inside the dialog
            // or if the target is not a form element.
            // TODO (issue #414): more robust handling of dialog scoped
            //                    vs. global key bindings
            e.stopPropagation();
            e.preventDefault();
        }
    };
    
    /**
     * General purpose modal dialog. Assumes that:
     * -- the root tag of the dialog is marked with a unique class name (passed as dlgClass), as well as the
     *    classes "template modal hide".
     * -- the HTML for the dialog contains elements with "title" and "message" classes, as well as a number 
     *    of elements with "dialog-button" class, each of which has a "data-button-id".
     *
     * @param {string} dlgClass The class of the dialog node in the HTML.
     * @param {string=} title The title of the error dialog. Can contain HTML markup. If unspecified, title in
     *      the HTML template is used unchanged.
     * @param {string=} message The message to display in the error dialog. Can contain HTML markup. If
     *      unspecified, body in the HTML template is used unchanged.
     * @return {$.Promise} a promise that will be resolved with the ID of the clicked button when the dialog
     *     is dismissed. Never rejected.
     */
    function showModalDialog(dlgClass, title, message) {
        var result = $.Deferred();
        
        // We clone the HTML rather than using it directly so that if two dialogs of the same
        // type happen to show up, they can appear at the same time. (This is an edge case that
        // shouldn't happen often, but we can't prevent it from happening since everything is
        // asynchronous.)
        var $dlg = $("." + dlgClass + ".template")
            .clone()
            .removeClass("template")
            .addClass("instance")
            .appendTo(window.document.body);
        
        if ($dlg.length === 0) {
            throw new Error("Dialog id " + dlgClass + " does not exist");
        }

        // Set title and message
        if (title) {
            $(".dialog-title", $dlg).html(title);
        }
        if (message) {
            $(".dialog-message", $dlg).html(message);
        }

        var handleKeyDown = _handleKeyDown.bind($dlg);

        // Pipe dialog-closing notification back to client code
        $dlg.one("hidden", function () {
            var buttonId = $dlg.data("buttonId");
            if (!buttonId) {    // buttonId will be undefined if closed via Bootstrap's "x" button
                buttonId = DIALOG_BTN_CANCEL;
            }
            
            // Let call stack return before notifying that dialog has closed; this avoids issue #191
            // if the handler we're triggering might show another dialog (as long as there's no
            // fade-out animation)
            window.setTimeout(function () {
                result.resolve(buttonId);
            }, 0);
            
            // Remove the dialog instance from the DOM.
            $dlg.remove();

            // Remove keydown event handler
            window.document.body.removeEventListener("keydown", handleKeyDown, true);
            KeyBindingManager.setEnabled(true);
        }).one("shown", function () {
            // Set focus to the default button
            var primaryBtn = $dlg.find(".primary");

            if (primaryBtn) {
                primaryBtn.focus();
            }

            // Listen for dialog keyboard shortcuts
            window.document.body.addEventListener("keydown", handleKeyDown, true);
            KeyBindingManager.setEnabled(false);
        });
        
        // Click handler for buttons
        $dlg.one("click", ".dialog-button", function (e) {
            _dismissDialog($dlg, $(this).attr("data-button-id"));
        });

        // Run the dialog
        $dlg.modal({
            backdrop: "static",
            show: true,
            keyboard: true
        });
        return result.promise();
    }
    
    /**
     * Immediately closes any dialog instances with the given class. The dialog callback for each instance will 
     * be called with the special buttonId DIALOG_CANCELED (note: callback is run asynchronously).
     */
    function cancelModalDialogIfOpen(dlgClass) {
        $("." + dlgClass + ".instance").each(function (index, dlg) {
            if ($(dlg).is(":visible")) {   // Bootstrap breaks if try to hide dialog that's already hidden
                _dismissDialog($(dlg), DIALOG_CANCELED);
            }
        });
    }
    
    exports.DIALOG_BTN_CANCEL = DIALOG_BTN_CANCEL;
    exports.DIALOG_BTN_OK = DIALOG_BTN_OK;
    exports.DIALOG_BTN_DONTSAVE = DIALOG_BTN_DONTSAVE;
    exports.DIALOG_CANCELED = DIALOG_CANCELED;
    
    exports.DIALOG_ID_ERROR = DIALOG_ID_ERROR;
    exports.DIALOG_ID_SAVE_CLOSE = DIALOG_ID_SAVE_CLOSE;
    exports.DIALOG_ID_EXT_CHANGED = DIALOG_ID_EXT_CHANGED;
    exports.DIALOG_ID_EXT_DELETED = DIALOG_ID_EXT_DELETED;
    exports.DIALOG_ID_LIVE_DEVELOPMENT = DIALOG_ID_LIVE_DEVELOPMENT;
    exports.DIALOG_ID_ABOUT = DIALOG_ID_ABOUT;
    
    exports.showModalDialog = showModalDialog;
    exports.cancelModalDialogIfOpen = cancelModalDialogIfOpen;
});