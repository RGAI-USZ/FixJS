function () {

    "use strict";
   
    var express = require("express"),
        fluid = require("infusion"),
        fs = require("fs"),
        path = require("path"),
        querystring = require("querystring");
        
    
    var gpii = fluid.registerNamespace("gpii");

    // TODO: use standard argv library here
    var findArgv = function (key) {
        return fluid.find(process.argv, function (arg) {
            if (arg.indexOf(key + "=") === 0) {
                return arg.substr(key.length + 1);
            }
        });
    };

    fluid.require("gpiiFramework", require);
    fluid.require("./UserLogin.js", require);
    fluid.require("./UserLogout.js", require);
    fluid.require("matchMaker", require);
    fluid.require("deviceReporter", require);
    fluid.require("lifecycleManager", require);

    fluid.defaults("gpii.flowManager", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "gpii.flowManager.preInit",
        finalInitFunction: "gpii.flowManager.finalInit",
        components: {
            requests: {
                type: "gpii.requests"
            },
            bodyParser: {
                type: "gpii.middleware",
                options: {
                    components: {
                        server: "{gpii.flowManager}.server"
                    }
                },
                createOnEvent: "onMiddleware"
            },
            preferencesDataSource: {
                type: "gpii.dataSource",
                options: {
                    url: "{gpii.flowManager}.config.preferences.url",
                    termMap: {
                        token: "%token"
                    }
                }
            },
            deviceReporterDataSource: {
                type: "gpii.dataSource",
                options: {
                    url: "{gpii.flowManager}.config.deviceReporter.url"
                }
            },
            matchMakerDataSource: {
                type: "gpii.dataSource",
                options: {
                    url: "{gpii.flowManager}.config.matchMaker.url",
                    writable: true
                }
            },
            lifecycleManager: {
                type: "gpii.lifecycleManager"
            }
        },
        events: {
            onMiddleware: null,
            onHandlers: null
        },
        listeners: {
            onHandlers: "{gpii.flowManager}.registerHandlers"
        },
        handlers: {
            userLogin: {
                route: "/user/:token/login",
                type: "get"
            },
            userLogout: {
                route: "/user/:token/logout",
                type: "get"
            }
        },
        configs: {
            production: {
                typeTag: "gpii.production",
                configPath: "../config.production.json",
                logging: false
            },
            development: {
                typeTag: "gpii.development",
                configPath: "../config.development.json",
                logging: true
            },
            demo_local: {
                typeTag: "gpii.demo_local",
                configPath: "../config.demo_local.json",
                logging: true
            },
            demo: {
                typeTag: "gpii.demo",
                configPath: "../config.demo.json",
                logging: true
            }
        }
    });

    gpii.flowManager.preInit = function (that) {
        that.server = express.createServer();
        fluid.each(that.options.configs, function (config, env) {
            that.server.configure(env, function () {
                fluid.staticEnvironment.production = fluid.typeTag(config.typeTag);
                that.config = JSON.parse(fs.readFileSync(path.join(__dirname, config.configPath)));
                fluid.setLogging(config.logging);
            });
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

    gpii.flowManager.finalInit = function (that) {

        that.server.configure(function () {
            that.server.use(that.requests.create);
        });
        that.events.onMiddleware.fire();
        that.events.onHandlers.fire();

        var port = findArgv("port") || 8081;
        fluid.log("Flow Manager is running on port: " + port);
        that.server.listen(typeof port === "string" ? parseInt(port, 10) : port);
    };

    fluid.demands("gpii.urlExpander", "gpii.flowManager", {
        options: {
            vars: {
                db: path.join(__dirname, ".."),
                root: path.join(__dirname, "..")
            }
        }
    });

    fluid.demands("gpii.urlExpander", ["gpii.demo", "gpii.flowManager"], {
        options: {
            vars: {
                db: "user",
                root: path.join(__dirname, "..")
            }
        }
    });

    fluid.demands("gpii.urlExpander", ["gpii.production", "gpii.flowManager"], {
        options: {
            vars: {
                db: "user",
                root: path.join(__dirname, "..")
            }
        }
    });

    fluid.demands("bodyParser", "gpii.flowManager", {
        funcName: "gpii.middleware.bodyParser"
    });

    fluid.demands("preferencesDataSource", "gpii.flowManager", {
        funcName: "gpii.dataSource.URL"
    });
    
    fluid.demands("matchMakerDataSource", "gpii.flowManager", {
        funcName: "gpii.matchMaker"
    });

    fluid.demands("deviceReporterDataSource", "gpii.flowManager", {
        funcName: "gpii.deviceReporter"
    });

}