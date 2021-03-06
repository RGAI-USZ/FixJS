function(using, value, callback) {
  var self = this;
  if(typeof using !== 'string'){
    return callback(new Error('Error: css selector value is not valid!'));
  }
  if (typeof value === 'function') {
    return callback(new Error("Not a valid object"));
  }
  self.element(using, value, function(err, result) {
    if (err && typeof callback === "function") return callback(err);
        self.elementIdSize(result.value.ELEMENT, function(err, result) {
            if (typeof callback === "function") {
              callback(null, result.value);
            }
          });
    });
}