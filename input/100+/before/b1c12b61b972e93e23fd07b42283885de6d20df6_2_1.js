function createLibrary(config, options) {
  if (!config || !config.filename) {
    throw new Error ('Configuration argument with a filename is required');
  }
  if (!options) options = {};
  var root = path.dirname(config.filename)
    , ns = options.ns || config.ns || path.basename(root)
    , scripts = config.scripts || {}
    , view = new View
    , constructors = {}
    , library = {
        ns: ns
      , root: root
      , view: view
      , constructors: constructors
      , styles: config.styles
      }
    , Component, proto;

  view._selfNs = 'lib';

  for (scriptName in scripts) {
    Component = function(model) {
      this.model = model;
    }
    Component.name = scriptName;
    proto = Component.prototype = Object.create(componentProto);
    merge(proto, scripts[scriptName]);
    proto.type = ns + ':' + scriptName;
    proto.view = view;
    // Note that component names are all lowercased
    constructors[scriptName.toLowerCase()] = Component;
  }

  this._libraries.push(library);
  this._libraries.map[ns] = library;
}