function(cssSelector, value, callback) {
  var self = this;
  if(typeof cssSelector === 'function' || typeof cssSelector === 'object'){
    return callback(new Error('Error: css selector value is not valid!'));
  }
  if(typeof value === 'function'){
    return callback(new Error("Not a valid value."));
  }

  self.element("css selector", cssSelector, function(err, result) {
      if(err && typeof callback === 'function') return callback(err);
        self.elementIdValue(result.value.ELEMENT, value, function(err, result) {
          if(err && typeof callback === 'function') return callback(err);          
          if (typeof callback === "function") {
            callback(null, result);
          }
        });
    });
}