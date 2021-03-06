function() {
var gazel = gazel || {};

var exists = function (obj) {
  return typeof obj !== 'undefined' && obj != null;
};

var isInt = function(n) {
  return !isNaN(n) && (n % 1 == 0);
};

window.indexedDB = window.indexedDB
  || window.mozIndexedDB
  || window.msIndexedDB
  || window.webkitIndexedDB
  || window.oIndexedDB;

window.IDBTransaction = window.IDBTransaction
  || window.webkitIDBTransaction;

window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || 'readonly';
window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || 'readwrite';

var slice = Array.prototype.slice,
    splice = Array.prototype.splice;
// Blantantly stolen from: https://gist.github.com/1308368
// Credit to LevelOne and Jed, js gods that they are.

function createUuid(
  a,b                // placeholders
){
  for(               // loop :)
      b=a='';        // b - result , a - numeric variable
      a++<36;        // 
      b+=a*51&52  // if "a" is not 9 or 14 or 19 or 24
                  ?  //  return a random number or 4
         (
           a^15      // if "a" is not 15
              ?      // genetate a random number from 0 to 15
           8^Math.random()*
           (a^20?16:4)  // unless "a" is 20, in which case a random number from 8 to 11
              :
           4            //  otherwise 4
           ).toString(16)
                  :
         '-'            //  in other cases (if "a" is 9,14,19,24) insert "-"
      );
  return b
 }
function Dict() {
  this.items = {};
}

Dict.prototype = {

  prop: function(key) {
    return ':' + key;
  },

  get: function(key, def) {
    var p = this.prop(key),
        k = this.items;

    return k.hasOwnProperty(p) ? k[p] : def;
  },

  set: function(key, value) {
    var p = this.prop(key);

    this.items[p] = value;

    return value;
  },

  count: function() {
    return Object.keys(this.items).length;
  },

  has: function(key) {
    var p = this.prop(key);

    return this.items.hasOwnProperty(p);
  },

  del: function(key) {
    var p = this.prop(key),
        k = this.items;

    if(k.hasOwnProperty(p))
      delete k[p];
  },

  keys: function() {
    return Object.keys(this.items).map(function(key) {
      return key.substring(1);
    });
  }

};
function Trans() {
  Dict.call(this);
}

Trans.prototype = Dict.prototype;
Trans.prototype.constructor = Trans;

Trans.prototype.add = function() {
  var uuid = createUuid();
  this.set(uuid, undefined);

  return uuid;
}

Trans.prototype.abortAll = function() {
  var self = this,
      keys = self.keys();

  keys.forEach(function(key) {
    var tx = self.get(key);
    if(tx)
      tx.abort();

    self.del(key);
  });
};

Trans.prototype.pull = function(db, os, uuid, perm) {
  var tx = this.get(uuid);
  if(!tx) {
    tx = db.transaction([os], perm);
    tx.onerror = onerror;

    this.set(uuid, tx);
  }

  return tx;
};
function Client() {
  this.chain = [];
  this.inMulti = false;
  this.returned = [];

  this.trans = new Trans();
  this.transMap = new Dict();

  this.events = new Dict();
}

Client.prototype = {
  register: function(type, action, callback) {
    var uuid;

    if(this.inMulti) {
      uuid = this.transMap.get(type);
      if(!uuid) {
        uuid = this.trans.add();
        this.transMap.set(type, uuid);
      }

      this.chain.push({
        uuid: uuid,
        action: action
      });

      return;
    }

    var self = this;
    uuid = self.trans.add();

    action(uuid, function() {
      var args = slice.call(arguments);

      self.trans.del(uuid);

      (callback || function() { }).apply(null, args);
    });
  },

  flush: function() {
    var args = slice.call(arguments) || [];

    this.returned.push(args);

    if(this.chain.length === 0) {
      this.complete();

      return;
    }

    var item = this.chain.shift();
    item.action.call(this, item.uuid, this.flush);
  },

  multi: function() {
    this.chain = [];
    this.inMulti = true;

    return this;
  },

  exec: function(callback) {
    this.inMulti = false;

    this.complete = function() {
      var self = this,
          returned = this.returned;

      this.complete = null;
      this.chain = null;
      this.returned = [];

      this.transMap.keys().forEach(function(key) {
        var uuid = self.transMap.get(key);

        self.trans.del(uuid);
      });

      this.transMap = new Dict();

      callback(returned);
    };

    var item = this.chain.shift();
    item.action.call(this, item.uuid, this.flush);
  },

  on: function(eventType, action) {
    var event = this.events.get(eventType);
    if(!event) {
      event = [];
      this.events.set(eventType, event);
    }

    event.push(action);
  }
};
Client.prototype.discard = function(callback) {
  try {
    this.trans.abortAll();

    (callback || function(){})('OK');
  } catch(err) {
    this.handleError(err);
  }
};
Client.prototype.handleError = function() {
  var args = slice.call(arguments);

  (this.events.get('error') || [])
    .forEach(function(action) {
      action.apply(null, args);
    });
};
Client.prototype.get = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_ONLY);

      var req = tx.objectStore(self.osName).get(key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        cb.call(self, e.target.result);
      };

    }, self.handleError.bind(self));

  }, callback);

  return this;
};
Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE);
      
      var req = tx.objectStore(self.osName).put(value, key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        var res = e.target.result === key ? 'OK' : 'ERR';
        cb.call(self, res);
      };

    }, self.handleError.bind(self));
  }, callback);

  return this;
};
Client.prototype.incrby = function(key, increment, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE);
      var os = tx.objectStore(self.osName);
      (function curl(val) {
        if(!exists(val)) {
          var req = os.get(key);
          req.onerror = self.handleError.bind(self);
          req.onsuccess = function(e) {
            curl(typeof e.target.result === 'undefined'
              ? 0 : e.target.result);
          };

          return;
        }

        if(!isInt(val)) {
          self.handleError('ERROR: Cannot increment a non-integer value.');

          return;
        }
     
        var value = val + increment;
        var req = os.put(value, key);
        req.onerror = self.handleError.bind(self);
        req.onsuccess = function (e) {
          var res = e.target.result === key ? value : "ERR";
          cb.call(self, res);
        };

      })();

    }, self.handleError.bind(self));
  }, callback);

  return this;
};

