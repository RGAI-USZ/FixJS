function() {
  var C, L, binary_op, call_macro, call_macro_transform, clone, compare_op, compile, compile_list, compile_runtime, define, defmacro, keys, last, map, math_op, oppo_eval, pop_shift_op, push_unshift_op, read, root, scope_stack, setup_built_in_macros, trim, type_of, types, _ref, _ref1, _ref2,
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

  oppo.root = root;

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    oppo.lodash = module.exports;
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

    Error.prototype.raise = function() {
      throw this;
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
    var items, key, type, value, _ref1;
    type = type_of(o);
    switch (type) {
      case "array":
        return C.List.prototype.toOppoString.call({
          value: o
        });
      case "object":
        if (o instanceof C.Construct) {
          return (_ref1 = typeof o.toOppoString === "function" ? o.toOppoString() : void 0) != null ? _ref1 : o.toString();
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
    var normal_compile, sym_compile;
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
    C.Number.prototype.valueOf = function() {
      return +this.compile();
    };
    C.Number.prototype.toString = C.Number.prototype.compile;
    sym_compile = C.Symbol.prototype.compile;
    C.Symbol.prototype.compile = function() {
      var c_sym, name;
      name = this.name;
      this.name = name.replace(/\-/g, '_');
      c_sym = sym_compile.call(this);
      this.name = name;
      return c_sym;
    };
    C.String.prototype.toString = function() {
      return eval(this.compile());
    };
    C.String.prototype.valueOf = C.String.prototype.toString;
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

  compile = oppo.compile = oppo.compiler.compile = function(sexp, comp_runtime) {
    if (comp_runtime == null) {
      comp_runtime = true;
    }
    if ((type_of(sexp)) === "array") {
      sexp = new C.List(sexp);
      sexp = new C.Lambda({
        body: [sexp]
      });
    }
    return new lemur.Compiler().compile(function() {
      var c_sym_prog, prog, r, sym_prog;
      setup_built_in_macros();
      if (comp_runtime) {
        r = compile_runtime();
      }
      if (r != null) {
        r = "\n// Oppo runtime\n" + r;
      } else {
        r = "";
      }
      sym_prog = C.Var.gensym("program");
      c_sym_prog = sym_prog.compile();
      prog = sexp._compile();
      return "// Your program\nvar " + c_sym_prog + " = " + prog + ";\n\n" + r + "\n\n// Run the oppo program\nif (lemur.core.to_type(" + c_sym_prog + ") === 'function')\n  " + c_sym_prog + "();\nelse\n  " + c_sym_prog + ";";
    });
  };

  oppo.compile_runtime = function() {
    var sexp;
    sexp = new C.Null(1);
    return compile(sexp);
  };

  oppo_eval = oppo["eval"] = function(sexp) {
    return root["eval"](compile(sexp));
  };

  C.Keyword = (function(_super) {

    __extends(Keyword, _super);

    function Keyword() {
      return Keyword.__super__.constructor.apply(this, arguments);
    }

    Keyword.prototype.toOppoString = function() {
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
      var body, item, result;
      body = this.body;
      this.body = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = body.length; _i < _len; _i++) {
          item = body[_i];
          _results.push(C.Macro.transform(item));
        }
        return _results;
      })();
      result = Lambda.__super__.compile.apply(this, arguments);
      this.body = body;
      return result;
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
      var item, items, ret, sym_js_eval;
      sym_js_eval = new C.Symbol("js-eval");
      items = (function() {
        var _i, _len, _ref3, _results;
        _ref3 = this.items;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          item = _ref3[_i];
          if (!(this.quasiquoted && item.unquoted)) {
            item.quoted = true;
          }
          _results.push(new C.List([sym_js_eval, new C.String(item._compile())]));
        }
        return _results;
      }).call(this);
      ret = new C.Array(items);
      return ret.compile();
    };

    List.prototype.compile_quasiquoted = function() {
      var grp, ls, sym_ls, value;
      value = this.compile_quoted.apply(this, arguments);
      ls = "new lemur.Compiler.List(" + value + ", " + this.line_number + ")";
      ls = new C.Raw(ls, this.yy);
      sym_ls = C.Var.gensym("ls");
      grp = new C.CommaGroup([
        new C.Var.Set({
          _var: sym_ls,
          value: ls
        }), new C.Raw("" + (sym_ls.compile()) + ".quoted = true"), sym_ls
      ]);
      return grp.compile();
    };

    List.prototype.toOppoString = function() {
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
      name = _arg.name, this.argnames = _arg.argnames, this.template = _arg.template, transform = _arg.transform, this.invoke = _arg.invoke;
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

    Macro.prototype.invoke = function() {
      var args, x;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      x = this.transform.apply(this, args);
      return x.compile();
    };

    Macro.prototype.transform = function() {
      var arg, args, c_template, fn, ls, transformed;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      fn = new C.Lambda({
        body: this.template,
        args: this.argnames
      }, this.yy);
      args = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          arg = arg.clone();
          arg.quoted = true;
          _results.push(arg);
        }
        return _results;
      })();
      ls = new C.List([fn].concat(__slice.call(args)), this.yy);
      c_template = ls.compile();
      transformed = eval(c_template);
      if (transformed instanceof C.List) {
        transformed.quoted = false;
      }
      return transformed;
    };

    Macro.can_transform = function(item) {
      return (item != null) && (item.transform != null) && !item.builtin;
    };

    Macro.transform = function(code) {
      var callable, item, transformed;
      if (code instanceof C.ReturnedConstruct) {
        code = code.value;
      }
      if (code instanceof C.List && !(code.quoted || code.quasiquoted)) {
        callable = code.items[0];
        if (callable instanceof C.Symbol) {
          item = C.get_var_val(callable);
          if (this.can_transform(item)) {
            transformed = item.transform.apply(item, code.items.slice(1));
          }
        }
      }
      if (!transformed && (!(code instanceof C.Macro)) && (this.can_transform(code))) {
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

  define = function(defs) {
    var name, o_val, result, scope, sym, sym_def, sym_js_eval, val, var_stmt;
    sym_js_eval = new C.Symbol("js-eval");
    sym_def = new C.Symbol("def");
    defs = (function() {
      var _i, _len, _ref3, _results;
      _results = [];
      for (_i = 0, _len = defs.length; _i < _len; _i++) {
        _ref3 = defs[_i], name = _ref3[0], val = _ref3[1];
        sym = new C.Symbol(name);
        o_val = new C.Raw("" + val);
        _results.push(new C.List([sym_def, sym, o_val]));
      }
      return _results;
    })();
    result = new C.CodeFragment(defs);
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

  push_unshift_op = function(method) {
    return "function (a) {\n    var args = __slice__.call(arguments, 1);\n    var new_a = a.slice();\n    new_a." + method + ".apply(new_a, args);\n    return new_a;\n}";
  };

  pop_shift_op = function(method) {
    return "function (a) {\n  var new_a = a.slice();\n  new_a." + method + "();\n  return new_a;\n}";
  };

  compile_runtime = function() {
    return define([
      ['+', math_op('+', true)], ['-', math_op('-')], ['*', math_op('*')], ['/', math_op('/')], [
        'mod', function(a, b) {
          return a % b;
        }
      ], ['**', "Math.pow"], ['min', 'Math.min'], ['max', 'Math.max'], [
        'inc', function(x) {
          return ++x;
        }
      ], [
        'dec', function(x) {
          return --x;
        }
      ], ['<', compare_op('<')], ['>', compare_op('>')], ['<=', compare_op('<=')], ['>=', compare_op('>=')], ['__hasDontEnumBug__', "!propertyIsEnumerable.call({ 'valueOf': 0 }, 'valueOf')"], ['__explicitEnum__', "__hasDontEnumBug__ ? [        'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',        'toLocaleString', 'toString', 'valueOf'      ] : null"], ['__hasOwnProperty__', 'Object.prototype.hasOwnProperty'], [
        '__equal__', function (a, b, stack) {
        stack || (stack = []);

        // exit early for identical values
        if (a === b) {
          // treat '+0' vs. '-0' as not equal
          return a !== 0 || (1 / a == 1 / b);
        }
        // a strict comparison is necessary because 'undefined == null'
        if (a == null || b == null) {
          return a === b;
        }
        // compare [[Class]] names
        var className = __typeof__(a);
        if (className != __typeof__(b)) {
          return false;
        }
        switch (className) {
          // strings, numbers, dates, and booleans are compared by value
          case "string":
            // primitives and their corresponding object instances are equivalent;
            // thus, '5' is quivalent to 'new String('5')'
            return a == String(b);

          case "number":
            // treat 'NaN' vs. 'NaN' as equal
            return a != +a
              ? b != +b
              // but treat '+0' vs. '-0' as not equal
              : (a == 0 ? (1 / a == 1 / b) : a == +b);

          case "boolean":
          case "date":
            // coerce dates and booleans to numeric values, dates to milliseconds and
            // booleans to 1 or 0; treat invalid dates coerced to 'NaN' as not equal
            return +a == +b;

          // regexps are compared by their source and flags
          case "regexp":
            return a.source == b.source &&
                   a.global == b.global &&
                   a.multiline == b.multiline &&
                   a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') {
          return false;
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation 'JO'.
        var length = stack.length;
        while (length--) {
          // Linear search. Performance is inversely proportional to the number of
          // unique nested structures.
          if (stack[length] == a) {
            return true;
          }
        }

        var index = -1,
            result = true,
            size = 0;

        // add the first collection to the stack of traversed objects
        stack.push(a);

        // recursively compare objects and arrays
        if (className == "array") {
          // compare array lengths to determine if a deep comparison is necessary
          size = a.length;
          result = size == b.length;

          if (result) {
            // deep compare the contents, ignoring non-numeric properties
            while (size--) {
              if (!(result = __equal__(a[size], b[size], stack))) {
                break;
              }
            }
          }
        }
        else {
          // objects with different constructors are not equivalent
          if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
            return false;
          }
          // deep compare objects.
          for (var prop in a) {
            if (__hasOwnProperty__.call(a, prop)) {
              // count the number of properties.
              size++;
              // deep compare each property value.
              if (!(result = __hasOwnProperty__.call(b, prop) && __equal__(a[prop], b[prop], stack))) {
                break;
              }
            }
          }
          // ensure both objects have the same number of properties
          if (result) {
            for (prop in b) {
              // Adobe's JS engine, embedded in applications like InDesign, has a
              // bug that causes '!size--' to throw an error so it must be wrapped
              // in parentheses.
              // https://github.com/documentcloud/underscore/issues/355
              if (__hasOwnProperty__.call(b, prop) && !(size--)) {
                break;
              }
            }
            result = !size;
          }
          // handle JScript [[DontEnum]] bug
          if (result && __hasDontEnumBug__) {
            while (++index < 7) {
              prop = __explicitEnum__[index];
              if (__hasOwnProperty__.call(a, prop)) {
                if (!(result = __hasOwnProperty__.call(b, prop) && __equal__(a[prop], b[prop], stack))) {
                  break;
                }
              }
            }
          }
        }
        // remove the first collection from the stack of traversed objects
        stack.pop();
        return result;
      }
      ], [
        '=', function() {
          var a, b, _i, _len;
          for (_i = 0, _len = arguments.length; _i < _len; _i++) {
            b = arguments[_i];
            if (!(typeof a !== "undefined" && a !== null)) {
              a = b;
              continue;
            }
            if (!__equal__(a, b)) {
              return false;
            }
            a = b;
          }
          return true;
        }
      ], [
        'not=', function() {
          return !(eq.apply(null, arguments));
        }
      ], ['or', binary_op('||')], ['and', binary_op('&&', true)], ['__oppo_eval__', 'oppo.eval'], ['__typeof__', 'lemur.core.to_type'], ['typeof', '__typeof__'], ['println', 'console.log.bind(console)'], ['prn', 'println'], ['__slice__', 'Array.prototype.slice'], [
        'list', function() {
          return __slice__.call(arguments);
        }
      ], [
        'first', function(a) {
          return a[0];
        }
      ], [
        'second', function(a) {
          return a[1];
        }
      ], [
        'last', function(a) {
          return a[a.length - 1];
        }
      ], [
        'init', function(a) {
          return a.slice(0, a.length - 1);
        }
      ], [
        'rest', function(a) {
          return a.slice(1);
        }
      ], [
        'nth', function(a, n) {
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
      ], ['push', push_unshift_op("push")], ['push-right', 'push'], ['push-r', 'push'], ['push-left', push_unshift_op("unshift")], ['push-l', (new C.Symbol('push-left')).compile()], ['pop', pop_shift_op("pop")], ['pop-right', 'pop'], ['pop-r', 'pop'], ['pop-left', pop_shift_op("shift")], ['pop-l', (new C.Symbol('pop-left')).compile()], [
        'concat', function (x) {
      var args = __slice__.call(arguments, 1);
      return x.concat.apply(x, args);
    }
      ], [
        'sort', function(a, f) {
          var new_a;
          new_a = a.slice();
          if (f != null) {
            return new_a.sort(f);
          } else {
            return new_a.sort();
          }
        }
      ], [
        'map', function(f, o) {
          var k, result, t, v, x, _i, _len, _results;
          t = __typeof__(o);
          if (o.map != null) {
            return o.map(function(x) {
              return f(x);
            });
          } else if (t === "array" || o instanceof Array) {
            _results = [];
            for (_i = 0, _len = o.length; _i < _len; _i++) {
              x = o[_i];
              _results.push(f(x));
            }
            return _results;
          } else if (t === "object" || o instanceof Object) {
            result = {};
            for (k in o) {
              v = o[k];
              if (!o.hasOwnProperty(k)) {
                continue;
              }
              result[k] = f([k, v]);
            }
            return result;
          }
        }
      ], [
        'reduce', function(f, o) {
          var k, result, t, v, x, _i, _len;
          t = __typeof__(o);
          if (o.reduce != null) {
            return o.reduce(function(a, b) {
              return f(a, b);
            });
          } else if (t === "array" || o instanceof Array) {
            for (_i = 0, _len = o.length; _i < _len; _i++) {
              x = o[_i];
              if (!(typeof result !== "undefined" && result !== null)) {
                result = x;
                continue;
              }
              result = f(result, x);
            }
          } else if (t === "object" || o instanceof Object) {
            for (k in o) {
              v = o[k];
              if (!o.hasOwnProperty(k)) {
                continue;
              }
              if (!(result != null)) {
                result = v;
                continue;
              }
              result = f(result, v);
            }
          }
          return result;
        }
      ], [
        'reduce-right', function(f, o) {
          var result, t, x, _i, _len, _ref3;
          t = __typeof__(o);
          if (o.reduceRight != null) {
            return o.reduceRight(function(a, b) {
              return f(a, b);
            });
          } else if (t === "array" || o instanceof Array) {
            _ref3 = o.slice().reverse();
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
              x = _ref3[_i];
              if (!(typeof result !== "undefined" && result !== null)) {
                result = x;
                continue;
              }
              result = f(result, x);
            }
            return result;
          } else if (t === "object" || o instanceof Object) {
            return reduce(f, o);
          }
        }
      ], ['reduce-r', (new C.Symbol('reduce-right')).compile()], [
        'filter', function(f, o) {
          var k, result, t, v, x, _i, _len;
          t = __typeof__(o);
          if (o.filter != null) {
            return o.filter(function(x) {
              return f(x);
            });
          } else if (t === "array" || o instanceof Array) {
            result = [];
            for (_i = 0, _len = o.length; _i < _len; _i++) {
              x = o[_i];
              if (f(x)) {
                result.push(x);
              }
            }
          } else if (t === "object" || o instanceof Object) {
            result = {};
            for (k in o) {
              v = o[k];
              if (!o.hasOwnProperty(k)) {
                continue;
              }
              if (f([k, v])) {
                result[k] = v;
              }
            }
          }
          return result;
        }
      ], [
        'keys', "Object.keys || " + function(o) {
          var k, _results;
          _results = [];
          for (k in o) {
            if (!o.hasOwnProperty(k)) {
              continue;
            }
            _results.push(k);
          }
          return _results;
        }
      ], [
        'values', function(o) {
          var k, t, _i, _len, _ref3, _results;
          t = __typeof__(o);
          if (t === "array" || o instanceof Array) {
            return o.slice();
          } else if (t === "object" || o instanceof Object) {
            _ref3 = keys(o);
            _results = [];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
              k = _ref3[_i];
              _results.push(o[k]);
            }
            return _results;
          }
        }
      ], [
        'str', function() {
          var arg, args;
          args = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = arguments.length; _i < _len; _i++) {
              arg = arguments[_i];
              if (typeof arg === "string") {
                _results.push(arg);
              } else if (arg.toString != null) {
                _results.push(arg.toString());
              } else {
                _results.push("" + arg);
              }
            }
            return _results;
          }).apply(this, arguments);
          return args.join('');
        }
      ], [
        'uppercase', function(s) {
          return s.toUpperCase();
        }
      ], [
        'lowercase', function(s) {
          return s.toLowerCase();
        }
      ], [
        'replace', function(s, re, rplc) {
          return s.replace(re, rplc);
        }
      ], [
        'match', function(s, re) {
          return s.match(re);
        }
      ], [
        're-test', function(re, s) {
          return re.test(s);
        }
      ]
    ]);
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
    defmacro("regex", function(pattern, modifiers) {
      return new C.Regex({
        pattern: pattern.value,
        modifiers: modifiers.value
      }, pattern.yy);
    }, false);
    defmacro("js-eval", function(js_code) {
      if (js_code instanceof C.String) {
        return js_code.value;
      } else if (js_code instanceof C.Number) {
        return js_code._compile();
      } else if ((js_code instanceof C.Symbol) && js_code.quoted) {
        return js_code.name;
      } else {
        return "oppo.root.eval(" + (js_code._compile()) + ")";
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
    defmacro("array", function() {
      var ary, items;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return ary = new C.Array(items);
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

    defmacro("keyword", function(keyword) {
      if (keyword instanceof C.Symbol) {
        return new C.String(keyword.value, keyword.yy);
      } else if (keyword instanceof C.String) {
        return k;
      }
    }, false);
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
      return set_ = new C.Var.Set({
        _var: name,
        value: value
      });
    }, false);
    defmacro("apply", function() {
      var arg, args, c_args, c_callable, callable;
      callable = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (args.length > 1) {
        c_args = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = args.length; _i < _len; _i++) {
            arg = args[_i];
            _results.push(arg._compile());
          }
          return _results;
        })();
        c_args = "[].concat(" + (c_args.join(', ')) + ")";
        args = [new C.Raw(c_args)];
      }
      args.unshift(new C.Null());
      args = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          _results.push(arg._compile());
        }
        return _results;
      })();
      c_callable = callable._compile();
      if (!callable instanceof C.Symbol) {
        c_callable = "(c_callable)";
      }
      return "" + c_callable + ".apply(" + (args.join(', ')) + ")";
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
            return item.transform.apply(item, args);
          }
        }
      }
      return fcall = new C.FunctionCall({
        fn: callable,
        args: args
      }, callable.yy);
    }, false);
    defmacro("defmacro", function() {
      var argnames, mac, name, template;
      argnames = arguments[0], template = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      name = argnames.items.shift();
      mac = new C.Macro({
        name: name,
        argnames: argnames,
        template: template
      });
      return new C.Raw(mac.compile());
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
          new_bindings.push(new C.List([def_sym, sym, item]));
        }
      }
      new_body = __slice.call(new_bindings).concat(__slice.call(body));
      return (new C.List([
        new C.Lambda({
          body: new_body
        })
      ])).compile();
    });
    macro_do = defmacro("do", function() {
      var arg, c_items;
      c_items = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arg = arguments[_i];
          _results.push(arg._compile());
        }
        return _results;
      }).apply(this, arguments);
      return "(" + (c_items.join(',\n')) + ")";
    });
    /*
      QUOTING
    */

    defmacro("quote", function(x) {
      x.quoted = true;
      return x;
    }, false);
    defmacro("quasiquote", function(x) {
      x.quasiquoted = true;
      return x;
    }, false);
    defmacro("unquote", function(x) {
      x.unquoted = true;
      return x;
    }, false);
    defmacro("unquote-splicing", function(x) {
      x.unquote_spliced = true;
      return x;
    }, false);
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
      return "new oppo.Error(" + c_namespace + ", " + c_error + ").raise()";
    });
    defmacro("try", function() {
      var body, catch_body, catch_err, finally_body, sexp, __, _catch, _finally, _ref3, _ref4, _ref5, _ref6;
      sexp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _finally = sexp.pop();
      if (!(_finally instanceof C.List) || ((_ref3 = _finally.items[0]) != null ? _ref3.name : void 0) !== "finally") {
        sexp.push(_finally);
        _finally = new C.List([]);
      }
      _catch = sexp.pop();
      if (!(_catch instanceof C.List) || ((_ref4 = _catch.items[0]) != null ? _ref4.name : void 0) !== "catch") {
        sexp.push(_catch);
        _catch = new C.List([]);
      }
      body = sexp;
      _ref5 = _catch.items, __ = _ref5[0], catch_err = _ref5[1], catch_body = 3 <= _ref5.length ? __slice.call(_ref5, 2) : [];
      _ref6 = _finally.items, __ = _ref6[0], finally_body = 2 <= _ref6.length ? __slice.call(_ref6, 1) : [];
      return new C.TryCatch({
        _try: body,
        err_name: catch_err,
        _catch: catch_body,
        _finally: finally_body
      });
    }, false);
    return defmacro("assert", function(sexp) {
      var c_sexp, error, error_namespace, raise_call;
      c_sexp = sexp._compile();
      error_namespace = new C.String("Assertion-Error");
      error = new C.String(oppo.stringify(sexp));
      raise_call = call_macro("raise", error_namespace, error);
      return "(" + c_sexp + " || " + raise_call + ")";
    });
  };

}