function() {

    var Y = require("yuidocjs");
    var done = this.async();
    var starttime = (new Date()).getTime();
    var json;

    var options = grunt.helper("options", this);

    // when invoking yuidocs via node, the project details
    // are assigned under the options object using the key
    // 'project'
    options.project = this.data;

    grunt.verbose.writeflags(options, "Options");

    // Catch if required fields are not provided.
    if ( !options.paths ) {
      grunt.fail.warn("No path(s) provided for YUIDoc to scan.");
    }
    if ( !options.outdir ) {
      grunt.fail.warn("You must specify a directory for YUIDoc output.");
    }

    // Input path: array expected, but grunt conventions allows for either a string or an array.
    if (kindOf(options.paths) === "string") {
      options.paths = [ options.paths ];
    }

    json = (new Y.YUIDoc(options)).run();

    options = Y.Project.mix(json, options);

    if (!options.parseOnly) {
      var builder = new Y.DocBuilder(options, json);

      grunt.log.writeln("Start YUIDoc compile...");
      grunt.log.writeln("Scanning: " + grunt.log.wordlist(options.paths));
      grunt.log.writeln("Output: " + (options.outdir).cyan);

      builder.compile(function() {
        var endtime = (new Date()).getTime();
        grunt.log.writeln("YUIDoc compile completed in " + ((endtime - starttime) / 1000) + " seconds");
        done();
      });
    }
  }