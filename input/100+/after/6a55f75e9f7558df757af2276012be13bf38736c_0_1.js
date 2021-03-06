function () {

    var fluid = require("universal"),
        gpii = fluid.registerNamespace("gpii");

    /*  Registry resolver reads registry key based on the path provided.
     *  Arguments:
     *  registryPath {string} - a path into the Windows Registry to be resolved.
     */
    gpii.lifecycleManager.registryResolver = function (registryPath) {
        var args = gpii.lifecycleManager.registryResolver.parseArguments(registryPath);
        return gpii.windows.readRegistryKey.apply(null, args).value;
    };

    /*  Parses the path into the registry into an array of arguments taken by gpii.windows.readRegistryKey.
     *  Arguments:
     *  value {string} - a path into the Windows Registry to be parsed.
     */
    gpii.lifecycleManager.registryResolver.parseArguments = function (value) {
       var splitString = value.split("\\");
       var subKey = splitString.pop();
       var baseKey = splitString.shift();
       return [ baseKey, splitString.join("\\"), subKey, "REG_SZ" ];
    };

}