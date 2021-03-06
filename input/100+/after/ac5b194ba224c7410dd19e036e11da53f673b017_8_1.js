function() {
  var url,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  url = require("url");

  module.exports.PGBackups = (function() {

    function PGBackups(opts) {
      this.delete_backup = __bind(this.delete_backup, this);

      this.get_latest_backup = __bind(this.get_latest_backup, this);

      this.get_backup = __bind(this.get_backup, this);

      this.get_backups = __bind(this.get_backups, this);

      this.get_transfer = __bind(this.get_transfer, this);

      this.get_transfers = __bind(this.get_transfers, this);

      this.create_transfer = __bind(this.create_transfer, this);

      this.request = __bind(this.request, this);

      var pgurl;
      pgurl = url.parse(opts.url);
      this.http = require(pgurl.protocol.slice(0, -1));
      this.host = pgurl.host;
      if (pgurl.port != null) {
        this.port = pgurl.port;
      }
      this.path = pgurl.pathname === "/" ? "" : pgurl.pathname;
      if (pgurl.auth != null) {
        this.auth = new Buffer(pgurl.auth).toString("base64");
      }
    }

    PGBackups.prototype.request = function(opts, fn) {
      var headers, query, req;
      query = opts.query;
      headers = {
        "Accept": "application/json",
        "X-Heroku-Gem-Version": "2.23.0"
      };
      if (this.auth != null) {
        headers["Authorization"] = "Basic " + this.auth;
      }
      if (query != null) {
        query = JSON.stringify(query);
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = query.length;
      }
      opts = {
        hostname: this.host,
        method: opts.method,
        path: "" + this.path + opts.path,
        headers: headers
      };
      if (this.port != null) {
        opts.port = this.port;
      }
      req = this.http.request(opts, function(res) {
        var data;
        if (res.statusCode !== 200) {
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

    PGBackups.prototype.create_transfer = function(from_url, from_name, to_url, to_name, opts, fn) {
      if (fn == null) {
        fn = opts;
        opts = {};
      }
      opts.from_url = from_url;
      opts.from_name = from_name;
      opts.to_url = to_url;
      opts.to_name = to_name;
      return this.request({
        method: "POST",
        path: "/transfers",
        query: opts
      }, fn);
    };

    PGBackups.prototype.get_transfers = function(fn) {
      return this.request({
        method: "GET",
        path: "/transfers"
      }, fn);
    };

    PGBackups.prototype.get_transfer = function(id, fn) {
      return this.request({
        method: "GET",
        path: "/transfers/" + id
      }, fn);
    };

    PGBackups.prototype.get_backups = function(fn) {
      return this.request({
        method: "GET",
        path: "/backups"
      }, fn);
    };

    PGBackups.prototype.get_backup = function(name, fn) {
      return this.request({
        method: "GET",
        path: "/backups/" + name
      }, fn);
    };

    PGBackups.prototype.get_latest_backup = function(fn) {
      return this.request({
        method: "GET",
        path: "/latest_backup"
      }, fn);
    };

    PGBackups.prototype.delete_backup = function(name, fn) {
      return this.request({
        method: "DELETE",
        path: "/client/backups/" + name
      }, fn);
    };

    return PGBackups;

  })();

}