Client.prototype.incr = function(key, callback) {
  return this.incrby(key, 1, callback);
};
Client.prototype.decrby = function(key, increment, callback) {
  return this.incrby(key, -increment, callback);
};

Client.prototype.decr = function(key, callback) {
  return this.incrby(key, -1, callback);
};
Client.prototype.del = function() {
  var self = this,
      args = slice.call(arguments),
      callback = args[args.length > 0 ? args.length - 1 : 0];

  if(typeof callback !== 'function')
    callback = undefined;
  else
    args.splice(args.length - 1);
  
  var keys = args,
      deleted = keys.length;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {
     
      var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE),
          os = tx.objectStore(self.osName),
          left = keys.length;

      while(keys.length > 0) {
        (function() {
          var key = keys.shift();
          var req = os.delete(key);
          req.onerror = self.handleError.bind(self);
          req.onsuccess = function(e) {
            left--;
            
            if(left === 0)
              cb.call(self, deleted);
          };
        })();
     }
    });
  }, callback);

  return this;
};
gazel.print = function() {
  var args = slice.call(arguments);
  if(args.length === 0)
    return;

  (args[0] instanceof Array ? args[0] : [args[0]])
    .forEach(function(item) {
      console.log(item);
    });
};
gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.createClient = function(osName) {
  var client = new Client;
  client.osName = osName || gazel.osName;

  return client;
};

this.gazel = gazel;
var db;
var loadingDb = false;

function openDatabase(onsuccess, onerror) {
  if(db) {
    onsuccess(db);
    return;
  }

  if(loadingDb) {
    setTimeout(function() {
      openDatabase(onsuccess, onerror);
    }, 100);

    return;
  }
  loadingDb = true;

  var req = window.indexedDB.open(gazel.dbName, gazel.version);
  
  req.onupgradeneeded = function (e) {
    var uDb = e.target.result;

    if(!uDb.objectStoreNames.contains(gazel.osName))
      uDb.createObjectStore(gazel.osName);
  };

  var reqSuccess;
  reqSuccess = req.onsuccess = function (e) {
    var sDb = e.target.result;

    if (sDb.setVersion && Number(sDb.version) !== gazel.version) {
      var dbReq = sDb.setVersion(String(gazel.version));
      dbReq.onsuccess = function (e2) {
        var e3 = {}; e3.target = {};
        e3.target.result = e2.target.result.db;
        
        req.onupgradeneeded(e3);
        reqSuccess(e3);
        
        return;
      };

      dbReq.onerror = onerror;
      dbReq.onfailure = onerror;
      dbReq.onblocked = onerror;

      return;
    }

    db = sDb;
    loadingDb = false;

    onsuccess(db);
  };

  req.onerror = onerror;
}
}