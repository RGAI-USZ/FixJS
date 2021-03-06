function (require, exports, module) {
    'use strict';
    
    var ProjectManager          = require("project/ProjectManager"),
        WorkingSetView          = require("project/WorkingSetView"),
        CommandManager          = require("command/CommandManager"),
        Commands                = require("command/Commands"),
        Strings                 = require("strings"),
        PreferencesManager      = require("preferences/PreferencesManager"),
        EditorManager           = require("editor/EditorManager");

    var $sidebar                = $("#sidebar"),
        $sidebarMenuText        = $("#menu-view-hide-sidebar span"),
        $sidebarResizer         = $("#sidebar-resizer"),
        $openFilesContainer     = $("#open-files-container"),
        $projectTitle           = $("#project-title"),
        $projectFilesContainer  = $("#project-files-container"),
        isSidebarClosed         = false;
    
    var PREFERENCES_CLIENT_ID = "com.adobe.brackets.SidebarView",
        defaultPrefs = { sidebarWidth: 200, sidebarClosed: false };
    
    
    /**
     * @private
     * Update project title when the project root changes
     */
    function _updateProjectTitle() {
        $projectTitle.html(ProjectManager.getProjectRoot().name);
        $projectTitle.attr("title", ProjectManager.getProjectRoot().fullPath);
    }
    
    /**
     * @private
     * Sets sidebar width and resizes editor. Does not change internal sidebar open/closed state.
     * @param {number} width Optional width in pixels. If null or undefined, the default width is used.
     * @param {!boolean} updateMenu Updates "View" menu label to indicate current sidebar state.
     * @param {!boolean} displayTriangle Display selection marker triangle in the active view.
     */
    function _setWidth(width, updateMenu, displayTriangle) {
        // if we specify a width with the handler call, use that. Otherwise use
        // the greater of the current width or 200 (200 is the minimum width we'd snap back to)
        
        var prefs                   = PreferencesManager.getPreferenceStorage(PREFERENCES_CLIENT_ID, defaultPrefs),
            sidebarWidth            = Math.max(prefs.getValue("sidebarWidth"), 10);
        
        width = width || Math.max($sidebar.width(), sidebarWidth);
        
        if (typeof displayTriangle === "boolean") {
            var display = (displayTriangle) ? "block" : "none";
            $sidebar.find(".sidebar-selection-triangle").css("display", display);
        }
        
        if (isSidebarClosed) {
            $sidebarResizer.css("left", 0);
        } else {
            $sidebar.width(width);
            $sidebarResizer.css("left", width - 1);
            
            // the following three lines help resize things when the sidebar shows
            // but ultimately these should go into ProjectManager.js with a "notify" 
            // event that we can just call from anywhere instead of hard-coding it.
            // waiting on a ProjectManager refactor to add that. 
            $sidebar.find(".sidebar-selection").width(width);
            
            if (width > 10) {
                prefs.setValue("sidebarWidth", width);
            }
        }
        
        if (updateMenu) {
            var text = (isSidebarClosed) ? Strings.CMD_SHOW_SIDEBAR : Strings.CMD_HIDE_SIDEBAR;
            CommandManager.get(Commands.VIEW_HIDE_SIDEBAR).setName(text);
        }
        EditorManager.resizeEditor();
    }
    
    /**
     * Toggle sidebar visibility.
     */
    function toggleSidebar(width) {
        if (isSidebarClosed) {
            $sidebar.show();
        } else {
            $sidebar.hide();
        }
        
        isSidebarClosed = !isSidebarClosed;
        
        var prefs = PreferencesManager.getPreferenceStorage(PREFERENCES_CLIENT_ID, defaultPrefs);
        prefs.setValue("sidebarClosed", isSidebarClosed);
        _setWidth(width, true, !isSidebarClosed);
    }
    
    /**
     * @private
     * Install sidebar resize handling.
     */
    function _initSidebarResizer() {
        var $mainView               = $(".main-view"),
            $body                   = $(document.body),
            prefs                   = PreferencesManager.getPreferenceStorage(PREFERENCES_CLIENT_ID, defaultPrefs),
            sidebarWidth            = prefs.getValue("sidebarWidth"),
            startingSidebarPosition = sidebarWidth,
            animationRequest        = null,
            isMouseDown             = false;
        
        $sidebarResizer.css("left", sidebarWidth - 1);
        
        if (prefs.getValue("sidebarClosed")) {
            toggleSidebar(sidebarWidth);
        } else {
            _setWidth(sidebarWidth, true, true);
        }
        
        $sidebarResizer.on("dblclick", function () {
            if ($sidebar.width() < 10) {
                //mousedown is fired first. Sidebar is already toggeled open to at least 10px.
                _setWidth(null, true, true);
                $projectFilesContainer.triggerHandler("scroll");
                $openFilesContainer.triggerHandler("scroll");
            } else {
                toggleSidebar(sidebarWidth);
            }
        });
        $sidebarResizer.on("mousedown.sidebar", function (e) {
            var startX = e.clientX,
                newWidth = Math.max(e.clientX, 0),
                doResize = true;
            
            isMouseDown = true;

            // take away the shadows (for performance reasons during sidebarmovement)
            $sidebar.find(".scroller-shadow").css("display", "none");
            
            $body.toggleClass("resizing");
            
            // check to see if we're currently in hidden mode
            if (isSidebarClosed) {
                toggleSidebar(1);
            }
                        
            
            animationRequest = window.webkitRequestAnimationFrame(function doRedraw() {
                // only run this if the mouse is down so we don't constantly loop even 
                // after we're done resizing.
                if (!isMouseDown) {
                    return;
                }
                    
                // if we've gone below 10 pixels on a mouse move, and the
                // sidebar is shrinking, hide the sidebar automatically an
                // unbind the mouse event. 
                if ((startX > 10) && (newWidth < 10)) {
                    toggleSidebar(startingSidebarPosition);
                    $mainView.off("mousemove.sidebar");
                        
                    // turn off the mouseup event so that it doesn't fire twice and retoggle the 
                    // resizing class
                    $mainView.off("mouseup.sidebar");
                    $body.toggleClass("resizing");
                    doResize = false;
                    startX = 0;
                        
                    // force isMouseDown so that we don't keep calling requestAnimationFrame
                    // this keeps the sidebar from stuttering
                    isMouseDown = false;
                        
                }
                
                if (doResize) {
                    // for right now, displayTriangle is always going to be false for _setWidth
                    // because we want to hide it when we move, and _setWidth only gets called
                    // on mousemove now.
                    _setWidth(newWidth, false, false);
                }
                
                animationRequest = window.webkitRequestAnimationFrame(doRedraw);
            });
            
            $mainView.on("mousemove.sidebar", function (e) {
                newWidth = Math.max(e.clientX, 0);
                
                e.preventDefault();
            });
                
            $mainView.one("mouseup.sidebar", function (e) {
                isMouseDown = false;
                
                // replace shadows and triangle
                $sidebar.find(".sidebar-selection-triangle").css("display", "block");
                $sidebar.find(".scroller-shadow").css("display", "block");
                
                $projectFilesContainer.triggerHandler("scroll");
                $openFilesContainer.triggerHandler("scroll");
                $mainView.off("mousemove.sidebar");
                $body.toggleClass("resizing");
                startingSidebarPosition = $sidebar.width();
            });
            
            e.preventDefault();
        });
    }
    
    // init
    (function () {
        WorkingSetView.create($openFilesContainer);
        
        $(ProjectManager).on("projectOpen", _updateProjectTitle);

        CommandManager.register(Strings.CMD_HIDE_SIDEBAR,       Commands.VIEW_HIDE_SIDEBAR,     toggleSidebar);
        
        _initSidebarResizer();
    }());
    
    exports.toggleSidebar = toggleSidebar;
}