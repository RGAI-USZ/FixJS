function() {
  var AddOns, Apps, Collaborators, ConfigVars, Domains, Heroku, Keys, Logs, Processes, Releases, Stacks, extend, include,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Heroku = (function() {

    Heroku.inherited = [];

    function Heroku(opts) {
      this.request = __bind(this.request, this);

      var constructor, _i, _len, _ref;
      this.auth = new Buffer(":" + (opts.key || process.env.HEROKU_API_KEY)).toString("base64");
      this.host = opts.host || "api.heroku.com";
      this.http = require(opts.scheme || "https");
      _ref = Heroku.inherited;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constructor = _ref[_i];
        constructor.apply(this, arguments);
      }
    }

    Heroku.prototype.request = function(opts, fn) {
      var expects, headers, query, req;
      expects = opts.expects || 200;
      query = opts.query;
      headers = {
        "Accept": "application/json",
        "Authorization": "Basic " + this.auth,
        "X-Heroku-API-Version": "3"
      };
      opts = {
        hostname: this.host,
        method: opts.method,
        path: opts.path,
        headers: headers
      };
      if (query != null) {
        query = JSON.stringify(query);
        opts.headers["Content-Type"] = "application/json";
        opts.headers["Content-Length"] = query.length;
      }
      req = this.http.request(opts, function(res) {
        var data;
        if (res.statusCode !== expects) {
          return fn(res, null);
        }
        data = "";
        res.on("data", function(buf) {
          return data += buf;
        });
        return res.on("end", function() {
          try {
            data = JSON.parse(data);
          } catch (err) {

          }
          return fn(null, data);
        });
      });
      return req.end(query);
    };

    return Heroku;

  })();

  AddOns = require("./addons").AddOns;

  Apps = require("./apps").Apps;

  Collaborators = require("./collaborators").Collaborators;

  ConfigVars = require("./config_vars").ConfigVars;

  Domains = require("./domains").Domains;

  Keys = require("./keys").Keys;

  Logs = require("./logs").Logs;

  Processes = require("./processes").Processes;

  Releases = require("./releases").Releases;

  Stacks = require("./stacks").Stacks;

  extend = function(obj, mixin) {
    var method, name, _results;
    _results = [];
    for (name in mixin) {
      method = mixin[name];
      _results.push(obj[name] = method);
    }
    return _results;
  };

  include = function(klass, mixin) {
    extend(klass.prototype, mixin.prototype);
    return Heroku.inherited.push(mixin);
  };

  include(Heroku, AddOns);

  include(Heroku, Apps);

  include(Heroku, Collaborators);

  include(Heroku, ConfigVars);

  include(Heroku, Domains);

  include(Heroku, Keys);

  include(Heroku, Logs);

  include(Heroku, Processes);

  include(Heroku, Releases);

  include(Heroku, Stacks);

  module.exports.Heroku = Heroku;

  module.exports.PGBackups = require("./pgbackups").PGBackups;

}