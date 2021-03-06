function () {
    "use strict";

    var fluid = require("infusion");
    var gpii = fluid.registerNamespace("gpii");

    fluid.staticEnvironment.gpiiTests = fluid.typeTag("gpii.tests.lifecycleManager");

    fluid.registerNamespace("gpii.tests.lifecycleManager");

    var fakeEnvironment = {
        JAWS_DIR: "e:\\Programs and Things\\Jaws\\",
        WINDIR: "c:\\Windows\\"
    };
    
    fluid.defaults("gpii.tests.lifecycleManager.resolverConfig", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        resolvers: {
            environment: "gpii.tests.lifecycleManager.environmentResolver"
        }
    });
    
    gpii.tests.lifecycleManager.environmentResolver = function (name) {
        return fakeEnvironment[name];
    };
    
    fluid.demands("resolverConfig", ["gpii.lifecycleManager.resolver", "gpii.tests.lifecycleManager"], {
        funcName: "gpii.tests.lifecycleManager.resolverConfig",
        } 
    );
    
    var standardLifecycle = {
        "start": [
            "setSettings",
            {
            "type": "gpii.tests.lifecycleManager.mockExecHandler",
            "name": "exec",
            "command": "${{environment}.JAWS_DIR}jaws.exe",
            args: ["-settingsDirectory", "${{environment}.WINDIR}"]
            }],
        "stop": [{
            "type": "gpii.tests.lifecycleManager.mockKillHandler",
            pid: "${{exec}.pid}"
            }, 
            "restoreSettings"]
        };

    var configurationSpec = [{
        "id": "org.gnome.desktop.a11y.magnifier",
        "settingsHandlers": [{
            "type": "gpii.tests.lifecycleManager.mockSettingsHandler",
            "settings": {
                "cross-hairs-clip": true,
                "cross-hairs-color": "red"
            },
            "options": {}
        }],
        "lifecycleManager": standardLifecycle
        }];

    var createPayloadForSettingsHandlerRequest = {
        "type": "gpii.gsettings.set",
        "settings": {
            "cross-hairs-clip": true,
            "cross-hairs-color": "red"
        },
        "options": {}
    };

    var createPayloadForSettingsHandlerResponse = {
        "org.gnome.desktop.a11y.magnifier": [{
            "settings": {
                "cross-hairs-clip": true,
                "cross-hairs-color": "red"
            },
            "options": {}
        }]
    };

    var parseHandlerResponseFunctionRequestNoSettings = {
        "org.gnome.desktop.interface": [{
            "settings": {}
        }]
    };

    var parseHandlerResponseFunctionRequest = {
        "org.gnome.desktop.a11y.magnifier": [{
            "settings": {
                "cross-hairs-clip": {
                    "oldValue": false,
                    "newValue": true
                },
                "cross-hairs-color": {
                    "oldValue": "red",
                    "newValue": "red",
                    statusCode: 500,
                    statusMessage: "Internal Error"
                }
            }
        }]
    };

    var parseHandlerResponseFunctionExpectedResponse = {
        "settings": {
            "cross-hairs-clip": false,
            "cross-hairs-color": "red"
        }
    };

    var invokeSettingsHandlersRequest = [{
        "type": "gpii.tests.lifecycleManager.mockSettingsHandler",
        "settings": {
            "cross-hairs-clip": true,
            "cross-hairs-color": "red"
        },
        "options": {}
    }];

    var invokeSettingsHandlersExpectedSnapshot = [{
        "type": "gpii.tests.lifecycleManager.mockSettingsHandler",
        "settings": {
            "cross-hairs-clip": false,
            "cross-hairs-color": "red"
        },
        "options": {}
    }];

    // Repository for "static" information reported by various kinds of handlers during the lifecycle
    // cleared to be empty on each test start
    gpii.tests.staticRepository = {};
    
    gpii.tests.lifecycleManager.mockExecHandler = function (command, args) {
        gpii.tests.staticRepository.execHandler = {
            command: command,
            args: args
        };
        return {
            pid: 8839
        };
    };
    
    fluid.defaults("gpii.tests.lifecycleManager.mockExecHandler", {
        gradeNames: "fluid.function",
        argumentMap: {
            command: 0,
            args: 1
            // Forfar: 4, Fife: 5
        }
    });
    
    gpii.tests.lifecycleManager.mockKillHandler = function (pid) {
        gpii.tests.staticRepository.killHandler = {
            pid: pid
        };
    };

    fluid.defaults("gpii.tests.lifecycleManager.mockKillHandler", {
        gradeNames: "fluid.function",
        argumentMap: {
            pid: 0,
        }
    });

    gpii.tests.lifecycleManager.mockSettingsHandler = function (data) {
        gpii.tests.staticRepository.settingsHandler = data;
        return parseHandlerResponseFunctionRequest;
    };
    
    gpii.tests.lifecycleManager.assertExpectedExec = function () {
        jqUnit.expect(1);
        jqUnit.assertDeepEq("Exec handler fired with expected arguments",
            {
            "command": fakeEnvironment.JAWS_DIR+"jaws.exe",
            args: ["-settingsDirectory", fakeEnvironment.WINDIR]
            }, 
            gpii.tests.staticRepository.execHandler);
    };
    
    gpii.tests.lifecycleManager.assertExpectedSettingsHandler = function (message, expected) {
        jqUnit.expect(1);
        jqUnit.assertDeepEq("expected input sent to settingsHandler" + message, expected, gpii.tests.staticRepository.settingsHandler);
    };


    var settingsHandlerExpectedInputNewSettings = {
        "org.gnome.desktop.a11y.magnifier": [{
            "settings": {
                "cross-hairs-clip": true,
                "cross-hairs-color": "red"
            },
            "options": {}
        }]
    };

    var settingsHandlerExpectedInputRestoreSettings = {
        "org.gnome.desktop.a11y.magnifier": [{
            "settings": {
                "cross-hairs-clip": false,
                "cross-hairs-color": "red"
            },
            "options": {}
        }]
    };


    gpii.tests.lifecycleManager.runTests = function () {
        var testCase = jqUnit.TestCase("Lifecycle Manager", function() {
            gpii.tests.staticRepository = {};
        });

        testCase.test("gpii.lifecycleManager.createPayloadForSettingsHandler()", function () {
            jqUnit.expect(1);
            var response = gpii.lifecycleManager.specToSettingsHandler("org.gnome.desktop.a11y.magnifier", createPayloadForSettingsHandlerRequest);
            jqUnit.assertDeepEq("createPayloadForSettingsHandler returning the correct payload", createPayloadForSettingsHandlerResponse, response);
        });

        testCase.test("gpii.lifecycleManager.parseHandlerResponse() no settings", function () {
            jqUnit.expect(1);
            var response = gpii.lifecycleManager.responseToSnapshot("org.gnome.desktop.interface", parseHandlerResponseFunctionRequestNoSettings);
            jqUnit.assertUndefined("parseHandlerResponse returning the correct payload", response);
        });

        testCase.test("gpii.lifecycleManager.parseHandlerResponse()", function () {
            jqUnit.expect(1);
            var response = gpii.lifecycleManager.responseToSnapshot("org.gnome.desktop.a11y.magnifier", parseHandlerResponseFunctionRequest);
            jqUnit.assertDeepEq("parseHandlerResponse returning the correct payload", parseHandlerResponseFunctionExpectedResponse, response);
        });

        testCase.test("gpii.lifecycleManager.invokeSettingsHandlers()", function () {
            jqUnit.expect(1);
            var snapshot = gpii.lifecycleManager.invokeSettingsHandlers("org.gnome.desktop.a11y.magnifier", invokeSettingsHandlersRequest);
            jqUnit.assertDeepEq("invokeSettingsHandlers produced snapshot", invokeSettingsHandlersExpectedSnapshot, snapshot);
            gpii.tests.lifecycleManager.assertExpectedSettingsHandler(" - standalone", settingsHandlerExpectedInputNewSettings);
        });

        testCase.asyncTest("gpii.lifecycleManager.start() and stop()", function () {
            //2 tests for the settingsHandler (see mockSettingsHandler function above)
            //2 tests for the launchHandler (see mockLaunchHandler function above)
            //and the two asserts below
            jqUnit.expect(2);
            var lifecycleManager = gpii.lifecycleManager();
            var options = {
                userToken: 123
            };

            lifecycleManager.start(options, configurationSpec, function (success) {
                gpii.tests.lifecycleManager.assertExpectedExec();
                gpii.tests.lifecycleManager.assertExpectedSettingsHandler(" - on start", settingsHandlerExpectedInputNewSettings);
                start();
            });

            lifecycleManager.stop(options, function (success) {
                gpii.tests.lifecycleManager.assertExpectedSettingsHandler(" - on stop", settingsHandlerExpectedInputRestoreSettings);
                jqUnit.assertEquals("Expected pid has been sent to kill handler", 
                    8839, gpii.tests.staticRepository.killHandler.pid);
                jqUnit.assertDeepEq("stop: Stop message to lifecycle manager, empty session state", {}, lifecycleManager.activeSessions);
                start();
            });

        });
    };
}