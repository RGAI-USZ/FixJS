function(server, err) {
  // Locate all the possible callbacks that need to return
  for(var i = 0; i < server.dbInstances.length; i++) {
    // Fetch the db Instance
    var dbInstance = server.dbInstances[i];
    // Check all callbacks
    var keys = Object.keys(dbInstance._callBackStore._notReplied);
    // For each key check if it's a callback that needs to be returned
    for(var j = 0; j < keys.length; j++) {
      var info = dbInstance._callBackStore._notReplied[keys[j]];
      // Check if we have a chained command (findAndModify)
      if(info && info['chained'] && Array.isArray(info['chained']) && info['chained'].length > 0) {
        var chained = info['chained'];
        // Only callback once and the last one is the right one
        var finalCallback = chained.pop();        
        // console.dir(finalCallback)
        if(info.connection.socketOptions.host === server.host && info.connection.socketOptions.port === server.port) {
          dbInstance._callBackStore.emit(finalCallback, err, null);
        } 
        
        // Put back the final callback to ensure we don't call all commands in the chain
        chained.push(finalCallback);

        // Remove all chained callbacks
        for(var i = 0; i < chained.length; i++) {
          delete dbInstance._callBackStore._notReplied[chained[i]];
        }
      } else {
        if(info && info.connection.socketOptions.host === server.host && info.connection.socketOptions.port === server.port) {
          dbInstance._callBackStore.emit(keys[j], err, null);
        }        
      }            
    }
  }  
}