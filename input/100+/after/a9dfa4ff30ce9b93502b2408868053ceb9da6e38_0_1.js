function () {

    var fluid = require("infusion");
    if (typeof($) === "undefined") {
        $ = fluid.jQueryStandalone;
    }
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.lifecycleManager", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        components: {
            variableResolver: {
                type: "gpii.lifecycleManager.resolver"
            }
        },
        preInitFunction: "gpii.lifecycleManager.preInit"
    });

    fluid.defaults("gpii.lifecycleManager.resolver", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        components: {
            resolverConfig: {
                type: "gpii.lifecycleManager.standardResolverConfig"
            }
        },
        invokers: {
            registerResolver: {
                funcName: "gpii.lifecycleManager.registerResolver",
                args: ["{that}", "{arguments}.0"]               
            }
        },
        finalInitFunction: "gpii.lifecycleManager.resolver.finalInit"
    });
    
    gpii.resolversToFetcher = function (resolvers) {
        return function (parsed) {
            var resolver = resolvers[parsed.context];
            return !resolver? undefined : (
                typeof(resolver) === "function" ? resolver(parsed.path) : fluid.get(resolver, parsed.path));
        };
    };
    
    gpii.combineFetchers = function (main, fallback) {
        return fallback ? function (parsed) {
            var fetched = main(parsed);
            return fetched === undefined? fallback(parsed) : fetched;
        } : main;
    };
    
    gpii.lifecycleManager.resolver.finalInit = function (that) {
        that.resolvers = fluid.transform(that.resolverConfig.options.resolvers, function (value) {
            return fluid.getGlobalValue(value);
        });
        that.fetcher = gpii.resolversToFetcher(that.resolvers); 
        that.resolve = function (material, extraFetcher) {
            return fluid.resolveEnvironment(material, {
                bareContextRefs: false,
                fetcher: gpii.combineFetchers(that.fetcher, extraFetcher)  
            });
        };
    };
    
    // TODO: Use this silly system until demands blocks are fixed via FLUID-4392
    // The idea is that users will derive grades from this one which add in further
    // resolvers, and then issue a single demands block which replaces this class with
    // their own impl. Still doesn't easily allow for multi-dim. extension
    fluid.defaults("gpii.lifecycleManager.standardResolverConfig", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        resolvers: {
            environment: "gpii.lifecycleManager.environmentResolver",
            registry: "gpii.lifecycleManager.registryResolver"
        }
    });
    


    gpii.lifecycleManager.registerResolver = function (that, options) {
        that.resolvers[options.name] = options.resolver;
    };
    
    gpii.lifecycleManager.environmentResolver = function (name) {
        return process.env[name];
    };

    //Transforms the handlerSpec (handler part of the payload) to the model required
    //by the settingsHandler
    gpii.lifecycleManager.specToSettingsHandler = function (solutionId, handlerSpec) {
        var returnObj = {};
        returnObj[solutionId] = [{
            settings: handlerSpec.settings,
            options: handlerSpec.options
        }];
        return returnObj; // NB array removed here
    };
    
    gpii.lifecycleManager.invariantSettings = {
        "type": "type",
        "options": "options"  
    };
    
    gpii.lifecycleManager.responseToSnapshotRules = {
        "*.*.settings.*": {
            expander: {
                type: "value",
                inputPath: "oldValue"
            }
        }
    };

    fluid.model.escapedPath = function () {
        var path = "";
        for (var i = 0; i < arguments.length; ++i) {
            path = fluid.pathUtil.composePath(path, arguments[i]);
        }
        return path;
    };
    
    fluid.model.escapedGetConfig = {
        parser: {
            parse: fluid.pathUtil.parseEL,
            compose: fluid.pathUtil.composePath
        },
        strategies: [fluid.model.defaultFetchStrategy]
    };

    //Transform the response from the handler to a format that we can pass back to it
    gpii.lifecycleManager.responseToSnapshot = function (solutionId, handlerResponse) {
        var unValued = fluid.model.transform(handlerResponse, gpii.lifecycleManager.responseToSnapshotRules, 
            {isomorphic: true});
        // TODO: Should eventually be able to do this final stage through transformation too
        return fluid.get(unValued, fluid.model.escapedPath(solutionId, "0"), fluid.model.escapedGetConfig);
    };

   // Payload example: http://wiki.gpii.net/index.php/Settings_Handler_Payload_Examples
   // Transformer output: http://wiki.gpii.net/index.php/Transformer_Payload_Examples
    gpii.lifecycleManager.invokeSettingsHandlers = function (solutionId, settingsHandlers) {
        // array just indexed by number, each one holds one handler for this id
        return fluid.transform(settingsHandlers, function (handlerSpec) {
            // first prepare the payload for the settingsHandler in question - a more efficient
            // implementation might bulk together payloads destined for the same handler 
            var settingsHandlerPayload = gpii.lifecycleManager.specToSettingsHandler(solutionId, handlerSpec);
            //send the payload to the settingsHandler
            var handlerResponse = fluid.invokeGlobalFunction(handlerSpec.type, [settingsHandlerPayload]);
            var settingsSnapshot = gpii.lifecycleManager.responseToSnapshot(solutionId, handlerResponse);
            var invariant = fluid.model.transform(handlerSpec, gpii.lifecycleManager.invariantSettings);
            return fluid.merge(null, {}, handlerSpec, settingsSnapshot);
            //update the settings section of our snapshot to contain the new format
        });
    };

    
    gpii.lifecycleManager.invokeAction = function (action) {
        var defaults = fluid.defaults(action.type);
        if (!defaults || !defaults.argumentMap) {
            fluid.fail("Error in action definition - " + action.type + " cannot be looked up to a function with a proper argument map: ", action);
        }
        var args = [];
        fluid.each(defaults.argumentMap, function (value, key) {
            args[value] = action[key];
        });
        return fluid.invokeGlobalFunction(action.type, args);
    };
    
    // Returns the results from any settings action, builds up action returns in argument "actionResults"
    gpii.lifecycleManager.executeActions = function (solutionId, settingsHandlers, actions, sessionState) {
        var togo;
        for (var i = 0; i < actions.length; ++ i) {
            var action = actions[i];
            if (typeof(action) === "string") {
                if (action === "setSettings" || action === "restoreSettings") {
                    var expanded = sessionState.localResolver(settingsHandlers);
                    togo = gpii.lifecycleManager.invokeSettingsHandlers(solutionId, expanded);
                }
            }
            else {
                var expanded = sessionState.localResolver(action);
                var result = gpii.lifecycleManager.invokeAction(expanded);
                if (action.name) {
                    sessionState.actionResults[action.name] = result;
                }
            }
        }
        return togo;
    };

