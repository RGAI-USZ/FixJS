function(cssSelector, waitForMilliseconds, callback) {
  var self = this;
  if (typeof cssSelector === 'function' || typeof cssSelector === 'number'){
    return callback(new Error('Error: css selector value is not valid!'));
  }
  if(typeof waitForMilliseconds === 'function') {
    return callback(new Error('Element ' + waitForMilliseconds + ' is not a valid time amount!'));
  }

  var startTimer = new Date().getTime();
  function checkElement() {
    self.direct.element("css selector", cssSelector, function(err, result) {
        if(err && typeof callback === 'function') return callback(err);

        if(typeof callback === 'function'){
          var now = new Date().getTime(); 
          if (now - startTimer < waitForMilliseconds) {
            setTimeout(checkElement, 500);
          }else if (typeof callback === "function"){
            callback(null, result);
          }
        }
      });
  }
  checkElement();
}