function () {

    "use strict";

    var fluid = require("infusion"),
        gpii = fluid.registerNamespace("gpii");

    fluid.demands("gpii.requests.request.handler", "userGet", {
        options: {
            invokers: {
                handle: {
                    funcName: "gpii.requests.request.handler.userGet",
                    args: ["{request}", "{userSource}"]
                }
            }
        }
    });

    gpii.requests.request.handler.userGet = function (request, userSource) {
        userSource.get({
            token: request.req.params.token
        }, gpii.requests.request.handler.makeCallback(request.res));
    };

    gpii.requests.request.handler.makeCallback = function (res) {
        return function (resp) {
            if (!resp) {
                res.send({
                    isError: true,
                    message: "Unknown error"
                }, 500);
                return;
            }
            if (resp.isError) {
                res.send(resp, 500);
                return;
            }
            res.send(resp, 200);
        };
    };

}