function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        '------------------------------\n' +
        'Build @ <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        'Documentation and Full License Available at:\n' +
        '<%= pkg.homepage %>\n' +
        '<%= pkg.repository.url %>\n' +
        'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n\n' +
        'Permission is hereby granted, free of charge, to any person obtaining a\n' +
        'copy of this software and associated documentation files (the "Software"),\n' +
        'to deal in the Software without restriction, including without limitation\n' +
        'the rights to use, copy, modify, merge, publish, distribute, sublicense,\n' +
        'and/or sell copies of the Software, and to permit persons to whom the\n\n' +
        'Software is furnished to do so, subject to the following conditions:\n' +
        'The above copyright notice and this permission notice shall be included in\n' +
        'all copies or substantial portions of the Software.\n\n' +
        'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,\n' +
        'EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' + 
        'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n' +
        'IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n' +
        'DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,\n' +
        'ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS\n' +
        'IN THE SOFTWARE.*/'
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.main %>>'],
        dest: '<%= pkg.name.toLowerCase() %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: '<%= pkg.name.toLowerCase() %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        nomen: false
      },
      globals: {}
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');
  grunt.registerTask('travis', 'qunit lint');

}