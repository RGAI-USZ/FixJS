function create(name, type, callback) {
  type = type || 'http';

  var root = path.join(process.cwd(), name),
      scaffold = path.join(__dirname, '..', '..', '..', 'scaffolds', type),
      info = {};

  if (!path.existsSync(scaffold)) {
    app.log.error('Scaffold named ' + type.yellow + ' does not exist');
    return callback();
  }

  //
  // Prompts user for details about their app to put in `package.json`.
  //
  function prompt (next) {
    var fields = ['name', 'author', 'description', 'homepage'];
    app.prompt.override = {name: name};
    app.prompt.start();
    app.prompt.addProperties(info, fields, next);
  }

  //
  // Creates directories specified in `/scaffolds/:type/directories.json`.
  //
  function createDirs(next) {
    var dirs = common.directories.normalize(
      common.mixin({}, flatiron.constants.DIRECTORIES, { '#ROOT': root }),
      JSON.parse(fs.readFileSync(path.join(scaffold, 'directories.json'), 'utf8'))
    );

    Object.keys(dirs).forEach(function (name) {
      app.log.info('Creating directory ' + name.grey);
    });

    common.directories.create(dirs, next);
  }

  //
  // Creates files specified in `/scaffolds/:type/files.json`.
  //
  function createFiles(next) {
    var files = common.directories.normalize(
      common.mixin({}, flatiron.constants.DIRECTORIES, { '#ROOT': root }),
      JSON.parse(fs.readFileSync(path.join(scaffold, 'files.json'), 'utf8'))
    );

    function copyFile(file, nextFile) {
      app.log.info('Writing file ' + file.grey);
      common.cpr(path.join(scaffold, file), files[file], nextFile);
    }

    common.async.mapSeries(Object.keys(files), copyFile, next);
  }

  //
  // Creates a templated package.json from `/scaffolds/:type/package.json`.
  //
  function createPackage(next) {
    var pkg = JSON.parse(fs.readFileSync(path.join(scaffold, 'package.json'), 'utf8'));

    pkg.dependencies.flatiron = flatiron.version;

    flatiron.common.mixin(pkg, info);

    app.log.info('Writing ' + 'package.json'.grey);
    fs.writeFile(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2) + '\n', next);
  }

  app.log.info('Creating application ' + (name ? name.magenta : ''));
  app.log.info('Using ' + type.yellow + ' scaffold.');
  common.async.series([
    prompt,
    createDirs,
    createPackage,
    createFiles
  ], function onComplete(next) {
      app.log.info('Application ' + info.name.magenta + ' is now ready');
      callback();
    }
  );
}