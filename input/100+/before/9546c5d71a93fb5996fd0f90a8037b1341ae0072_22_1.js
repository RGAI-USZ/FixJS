function($, sakai){

    sakai_global = sakai_global || {};
    sakai.widgets = sakai.widgets || {};
    sakai.widgets = {};
    sakai_global.qunit = sakai_global.qunit || {};
    sakai_global.qunit.widgets = sakai_global.qunit.widgets || [];
    sakai_global.qunit.widgetsdone = false;

    /**
     * An array of all of the widgets in the system
     * NOTE: This has to be manually updated, so whenever you add a widget
     *       you must add it to this list
     */
    var widgetList = [
        "accountpreferences",
        "activegroups",
        "addarea",
        "addpeople",
        "addtocontacts",
        "allcategories",
        "areapermissions",
        "assignlocation",
        "basiclti",
        "captcha",
        "carousel",
        "categories",
        "changepic",
        "collectionviewer",
        "comments",
        "contacts",
        "contentauthoring",
        "contentcomments",
        "contentmetadata",
        "contentpermissions",
        "contentpreview",
        "createpage",
        "dashboard",
        "dashboardactivity",
        "deletecontent",
        "discussion",
        "displayprofilesection",
        "documentviewer",
        "embedcontent",
        "entity",
        "faceted",
        "featuredcontent",
        "featuredpeople",
        "featuredworlds",
        "footer",
        "ggadget",
        "googlemaps",
        "helloworld",
        "help",
        "htmlblock",
        "inbox",
        "inserter",
        "inserterbar",
        "institutionalskinning",
        "joingroup",
        "joinrequestbuttons",
        "joinrequests",
        "lhnavigation",
        "listgeneral",
        "listpeople",
        "listpeopleinnode",
        "listpeoplewrappergroup",
        "login",
        "mycontacts",
        "mycontent",
        "mygroups",
        "mylibrary",
        "mymemberships",
        "mysakai2",
        "navigation",
        "newaddcontent",
        "newcreategroup",
        "newsharecontent",
        "pagetitle",
        "pageviewer",
        "participants",
        "personinfo",
        "pickeradvanced",
        "pickeruser",
        "poll",
        "popularcontent",
        "recentactivity",
        "recentchangedcontent",
        "recentcontactsnew",
        "recentmemberships",
        "recentmessages",
        "relatedcontent",
        "remotecontent",
        "rss",
        "sakai2favourites",
        "sakai2tools",
        "savecontent",
        "searchall",
        "searchcontent",
        "searchgroups",
        "searchpeople",
        "searchsakai2",
        "selecttemplate",
        "sendmessage",
        "siterecentactivity",
        "tags",
        "text",
        "tooltip",
        "topnavigation",
        "uploadcontent",
        "uploadnewversion",
        "versions",
        "video",
        "welcome",
        "worldsettings"
    ];


    /**
     * Grab all the widget config files
     *
     * This does the same thing as /var/widgets.json does, but 
     * since we have to be able to do this without a sever, we recreate
     * the effect here
     */

    var loadWidgets = function() {
        sakai_global.qunit.allJSFiles = $.merge([], sakai_global.qunit.devJsFiles);
        sakai_global.qunit.allHtmlFiles = $.merge([], sakai_global.qunit.devHtmlFiles);
        for (var i=0, j=widgetList.length; i<j; i++) {
            var widget = widgetList[i];

            (function(widgetName) {
                var widgetJS = "/devwidgets/" + widgetName + "/javascript/" + widgetName + ".js",
                    widgetHTML = false;
                $.ajax({
                    url: "/devwidgets/" + widgetName + "/config.json",
                    type: "json",
                    success: function(data) {
                        try {
                            data = $.parseJSON(data);
                        } catch (e) {
                            console.error(widgetName + " has an error in its json");
                        }
                        sakai.widgets[widgetName] = data;
                        widgetHTML = sakai.widgets[widgetName].url;
                        sakai_global.qunit.widgets.push({name:widgetName, html: widgetHTML, js: widgetJS});
                        if (widgetList.length === sakai_global.qunit.widgets.length) {
                            sakai_global.qunit.widgetsdone = true;
                            $(window).trigger("widgetsdone.qunit.sakai");
                        }
                    }
                });
            })(widget);
        }
    };

    if (sakai_global.qunit.devfilesdone) {
        loadWidgets();
    } else {
        $(window).bind("devfilesdone.qunit.sakai", function() {
            loadWidgets();
        });
    }


}