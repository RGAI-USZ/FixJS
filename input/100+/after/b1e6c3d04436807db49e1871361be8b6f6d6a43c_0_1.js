function() {
  var copy, fs, fse, key, mkdir, path, remove, val;

  fs = require('fs');

  path = require('path');

  fse = {};

  for (key in fs) {
    val = fs[key];
    if (typeof val === 'function') {
      fse[key] = val;
    }
  }

  fs = fse;

  copy = require('./copy');

  fs.copy = copy.copy;

  remove = require('./remove');

  fs.remove = remove.remove;

  fs.removeSync = remove.removeSync;

  fs["delete"] = fs.remove;

  fs.deleteSync = fs.removeSync;

  mkdir = require('./mkdir');

  fs.mkdir = mkdir.mkdir;

  fs.mkdirSync = mkdir.mkdirSync;

  if (!(fs.exists != null)) {
    fs.exists = path.exists;
  }

  if (!(fs.existsSync != null)) {
    fs.existsSync = path.existsSync;
  }

  module.exports = fs;

}