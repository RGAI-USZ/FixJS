function () {

    "use strict";

    var fluid = require("infusion"),
        semver = require("semver");
    
    var gpii = fluid.registerNamespace("gpii");
    fluid.require("transformer", require);

    fluid.defaults("gpii.matchMaker", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            solutionsReporter: {
                type: "gpii.dataSource"
            },
            transformer: {
                type: "gpii.transformer"
            }
        },
        invokers: {
            set: "gpii.matchMaker.set",
            match: "gpii.matchMaker.match",
            prefilterSolutions: "gpii.matchMaker.prefilterSolutions"
        },
        nickName: "matchMaker"
    });

    fluid.demands("gpii.matchMaker.set", "gpii.matchMaker", {
        funcName: "gpii.matchMaker.setFS",
        args: ["{transformer}.transformSettings", "{solutionsReporter}", "{gpii.matchMaker}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
    });

    fluid.demands("gpii.matchMaker.match", "gpii.matchMaker", {
        funcName: "gpii.matchMaker.match",
        args: ["{arguments}.0", "{arguments}.1"]
    });

    fluid.demands("gpii.matchMaker.prefilterSolutions", "gpii.matchMaker", {
        funcName: "gpii.matchMaker.prefilterSolutions",
        args: ["{arguments}.0", "{arguments}.1"]
    });

    gpii.matchMaker.prefilterSolutions = function (solutions, device) {
        return fluid.remove_if(fluid.copy(solutions), function (solution) {
            // Match OS id.
            var OS = fluid.makeArray(solution.contexts.OS);
            var matchesOS = fluid.find(OS, function(OSEntry) {
                return OSEntry.id === device.OS.id? true: undefined 
            });
            if (!matchesOS) {
                return solution;
            }
            // Match OS version.
            if (!semver.satisfies(device.OS.version, solution.contexts.OS.version)) {
                return solution;
            }
            // Match on device solutions.
            return fluid.find(device.solutions, function (devSolution) {
                if (devSolution.id !== solution.id) {
                    return solution;
                }
                if (!semver.satisfies(devSolution.version, solution.version)) {
                    return solution;
                }
            });
        });
    };

    gpii.matchMaker.setFS = function (transform, solutionsReporter, matchMaker, directModel, model, callback) {
        solutionsReporter.get(undefined, function (solutions) {
            var solutions = matchMaker.prefilterSolutions(solutions, model.device);
            callback(transform({
                solutions: matchMaker.match(model.preferences, solutions),
                preferences: model.preferences
            }));
        });
    };

    gpii.matchMaker.match = function (preferences, solutions) {
        return fluid.remove_if(fluid.copy(solutions), function (solution) {
            return !fluid.find(solution.settingsHandlers, function (settingsHandlers) {
                // TODO: this should use inverse model transformation to derive capabilities from capabilitiesTransformations
                return fluid.find(settingsHandlers.capabilities, function (capability) {
                    if (fluid.get(preferences, capability)) {
                        return true;
                    }
                });
            });
        });
    };

    fluid.demands("solutionsReporter", "gpii.flowManager", {
        funcName: "gpii.dataSource.URL",
        args: {
            url: "{gpii.flowManager}.config.solutionsReporter.url"
        }
    });

}