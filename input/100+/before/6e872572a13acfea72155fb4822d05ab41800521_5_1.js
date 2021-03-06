function(parents, children, name, getDefault, allowedFields) {
  var scaffold = {};

  /* Get Hash Key
   * Requires: web request
   * Returns: database key for objects hash
   */
  function getHashKey(req) {
    var key = req.session.email + ':';

    var parentKeys = parents.map(function(parentName) {
      var singularName = parentName.substring(0, parentName.length - 1);
      return singularName + ':' + req.params[singularName + '_id'];
    });

    if (parentKeys.length > 0) {
      parentKeys[parentKeys.length - 1] += ':';
    }

    return key + parentKeys.join(':') + name;
  }

  /* Object List
   * Requires: web request, db connection, callback
   * Calls: callback(error, objectList):
   *  error - null if object list was retrieved or an error otherwise
   *  objectList - if error is null, the list of objects
   */
  scaffold.list = function(req, db, callback) {
    var key = getHashKey(req);
    crud.list(key, db, function(err, objectList) {
      if (err) {
        callback(err);
      } else {
        callback(null, objectList);
      }
    });
  };

  /* Object Get
   * Requires: web request, db connection, id, callback
   * Calls: callback(error, object):
   *  error - null if object was retrieved or an error otherwise
   *  object - if error is null, the object
   */
  scaffold.get = function(req, db, id, callback) {
    var key = getHashKey(req);
    crud.get(key, id, db, function(err, object) {
      if (err) {
        callback(err);
      } else {
        callback(null, object);
      }
    });
  };

  /* Object Add
   * Requires: web request, db connection, callback
   * Calls: callback(error, object):
   *  error - null if the object was added or an error otherwise
   *  object - if error is null, the object that was added
   */
  scaffold.add = function(req, db, callback) {
    var defaultValues = getDefault(req);
    var key = getHashKey(req);

    callback = callback || utils.noop;
    crud.add(req, key, defaultValues, db, function(err, object) {
      if (err) {
        callback(err);
      } else {
        callback(null, object);
      }
    });
  };

  /* Object Update
   * Requires: web request, db connection, id, callback
   * Calls: callback(error, object):
   *  error - null if object was updated or error otherwise
   *  object - if error is null, the object that was updated
   */
  scaffold.update = function(req, db, id, callback) {
    var key = getHashKey(req);
    callback = callback || utils.noop;

    crud.update(req, key, id, allowedFields, db,
      function(err, project) {
        if (err) {
          callback(err);
        } else {
          callback(null, project);
        }
      });
  };

  /* Object Remove
   * Requires: web request, db connection, id, callback
   * Calls: callback(error):
   *  error - null if the object was removed or an error otherwise
   */
  scaffold.remove = function(req, db, id, callback) {
    var key = getHashKey(req);
    callback = callback || utils.noop;
    id = String(id);

    // set up the request to remove child scaffolds
    var childReq = req;
    var singularName = name.substring(0, name.length - 1);

    if (!childReq.params) {
        childReq.params = {};
    }

    // set up the id of the current object being removed for access by child
    // scaffolds
    childReq.params[singularName + '_id'] = id;

    // statistics for determining when deletion is complete
    var objectsRemoved = 0;
    var numChildrenProcessed = 0;
    var numObjects = 0;

    // remove handler for deleting child scaffold objects
    function removeHandler(err) {
      if (err) {
        callback(err);
      } else {
        objectsRemoved++;
        if (numChildrenProcessed === children.length && 
            objectsRemoved === numObjects) {
          crud.remove(key, id, db, function(err, status) {
            callback(err);
          });
        }
      }
    }

    // if there is nothing to remove, immediately call the remove handler
    if (children.length === 0) {
      // set to one so that the handler thinks it has removed all objects
      numObjects = 1;
      removeHandler(null);
    }

    // remove objects in child scaffolds that correspond to this object
    children.forEach(function(childName) {
      var childScaffold = require('./' + childName);

      // key is in the form project:screen:components; want to get it in
      // the form project:screen:component:elements
      var childKey = key.substr(0, key.length - 1);
      childKey += ':' + id + ':' + childName;

      db.hlen(childKey, function(err, length) {
        numObjects += length;
        numChildrenProcessed++;

        // there are no children to remove
        if (numChildrenProcessed === children.length && numObjects === 0) {
          numObjects = 1;
          removeHandler(null);
        }

        if (err) {
          callback(err);
        } else {
          for (var i = 1; i <= length; i++) {
            childScaffold.remove(childReq, db, i, removeHandler);
          }
        }
      });
    });
  };

  return scaffold;
}