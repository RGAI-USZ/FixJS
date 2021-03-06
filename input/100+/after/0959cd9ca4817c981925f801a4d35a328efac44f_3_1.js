function(hostname, port, ssl, selfSigned, nick, realName, password, rejoin, away, channels) {
  this.sockets = new Array();
  this.server = hostname;
  
  if (away === undefined || away == '')
    this.away = 'AFK';
  else
    this.away = away;
  
  if (channels === undefined || !rejoin)
    var channels = new Array();
  
  this.client = new irc.Client(hostname, nick, {
    userName: nick,
    realName: realName,
    port: port || (ssl ? 6697 : 6667),
    debug: false,
    showErrors: false,
    autoRejoin: true,
    autoConnect: true,
    channels: channels,
    password: password,
    secure: ssl,
    selfSigned: selfSigned,
    certExpired: false,
    floodProtection: false,
    floodProtectionDelay: 1000,
    stripColors: true
  });
  
  // Events to signal TO the front-end
  this.events = {
    'join': ['channel', 'nick'],
    'part': ['channel', 'nick'],
    'quit': ['nick', 'reason', 'channels', 'message'],
    'topic': ['channel', 'topic', 'nick'],
    'nick': ['oldNick', 'newNick', 'channels'],
    'names': ['channel', 'nicks'],
    'message': ['from', 'to', 'text'],
    '+mode': ['channel', 'by', 'mode', 'argument', 'message'],
    '-mode': ['channel', 'by', 'mode', 'argument', 'message'],
    'notice': ['nick', 'to', 'text', 'message'],
    'pm': ['nick', 'text'],
    'registered': ['message'],
    'motd': ['motd'],
    'error': ['message'],
    'netError': ['message']
  };
  
  // store the instance
  var instance = this;
  
  // Add a listener on client for the given event & argument names
  this.activateListener = function(event, argNames) {
    instance.client.addListener(event, function() {
      // Associate specified names with callback arguments
      var callbackArgs = arguments;
      var args = {};
      argNames.forEach(function(arg, index) {
        args[arg] = callbackArgs[index];
      });
      
      // loop through all sockets and emit events
      for (var i = 0; i < instance.sockets.length; i++) {
          instance.sockets[i].emit(event, args);
      }
      
      // This is the logic on what to do on a recieved message
      if(event == 'message'){
        if(instance.username){
          var target;
          if (args.to[0] != '#')
            target = args.from.toLowerCase();
          else
            target = args.to.toLowerCase();
            
          // log this message
          instance.logMessage(target, {user: args.from, message: args.text});
          
          if(instance.sockets.length == 0){
            instance.client.chans[target].unread_messages++;
            
            var re = new RegExp('\\b' + nick.toLowerCase() + '\\b', 'g');
            if(re.test(args.text.toLowerCase())){
              instance.client.chans[target].unread_mentions++;
            }
          }
        }
      }
      
      // This is the logic to assign a user to log messages on join
      if(event == 'join') {
        var target = args.channel.toLowerCase();
        
        if(instance.client.chans[target] === undefined)
          instance.client.chans[target] = {serverName: target, unread_messages: 0, unread_mentions: 0};
        
        if(instance.username && rejoin){
          // update the user's channel list
          Connection.update({ user: instance.username }, { $addToSet: { channels: target } }, function(err) {});
        }
      }
    });
  };

  for (var event in this.events) {
    this.activateListener(event, this.events[event]);
  }
}