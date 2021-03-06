function () {

    "use strict";

    var fluid = require("infusion"),
        path = require("path"),
        gpii = fluid.registerNamespace("gpii");

    fluid.require("gpiiFramework", require);
    fluid.require("./userGet.js", require);
    fluid.require("./userPost.js", require);
    
    fluid.defaults("gpii.preferencesServer", {
        gradeNames: ["gpii.app", "autoInit"],
        handlers: {
            userGet: {
                route: "/user/:token",
                type: "get"
            },
            userPost: {
                route: "/user/:token",
                type: "post"
            }
        },
        userSourceUrl: "",
        components: {
            userSource: {
                type: "gpii.dataSource",
                options: {
                    url: "{gpii.preferencesServer}.options.userSourceUrl",
                    writable: true,
                    termMap: {
                        token: "%token"
                    }
                }
            }
        }
    });

    fluid.demands("gpii.urlExpander", ["preferencesServer.development", "gpii.preferencesServer"], {
        options: {
            vars: {
                root: path.join(__dirname, "..")
            }
        }
    });

    fluid.demands("userSource", "gpii.preferencesServer", {
        funcName: "gpii.dataSource.URL"
    });
    
}