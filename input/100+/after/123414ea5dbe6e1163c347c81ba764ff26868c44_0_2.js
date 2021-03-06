function(grunt) {
  var path = require('path');

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('coffee', 'Compile CoffeeScript files', function() {
    var dest = this.file.dest,
        options = this.data.options;
    grunt.file.expandFiles(this.file.src).forEach(function(filepath) {
      grunt.helper('coffee', filepath, dest, options);
    });

    if (grunt.task.current.errorCount) {
      return false;
    }
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('coffee', function(src, destPath, options) {
    var coffee = require('coffee-script'),
        js = '';

    var dest = path.join(destPath,
                         path.basename(src, '.coffee') + '.js');

    options = options || {};
    if( options.bare !== false ) {
      options.bare = true;
    }

    try {
      js = coffee.compile(grunt.file.read(src), options);
    } catch (e) {
      grunt.log.error("Error in " + src + ":\n" + e);
    }
    if (this.errorCount) { return false; }
    grunt.file.write(dest, js);
  });
}