/** Structure of lifecycleManager options:
  * userid: userid,
  * actions: either start or stop configuration from solutions registry
  * settingsHandlers: transformed settings handler blocks
  */

    gpii.lifecycleManager.preInit = function (that) {
        that.activeSessions = {};

        that.start = function (options, solutions, callback) {
            var userToken = options.userToken;
            if (that.activeSessions[userToken]) {
                // TODO: develop async architecture to prevent rat's nest of callbacks
                that.stop({userToken: userToken}, fluid.identity);
            }
            var sessionState = {
                actionResults: {}
            };
            // let the user's token as well as any named action results accumulated to date be
            // resolvable for any future action
            sessionState.localFetcher = gpii.combineFetchers(
                gpii.resolversToFetcher({userToken: userToken}),
                gpii.resolversToFetcher(sessionState.actionResults));
                
            sessionState.localResolver = function (material) {
                return that.variableResolver.resolve(material, sessionState.localFetcher);
            };
            
            //data is an array of solutions with settingsHandlers and launchHandlers
            //for each solution
            sessionState.solutions = fluid.transform(solutions, function (solution) {
                //build structure for returned values (for later reset)
                var togo = fluid.copy(solution);
                togo.settingsHandlers = gpii.lifecycleManager.executeActions(solution.id, solution.settingsHandlers, solution.lifecycleManager.start, sessionState);
                delete togo.lifecycleManager.start;
                return togo;
            });
            that.activeSessions[userToken] = sessionState;
            callback(true);
        };

        that.stop = function (options, callback) {
            var userToken = options.userToken;
            var sessionState = that.activeSessions[userToken];
            if (!sessionState) {
                callback(false);
                return;
            }
            
            fluid.each(sessionState.solutions, function (solution) {
                gpii.lifecycleManager.executeActions(solution.id, solution.settingsHandlers, solution.lifecycleManager.stop, sessionState);
            });
            delete that.activeSessions[userToken];
            callback(true);
        };
    };

}