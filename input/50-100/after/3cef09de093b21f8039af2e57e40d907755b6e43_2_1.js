function () {
  var context =
  { stencil: require('../../index')
  , resolver: require('../../resolver')
  , compare: require('../compare')
  , fixture: function (file, callback) { fs.readFile(path.resolve(__dirname, file), 'utf8', callback) }
  };
  return context;
}