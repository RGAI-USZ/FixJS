function(cssSelector, callback) {
  var self = this;
  if( typeof cssSelector === 'function') {
    return callback(new Error('Error: css selector value is not valid!'));
  }
  self.element("css selector", cssSelector, function(err, result) {
    if (err && typeof callback === "function") return callback(err);
    self.elementIdValue(result.value.ELEMENT, function(err, result) {
      if (err && typeof callback === "function") return callback(err);
      if (typeof callback === "function" && typeof result.value !== "string"){
        return callback(new Error('Element ' + cssSelector + ' value could not be retrieved' ));
      }
      if (typeof callback === "function"){
          callback(null, result.value);
        }
    });
  });
}