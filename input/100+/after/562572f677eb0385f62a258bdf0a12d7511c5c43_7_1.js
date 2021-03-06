function () {

    "use strict";

    var fluid = require("infusion"),
        uuid = require("node-uuid"),
        gpii = fluid.registerNamespace("gpii");

    fluid.demands("gpii.requests.request.handler", "userPost", {
        options: {
            invokers: {
                handle: {
                    funcName: "gpii.requests.request.handler.userPost",
                    args: ["{request}", "{preferencesServer}.userSource"]
                }
            }
        }
    });

    gpii.requests.request.handler.userPost = function (request, userSource) {
        var req = request.req;
        userSource.set({
            token: req.params.token || uuid.v4()
        }, req.body, gpii.requests.request.handler.makePostCallback(request.res));
    };

    gpii.requests.request.handler.makePostCallback = function (res) {
        return function (resp) {
            if (resp.ok) {
                resp = fluid.model.transformWithRules(resp, {
                    "_rev": "rev",
                    "_id": "id"
                });
            }
            var callback = gpii.requests.request.handler.makeCallback(res);
            callback(resp);
        };
    };

}