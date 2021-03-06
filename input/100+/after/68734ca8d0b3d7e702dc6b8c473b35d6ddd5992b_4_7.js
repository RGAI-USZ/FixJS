function() {
  var balUtilFlow,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  balUtilFlow = {
    wait: function(delay, fn) {
      return setTimeout(fn, delay);
    },
    extractOptsAndCallback: function(opts, next) {
      if (typeof opts === 'function' && (next != null) === false) {
        next = opts;
        opts = {};
      } else {
        opts || (opts = {});
      }
      next || (next = opts.next || null);
      return [opts, next];
    },
    fireWithOptionalCallback: function(method, args, context) {
      var callback, err, result;
      args || (args = []);
      callback = args[args.length - 1];
      context || (context = null);
      result = null;
      if (method.length === args.length) {
        try {
          result = method.apply(context, args);
        } catch (caughtError) {
          callback(caughtError);
        }
      } else {
        err = null;
        try {
          result = method.apply(context, args);
          if (result instanceof Error) {
            err = result;
          }
        } catch (caughtError) {
          err = caughtError;
        }
        callback(err, result);
      }
      return result;
    },
    toString: function(obj) {
      return Object.prototype.toString.call(obj);
    },
    isArray: function(obj) {
      return this.toString(obj) === '[object Array]';
    },
    extend: function() {
      var key, obj, objs, target, value, _i, _len;
      target = arguments[0], objs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      target || (target = {});
      for (_i = 0, _len = objs.length; _i < _len; _i++) {
        obj = objs[_i];
        obj || (obj = {});
        for (key in obj) {
          if (!__hasProp.call(obj, key)) continue;
          value = obj[key];
          target[key] = value;
        }
      }
      return target;
    },
    each: function(obj, callback, context) {
      var broke, item, key, _i, _len;
      broke = false;
      context || (context = obj);
      if (this.isArray(obj)) {
        for (key = _i = 0, _len = obj.length; _i < _len; key = ++_i) {
          item = obj[key];
          if (callback.call(context, item, key, obj) === false) {
            broke = true;
            break;
          }
        }
      } else {
        for (key in obj) {
          if (!__hasProp.call(obj, key)) continue;
          item = obj[key];
          if (callback.call(context, item, key, obj) === false) {
            broke = true;
            break;
          }
        }
      }
      return this;
    },
    flow: function(opts) {
      var action, actions, args, next, object, tasks;
      object = opts.object, action = opts.action, args = opts.args, tasks = opts.tasks, next = opts.next;
      if (!action) {
        throw new Error('balUtilFlow.flow called without any action');
      }
      actions = action.split(/[,\s]+/g);
      tasks || (tasks = new balUtilFlow.Group(next));
      balUtilFlow.each(actions, function(action) {
        return tasks.push(function(complete) {
          var argsClone, fn;
          argsClone = (args || []).slice();
          argsClone.push(complete);
          fn = object[action];
          return fn.apply(object, argsClone);
        });
      });
      tasks.sync();
      return this;
    }
  };

  /*
  Usage:
    # Add tasks to a queue then fire them in parallel (asynchronously)
    tasks = new Group (err) -> next err
    tasks.push (complete) -> someAsyncFunction(arg1, arg2, complete)
    tasks.push (complete) -> anotherAsyncFunction(arg1, arg2, complete)
    tasks.async()

    # Add tasks to a queue then fire them in serial (synchronously)
    tasks = new Group (err) -> next err
    tasks.push (complete) -> someAsyncFunction(arg1, arg2, complete)
    tasks.push (complete) -> anotherAsyncFunction(arg1, arg2, complete)
    tasks.sync()
  */


  balUtilFlow.Group = (function() {

    _Class.prototype.total = 0;

    _Class.prototype.completed = 0;

    _Class.prototype.running = 0;

    _Class.prototype.exited = false;

    _Class.prototype.breakOnError = true;

    _Class.prototype.autoClear = false;

    _Class.prototype.queue = [];

    _Class.prototype.mode = 'async';

    _Class.prototype.lastResult = null;

    _Class.prototype.results = [];

    _Class.prototype.errors = [];

    _Class.prototype.next = function() {
      throw new Error('Groups require a completion callback');
    };

    function _Class() {
      var arg, args, autoClear, breakOnError, mode, next, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.clear();
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        if (typeof arg === 'string') {
          this.mode = arg;
        } else if (typeof arg === 'function') {
          this.next = arg;
        } else if (typeof arg === 'object') {
          next = arg.next, mode = arg.mode, breakOnError = arg.breakOnError, autoClear = arg.autoClear;
          if (next) {
            this.next = next;
          }
          if (mode) {
            this.mode = mode;
          }
          if (breakOnError) {
            this.breakOnError = breakOnError;
          }
          if (autoClear) {
            this.autoClear = autoClear;
          }
        } else {
          throw new Error('Unknown argument sent to Groups constructor');
        }
      }
    }

    _Class.prototype.clear = function() {
      this.total = 0;
      this.completed = 0;
      this.running = 0;
      this.exited = false;
      this.queue = [];
      this.results = [];
      this.errors = [];
      this.lastResult = null;
      return this;
    };

    _Class.prototype.hasTasks = function() {
      return this.queue.length !== 0;
    };

    _Class.prototype.hasCompleted = function() {
      return this.total !== 0 && this.total === this.completed;
    };

    _Class.prototype.isRunning = function() {
      return this.running !== 0;
    };

    _Class.prototype.hasExited = function(value) {
      if (value != null) {
        this.exited = value;
      }
      return this.exited === true;
    };

    _Class.prototype.logError = function(err) {
      if (this.errors[this.errors.length - 1] !== err) {
        this.errors.push(err);
      }
      return this;
    };

    _Class.prototype.complete = function() {
      var args, err;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      err = args[0] || void 0;
      this.lastResult = args;
      if (err) {
        this.logError(err);
      }
      this.results.push(args);
      if (this.running !== 0) {
        --this.running;
      }
      if (this.hasExited()) {

      } else {
        if (err && this.breakOnError) {
          this.exit();
        } else {
          ++this.completed;
          if (this.hasTasks()) {
            this.nextTask();
          } else if (this.isRunning() === false && this.hasCompleted()) {
            this.exit();
          }
        }
      }
      return this;
    };

    _Class.prototype.completer = function() {
      var _this = this;
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.complete.apply(_this, args);
      };
    };

    _Class.prototype.exit = function(err) {
      var errors, lastResult, results;
      if (err == null) {
        err = null;
      }
      if (err) {
        this.logError(err);
      }
      if (this.hasExited()) {

      } else {
        lastResult = this.lastResult;
        results = this.results;
        if (this.errors.length === 0) {
          errors = null;
        } else if (this.errors.length === 1) {
          errors = this.errors[0];
        } else {
          errors = this.errors;
        }
        if (this.autoClear) {
          this.clear();
        } else {
          this.hasExited(true);
        }
        this.next(errors, lastResult, results);
      }
      return this;
    };

    _Class.prototype.tasks = function(tasks) {
      var task, _i, _len;
      for (_i = 0, _len = tasks.length; _i < _len; _i++) {
        task = tasks[_i];
        this.push(task);
      }
      return this;
    };

    _Class.prototype.push = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ++this.total;
      this.queue.push(args);
      return this;
    };

    _Class.prototype.pushAndRun = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.mode === 'sync' && this.isRunning()) {
        this.push.apply(this, args);
      } else {
        ++this.total;
        this.runTask(args);
      }
      return this;
    };

    _Class.prototype.nextTask = function() {
      var task;
      if (this.hasTasks()) {
        task = this.queue.shift();
        this.runTask(task);
      }
      return this;
    };

    _Class.prototype.runTask = function(task) {
      var me, run;
      me = this;
      try {
        run = function() {
          var complete, _context, _task;
          ++me.running;
          complete = me.completer();
          if (balUtilFlow.isArray(task)) {
            if (task.length === 2) {
              _context = task[0];
              _task = task[1];
            } else if (task.length === 1) {
              _task = task[0];
              _context = null;
            } else {
              throw new Error('balUtilFlow.Group an invalid task was pushed');
            }
          } else {
            _task = task;
          }
          return balUtilFlow.fireWithOptionalCallback(_task, [complete], _context);
        };
        if (this.completed !== 0 && (this.mode === 'async' || (this.completed % 100) === 0)) {
          setTimeout(run, 0);
        } else {
          run();
        }
      } catch (err) {
        this.complete(err);
      }
      return this;
    };

    _Class.prototype.run = function() {
      var task, _i, _len, _ref;
      if (this.isRunning() === false) {
        this.hasExited(false);
        if (this.hasTasks()) {
          if (this.mode === 'sync') {
            this.nextTask();
          } else {
            _ref = this.queue;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              task = _ref[_i];
              this.nextTask();
            }
          }
        } else {
          this.exit();
        }
      }
      return this;
    };

    _Class.prototype.async = function() {
      this.mode = 'async';
      this.run();
      return this;
    };

    _Class.prototype.sync = function() {
      this.mode = 'sync';
      this.run();
      return this;
    };

    return _Class;

  })();

  balUtilFlow.Block = (function(_super) {

    __extends(_Class, _super);

    _Class.prototype.blockBefore = function(block) {};

    _Class.prototype.blockAfter = function(block, err) {};

    _Class.prototype.blockTaskBefore = function(block, task, err) {};

    _Class.prototype.blockTaskAfter = function(block, task, err) {};

    function _Class(opts) {
      var block, complete, fn, name, parentBlock;
      block = this;
      name = opts.name, fn = opts.fn, parentBlock = opts.parentBlock, complete = opts.complete;
      block.blockName = name;
      if (parentBlock != null) {
        block.parentBlock = parentBlock;
      }
      block.mode = 'sync';
      block.fn = fn;
      _Class.__super__.constructor.call(this, function(err) {
        block.blockAfter(block, err);
        return typeof complete === "function" ? complete(err) : void 0;
      });
      block.blockBefore(block);
      if (block.fn != null) {
        if (block.fn.length === 3) {
          block.total = Infinity;
        }
        try {
          block.fn(function(name, fn) {
            return block.block(name, fn);
          }, function(name, fn) {
            return block.task(name, fn);
          }, function(err) {
            return block.exit(err);
          });
          if (block.fn.length !== 3) {
            block.run();
          }
        } catch (err) {
          block.exit(err);
        }
      } else {
        block.total = Infinity;
      }
      this;

    }

    _Class.prototype.block = function(name, fn) {
      var block, pushBlock;
      block = this;
      pushBlock = function(fn) {
        if (block.total === Infinity) {
          return block.pushAndRun(fn);
        } else {
          return block.push(fn);
        }
      };
      pushBlock(function(complete) {
        var subBlock;
        return subBlock = block.createSubBlock({
          name: name,
          fn: fn,
          complete: complete
        });
      });
      return this;
    };

    _Class.prototype.createSubBlock = function(opts) {
      opts.parentBlock = this;
      return new balUtilFlow.Block(opts);
    };

    _Class.prototype.task = function(name, fn) {
      var block, pushTask;
      block = this;
      pushTask = function(fn) {
        if (block.total === Infinity) {
          return block.pushAndRun(fn);
        } else {
          return block.push(fn);
        }
      };
      pushTask(function(complete) {
        var preComplete;
        preComplete = function(err) {
          block.blockTaskAfter(block, name, err);
          return complete(err);
        };
        block.blockTaskBefore(block, name);
        return balUtilFlow.fireWithOptionalCallback(fn, [preComplete]);
      });
      return this;
    };

    return _Class;

  })(balUtilFlow.Group);

  balUtilFlow.Runner = (function() {

    _Class.prototype.runnerBlock = null;

    function _Class() {
      var _ref;
      if ((_ref = this.runnerBlock) == null) {
        this.runnerBlock = new balUtilFlow.Block();
      }
    }

    _Class.prototype.getRunnerBlock = function() {
      return this.runnerBlock;
    };

    _Class.prototype.block = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.getRunnerBlock()).block.apply(_ref, args);
    };

    _Class.prototype.task = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.getRunnerBlock()).task.apply(_ref, args);
    };

    return _Class;

  })();

  if (typeof module !== "undefined" && module !== null) {
    module.exports = balUtilFlow;
  } else {
    this.balUtilFlow = balUtilFlow;
  }

}