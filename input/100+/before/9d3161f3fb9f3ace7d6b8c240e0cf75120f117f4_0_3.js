f  options = options || {};
  var helpers = _.extend({}, Handlebars._default_helpers);
  _.extend(helpers, options.helpers || {});
  var partials = options.partials || {};

  // re 'stack' arguments: top of stack is the current data to use for
  // the template. higher levels are the data referenced by
  // identifiers with one or more '..' segments. we have to keep the
  // stack pure-functional style, with a tree rather than an array,
  // because we want to continue to allow block helpers provided by
  // the user to capture their subtemplate rendering functions and
  // call them later, after we've finished running (for eg findLive.)
  // maybe revisit later.

  var eval_value = function (stack, id) {
    if (typeof(id) !== "object")
      return id;

    // follow '..' in {{../../foo.bar}}
    for (var i = 0; i < id[0]; i++) {
      if (!stack.parent)
        throw new Error("Too many '..' segments");
      else
        stack = stack.parent;
    }

    if (id.length === 1)
      // no name: {{this}}, {{..}}, {{../..}}
      return stack.data;

    var scopedToContext = false;
    if (id[1] === '') {
      // an empty path segment is our AST's way of encoding
      // the presence of 'this.' at the beginning of the path.
      id.splice(1, 1); // remove the ''
      scopedToContext = true;
    }

    // when calling functions (helpers/methods/getters), dataThis
    // tracks what to use for `this`.  For helpers, it's the
    // current data context.  For getters and methods on the data
    // context object, and on the return value of a helper, it's
    // the object where we got the getter or method.
    var dataThis = stack.data;

    var data;
    if (id[0] === 0 && (id[1] in helpers) && ! scopedToContext) {
      // first path segment is a helper
      data = helpers[id[1]];
    } else {
      if ((! data instanceof Object) &&
          (typeof (function() {})[id[1]] !== 'undefined') &&
          ! scopedToContext) {
        // Give a helpful error message if the user tried to name
        // a helper 'name', 'length', or some other built-in property
        // of function objects.  Unfortunately, this case is very
        // hard to detect, as Template.foo.name = ... will fail silently,
        // and {{name}} will be silently empty if the property doesn't
        // exist (per Handlebars rules).
        // However, if there is no data context at all, we jump in.
        throw new Error("Can't call a helper '"+id[1]+"' because "+
                        "it is a built-in function property in JavaScript");
      }
      // first path segment is property of data context
      data = (stack.data && stack.data[id[1]]);
    }

    // handle dots, as in {{foo.bar}}
    for (var i = 2; i < id.length; i++) {
      // Call functions when taking the dot, to support
      // for example currentUser.name.
      //
      // In the case of {{foo.bar}}, we end up returning one of:
      // - helpers.foo.bar
      // - helpers.foo().bar
      // - stack.data.foo.bar
      // - stack.data.foo().bar.
      //
      // The caller does the final application with any
      // arguments, as in {{foo.bar arg1 arg2}}, and passes
      // the current data context in `this`.  Therefore,
      // we use the current data context (`helperThis`)
      // for all function calls.
      if (typeof data === 'function') {
        data = data.call(dataThis);
        dataThis = data;
      } else if (data === undefined || data === null) {
        // Handlebars fails silently and returns "" if
        // we start to access properties that don't exist.
        data = '';
      }

      data = data[id[i]];
    }

    // ensure `this` is bound appropriately when the caller
    // invokes `data` with any arguments.  For example,
    // in {{foo.bar baz}}, the caller must supply `baz`,
    // but we alone have `foo` (in `dataThis`).
    if (typeof data === 'function')
      return _.bind(data, dataThis);

    return data;
  };

  // 'extra' will be clobbered, but not 'params'
  var invoke = function (stack, params, extra) {
    extra = extra || {};
    params = params.slice(0);
    var last = params.pop();
    if (typeof(last) === "object" && !(last instanceof Array))
      extra.hash = last;
    else
      params.push(last);

    // values[0] must be a function. if values[1] is a function, then
    // apply values[1] to the remaining arguments, then apply
    // values[0] to the results. otherwise, directly apply values[0]
    // to the other arguments. if toplevel, also pass 'extra' as an
    // argument.
    var apply = function (values, toplevel) {
      var args = values.slice(1);
      if (args.length && typeof (args[0]) === "function")
        args = [apply(args)];
      if (toplevel)
        args.push(extra);
      return values[0].apply(stack.data, args);
    };

    var values = new Array(params.length);
    for(var i=0; i<params.length; i++)
      values[i] = eval_value(stack, params[i]);

    if (typeof(values[0]) !== "function")
      return values[0];
    return apply(values, true);
  };

  var template = function (stack, elts) {
    var buf = [];

    var toString = function (x) {
      if (typeof x === "string") return x;
      // May want to revisit the following one day
      if (x === null) return "null";
      if (x === undefined) return "";
      return x.toString();
    };

    // wrap `fn` and `inverse` blocks in liveranges
    // having event_data, if the data is different
    // from the enclosing data.
    var decorateBlockFn = function(fn, old_data) {
      return function(data) {
        var result = fn(data);
        // don't create spurious ranges when data is same as before
        // (or when transitioning between e.g. `window` and `undefined`)
        if ((data || Handlebars._defaultThis) ===
            (old_data || Handlebars._defaultThis)) {
          return result;
        } else {
          return Meteor.ui.chunk(
            function() { return result; },
            { event_data: data });
        }
      };
    };

    // Handle the return value of a {{helper}}.
    // Takes a:
    //   string - escapes it
    //   SafeString - returns the underlying string unescaped
    //   other value - coerces to a string and escapes it
    var maybeEscape = function(x) {
      if (x instanceof Handlebars.SafeString)
        return x.toString();
      return Handlebars._escape(toString(x));
    };

    _.each(elts, function (elt) {
      if (typeof(elt) === "string")
        buf.push(elt);
      else if (elt[0] === '{')
        buf.push(maybeEscape(invoke(stack, elt[1])));
      else if (elt[0] === '!')
        buf.push(toString(invoke(stack, elt[1] || '')));
      else if (elt[0] === '#') {
        var block = decorateBlockFn(
          function (data) {
            return template({parent: stack, data: data}, elt[2]);
          }, stack.data);
        block.fn = block;
        block.inverse = decorateBlockFn(
          function (data) {
            return template({parent: stack, data: data}, elt[3] || []);
          }, stack.data);
        buf.push(toString(invoke(stack, elt[1], block)));
      } else if (elt[0] === '>') {
        if (!(elt[1] in partials))
          throw new Error("No such partial '" + elt[1] + "'");
        buf.push(toString(partials[elt[1]](stack.data)));
      } else
        throw new Error("bad element in template");
    });

    return buf.join('');
  };

  return template({data: data, parent: null}, ast);
};
