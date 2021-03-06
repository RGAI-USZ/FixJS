function () {
    // This loads universal.
    var fluid = require("universal"),
        http = require("http"),
        gpii = fluid.registerNamespace("gpii"),
        jqUnit = fluid.require("jqUnit");

    fluid.require("./gpiiTests.js", require);

    gpii.integrationTesting = fluid.registerNamespace("gpii.integrationTesting");

    var integrationTester = gpii.tests.testEnvironment();

    /*
    * Sets the settings given in the json paramater. The content of the json passed
    * is the values to set in a format similar to the content of 'initialState'
    */
    var setSettings = function (json) {
        //go through each of the settings
        fluid.each(json, function (handlerBlock, handlerIndex) {
            var args = {};
            args["setting"] = handlerBlock.data;
            var setter = handlerBlock.type.substr(0, handlerBlock.type.indexOf(".get"))+".set";
            var response = fluid.invokeGlobalFunction(setter, [args]);
        });
    };

    /*
    * Checks the settings given in the json paramater. The content of the json passed
    * should contain the expected value, and they should be in the format of the contant
    * of 'initialState'
    */
    var checkSettings = function (expected) {
        //go through each of the settings
        fluid.each(expected, function (handlerBlock, handlerIndex) {
            //first get the settings from the system
            var args = {};
            args["checking"] = handlerBlock.data;
            var response = fluid.invokeGlobalFunction(handlerBlock.type, [args]);
            //check that these corresponds to the one we anted to set:
            fluid.each(handlerBlock.data, function (solutionBlock, solutionIndex) {
                //check each setting:
                fluid.each(solutionBlock.settings, function (expectedValue, settingKey) {
                    var responseValue = response["checking"][solutionIndex].settings[settingKey];
                    jqUnit.assertEquals("Check setting "+settingKey, expectedValue, responseValue);
                });
            });
        })
    };

    var addTests = function () {
        gpii.flowManager();

        fluid.each(integrationTestsJSON, function (json, token) {
            //Setup and check an initial known state:
            integrationTester.asyncTest("Set up initial state", function() {
                setSettings(json.initialState);
                checkSettings(json.initialState);
                setTimeout(function() {
                    jqUnit.start();
                }, 10);
            });

            //test login with token
            integrationTester.asyncTest("Test "+token+" Login", function () {
                http.get({
                    host: "localhost",
                    port: 8081,
                    path: "/user/"+token+"/login"
                }, function(response) {
                    var data = "";
                    fluid.log("Callback from use login called");

                    response.on("data", function (chunk) {
                        fluid.log("Response from server: " + chunk);
                        data += chunk;
                    });
                    response.on("close", function(err) {
                        if (err) {
                            jqUnit.assertFalse("Got an error on login:" + err.message, true);
                            jqUnit.start();
                        }
                        fluid.log("Connection to the server was closed");
                    });
                    response.on("end", function() {
                        fluid.log("Connection to server ended");
                        jqUnit.assertNotEquals("Successful login message returned", data.indexOf("User was successfully logged in."), -1);
                        setTimeout(function() {
                            checkSettings(json.loggedInState);
                            jqUnit.start();
                        }, 5000);
                    });
                }).on('error', function(err) {
                    fluid.log("Got error: " + err.message);
                    jqUnit.start();
                });
                jqUnit.stop();
            });

            integrationTester.asyncTest("Test "+token+" logout", function () {
                http.get({
                    host: "localhost",
                    port: 8081,
                    path: "/user/"+token+"/logout"
                }, function(response) {
                    var data = "";
                    response.on("data", function (chunk) {
                        fluid.log("Response from server: " + chunk);
                        data += chunk;
                    });
                    response.on("close", function(err) {
                        if (err) {
                            jqUnit.assertFalse("Got an error on logout:" + err.message, true);
                            jqUnit.start();
                        }
                        fluid.log("Connection to the server was closed");
                    });
                    response.on("end", function() {
                        fluid.log("Logout connection to server ended");
                        jqUnit.assertNotEquals("Successful logout message returned", data.indexOf("successfully logged out."), -1);
                        //After successful logout, get settings and check that they have been properly reset
                        setTimeout(function () {
                            checkSettings(json.initialState);
                            jqUnit.start();
                        }, 5000);
                    });
                }).on('error', function(err) {
                    fluid.log("Got error: " + err.message);
                    jqUnit.start();
                });
            });
        });
    };

    addTests();
}