function() {
    // define openmdao namespace & create interface to openmdao in global scope
    openmdao = (typeof openmdao === "undefined" || !openmdao ) ? {} : openmdao ;
    openmdao.model = new openmdao.Model();

    // set the layout (note: global scope)
    layout = jQuery('body').layout({
        north__size: 40,
        north__resizable: false,
        north_showOverflowOnHover: true,
        south__size: 150,
        onresize: function(e) {
            // resize content pane of all tabbed panes to fill the layout pane
            var layout_pane = jQuery('.ui-layout-'+e),
                tabs_height = layout_pane.find('.ui-tabs-nav').outerHeight(),
                pane_height = layout_pane.height()-tabs_height,
                pane_width  = layout_pane.width();
            jQuery(layout_pane.find('.ui-tabs-panel').each(function() {
                var panel = jQuery(this);
                panel.height(pane_height);
                panel.width(pane_width);
            }));
        }
    });

    // add main menu
    jQuery.getJSON("/static/js/openmdao/MainMenu.json",
        function(json) { new openmdao.Menu("menu",json); }
    );

    // add tabbed pane functionality
    jQuery("#leftcol_tabs").tabs();
    jQuery("#central_tabs").tabs();
    jQuery("#rightcol_tabs").tabs();

    // add gui functionality to designated DOM nodes
    (function() {
        var model = openmdao.model;

        var data = new openmdao.DataflowFrame("dataflow_pane",model,''),
            work = new openmdao.WorkflowFrame("workflow_pane",model,''),
            prop = new openmdao.PropertiesFrame("properties_pane",model);

        // create functions to load content into the different panes
        // intercept tab clicks to set the adjacent label
        var central_label = jQuery('#central_label'),
            dataflow_tab  = jQuery('#dataflow_tab a'),
            workflow_tab  = jQuery('#workflow_tab a');

        dataflow_tab.click(function(e) { central_label.text(data.getPathname()); });
        workflow_tab.click(function(e) { central_label.text(work.getPathname()); });

        function data_fn(path) { data.showDataflow(path); dataflow_tab.click(); }
        function work_fn(path) { work.showWorkflow(path); workflow_tab.click(); }
        function prop_fn(path) { prop.editObject(path); }
        function comp_fn(path) { new openmdao.ComponentFrame(model,path); }

        new openmdao.ComponentTreeFrame("otree_pane", model, prop_fn, comp_fn, work_fn, data_fn);
        new openmdao.LibraryFrame("library_pane",  model);
        new openmdao.ConsoleFrame("console",  model);
    }());

    // do layout
    jQuery('body').trigger('layoutresizeall');
}