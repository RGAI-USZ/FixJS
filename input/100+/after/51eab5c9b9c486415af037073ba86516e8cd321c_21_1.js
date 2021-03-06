function(cssSelector, callback) {
  var self = this;
  if(typeof cssSelector === 'function'){
    return callback(new Error('Error: css selector value is not valid!'));
  }

  self.element("css selector", cssSelector, function(err, result) {
      if (err && typeof callback === "function") return callback(err);
    self.moveTo(result.value.ELEMENT, function(err, result) {
        if (err && typeof callback === "function") {
          return callback(err);
        }else {
          callback(null, result);
      }
    });
  });
}