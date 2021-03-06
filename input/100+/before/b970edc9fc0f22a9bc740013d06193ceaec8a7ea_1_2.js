function exec() {

  var scriptOpts = {
    version: {
      string: '-v',
      flag: true,
      help: 'AE86 version number',
      callback: function () {
        return JSON.parse(fs.readFileSync(p.join(__dirname, '../package.json'))).version;
      }
    }
  };

  nomnom.scriptName('ae86').opts(scriptOpts);

  nomnom.command('init').callback(function (args) {
    console.log('Initialising project');
    ae86.init(p.join(__dirname, '../examples'), function (err) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      }
      process.exit((err) ? 1 : 0);
    });
  });

  nomnom.command('gen').callback(function (args) {
    console.log('Generating website');
    var prms = require(p.join(process.cwd(), 'params'));
    ae86.gen(prms.params, function (err, result) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      } else {
        console.log('Total of ' + result.length + ' page' +
          ((result.length > 1) ? 's' : ''));
      }
      process.exit((err) ? 1 : 0);
    });
  });

  nomnom.command('watch').callback(function (args) {
    console.log('Watching project');
    var prms = require(p.join(process.cwd(), 'params'));
    ae86.watch(function listener() {
      console.log('Change detected. Regenerating website');
      ae86.gen(prms.params, function (err, result) {
      });
    });
  });

  nomnom.command('').callback(function (args) {
    console.log(nomnom.getUsage());
  });
  
  nomnom.parseArgs();
}