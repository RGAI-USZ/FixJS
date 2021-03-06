function() {
  var C, L, binary_op, call_macro, call_macro_transform, clone, compare_op, compile, compile_list, compile_runtime, define, defmacro, keys, last, map, math_op, read, root, scope_stack, setup_built_in_macros, trim, type_of, types, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

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
    C.Construct.prototype._compile = function() {
      var compile_fn;
      compile_fn = this.quoted ? this.compile_quoted : this.quasiquoted ? this.compile_quasiquoted : this.unquoted ? this.compile_unquoted : this.unquote_spliced ? this.compile_unquote_spliced : this.compile;
      return compile_fn.apply(this, arguments);
    };
    C.Construct.prototype.compile_quoted = function() {
      return "new lemur.Compiler." + this.constructor.name + "('" + this.value + "')";
    };
    C.Construct.prototype.compile_quasiquoted = C.Construct.prototype.compile;
    C.Construct.prototype.compile_unquoted = C.Construct.prototype.compile;
    C.Construct.prototype.compile_unquote_spliced = C.Construct.prototype.compile;
    C.Number.prototype.compile_quoted = C.Number.prototype.compile;
    C.String.prototype.compile_quoted = C.String.prototype.compile;
    C.Array.prototype.compile_quoted = C.Array.prototype.compile;
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
    return new lemur.Compiler().compile(function() {
      var prog, r;
      setup_built_in_macros();
      r = compile_runtime();
      prog = sexp._compile();
      return "" + r + "\n" + prog;
    });
  };

  C.Keyword = (function(_super) {

    __extends(Keyword, _super);

    function Keyword() {
      return Keyword.__super__.constructor.apply(this, arguments);
    }

    Keyword.prototype.toString = function() {
      return ":" + this.value;
    };

    return Keyword;

  })(C.String);

  C.Lambda = (function(_super) {

    __extends(Lambda, _super);

    function Lambda(config, yy) {
      this.arity = config.arity;
      config.autoreturn = true;
      Lambda.__super__.constructor.call(this, config, yy);
    }

    Lambda.prototype.compile = function() {
      var to_return, _ref3;
      to_return = (_ref3 = this.body) != null ? _ref3.pop() : void 0;
      if (to_return) {
        to_return = C.Macro.transform(to_return);
        this.body.push(to_return);
      }
      return Lambda.__super__.compile.apply(this, arguments);
    };

    return Lambda;

  })(C.Function);

  C.List = (function(_super) {

    __extends(List, _super);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.compile = function() {
      return call_macro.apply(null, ["call"].concat(__slice.call(this.value)));
    };

    List.prototype.compile_quoted = function() {
      var item, items, sym_js_eval;
      sym_js_eval = new C.Symbol("js-eval");
      items = (function() {
        var _i, _len, _ref3, _results;
        _ref3 = this.items;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          item = _ref3[_i];
          if (!item.unquoted) {
            item.quoted = true;
          }
          _results.push(new C.List([sym_js_eval, new C.String(item._compile())]));
        }
        return _results;
      }).call(this);
      return (new C.Array(items)).compile();
    };

    List.prototype.toString = function() {
      var item, prefix, s_value;
      s_value = (function() {
        var _i, _len, _ref3, _results;
        _ref3 = this.value;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          item = _ref3[_i];
          _results.push(oppo.stringify(item));
        }
        return _results;
      }).call(this);
      prefix = this.quoted ? "'" : this.quasiquoted ? "`" : this.unquoted ? "~" : this.unquote_spliced ? "..." : "";
      return "" + prefix + "(" + (s_value.join(' ')) + ")";
    };

    List.prototype.transform = function() {
      if (!(this.quoted || this.quasiquoted || this.unquote_spliced)) {
        return call_macro_transform.apply(null, ["call"].concat(__slice.call(this.value)));
      }
    };

    return List;

  })(C.Array);

  C.Macro = (function(_super) {

    __extends(Macro, _super);

    function Macro(_arg, yy) {
      var name, scope, transform;
      name = _arg.name, this.argnames = _arg.argnames, this.template = _arg.template, transform = _arg.transform, this.invoke = _arg.invoke, this.oppo_fn = _arg.oppo_fn;
      this.name = new C.Var(name);
      scope = C.current_scope();
      scope.set_var(this.name, this);
      if (transform != null) {
        this.transform = transform;
      }
      Macro.__super__.constructor.call(this, null, yy);
    }

    Macro.prototype.compile = function() {
      return "null";
    };

    Macro.prototype.invoke = function() {};

    Macro.prototype.transform = function() {};

    Macro.can_transform = function(item) {
      return (item != null) && (item.transform != null) && !item.builtin;
    };

    Macro.transform = function(code) {
      var callable, item, transformed;
      if (code instanceof C.ReturnedConstruct) {
        code = code.value;
      }
      if (code instanceof C.List) {
        callable = code.items[0];
        if (callable instanceof C.Symbol) {
          item = C.get_var_val(callable);
          if (this.can_transform(item)) {
            transformed = item.transform.apply(item, code.items.slice(1));
          }
        }
      }
      if (!transformed && this.can_transform(code)) {
        transformed = code.transform();
      }
      if ((transformed != null) && transformed !== code) {
        return this.transform(transformed);
      } else {
        return code;
      }
    };

    return Macro;

  })(C.Construct);

  define = function(o) {
    var defs, name, o_val, result, scope, sym, sym_def, sym_do, sym_js_eval, val, var_stmt;
    sym_js_eval = new C.Symbol("js-eval");
    sym_do = new C.Symbol("do");
    sym_def = new C.Symbol("def");
    defs = (function() {
      var _results;
      _results = [];
      for (name in o) {
        if (!__hasProp.call(o, name)) continue;
        val = o[name];
        sym = new C.Symbol(name);
        o_val = new C.List([sym_js_eval, new C.String("" + val)]);
        _results.push(new C.List([sym_def, sym, o_val]));
      }
      return _results;
    })();
    result = new C.List([sym_do].concat(__slice.call(defs)));
    scope = C.current_scope();
    var_stmt = scope.var_stmt();
    return "" + var_stmt + (result._compile()) + ";";
  };

  compare_op = function(sym) {
    return "function () {\n  var last = arguments[0];\n  for (var i=1, len=arguments.length; i<len; i++) {\n    var current = arguments[i];\n    var result = last " + sym + " current;\n    if (!result) return result;\n    last = current;\n  }\n  return true;\n}";
  };

  binary_op = function(sym, _not) {
    if (_not == null) {
      _not = false;
    }
    return "function () {\n  var last = arguments[0];\n  for (var i=1, len=arguments.length; i<len; i++) {\n    if (" + (_not ? '!' : '') + "last) return last;\n    last = last " + sym + " arguments[i];\n  }\n  return last;\n}";
  };

  math_op = function(sym, explicit_convert) {
    if (explicit_convert == null) {
      explicit_convert = false;
    }
    return "function () {\n  var x = arguments[0];\n  for (var i=1, len=arguments.length; i<len; i++) {\n    x " + sym + "= " + (explicit_convert ? '+' : '') + "arguments[i];\n  }\n  return x;\n}";
  };

  compile_runtime = function() {
    return define({
      '+': math_op('+', true),
      '-': math_op('-'),
      '*': math_op('*'),
      '/': math_op('/'),
      mod: function(a, b) {
        return a % b;
      },
      '**': "Math.pow",
      '=': compare_op('==='),
      'not=': compare_op('!=='),
      '<': compare_op('<'),
      '>': compare_op('>'),
      '<=': compare_op('<='),
      '>=': compare_op('>='),
      or: binary_op('||'),
      and: binary_op('&&', true),
      first: function(a) {
        return a[0];
      },
      second: function(a) {
        return a[1];
      },
      last: function(a) {
        return a[a.length - 1];
      },
      nth: function(a, n) {
        if (n < 0) {
          n += a.length;
        } else if (n === 0) {
          console.warn("nth treats collections as 1-based instead of 0 based. Don't try to access the 0th element.");
          return null;
        } else {
          n -= 1;
        }
        return a[n];
      }
    });
  };

  /*
  HELPERS
  */


  defmacro = function(name, fn, builtin) {
    var m, macro_args, s_name;
    if (builtin == null) {
      builtin = true;
    }
    s_name = new C.Symbol(name);
    macro_args = {
      name: s_name
    };
    if (builtin) {
      macro_args.invoke = fn;
    } else {
      macro_args.transform = fn;
    }
    m = new C.Macro(macro_args);
    m.builtin = builtin;
    m._compile();
    return m;
  };

  call_macro = function() {
    var args, name, ret, to_call;
    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    to_call = C.get_var_val(new C.Symbol(name));
    if (to_call.invoke != null) {
      return to_call.invoke.apply(to_call, args);
    } else {
      ret = to_call.transform.apply(to_call, args);
      return ret.compile();
    }
  };

  call_macro_transform = function() {
    var args, name, to_call;
    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    to_call = C.get_var_val(new C.Symbol(name));
    return to_call.transform.apply(to_call, args);
  };

  setup_built_in_macros = function() {
    /*
      JAVASCRIPT BUILTINS
    */

    var macro_do, macro_let, operator_macro;
    defmacro("js-eval", function(js_code) {
      if (js_code instanceof C.String) {
        return js_code.value;
      } else if (js_code instanceof C.Number) {
        return js_code._compile();
      } else if ((js_code instanceof C.Symbol) && js_code.quoted) {
        return js_code.name;
      } else {
        return "window.eval(" + (js_code._compile()) + ")";
      }
    });
    defmacro("if", function(cond, tbranch, fbranch) {
      var _if;
      return _if = new C.If({
        condition: cond,
        then: tbranch,
        _else: fbranch
      });
    }, false);
    defmacro("lambda", function() {
      var args, body, fn;
      args = arguments[0], body = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return fn = new C.Lambda({
        args: args.value,
        body: body
      });
    }, false);
    defmacro("js-for", function() {
      var a, b, body, c, _for;
      a = arguments[0], b = arguments[1], c = arguments[2], body = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
      return _for = new C.ForLoop({
        condition: [a, b, c],
        body: body
      });
    }, false);
    defmacro("foreach", function() {
      var body, coll, foreach;
      coll = arguments[0], body = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return foreach = new C.ForEachLoop({
        collection: coll,
        body: body
      });
    }, false);
    operator_macro = function(name, className) {
      var macro_fn;
      macro_fn = function() {
        var Cls, args, postfix, prefix, results, x, y;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        Cls = C[className];
        prefix = Cls.prototype instanceof C.PrefixOperation;
        postfix = Cls.prototype instanceof C.PostfixOperation;
        results = (function() {
          var _results;
          _results = [];
          while (args.length) {
            x = args.shift();
            _results.push((prefix || postfix ? new Cls(x, x.yy) : (y = args.shift(), new Cls([x, y], x.yy))).compile());
          }
          return _results;
        })();
        return results.join(' ');
      };
      return defmacro(name, macro_fn);
    };
    operator_macro("subtract", "Subtract");
    operator_macro("add", "Add");
    operator_macro("multiply", "Multiply");
    operator_macro("divide", "Divide");
    operator_macro("modulo", "Mod");
    operator_macro("==", "Eq2");
    operator_macro("===", "Eq3");
    operator_macro("gt", "GT");
    operator_macro("lt", "LT");
    operator_macro("gte", "GTE");
    operator_macro("lte", "LTE");
    operator_macro("not===", "NotEq3");
    operator_macro("not==", "NotEq2");
    operator_macro("!", "Not");
    operator_macro("||", "Or");
    operator_macro("&&", "And");
    operator_macro("&", "BAnd");
    operator_macro("|", "BOr");
    operator_macro("^", "BXor");
    operator_macro("<<", "BLeftShift");
    operator_macro(">>", "BRightShift");
    operator_macro(">>>", "BZeroFillRightShift");
    operator_macro("~", "BNot");
    operator_macro("delete", "Delete");
    /*
      OPPO BUILTINS
    */

    defmacro("def", function() {
      var args, body, name, rest, scope, set_, to_define, value;
      to_define = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!rest.length) {
        to_define.error("Def", "You must provide a value.");
      }
      scope = C.current_scope();
      if (to_define instanceof C.List) {
        name = to_define.value[0];
        args = to_define.value.slice(1);
        body = rest;
        value = new C.Lambda({
          name: name,
          args: args,
          body: body
        });
      } else if (to_define instanceof C.Symbol) {
        name = to_define;
        value = rest[0];
      } else {
        to_define.error("Def", "Invalid definition.");
      }
      name = new C.Var(name);
      set_ = new C.Var.Set({
        _var: name,
        value: value
      });
      return set_._compile();
    });
    defmacro("call", function() {
      var args, callable, fcall, item;
      callable = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (callable instanceof C.Symbol) {
        item = C.get_var_val(callable);
        if (item instanceof C.Macro) {
          if (item.invoke != null) {
            return new C.Raw(item.invoke.apply(item, args));
          } else {
            return item.transform();
          }
        }
      }
      return fcall = new C.FunctionCall({
        fn: callable,
        args: args
      }, callable.yy);
    }, false);
    macro_let = defmacro("let", function() {
      var bindings, body, def_sym, i, item, new_bindings, new_body, sym, _i, _len, _ref3;
      bindings = arguments[0], body = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      def_sym = new C.Symbol('def');
      sym = null;
      new_bindings = [];
      _ref3 = bindings.value;
      for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
        item = _ref3[i];
        if (i % 2 === 0) {
          sym = item;
        } else {
          if (!(item != null)) {
            bindings.error("Must have even number of bindings.");
          }
          new_bindings.push(new types.List([def_sym, sym, item]));
        }
      }
      new_body = __slice.call(new_bindings).concat(__slice.call(body));
      return (new types.List([
        new types.Lambda({
          body: new_body
        })
      ])).compile();
    });
    macro_do = defmacro("do", function() {
      var c_items;
      c_items = compile_list(arguments, null, true);
      return "(" + (c_items.join(',\n')) + ")";
    });
    /*
      QUOTING
    */

    defmacro("quote", function(x) {
      x.quoted = true;
      return x._compile();
    });
    defmacro("quasiquote", function(x) {
      var c_item, compiled, current_group, first, item, push_group, scope, _i, _len, _ref3;
      scope = last(scope_stack);
      current_group = [];
      compiled = [];
      push_group = function() {
        if (current_group.length) {
          compiled.push("[" + (current_group.join(', ')) + "]");
        }
        return current_group = [];
      };
      _ref3 = x.value;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        item = _ref3[_i];
        if (item instanceof types.UnquoteSpliced) {
          c_item = "Array.prototype.slice.call(" + (item._compile()) + ")";
          push_group();
          compiled.push(c_item);
        } else if (item instanceof types.Unquoted) {
          current_group.push(item._compile());
        } else {
          current_group.push(item._compile(true));
        }
      }
      push_group();
      first = compiled.shift();
      if (compiled.length) {
        return "" + first + ".concat(" + (compiled.join(', ')) + ")";
      } else {
        return first;
      }
    });
    defmacro("unquote", function(x) {
      return x._compile(false);
    });
    defmacro("unquote-splicing", function(x) {
      return x._compile(false);
    });
    /*
      ERRORS & VALIDATIONS
    */

    defmacro("raise", function(namespace, error) {
      var c_error, c_namespace;
      if (arguments.length === 1) {
        error = namespace;
        c_namespace = "\"Error\"";
      } else {
        c_namespace = namespace._compile();
      }
      c_error = error._compile();
      return "(function () {\n  throw new oppo.Error(" + c_namespace + ", " + c_error + ");\n})()";
    });
    return defmacro("assert", function(sexp) {
      var c_sexp, error, error_namespace, raise_call;
      c_sexp = sexp._compile();
      error_namespace = new types.String("Assertion-Error");
      error = new types.String(sexp.toString());
      raise_call = call_macro("raise", error_namespace, error);
      return "(" + c_sexp + " || " + raise_call + ")";
    });
  };

}