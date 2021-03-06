function() {
  var Commands, Fs, Path, async, cwd, dbInterface, down, getSubDirs, initMigrationsDir, migrationFile, pad2, prog, readMigrationFile, timestamp,
    _this = this;

  Fs = require("fs");

  Path = require("path");

  prog = require("commander");

  async = require("async");

  cwd = process.cwd();

  dbInterface = function() {
    var Adapter, adapter, config, env, k, v;
    if (!Path.existsSync("migrations")) {
      console.error("migrations directory not found");
      process.exit(1);
    }
    env = process.env.NODE_ENV || "development";
    config = require(process.cwd() + "/migrations/config")[env];
    for (k in config) {
      v = config[k];
      adapter = k;
      Adapter = require("./" + adapter);
      break;
    }
    return {
      connectionInfo: config[adapter],
      schema: new Adapter(config[adapter])
    };
  };

  pad2 = function(num) {
    if (num < 9) {
      return "0" + num;
    } else {
      return num;
    }
  };

  timestamp = function(date, separator) {
    if (date == null) {
      date = new Date();
    }
    if (separator == null) {
      separator = "";
    }
    return [date.getUTCFullYear(), pad2(date.getUTCMonth() + 1), pad2(date.getUTCDate()), pad2(date.getUTCHours()), pad2(date.getUTCMinutes())].join(separator);
  };

  initMigrationsDir = function() {
    var sample;
    if (!Path.existsSync("./migrations")) {
      Fs.mkdirSync("./migrations");
    }
    if (!Path.existsSync("./migrations/config.js")) {
      sample = Fs.readFileSync(__dirname + "/../src/test/config.sample", "utf8");
      Fs.writeFileSync("./migrations/config.js", sample);
      return console.log("Created sample configuration. Edit migrations/config.js.");
    }
  };

  getSubDirs = function(dirname, cb) {
    var dirs, fifiles, file, stat, _i, _len, _ref;
    dirname = Path.resolve(dirname);
    dirs = [];
    fifiles = Fs.readdirSync(dirname);
    _ref = Fs.readdirSync(dirname);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      stat = Fs.statSync(dirname + "/" + file);
      if (stat.isDirectory()) {
        dirs.push(file);
      }
    }
    return cb(null, dirs);
  };

  migrationFile = function(version, which) {
    return Path.resolve("migrations/" + version + "/" + which + ".sql");
  };

  readMigrationFile = function(migration, which) {
    var filename;
    filename = migrationFile(migration, which);
    if (Path.existsSync(filename)) {
      return Fs.readFileSync(filename, "utf8");
    } else {
      return "";
    }
  };

  down = function(schema, migrations, cb) {
    var migrate;
    migrate = function(version, cb) {
      var filename;
      filename = migrationFile(version, "down");
      return schema.execFile(filename, function(err) {
        if (err) {
          return cb("Down migrations/" + version + ": " + err);
        }
        return schema.remove(version, function(err) {
          if (err) {
            return cb("Down migrations/" + version + ": " + err);
          }
          console.log("Down migrations/" + version);
          return cb(null);
        });
      });
    };
    return async.forEachSeries(migrations, migrate, cb);
  };

  Commands = {
    generate: function(suffix, options) {
      var filename, path;
      if (!Path.existsSync(Path.resolve("migrations"))) {
        console.error("ERROR migrations directory not found. Try `schema init`");
        process.exit(1);
      }
      if (typeof suffix !== "string") {
        console.error("Migration identifier missing");
        process.exit(1);
      }
      filename = timestamp();
      if (typeof suffix === "string") {
        filename += "-" + suffix;
      }
      path = "./migrations/" + filename;
      if (!Path.existsSync(path)) {
        Fs.mkdirSync(path);
        Fs.writeFileSync(path + "/up.sql", "");
        Fs.writeFileSync(path + "/down.sql", "");
        return console.log("Migration created: " + path);
      }
    },
    init: function() {
      initMigrationsDir();
      return Commands.generate("init");
    },
    migrateUp: function() {
      var dirs, lastMigration, schema;
      schema = dbInterface().schema;
      dirs = null;
      lastMigration = null;
      return async.series({
        ensureSchema: function(cb) {
          return schema.init(cb);
        },
        getMigrationDirs: function(cb) {
          return getSubDirs("migrations", function(err, subdirs) {
            if (err) {
              return cb(err);
            }
            dirs = subdirs.sort();
            return cb(null);
          });
        },
        getLastMigration: function(cb) {
          return schema.last(function(err, migration) {
            lastMigration = migration;
            return cb(err);
          });
        },
        run: function(cb) {
          var index, migrateUp, msg, versions;
          if (lastMigration != null ? lastMigration.version : void 0) {
            index = dirs.indexOf(lastMigration.version);
            versions = dirs.slice(index + 1);
          } else {
            versions = dirs;
          }
          if (versions.length > 0) {
            migrateUp = function(version, cb) {
              var filename;
              filename = migrationFile(version, "up");
              return schema.execFile(filename, function(err) {
                var up;
                if (err) {
                  return cb("Up migrations/" + version + ": " + err);
                }
                up = readMigrationFile(version, "up");
                down = readMigrationFile(version, "down");
                return schema.add(version, up, down, function(err) {
                  if (err) {
                    return cb(err);
                  }
                  console.log("Up migrations/" + version);
                  return cb(null);
                });
              });
            };
            return async.forEachSeries(versions, migrateUp, cb);
          } else {
            msg = "Nothing to run.";
            if (lastMigration != null ? lastMigration.version : void 0) {
              msg += " Last recorded migration: migrations/" + lastMigration.version;
            }
            console.log(msg);
            return cb(null);
          }
        }
      }, function(err) {
        if (err) {
          console.error(err);
          return process.exit(1);
        } else {
          console.log("OK");
          return process.exit();
        }
      });
    },
    migrateDown: function(countOrVersion) {
      var dirs, lastMigration, schema;
      schema = dbInterface().schema;
      if (typeof countOrVersion !== "string") {
        countOrVersion = "1";
      }
      dirs = null;
      lastMigration = null;
      return async.series({
        getLastMigration: function(cb) {
          return schema.last(function(err, migration) {
            if (err) {
              return cb(err);
            }
            lastMigration = migration;
            return cb(err);
          });
        },
        getMigrationDirs: function(cb) {
          return getSubDirs("migrations", function(err, subdirs) {
            if (err) {
              return cb(err);
            }
            dirs = subdirs;
            return cb(null);
          });
        },
        run: function(cb) {
          return schema.all(function(err, migrations) {
            var count, found, migration, version, versions, _i, _j, _k, _len, _len1, _len2;
            if (err) {
              return cb(err);
            }
            if (migrations.length === 0) {
              console.log("0 migrations found");
              return cb(null);
            }
            versions = [];
            if (countOrVersion === "all") {
              for (_i = 0, _len = migrations.length; _i < _len; _i++) {
                migration = migrations[_i];
                versions.push(migration.version);
              }
              return down(schema, versions, cb);
            } else if (countOrVersion.length < 3) {
              count = parseInt(countOrVersion);
              for (_j = 0, _len1 = migrations.length; _j < _len1; _j++) {
                migration = migrations[_j];
                versions.push(migration.version);
                count -= 1;
                if (count === 0) {
                  break;
                }
              }
              return down(schema, versions, cb);
            } else {
              version = countOrVersion;
              versions = [];
              for (_k = 0, _len2 = migrations.length; _k < _len2; _k++) {
                migration = migrations[_k];
                versions.push(migration.version);
                if (migration.version === version) {
                  found = migration;
                  break;
                }
              }
              if (found) {
                return down(schema, versions, cb);
              } else {
                return cb(null);
              }
            }
          });
        }
      }, function(err) {
        if (err) {
          console.error(err);
          return process.exit(1);
        } else {
          console.log("OK");
          return process.exit();
        }
      });
    },
    history: function() {
      var connectionInfo, schema, _ref;
      _ref = dbInterface(), connectionInfo = _ref.connectionInfo, schema = _ref.schema;
      return schema.all(function(err, migrations) {
        var at, migration, _i, _len;
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log("History connection=" + JSON.stringify(connectionInfo));
        if (migrations.length < 1) {
          console.log("0 migrations found");
        } else {
          for (_i = 0, _len = migrations.length; _i < _len; _i++) {
            migration = migrations[_i];
            at = timestamp(new Date(migration.created_at), "-");
            console.log("" + at + "\t" + migration.version);
          }
        }
        return process.exit();
      });
    }
  };

  module.exports = Commands;

}