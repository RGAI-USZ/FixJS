function(err, result) {
      if(err && typeof callback == 'function') return callback(err);
        self.doDoubleClick(result.value.ELEMENT, function(err, result) {
            if (typeof callback === "function") {
              callback();
            }
          });
    }