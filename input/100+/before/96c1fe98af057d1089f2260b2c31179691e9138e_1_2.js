function (require, exports, module) {
    'use strict';
    
    // Load dependent non-module scripts
    require("widgets/bootstrap-dropdown");
    require("widgets/bootstrap-modal");
    require("thirdparty/path-utils/path-utils.min");
    require("thirdparty/smart-auto-complete/jquery.smart_autocomplete");

    // Load LiveDeveopment
    require("LiveDevelopment/main");
    
    // Load dependent modules
    var ProjectManager          = require("project/ProjectManager"),
        DocumentManager         = require("document/DocumentManager"),
        EditorManager           = require("editor/EditorManager"),
        CSSInlineEditor         = require("editor/CSSInlineEditor"),
        WorkingSetView          = require("project/WorkingSetView"),
        DocumentCommandHandlers = require("document/DocumentCommandHandlers"),
        FileViewController      = require("project/FileViewController"),
        FileSyncManager         = require("project/FileSyncManager"),
        KeyBindingManager       = require("command/KeyBindingManager"),
        KeyMap                  = require("command/KeyMap"),
        Commands                = require("command/Commands"),
        CommandManager          = require("command/CommandManager"),
        BuildInfoUtils          = require("utils/BuildInfoUtils"),
        CodeHintManager         = require("editor/CodeHintManager"),
        JSLintUtils             = require("language/JSLintUtils"),
        PerfUtils               = require("utils/PerfUtils"),
        FileIndexManager        = require("project/FileIndexManager"),
        QuickOpen               = require("search/QuickOpen"),
        Menus                   = require("command/Menus"),
        FileUtils               = require("file/FileUtils"),
        Strings                 = require("strings"),
        Dialogs                 = require("widgets/Dialogs"),
        ExtensionLoader         = require("utils/ExtensionLoader"),
        SidebarView             = require("project/SidebarView");
        
    //Load modules that self-register and just need to get included in the main project
    require("editor/CodeHintManager");
    require("editor/EditorCommandHandlers");
    require("debug/DebugCommandHandlers");
    require("view/ViewCommandHandlers");
    require("search/FindInFiles");

    // Define core brackets namespace if it isn't already defined
    //
    // We can't simply do 'brackets = {}' to define it in the global namespace because
    // we're in "use strict" mode. Most likely, 'window' will always point to the global
    // object when this code is running. However, in case it isn't (e.g. if we're running 
    // inside Node for CI testing) we use this trick to get the global object.
    //
    // Taken from:
    //   http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript
    var Fn = Function, global = (new Fn('return this'))();
    if (!global.brackets) {
        global.brackets = {};
    }
    
    // TODO: (issue #265) Make sure the "test" object is not included in final builds
    // All modules that need to be tested from the context of the application
    // must to be added to this object. The unit tests cannot just pull
    // in the modules since they would run in context of the unit test window,
    // and would not have access to the app html/css.
    brackets.test = {
        PreferencesManager      : require("preferences/PreferencesManager"),
        ProjectManager          : ProjectManager,
        DocumentCommandHandlers : DocumentCommandHandlers,
        FileViewController      : FileViewController,
        DocumentManager         : DocumentManager,
        EditorManager           : EditorManager,
        Commands                : Commands,
        WorkingSetView          : WorkingSetView,
        JSLintUtils             : JSLintUtils,
        PerfUtils               : PerfUtils,
        CommandManager          : require("command/CommandManager"),
        FileSyncManager         : FileSyncManager,
        FileIndexManager        : FileIndexManager,
        CSSUtils                : require("language/CSSUtils"),
        LiveDevelopment         : require("LiveDevelopment/LiveDevelopment"),
        Inspector               : require("LiveDevelopment/Inspector/Inspector"),
        NativeApp               : require("utils/NativeApp")
    };
    
    // Uncomment the following line to force all low level file i/o routines to complete
    // asynchronously. This should only be done for testing/debugging.
    // NOTE: Make sure this line is commented out again before committing!
    //brackets.forceAsyncCallbacks = true;

    // Load native shell when brackets is run in a native shell rather than the browser
    // TODO: (issue #266) load conditionally
    brackets.shellAPI = require("utils/ShellAPI");
    
    brackets.inBrowser = !brackets.hasOwnProperty("fs");
    
    brackets.platform = (global.navigator.platform === "MacIntel" || global.navigator.platform === "MacPPC") ? "mac" : "win";

    // Main Brackets initialization
    $(window.document).ready(function () {
        
        function initListeners() {
            // Prevent unhandled drag and drop of files into the browser from replacing 
            // the entire Brackets app. This doesn't prevent children from choosing to
            // handle drops.
            $(window.document.body)
                .on("dragover", function (event) {
                    if (event.originalEvent.dataTransfer.files) {
                        event.stopPropagation();
                        event.preventDefault();
                        event.originalEvent.dataTransfer.dropEffect = "none";
                    }
                })
                .on("drop", function (event) {
                    if (event.originalEvent.dataTransfer.files) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                });
        }
        
        function initCommandHandlers() {
            // Most command handlers are automatically registered when their module is loaded (see "modules
            // that self-register" above for some). A few commands need an extra kick here though:
            
            DocumentCommandHandlers.init($("#main-toolbar"));
            
            // About dialog
            CommandManager.register(Commands.HELP_ABOUT, function () {
                // If we've successfully determined a "build number" via .git metadata, add it to dialog
                var bracketsSHA = BuildInfoUtils.getBracketsSHA(),
                    bracketsAppSHA = BuildInfoUtils.getBracketsAppSHA(),
                    versionLabel = "";
                if (bracketsSHA) {
                    versionLabel += " (" + bracketsSHA.substr(0, 7) + ")";
                }
                if (bracketsAppSHA) {
                    versionLabel += " (shell " + bracketsAppSHA.substr(0, 7) + ")";
                }
                $("#about-build-number").text(versionLabel);
                
                Dialogs.showModalDialog(Dialogs.DIALOG_ID_ABOUT);
            });
        }

        function initKeyBindings() {
            // Register keymaps and install the keyboard handler
            // TODO: (issue #268) show keyboard equivalents in the menus
            var _globalKeymap = KeyMap.create({
                "bindings": [
                    // FILE
                    {"Ctrl-N": Commands.FILE_NEW},
                    {"Ctrl-O": Commands.FILE_OPEN},
                    {"Ctrl-S": Commands.FILE_SAVE},
                    {"Ctrl-W": Commands.FILE_CLOSE},
                    {"Ctrl-Alt-P": Commands.FILE_LIVE_FILE_PREVIEW},
                    {"Ctrl-Q": Commands.FILE_QUIT},

                    // EDIT 
                    // disabled until the menu items are connected to the commands. Keyboard shortcuts work via CodeMirror
                    //{"Ctrl-Z": Commands.EDIT_UNDO},
                    //{"Ctrl-Y": Commands.EDIT_REDO},
                    //{"Ctrl-X": Commands.EDIT_CUT},
                    //{"Ctrl-C": Commands.EDIT_COPY}, 
                    //{"Ctrl-V": Commands.EDIT_PASTE},

                    {"Ctrl-A": Commands.EDIT_SELECT_ALL},
                    {"Ctrl-F": Commands.EDIT_FIND},
                    {"Ctrl-Shift-F": Commands.EDIT_FIND_IN_FILES},
                    {"Ctrl-G": Commands.EDIT_FIND_NEXT, "platform": "mac"},
                    {"F3": Commands.EDIT_FIND_NEXT, "platform": "win"},
                    {"Ctrl-Shift-G": Commands.EDIT_FIND_PREVIOUS, "platform": "mac"},
                    {"Shift-F3": Commands.EDIT_FIND_PREVIOUS, "platform": "win"},
                    {"Ctrl-Alt-F": Commands.EDIT_REPLACE, "platform": "mac"},
                    {"Ctrl-H": Commands.EDIT_REPLACE, "platform": "win"},
                    {"Ctrl-D": Commands.EDIT_DUPLICATE},
                    {"Ctrl-/": Commands.EDIT_LINE_COMMENT},

                    // VIEW
                    {"Ctrl-Shift-H": Commands.VIEW_HIDE_SIDEBAR},
                    {"Ctrl-=": Commands.VIEW_INCREASE_FONT_SIZE},
                    {"Ctrl--": Commands.VIEW_DECREASE_FONT_SIZE},
                    
                    // Navigate
                    {"Ctrl-Shift-O": Commands.NAVIGATE_QUICK_OPEN},
                    {"Ctrl-T": Commands.NAVIGATE_GOTO_DEFINITION},
                    {"Ctrl-L": Commands.NAVIGATE_GOTO_LINE, "platform": "mac"},
                    {"Ctrl-G": Commands.NAVIGATE_GOTO_LINE, "platform": "win"},
                    {"Ctrl-E": Commands.SHOW_INLINE_EDITOR},
                    {"Alt-Up": Commands.QUICK_EDIT_PREV_MATCH},
                    {"Alt-Down": Commands.QUICK_EDIT_NEXT_MATCH},

                    // DEBUG
                    {"F5": Commands.DEBUG_REFRESH_WINDOW, "platform": "win"},
                    {"Ctrl-R": Commands.DEBUG_REFRESH_WINDOW, "platform": "mac"}


                ],
                "platform": brackets.platform
            });
            KeyBindingManager.installKeymap(_globalKeymap);

            window.document.body.addEventListener(
                "keydown",
                function (event) {
                    if (KeyBindingManager.handleKey(KeyMap.translateKeyboardEvent(event))) {
                        event.stopPropagation();
                    }
                },
                true
            );
        }
        
        function initWindowListeners() {
            // TODO: (issue 269) to support IE, need to listen to document instead (and even then it may not work when focus is in an input field?)
            $(window).focus(function () {
                FileSyncManager.syncOpenDocuments();
                FileIndexManager.markDirty();
            });
            
            $(window).contextmenu(function (e) {
                e.preventDefault();
            });
        }

        // Add the platform (mac or win) to the body tag so we can have platform-specific CSS rules
        $("body").addClass("platform-" + brackets.platform);


        EditorManager.setEditorHolder($('#editor-holder'));

        // Let the user know Brackets doesn't run in a web browser yet
        if (brackets.inBrowser) {
            Dialogs.showModalDialog(
                Dialogs.DIALOG_ID_ERROR,
                Strings.ERROR_BRACKETS_IN_BROWSER_TITLE,
                Strings.ERROR_BRACKETS_IN_BROWSER
            );
        }
    
        initListeners();
        initCommandHandlers();
        initKeyBindings();
        Menus.init(); // key bindings should be initialized first
        initWindowListeners();
        
        // Read "build number" SHAs off disk at the time the matching Brackets JS code is being loaded, instead
        // of later, when they may have been updated to a different version
        BuildInfoUtils.init();

        // Load extensions

        // FUTURE (JRB): As we get more fine-grained performance measurement, move this out of core application startup

        // Loading extensions requires creating new require.js contexts, which requires access to the global 'require' object
        // that always gets hidden by the 'require' in the AMD wrapper. We store this in the brackets object here so that 
        // the ExtensionLoader doesn't have to have access to the global object.
        brackets.libRequire = global.require;

        // Also store our current require.js context (the one that loads brackets core modules) so that extensions can use it
        // Note: we change the name to "getModule" because this won't do exactly the same thing as 'require' in AMD-wrapped
        // modules. The extension will only be able to load modules that have already been loaded once.
        brackets.getModule = require;

        ExtensionLoader.loadAllExtensionsInNativeDirectory(
            FileUtils.getNativeBracketsDirectoryPath() + "/extensions/default",
            "extensions/default"
        );
        ExtensionLoader.loadAllExtensionsInNativeDirectory(
            FileUtils.getNativeBracketsDirectoryPath() + "/extensions/user",
            "extensions/user"
        );
        
        // Use quiet scrollbars if we aren't on Lion. If we're on Lion, only
        // use native scroll bars when the mouse is not plugged in or when
        // using the "Always" scroll bar setting. 
        var osxMatch = /Mac OS X 10\D([\d+])\D/.exec(navigator.userAgent);
        if (osxMatch && osxMatch[1] && Number(osxMatch[1]) >= 7) {
            // test a scrolling div for scrollbars
            var $testDiv = $("<div style='position:fixed;left:-50px;width:50px;height:50px;overflow:auto;'><div style='width:100px;height:100px;'/></div>").appendTo(window.document.body);
            
            if ($testDiv.outerWidth() === $testDiv.get(0).clientWidth) {
                $(".sidebar").removeClass("quiet-scrollbars");
            }
            
            $testDiv.remove();
        }
        
        PerfUtils.addMeasurement("Application Startup");
        
        ProjectManager.loadProject();
    });
    
}