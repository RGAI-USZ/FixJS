function(using, value, cssProperty, callback) {
  var self = this;
  if(typeof using !== 'string'){
    return callback(new Error('Error: css selector value is not valid!'));
  }
  if (typeof value !== 'object') {
    return callback(new Error("Not a valid object"));
  }
  if (typeof cssProperty === 'function'){
    return callback(new Error("Not a valid cssProperty"));
  }

  self.element(using, value, function(err, result) {
    if (err && typeof callback === 'function') return callback(err);
        self.elementIdCssProperty(result.value.ELEMENT, cssProperty, function(err, result) {
          if (err && typeof callback === "function") return callback(err);
            if (typeof callback === 'function') {
              callback(null, result.value);
            }
          });
    });
}