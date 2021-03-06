function () {

    "use strict";

    var express = require("express"),
        fluid = require("infusion"),
        path = require("path"),
        gpii = fluid.registerNamespace("gpii");

    var findArgv = function (key) {
        return fluid.find(process.argv, function (arg) {
            if (arg.indexOf(key + "=") === 0) {
                return arg.substr(key.length + 1);
            }
        });
    };

    fluid.require("gpiiFramework", require);
    fluid.require("./userGet.js", require);
    fluid.require("./userPost.js", require);
    
    fluid.defaults("gpii.preferencesServer", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "gpii.preferencesServer.preInit",
        finalInitFunction: "gpii.preferencesServer.finalInit",
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
        components: {
            requests: {
                type: "gpii.requests"
            },
            bodyParser: {
                type: "gpii.middleware",
                options: {
                    components: {
                        server: "{gpii.preferencesServer}.server"
                    }
                },
                createOnEvent: "onMiddleware"
            },
            userSource: {
                type: "gpii.dataSource"
            }
        },
        events: {
            onMiddleware: null,
            onHandlers: null
        },
        listeners: {
            onHandlers: "{gpii.preferencesServer}.registerHandlers"
        }
    });
    
    gpii.preferencesServer.preInit = function (that) {
        that.server = express.createServer();

        that.server.configure("production", function () {
            // Set production options.
            fluid.staticEnvironment.production = fluid.typeTag("gpii.production");
            fluid.setLogging(false);
        });
        that.server.configure("development", function () {
            // Set development options.
            fluid.staticEnvironment.production = fluid.typeTag("gpii.development");
            fluid.setLogging(true);
        });

        that.registerHandlers = function () {
            fluid.each(that.options.handlers, function (handler, context) {
                that.server[handler.type](handler.route, function (req) {
                    var request = req.fluidRequest;
                    request.context = fluid.typeTag(context);
                    request.handle();
                });
            });
        };
    };
    
    gpii.preferencesServer.finalInit = function (that) {
        that.server.configure(function () {
            that.server.use(that.requests.create);
        });
        that.events.onMiddleware.fire();
        that.events.onHandlers.fire();

        var port = findArgv("port") || 8080;
        fluid.log("Preferences Server is running on port: " + port);
        that.server.listen(typeof port === "string" ? parseInt(port, 10) : port);
    };

    fluid.demands("bodyParser", "gpii.preferencesServer", {
        funcName: "gpii.middleware.bodyParser"
    });
    fluid.demands("gpii.urlExpander", ["gpii.development", "gpii.preferencesServer"], {
        options: {
            vars: {
                db: path.join(__dirname, ".."),
                root: path.join(__dirname, "..")
            }
        }
    });
    fluid.demands("userSource", ["gpii.development"], {
        funcName: "gpii.dataSource.file",
        options: {
            url: "%db/test/data/user/%token.json",
            writable: true,
            termMap: {
                token: "%token"
            }
        }
    });
    fluid.demands("userSource", ["gpii.production"], {
        funcName: "gpii.dataSource.URL",
        options: {
            url: "http://localhost:5984/user/%token",
            writable: true,
            termMap: {
                token: "%token"
            }
        }
    });

    gpii.preferencesServer();
    
}