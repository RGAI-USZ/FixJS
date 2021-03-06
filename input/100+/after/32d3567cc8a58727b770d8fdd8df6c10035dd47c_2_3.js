function(model,pathname) {
    // TODO: hack alert... mangling pathname
    openmdao.ComponentFrame.prototype.init.call(this,
        'CE-'+pathname.replace(/\./g,'-'),'Component: '+pathname);

    /***********************************************************************
     *  private
     ***********************************************************************/

    // initialize private variables
    var self = this,
        panes = {};

    self.elm.css({'overflow':'hidden'});

    /** load the table with the given properties */
    function loadTabs(properties) {
        if (!properties || properties.length === 0) {
            alert('No properties found for ',self.pathname);
            return;
        }

        var tabbed_pane = jQuery('<div id="'+self.id+'_tabs">'),
            tabs = jQuery('<ul>');

        self.elm.html("");
        self.elm.append(tabbed_pane);
        tabbed_pane.append(tabs);

        var tabcount = 0;

        jQuery.each(properties,function (name,val) {
            if (name === 'type') {
                if (self.elm.parent().hasClass('ui-dialog')) {
                    self.elm.dialog("option","title",val+': '+self.pathname);
                }
            }
            else {
                tabcount = tabcount + 1;

                if (name.length > 10) {
                    tabname = name.substr(0,10);
                }
                else {
                    tabname = name;
                }

                var contentID = self.id+'_'+name,
                    tab = jQuery('<li id="'+contentID+'_tab">')
                        .append('<a href="#'+contentID+'">'+tabname+'</a>'),
                    contentPane = jQuery('<div id="'+contentID+'" style="overflow:auto"></div>');

                tabs.append(tab);
                tabbed_pane.append(contentPane);
                getContent(contentPane,name,val);
            }
        });

        self.elm.height(400);
        self.elm.width(600);
        jQuery('#'+self.id).tabs();
    }

    /** populate content pane appropriately for the content */
    function getContent(contentPane,name,val) {
        // TODO: get content pane type more dynamically (a look up table maybe?)
        if (name === 'Inputs') {
            panes[name] = new openmdao.PropertiesPane(contentPane,model,
                                self.pathname,name,true,true);
            panes[name].loadData(val);
        }
        else if (name === 'Outputs') {
            panes[name] = new openmdao.PropertiesPane(contentPane,model,
                                self.pathname,name,false,true);
            panes[name].loadData(val);
        }
        else if (name === 'CouplingVars') {
            panes[name] = new openmdao.CouplingVarsPane(contentPane,model,
                                self.pathname,name,true);
            panes[name].loadData(val);
        }
        else if (name === 'Objectives') {
            panes[name] = new openmdao.ObjectivesPane(contentPane,model,
                                self.pathname,name,true);
            panes[name].loadData(val);
        }
        else if (name === 'Parameters') {
            panes[name] = new openmdao.ParametersPane(contentPane,model,
                                self.pathname,name,true);
            panes[name].loadData(val);
        }
        else if ((name === 'EqConstraints') || (name === 'IneqConstraints')) {
            panes[name] = new openmdao.ConstraintsPane(contentPane,model,
                                self.pathname,name,true);
            panes[name].loadData(val);
        }
        else if (name === 'Workflow') {
            panes[name] = new openmdao.WorkflowPane(contentPane,model,
                                self.pathname,name);
            panes[name].loadData(val);
        }
        else if (name === 'Dataflow') {
            panes[name] = new openmdao.DataflowPane(contentPane,model,
                                self.pathname,name);
            panes[name].loadData(val);
        }
        else if (name === 'Slots') {
            panes[name] = new openmdao.SlotsPane(contentPane,model,
                                self.pathname,name,false);
            panes[name].loadData(val);
        }
        else {
            debug.warn("ComponentFrame: Unexpected object",self.pathname,name);
        }
    }

    function loadData(ifaces) {
        jQuery.each(ifaces,function (name,props) {
            if (panes[name]) {
                panes[name].loadData(props);
            }
            else if (name !== 'type') {
                debug.warn("ComponentFrame: Unexpected object",
                                self.pathname,name,props);
            }
        });
    }

    function handleMessage(message) {
        if (message.length !== 2 || message[0] !== self.pathname) {
            debug.warn('Invalid component data for:',self.pathname,message);
            debug.warn('message length',message.length,'topic',message[0]);
        }
        else {
            loadData(message[1]);
        }
    }

    /***********************************************************************
     *  privileged
     ***********************************************************************/

    /** if there is an object loaded, update it from the model */
    this.update = function() {
        // TODO: should just update existing panes rather than recreate them
        if (self.pathname && self.pathname.length>0) {
            self.editObject(self.pathname);
        }
    };

    /** get the specified object from model, load properties into tabs */
    this.editObject = function(path) {
        var callback = loadData;
        if (self.pathname !== path) {
           if (self.pathname) {
                model.removeListener(self.pathname, handleMessage);
            }

            self.pathname = path;
            callback = loadTabs;    // recreate tabs

            // listen for messages and update component properties accordingly
            model.addListener(self.pathname, handleMessage);
        }

        model.getComponent(path, callback,
            function(jqXHR, textStatus, errorThrown) {
                debug.warn('ComponentFrame.editObject() Error:',
                            jqXHR, textStatus, errorThrown);
                // assume component has been deleted, so close frame
                self.close();
            }
        );
        return this;
    };

    this.destructor = function() {
        if (self.pathname && self.pathname.length>0) {
            model.removeListener(self.pathname, handleMessage);
        }
    };

    this.editObject(pathname);

}