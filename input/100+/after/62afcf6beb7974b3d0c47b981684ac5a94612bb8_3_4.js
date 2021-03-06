function() {
  var C, L, clone, compile, compile_list, keys, last, map, oppo_eval, read, root, scope_stack, trim, type_of, types, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof global !== "undefined" && global !== null ? global : window;

  L = lemur;

  C = L.Compiler;

  root.oppo = {
    compiler: {
      types: {},
      scope_stack: [{}]
    }
  };

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = oppo;
  }

  _ref = oppo.compiler, scope_stack = _ref.scope_stack, types = _ref.types;

  oppo.Error = (function(_super) {

    __extends(Error, _super);

    function Error(name, message) {
      this.name = name;
      this.message = message;
    }

    Error.prototype.toString = function() {
      return "" + this.name + ": " + this.message;
    };

    return Error;

  })(Error);

  oppo.ArityException = (function(_super) {

    __extends(ArityException, _super);

    function ArityException(message) {
      if (message != null) {
        this.message = message;
      }
    }

    ArityException.prototype.name = "Arity-Exception";

    ArityException.prototype.message = "Wrong number of arguments";

    return ArityException;

  })(oppo.Error);

  type_of = lemur.core.to_type;

  oppo.stringify = function(o) {
    var items, key, type, value;
    type = type_of(o);
    switch (type) {
      case "array":
        return C.List.prototype.toString.call({
          value: o
        });
      case "object":
        if (o instanceof C.Construct) {
          return o.toString();
        } else {
          items = (function() {
            var _results;
            _results = [];
            for (key in o) {
              value = o[key];
              _results.push("" + (oppo.stringify(key)) + " " + (oppo.stringify(value)));
            }
            return _results;
          })();
          return "{ " + (items.join("\n")) + " }";
        }
        break;
      default:
        return "" + o;
    }
  };

  oppo.stringify_html = function(o) {
    var s;
    s = oppo.stringify(o);
    return s.replace(/\n/g, "<br />");
  };

  clone = (_ref1 = Object.create) != null ? _ref1 : function(o) {
    function ObjectClone () {};
    ObjectClone.prototype = o;
    return new ObjectClone();
  };

  keys = (_ref2 = Object.keys) != null ? _ref2 : function(o) {
    var prop, _results;
    _results = [];
    for (prop in o) {
      if (!__hasProp.call(o, prop)) continue;
      _results.push(prop);
    }
    return _results;
  };

  last = function(list) {
    if ((list != null ? list.length : void 0) != null) {
      return list[list.length - 1];
    }
  };

  map = function(list, fn) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      item = list[_i];
      _results.push(fn(item));
    }
    return _results;
  };

  compile_list = function(list, arg, unquoted) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      item = list[_i];
      if (unquoted) {
        item.quoted = false;
      }
      _results.push(item._compile(arg));
    }
    return _results;
  };

  trim = String.prototype.trim || function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  };

  (function() {
    var normal_compile;
    C.Construct.prototype._compile = function() {
      var compile_fn;
      compile_fn = this.quasiquoted ? this.compile_quasiquoted : this.unquoted ? this.compile_unquoted : this.unquote_spliced ? this.compile_unquote_spliced : this.quoted ? this.compile_quoted : this.compile;
      return compile_fn.apply(this, arguments);
    };
    C.Construct.prototype.compile_quoted = function() {
      return "new lemur.Compiler." + this.constructor.name + "('" + this.value + "')";
    };
    normal_compile = function() {
      return this.compile.apply(this, arguments);
    };
    C.Construct.prototype.compile_quasiquoted = normal_compile;
    C.Construct.prototype.compile_unquoted = normal_compile;
    C.Construct.prototype.compile_unquote_spliced = normal_compile;
    return C.If.prototype.transform = function() {
      this.then = C.Macro.transform(this.then);
      if (this._else != null) {
        this._else = C.Macro.transform(this._else);
      }
      return this;
    };
  })();

  read = oppo.read = oppo.compiler.read = function() {
    return parser.parse.apply(parser, arguments);
  };

  compile = oppo.compile = oppo.compiler.compile = function(sexp) {
    if ((type_of(sexp)) === "array") {
      sexp = new C.List(sexp);
      sexp = new C.Lambda({
        body: [sexp]
      });
    }
    return new lemur.Compiler().compile(function() {
      var c_sym_prog, prog, r, sym_prog;
      setup_built_in_macros();
      r = compile_runtime();
      sym_prog = C.Var.gensym("program");
      c_sym_prog = sym_prog.compile();
      prog = sexp._compile();
      return "// Your program\nvar " + c_sym_prog + " = " + prog + ";\n\n// Oppo runtime\n" + r + "\n\n// Run the oppo program\nif (" + c_sym_prog + ")\n  " + c_sym_prog + "();\nelse\n  " + c_sym_prog + ";";
    });
  };

  oppo_eval = oppo["eval"] = function(sexp) {
    return root["eval"](compile(sexp));
  };

}