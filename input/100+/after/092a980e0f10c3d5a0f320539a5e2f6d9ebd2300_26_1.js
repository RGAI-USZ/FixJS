function (require, exports, module) {
    "use strict";
    
    var NativeFileSystem    = require("file/NativeFileSystem").NativeFileSystem,
        ProjectManager      = require("project/ProjectManager"),
        EditorManager       = require("editor/EditorManager"),
        PreferencesManager  = require("preferences/PreferencesManager"),
        FileUtils           = require("file/FileUtils"),
        CommandManager      = require("command/CommandManager"),
        Async               = require("utils/Async"),
        PerfUtils           = require("utils/PerfUtils"),
        Commands            = require("command/Commands");
    
    /**
     * Unique PreferencesManager clientID
     */
    var PREFERENCES_CLIENT_ID = "com.adobe.brackets.DocumentManager";
    
    /**
     * @private
     * @see DocumentManager.getCurrentDocument()
     */
    var _currentDocument = null;
    
    /**
     * @private
     * @type {PreferenceStorage}
     */
    var _prefs = {};
    
    /**
     * Returns the Document that is currently open in the editor UI. May be null.
     * When this changes, DocumentManager dispatches a "currentDocumentChange" event. The current
     * document always has a backing Editor (Document._masterEditor != null) and is thus modifiable.
     * @return {?Document}
     */
    function getCurrentDocument() {
        return _currentDocument;
    }
    
    /**
     * @private
     * @type {Array.<FileEntry>}
     * @see DocumentManager.getWorkingSet()
     */
    var _workingSet = [];
    
    /**
     * @private
     * Contains the same set of items as _workinSet, but ordered by how recently they were _currentDocument (0 = most recent).
     * @type {Array.<FileEntry>}
     */
    var _workingSetMRUOrder = [];
    
    /**
     * While true, the MRU order is frozen
     * @type {boolean}
     */
    var _documentNavPending = false;
    
    /**
     * While true, allow preferences to be saved
     * @type {boolean}
     */
    var _isProjectChanging = false;
    
    /**
     * All documents with refCount > 0. Maps Document.file.fullPath -> Document.
     * @private
     * @type {Object.<string, Document>}
     */
    var _openDocuments = {};
    
    /**
     * Returns a list of items in the working set in UI list order. May be 0-length, but never null.
     *
     * When a file is added this list, DocumentManager dispatches a "workingSetAdd" event.
     * When a file is removed from list, DocumentManager dispatches a "workingSetRemove" event.
     * To listen for ALL changes to this list, you must listen for both events.
     *
     * Which items belong in the working set is managed entirely by DocumentManager. Callers cannot
     * (yet) change this collection on their own.
     *
     * @return {Array.<FileEntry>}
     */
    function getWorkingSet() {
        return _workingSet;
        // TODO: (issue #297) return a clone to prevent meddling?
    }

    /** 
     * Returns the index of the file matching fullPath in the working set.
     * Returns -1 if not found.
     * @param {!string} fullPath
     * @param {Array.<FileEntry>=} list Pass this arg to search a different array of files. Internal
     *          use only.
     * @returns {number} index
     */
    function findInWorkingSet(fullPath, list) {
        list = list || _workingSet;
        
        var ret = -1;
        var found = list.some(function findByPath(file, i) {
                ret = i;
                return file.fullPath === fullPath;
            });
            
        return (found ? ret : -1);
    }

    /**
     * Returns all Documents that are 'open' in the UI somewhere (for now, this means open in an
     * inline editor and/or a full-size editor). Only these Documents can be modified, and only
     * these Documents are synced with external changes on disk.
     * @return {Array.<Document>}
     */
    function getAllOpenDocuments() {
        var result = [];
        var path;
        for (path in _openDocuments) {
            if (_openDocuments.hasOwnProperty(path)) {
                result.push(_openDocuments[path]);
            }
        }
        return result;
    }
    
    
    /**
     * Adds the given file to the end of the working set list, if it is not already in the list.
     * Does not change which document is currently open in the editor.
     * @param {!FileEntry} file
     */
    function addToWorkingSet(file) {
        // If doc is already in working set, don't add it again
        if (findInWorkingSet(file.fullPath) !== -1) {
            return;
        }
        
        // Add
        _workingSet.push(file);
        
        // Add to MRU order: either first or last, depending on whether it's already the current doc or not
        if (_currentDocument && _currentDocument.file.fullPath === file.fullPath) {
            _workingSetMRUOrder.unshift(file);
        } else {
            _workingSetMRUOrder.push(file);
        }
        
        // Dispatch event
        $(exports).triggerHandler("workingSetAdd", file);
    }
    
    /**
     * Removes the given file from the working set list, if it was in the list. Does not change
     * the current editor even if it's for this file.
     * @param {!FileEntry} file
     */
    function _removeFromWorkingSet(file) {
        // If doc isn't in working set, do nothing
        var index = findInWorkingSet(file.fullPath);
        if (index === -1) {
            return;
        }
        
        // Remove
        _workingSet.splice(index, 1);
        _workingSetMRUOrder.splice(findInWorkingSet(file.fullPath, _workingSetMRUOrder), 1);
        
        // Dispatch event
        $(exports).triggerHandler("workingSetRemove", file);
    }
    
    /**
     * Moves document to the front of the MRU list, IF it's in the working set; no-op otherwise.
     * @param {!Document}
     */
    function _markMostRecent(document) {
        var mruI = findInWorkingSet(document.file.fullPath, _workingSetMRUOrder);
        if (mruI !== -1) {
            _workingSetMRUOrder.splice(mruI, 1);
            _workingSetMRUOrder.unshift(document.file);
        }
    }
    
    
    /**
     * Indicate that changes to currentDocument are temporary for now, and should not update the MRU
     * ordering of the working set. Useful for next/previous keyboard navigation (until Ctrl is released)
     * or for incremental-search style document preview like Quick Open will eventually have.
     * Can be called any number of times, and ended by a single finalizeDocumentNavigation() call.
     */
    function beginDocumentNavigation() {
        _documentNavPending = true;
    }
    
    /**
     * Un-freezes the MRU list after one or more beginDocumentNavigation() calls. Whatever document is
     * current is bumped to the front of the MRU list.
     */
    function finalizeDocumentNavigation() {
        if (_documentNavPending) {
            _documentNavPending = false;
            
            _markMostRecent(_currentDocument);
        }
    }
    
    
    /**
     * Changes currentDocument to the given Document, firing currentDocumentChange, which in turn
     * causes this Document's main editor UI to be shown in the editor pane, updates the selection
     * in the file tree / working set UI, etc. This call may also add the item to the working set.
     * 
     * @param {!Document} document  The Document to make current. May or may not already be in the
     *      working set.
     */
    function setCurrentDocument(document) {
        
        // If this doc is already current, do nothing
        if (_currentDocument === document) {
            return;
        }

        var perfTimerName = PerfUtils.markStart("setCurrentDocument:\t" + (!document || document.file.fullPath));
        
        // If file not within project tree, add it to working set right now (don't wait for it to
        // become dirty)
        if (!ProjectManager.isWithinProject(document.file.fullPath)) {
            addToWorkingSet(document.file);
        }
        
        // Adjust MRU working set ordering (except while in the middle of a Ctrl+Tab sequence)
        if (!_documentNavPending) {
            _markMostRecent(document);
        }
        
        // Make it the current document
        _currentDocument = document;
        $(exports).triggerHandler("currentDocumentChange");
        // (this event triggers EditorManager to actually switch editors in the UI)

        PerfUtils.addMeasurement(perfTimerName);
    }
    
    /** Changes currentDocument to null, causing no full Editor to be shown in the UI */
    function _clearCurrentDocument() {
        // If editor already blank, do nothing
        if (!_currentDocument) {
            return;
        }
        
        // Change model & dispatch event
        _currentDocument = null;
        $(exports).triggerHandler("currentDocumentChange");
        // (this event triggers EditorManager to actually clear the editor UI)
    }
    
    /**
     * Closes the full editor for the given file (if there is one), and removes it from the working
     * set. Any other editors for this Document remain open. Discards any unsaved changes - it is
     * expected that the UI has already confirmed with the user before calling this.
     *
     * Changes currentDocument if this file was the current document (may change to null).
     *
     * This is a subset of notifyFileDeleted(). Use this for the user-facing Close command.
     *
     * @param {!FileEntry} file
     */
    function closeFullEditor(file) {
        // If this was the current document shown in the editor UI, we're going to switch to a
        // different document (or none if working set has no other options)
        if (_currentDocument && _currentDocument.file.fullPath === file.fullPath) {
            var wsIndex = findInWorkingSet(file.fullPath);
            
            // Decide which doc to show in editor after this one
            var nextFile;
            if (wsIndex === -1) {
                // If doc wasn't in working set, use bottommost working set item
                if (_workingSet.length > 0) {
                    nextFile = _workingSet[_workingSet.length  - 1];
                }
                // else: leave nextDocument null; editor area will be blank
            } else {
                // If doc was in working set, use item next to it (below if possible)
                if (wsIndex < _workingSet.length - 1) {
                    nextFile = _workingSet[wsIndex + 1];
                } else if (wsIndex > 0) {
                    nextFile = _workingSet[wsIndex - 1];
                }
                // else: leave nextDocument null; editor area will be blank
            }
            
            // Switch editor to next document (or blank it out)
            if (nextFile) {
                CommandManager.execute(Commands.FILE_OPEN, { fullPath: nextFile.fullPath });
            } else {
                _clearCurrentDocument();
            }
        }
        
        // (Now we're guaranteed that the current document is not the one we're closing)
        console.assert(!(_currentDocument && _currentDocument.file.fullPath === file.fullPath));
        
        // Remove closed doc from working set, if it was in there
        // This happens regardless of whether the document being closed was the current one or not
        _removeFromWorkingSet(file);
        
        // Note: EditorManager will dispose the closed document's now-unneeded editor either in
        // response to the editor-swap call above, or the _removeFromWorkingSet() call, depending on
        // circumstances. See notes in EditorManager for more.
    }

    /**
     * Equivalent to calling closeFullEditor() for all Documents. Same caveat: this discards any
     * unsaved changes, so the UI should confirm with the user before calling this.
     */
    function closeAll() {
        _clearCurrentDocument();
        
        var wsClone = _workingSet.slice(0);  // can't delete from the same array we're iterating
        wsClone.forEach(_removeFromWorkingSet);
    }
    
    
    /**
     * Cleans up any loose Documents whose only ref is its own master Editor, and that Editor is not
     * rooted in the UI anywhere. This can happen if the Editor is auto-created via Document APIs that
     * trigger _ensureMasterEditor() without making it dirty. E.g. a command invoked on the focused
     * inline editor makes no-op edits or does a read-only operation.
     */
    function _gcDocuments() {
        getAllOpenDocuments().forEach(function (doc) {
            // Is the only ref to this document its own master Editor?
            if (doc._refCount === 1 && doc._masterEditor) {
                // Destroy the Editor if it's not being kept alive by the UI
                EditorManager._destroyEditorIfUnneeded(doc);
            }
        });
    }
    
    
    /**
     * @constructor
     * Model for the contents of a single file and its current modification state.
     * See DocumentManager documentation for important usage notes.
     *
     * Document dispatches these events:
     *
     * change -- When the text of the editor changes (including due to undo/redo). 
     *
     *        Passes ({Document}, {ChangeList}), where ChangeList is a linked list (NOT an array)
     *        of change record objects. Each change record looks like:
     *
     *            { from: start of change, expressed as {line: <line number>, ch: <character offset>},
     *              to: end of change, expressed as {line: <line number>, ch: <chracter offset>},
     *              text: array of lines of text to replace existing text,
     *              next: next change record in the linked list, or undefined if this is the last record }
     *      
     *        The line and ch offsets are both 0-based.
     *
     *        The ch offset in "from" is inclusive, but the ch offset in "to" is exclusive. For example,
     *        an insertion of new content (without replacing existing content) is expressed by a range
     *        where from and to are the same.
     *
     *        If "from" and "to" are undefined, then this is a replacement of the entire text content.
     *
     *        IMPORTANT: If you listen for the "change" event, you MUST also addRef() the document 
     *        (and releaseRef() it whenever you stop listening). You should also listen to the "deleted"
     *        event.
     *  
     *        (FUTURE: this is a modified version of the raw CodeMirror change event format; may want to make 
     *        it an ordinary array)
     *
     * deleted -- When the file for this document has been deleted. All views onto the document should
     *      be closed. The document will no longer be editable or dispatch "change" events.
     *
     * @param {!FileEntry} file  Need not lie within the project.
     * @param {!Date} initialTimestamp  File's timestamp when we read it off disk.
     * @param {!string} rawText  Text content of the file.
     */
    function Document(file, initialTimestamp, rawText) {
        if (!(this instanceof Document)) {  // error if constructor called without 'new'
            throw new Error("Document constructor must be called with 'new'");
        }
        if (_openDocuments[file.fullPath]) {
            throw new Error("Creating a document when one already exists, for: " + file);
        }
        
        this.file = file;
        this.refreshText(rawText, initialTimestamp);
        
        // This is a good point to clean up any old dangling Documents
        _gcDocuments();
    }
    
    /**
     * Number of clients who want this Document to stay alive. The Document is listed in
     * DocumentManager._openDocuments whenever refCount > 0.
     */
    Document.prototype._refCount = 0;
    
    /**
     * The FileEntry for this document. Need not lie within the project.
     * @type {!FileEntry}
     */
    Document.prototype.file = null;
    
    /**
     * Whether this document has unsaved changes or not.
     * When this changes on any Document, DocumentManager dispatches a "dirtyFlagChange" event.
     * @type {boolean}
     */
    Document.prototype.isDirty = false;
    
    /**
     * What we expect the file's timestamp to be on disk. If the timestamp differs from this, then
     * it means the file was modified by an app other than Brackets.
     * @type {!Date}
     */
    Document.prototype.diskTimestamp = null;
    
    /**
     * The text contents of the file, or null if our backing model is _masterEditor.
     * @type {?string}
     */
    Document.prototype._text = null;
    
    /**
     * Editor object representing the full-size editor UI for this document. May be null if Document
     * has not yet been modified or been the currentDocument; in that case, our backing model is the
     * string _text.
     * @type {?Editor}
     */
    Document.prototype._masterEditor = null;
    
    /**
     * The content's line-endings style. If a Document is created on empty text, or text with
     * inconsistent line endings, defaults to the current platform's standard endings.
     * @type {FileUtils.LINE_ENDINGS_CRLF|FileUtils.LINE_ENDINGS_LF}
     */
    Document.prototype._lineEndings = null;

    /** Add a ref to keep this Document alive */
    Document.prototype.addRef = function () {
        //console.log("+++REF+++ "+this);
        
        if (this._refCount === 0) {
            //console.log("+++ adding to open list");
            if (_openDocuments[this.file.fullPath]) {
                throw new Error("Document for this path already in _openDocuments!");
            }
            _openDocuments[this.file.fullPath] = this;
        }
        this._refCount++;
    };
    /** Remove a ref that was keeping this Document alive */
    Document.prototype.releaseRef = function () {
        //console.log("---REF--- "+this);
        
        this._refCount--;
        if (this._refCount < 0) {
            throw new Error("Document ref count has fallen below zero!");
        }
        if (this._refCount === 0) {
            //console.log("--- removing from open list");
            if (!_openDocuments[this.file.fullPath]) {
                throw new Error("Document with references was not in _openDocuments!");
            }
            delete _openDocuments[this.file.fullPath];
        }
    };
    
    /**
     * Attach a backing Editor to the Document, enabling setText() to be called. Assumes Editor has
     * already been initialized with the value of getText(). ONLY Editor should call this (and only
     * when EditorManager has told it to act as the master editor).
     * @param {!Editor} masterEditor
     */
    Document.prototype._makeEditable = function (masterEditor) {
        if (this._masterEditor) {
            throw new Error("Document is already editable");
        } else {
            this._text = null;
            this._masterEditor = masterEditor;
            $(masterEditor).on("change", this._handleEditorChange.bind(this));
        }
    };
    
    /**
     * Detach the backing Editor from the Document, disallowing setText(). The text content is
     * stored back onto _text so other Document clients continue to have read-only access. ONLY
     * Editor.destroy() should call this.
     */
    Document.prototype._makeNonEditable = function () {
        if (!this._masterEditor) {
            throw new Error("Document is already non-editable");
        } else {
            // _text represents the raw text, so fetch without normalized line endings
            this._text = this.getText(true);
            this._masterEditor = null;
        }
    };
    
    /**
     * Guarantees that _masterEditor is non-null. If needed, asks EditorManager to create a new master
     * editor bound to this Document (which in turn causes Document._makeEditable() to be called).
     * Should ONLY be called by Editor and Document.
     */
    Document.prototype._ensureMasterEditor = function () {
        if (!this._masterEditor) {
            EditorManager._createFullEditorForDocument(this);
        }
    };
    
    /**
     * Returns the document's current contents; may not be saved to disk yet. Whenever this
     * value changes, the Document dispatches a "change" event.
     *
     * @param {boolean=} useOriginalLineEndings If true, line endings in the result depend on the
     *      Document's line endings setting (based on OS & the original text loaded from disk).
     *      If false, line endings are always \n (like all the other Document text getter methods).
     * @return {string}
     */
    Document.prototype.getText = function (useOriginalLineEndings) {
        if (this._masterEditor) {
            // CodeMirror.getValue() always returns text with LF line endings; fix up to match line
            // endings preferred by the document, if necessary
            var codeMirrorText = this._masterEditor._codeMirror.getValue();
            if (useOriginalLineEndings) {
                if (this._lineEndings === FileUtils.LINE_ENDINGS_CRLF) {
                    return codeMirrorText.replace(/\n/g, "\r\n");
                }
            }
            return codeMirrorText;
            
        } else {
            // Optimized path that doesn't require creating master editor
            if (useOriginalLineEndings) {
                return this._text;
            } else {
                return this._text.replace(/\r\n/g, "\n");
            }
        }
    };
    
    /**
     * Sets the contents of the document. Treated as an edit. Line endings will be rewritten to
     * match the document's current line-ending style.
     * @param {!string} text The text to replace the contents of the document with.
     */
    Document.prototype.setText = function (text) {
        this._ensureMasterEditor();
        this._masterEditor._codeMirror.setValue(text);
        // _handleEditorChange() triggers "change" event
    };
    
    /**
     * Sets the contents of the document. Treated as reloading the document from disk: the document
     * will be marked clean with a new timestamp, the undo/redo history is cleared, and we re-check
     * the text's line-ending style. CAN be called even if there is no backing editor.
     * @param {!string} text The text to replace the contents of the document with.
     * @param {!Date} newTimestamp Timestamp of file at the time we read its new contents from disk.
     */
    Document.prototype.refreshText = function (text, newTimestamp) {
        var perfTimerName = PerfUtils.markStart("refreshText:\t" + (!this.file || this.file.fullPath));

        if (this._masterEditor) {
            this._masterEditor._resetText(text);
            // _handleEditorChange() triggers "change" event for us
        } else {
            this._text = text;
            // We fake a change record here that looks like CodeMirror's text change records, but
            // omits "from" and "to", by which we mean the entire text has changed.
            // TODO: Dumb to split it here just to join it again in the change handler, but this is
            // the CodeMirror change format. Should we document our change format to allow this to
            // either be an array of lines or a single string?
            $(this).triggerHandler("change", [this, {text: text.split(/\r?\n/)}]);
        }
        this._markClean();
        this.diskTimestamp = newTimestamp;
        
        // Sniff line-ending style
        this._lineEndings = FileUtils.sniffLineEndings(text);
        if (!this._lineEndings) {
            this._lineEndings = FileUtils.getPlatformLineEndings();
        }

        PerfUtils.addMeasurement(perfTimerName);
    };
    
    /**
     * Adds, replaces, or removes text. If a range is given, the text at that range is replaced with the
     * given new text; if text == "", then the entire range is effectively deleted. If 'end' is omitted,
     * then the new text is inserted at that point and all existing text is preserved. Line endings will
     * be rewritten to match the document's current line-ending style.
     * @param {!string} text  Text to insert or replace the range with
     * @param {!{line:number, ch:number}} start  Start of range, inclusive (if 'to' specified) or insertion point (if not)
     * @param {?{line:number, ch:number}} end  End of range, exclusive; optional
     */
    Document.prototype.replaceRange = function (text, start, end) {
        this._ensureMasterEditor();
        this._masterEditor._codeMirror.replaceRange(text, start, end);
        // _handleEditorChange() triggers "change" event
    };
    
    /**
     * Returns the characters in the given range. Line endings are normalized to '\n'.
     * @param {!{line:number, ch:number}} start  Start of range, inclusive
     * @param {!{line:number, ch:number}} end  End of range, exclusive
     * @return {!string}
     */
    Document.prototype.getRange = function (start, end) {
        this._ensureMasterEditor();
        return this._masterEditor._codeMirror.getRange(start, end);
    };
    
    /**
     * Returns the text of the given line (excluding any line ending characters)
     * @param {number} Zero-based line number
     * @return {!string}
     */
    Document.prototype.getLine = function (lineNum) {
        this._ensureMasterEditor();
        return this._masterEditor._codeMirror.getLine(lineNum);
    };
    
    /**
     * Batches a series of related Document changes. Repeated calls to replaceRange() should be wrapped in a
     * batch for efficiency. Begins the batch, calls doOperation(), ends the batch, and then returns.
     * @param {function()} doOperation
     */
    Document.prototype.batchOperation = function (doOperation) {
        this._ensureMasterEditor();
        this._masterEditor._codeMirror.operation(doOperation);
    };
    
    /**
     * Handles changes from the master backing Editor. Changes are triggered either by direct edits
     * to that Editor's UI, OR by our setText()/refreshText() methods.
     * @private
     */
    Document.prototype._handleEditorChange = function (event, editor, changeList) {
        // On any change, mark the file dirty. In the future, we should make it so that if you
        // undo back to the last saved state, we mark the file clean.
        var wasDirty = this.isDirty;
        this.isDirty = editor._codeMirror.isDirty();
        
        // If file just became dirty, notify listeners, and add it to working set (if not already there)
        if (wasDirty !== this.isDirty) {
            $(exports).triggerHandler("dirtyFlagChange", [this]);
            addToWorkingSet(this.file);
        }
        
        // Notify that Document's text has changed
        // TODO: This needs to be kept in sync with SpecRunnerUtils.createMockDocument(). In the
        // future, we should fix things so that we either don't need mock documents or that this
        // is factored so it will just run in both.
        $(this).triggerHandler("change", [this, changeList]);
    };
    
    /**
     * @private
     */
    Document.prototype._markClean = function () {
        this.isDirty = false;
        if (this._masterEditor) {
            this._masterEditor._codeMirror.markClean();
        }
        $(exports).triggerHandler("dirtyFlagChange", this);
    };
    
    /** 
     * Called when the document is saved (which currently happens in DocumentCommandHandlers). Marks the
     * document not dirty and notifies listeners of the save.
     */
    Document.prototype.notifySaved = function () {
        if (!this._masterEditor) {
            console.log("### Warning: saving a Document that is not modifiable!");
        }
        
        this._markClean();
        $(exports).triggerHandler("documentSaved", this);
        
        // TODO: (issue #295) fetching timestamp async creates race conditions (albeit unlikely ones)
        var thisDoc = this;
        this.file.getMetadata(
            function (metadata) {
                thisDoc.diskTimestamp = metadata.modificationTime;
            },
            function (error) {
                console.log("Error updating timestamp after saving file: " + thisDoc.file.fullPath);
            }
        );
    };
    
    /* (pretty toString(), to aid debugging) */
    Document.prototype.toString = function () {
        var dirtyInfo = (this.isDirty ? " (dirty!)" : " (clean)");
        var editorInfo = (this._masterEditor ? " (Editable)" : " (Non-editable)");
        var refInfo = " refs:" + this._refCount;
        return "[Document " + this.file.fullPath + dirtyInfo + editorInfo + refInfo + "]";
    };
    
    /**
     * Gets an existing open Document for the given file, or creates a new one if the Document is
     * not currently open ('open' means referenced by the UI somewhere). Always use this method to
     * get Documents; do not call the Document constructor directly.
     *
     * If you are going to hang onto the Document for more than just the duration of a command - e.g.
     * if you are going to display its contents in a piece of UI - then you must addRef() the Document
     * and listen for changes on it. (Note: opening the Document in an Editor automatically manages
     * refs and listeners for that Editor UI).
     *
     * @param {!string} fullPath
     * @return {$.Promise} A promise object that will be resolved with the Document, or rejected
     *      with a FileError if the file is not yet open and can't be read from disk.
     */
    function getDocumentForPath(fullPath) {
        var result  = new $.Deferred(),
            doc     = _openDocuments[fullPath];

        PerfUtils.markStart(PerfUtils.DOCUMENT_MANAGER_GET_DOCUMENT_FOR_PATH);
        result.done(function () {
            PerfUtils.addMeasurement(PerfUtils.DOCUMENT_MANAGER_GET_DOCUMENT_FOR_PATH);
        }).fail(function () {
            PerfUtils.finalizeMeasurement(PerfUtils.DOCUMENT_MANAGER_GET_DOCUMENT_FOR_PATH);
        });

        if (doc) {
            result.resolve(doc);
        } else {
            var fileEntry = new NativeFileSystem.FileEntry(fullPath);
            FileUtils.readAsText(fileEntry)
                .done(function (rawText, readTimestamp) {
                    doc = new Document(fileEntry, readTimestamp, rawText);
                    result.resolve(doc);
                })
                .fail(function (fileError) {
                    result.reject(fileError);
                });
        }
        
        return result.promise();
    }
    
    /**
     * Returns the existing open Document for the given file, or null if the file is not open ('open'
     * means referenced by the UI somewhere). If you will hang onto the Document, you must addRef()
     * it; see {@link getDocumentForPath()} for details.
     */
    function getOpenDocumentForPath(fullPath) {
        return _openDocuments[fullPath];
    }
    
    
    /**
     * Reacts to a file being deleted: if there is a Document for this file, causes it to dispatch a
     * "deleted" event; ensures it's not the currentDocument; and removes this file from the working
     * set. These actions in turn cause all open editors for this file to close. Discards any unsaved
     * changes - it is expected that the UI has already confirmed with the user before calling.
     *
     * To simply close a main editor when the file hasn't been deleted, use closeFullEditor() or FILE_CLOSE.
     *
     * FUTURE: Instead of an explicit notify, we should eventually listen for deletion events on some
     * sort of "project file model," making this just a private event handler.
     */
    function notifyFileDeleted(file) {
        // First ensure it's not currentDocument, and remove from working set
        closeFullEditor(file);
        
        // Notify all other editors to close as well
        var doc = getOpenDocumentForPath(file.fullPath);
        if (doc) {
            $(doc).triggerHandler("deleted");
        }
        
        // At this point, all those other views SHOULD have released the Doc
        if (doc && doc._refCount > 0) {
            console.log("WARNING: deleted Document still has " + doc._refCount + " references. Did someone addRef() without listening for 'deleted'?");
        }
    }
    
    
    /**
     * Get the next or previous file in the working set, in MRU order (relative to currentDocument).
     * @param {Number} inc  -1 for previous, +1 for next; no other values allowed
     * @return {?FileEntry}  null if working set empty
     */
    function getNextPrevFile(inc) {
        if (inc !== -1 && inc !== +1) {
            throw new Error("Illegal argument: inc = " + inc);
        }
        
        if (_currentDocument) {
            var mruI = findInWorkingSet(_currentDocument.file.fullPath, _workingSetMRUOrder);
            if (mruI === -1) {
                // If doc not in working set, return most recent working set item
                if (_workingSetMRUOrder.length > 0) {
                    return _workingSetMRUOrder[0];
                }
            } else {
                // If doc is in working set, return next/prev item with wrap-around
                var newI = mruI + inc;
                if (newI >= _workingSetMRUOrder.length) {
                    newI = 0;
                } else if (newI < 0) {
                    newI = _workingSetMRUOrder.length - 1;
                }
                
                return _workingSetMRUOrder[newI];
            }
        }
        
        // If no doc open or working set empty, there is no "next" file
        return null;
    }
    
    
    /**
     * @private
     * Preferences callback. Saves the document file paths for the working set.
     */
    function _savePreferences() {

        if (_isProjectChanging) {
            return;
        }
        
        // save the working set file paths
        var files       = [],
            isActive    = false,
            workingSet  = getWorkingSet(),
            currentDoc  = getCurrentDocument(),
            projectRoot = ProjectManager.getProjectRoot();

        workingSet.forEach(function (file, index) {
            // flag the currently active editor
            isActive = currentDoc && (file.fullPath === currentDoc.file.fullPath);

            files.push({
                file: file.fullPath,
                active: isActive
            });
        });

        // append file root to make file list unique for each project
        _prefs.setValue("files_" + projectRoot.fullPath, files);
    }

    /**
     * @private
     * Handle beforeProjectClose event
     */
    function _beforeProjectClose() {
        _savePreferences();

        // When app is shutdown via shortcut key, the command goes directly to the
        // app shell, so we can't reliably fire the beforeProjectClose event on
        // app shutdown. To compensate, we listen for currentDocumentChange,
        // workingSetAdd, and workingSetRemove events so that the prefs for
        // last project used get updated. But when switching projects, after
        // the beforeProjectChange event gets fired, DocumentManager.closeAll()
        // causes workingSetRemove event to get fired and update the prefs to an empty
        // list. So, temporarily (until projectOpen event) disallow saving prefs.
        _isProjectChanging = true;
    }

    /**
     * @private
     * Initializes the working set.
     */
    function _projectOpen() {
        _isProjectChanging = false;
        
        // file root is appended for each project
        var projectRoot = ProjectManager.getProjectRoot(),
            files = _prefs.getValue("files_" + projectRoot.fullPath);

        if (!files) {
            return;
        }

        var filesToOpen = [],
            activeFile;

        // in parallel, check if files exist
        // TODO: (issue #298) delay this check until it becomes the current document?
        function checkOneFile(value, index) {
            var oneFileResult = new $.Deferred();
            
            // check if the file still exists; silently drop from working set if it doesn't
            projectRoot.getFile(value.file, {},
                function (fileEntry) {
                    // maintain original sequence
                    filesToOpen[index] = fileEntry;

                    if (value.active) {
                        activeFile = fileEntry;
                    }
                    oneFileResult.resolve();
                },
                function (error) {
                    filesToOpen[index] = null;
                    oneFileResult.resolve();
                });
            
            return oneFileResult.promise();
        }

        var result = Async.doInParallel(files, checkOneFile, false);

        result.done(function () {
            // Add all existing files to the working set
            filesToOpen.forEach(function (file, index) {
                if (file) {
                    addToWorkingSet(file);
                }
            });

            // Initialize the active editor
            if (!activeFile && _workingSet.length > 0) {
                activeFile = _workingSet[0];
            }

            if (activeFile) {
                CommandManager.execute(Commands.FILE_OPEN, { fullPath: activeFile.fullPath });
            }
        });
    }


    // Define public API
    exports.Document = Document;
    exports.getCurrentDocument = getCurrentDocument;
    exports.getDocumentForPath = getDocumentForPath;
    exports.getOpenDocumentForPath = getOpenDocumentForPath;
    exports.getWorkingSet = getWorkingSet;
    exports.findInWorkingSet = findInWorkingSet;
    exports.getAllOpenDocuments = getAllOpenDocuments;
    exports.setCurrentDocument = setCurrentDocument;
    exports.addToWorkingSet = addToWorkingSet;
    exports.getNextPrevFile = getNextPrevFile;
    exports.beginDocumentNavigation = beginDocumentNavigation;
    exports.finalizeDocumentNavigation = finalizeDocumentNavigation;
    exports.closeFullEditor = closeFullEditor;
    exports.closeAll = closeAll;
    exports.notifyFileDeleted = notifyFileDeleted;

    // Setup preferences
    _prefs = PreferencesManager.getPreferenceStorage(PREFERENCES_CLIENT_ID);
    $(exports).bind("currentDocumentChange workingSetAdd workingSetRemove", _savePreferences);
    
    // Performance measurements
    PerfUtils.createPerfMeasurement("DOCUMENT_MANAGER_GET_DOCUMENT_FOR_PATH", "DocumentManager.getDocumentForPath()");

    // Handle project change events
    $(ProjectManager).on("projectOpen", _projectOpen);
    $(ProjectManager).on("beforeProjectClose", _beforeProjectClose);
}