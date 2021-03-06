function(source, filepath, namespace, templateSettings) {
    // Derived from underscore 1.3.3
    function underscoreTemplating(text, settings) {
      settings = _.defaults(settings || {}, _.templateSettings);

      var noMatch = /.^/;

      var escapes = {
        '\\': '\\',
        "'": "'",
        r: '\r',
        n: '\n',
        t: '\t',
        u2028: '\u2028',
        u2029: '\u2029'
      };

      for (var key in escapes) escapes[escapes[key]] = key;
      var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
      var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

      var unescape = function(code) {
        return code.replace(unescaper, function(match, escape) {
          return escapes[escape];
        });
      };

      // Compile the template source, taking care to escape characters that
      // cannot be included in a string literal and then unescape them in code
      // blocks.
      var source = "__p+='" + text
          .replace(escaper, function(match) {
            return '\\' + escapes[match];
          })
          .replace(settings.escape || noMatch, function(match, code) {
            return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
          })
          .replace(settings.interpolate || noMatch, function(match, code) {
            return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
          })
          .replace(settings.evaluate || noMatch, function(match, code) {
            return "';\n" + unescape(code) + "\n__p+='";
          }) + "';\n";

      // If a variable is not specified, place data values in local scope.
      if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

      source = "var __t,__p='',__j=Array.prototype.join," +
          "print=function(){__p+=__j.call(arguments,'')};\n" +
          source + "return __p;\n";

      return 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
    }

    try {
      return namespace + "['" + filepath + "'] = " + underscoreTemplating(source, templateSettings);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn("JST failed to compile.");
    }
  }