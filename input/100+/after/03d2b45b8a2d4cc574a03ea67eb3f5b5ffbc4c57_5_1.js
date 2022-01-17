function init() {
        // TODO: Issue 949 - the following code should be shared

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

        // Loading extensions requires creating new require.js contexts, which requires access to the global 'require' object
        // that always gets hidden by the 'require' in the AMD wrapper. We store this in the brackets object here so that 
        // the ExtensionLoader doesn't have to have access to the global object.
        brackets.libRequire = global.require;

        // Also store our current require.js context (the one that loads brackets core modules) so that extensions can use it
        // Note: we change the name to "getModule" because this won't do exactly the same thing as 'require' in AMD-wrapped
        // modules. The extension will only be able to load modules that have already been loaded once.
        brackets.getModule = require;
            
        suite = params.get("suite") || localStorage.getItem("SpecRunner.suite") || "UnitTestSuite";
        
        // Create a top-level filter to show/hide performance and extensions tests
        var isPerfSuite = (suite === "PerformanceTestSuite"),
            isExtSuite = (suite === "ExtensionTestSuite");
        
        var topLevelFilter = function (spec) {
            if (!isPerfSuite && !isExtSuite) {
                return !spec.category;
            }
            
            var category = (isPerfSuite) ? "performance" : "extension";
            
            if (spec.category === category) {
                return true;
            }
            
            var suite = spec.suite;
            
            while (suite) {
                if (suite.category === category) {
                    return true;
                }
                
                suite = suite.parentSuite;
            }
            
            return false;
        };
        
        /*
         * TODO (jason-sanjose): extension unit tests should only load the
         * extension and the extensions dependencies. We should not load
         * unrelated extensions. Currently, this solution is all or nothing.
         */
        
        // configure spawned test windows to load extensions
        SpecRunnerUtils.setLoadExtensionsInTestWindow(isExtSuite);
        
        _loadExtensionTests(suite).done(function () {
            var jasmineEnv = jasmine.getEnv();
    
            // Initiailize unit test preferences for each spec
            beforeEach(function () {
                // Unique key for unit testing
                localStorage.setItem("preferencesKey", SpecRunnerUtils.TEST_PREFERENCES_KEY);
            });
            
            afterEach(function () {
                // Clean up preferencesKey
                localStorage.removeItem("preferencesKey");
            });
            
            jasmineEnv.updateInterval = 1000;
            
            jasmineEnv.addReporter(new jasmine.BootstrapReporter(document, topLevelFilter));
            
            // add performance reporting
            if (isPerfSuite) {
                jasmineEnv.addReporter(new PerformanceReporter());
            }
            
            // remember the suite for the next unit test window launch
            localStorage.setItem("SpecRunner.suite", suite);
            
            $(window.document).ready(_documentReadyHandler);
        });
    }