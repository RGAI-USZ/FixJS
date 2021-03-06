function(data) {
    var client;
    if(current_user){
      client = clients[current_user.username];
    }
    if(client === undefined) {
      client = new irc.Client(data.server, data.nick, {
        port: data.port || (data.secure ? 6697 : 6667),
        password: data.password,
        secure: data.secure,
        selfSigned: data.selfSigned,
        debug: true,
        logged_in: false,
        showErrors: true,
        channels: data.channels,
        userName: 'subway',
        realName: 'Subway IRC client'
      });

      if(current_user){
        clients[current_user.username] = client;
      }
    } else {
      socket.emit('restore_connection', {nick: client.nick,
        server: client.opt.server, channels: client.chans});
      clear_unreads(client.chans);
    }

    // Socket events sent FROM the front-end
    socket.on('join', function(name) {
      client.join(name);
    });

    socket.on('part_pm', function(name){
      if(client.chans[name] !== undefined){
        delete client.chans[name];
        console.log(name);
      }
    });

    socket.on('part', function(name) {
      client.part(name);
      if(current_user){
        if(logger_users[name] == current_user.username){
          delete logger_users[name];
          for(client_key in clients){
            if(client_key == current_user.username){
              continue;
            }
            var cl = clients[client_key];
            // This does not work cl.chans is an object
            // need to do logic for channel
            if(cl.chans[name.toLowerCase()] !== undefined){
              logger_users[name.toLowerCase()] = cl.nick;
            }
          }
        }
      }
    });

    socket.on('say', function(data) {
      client.say(data.target, data.message);
      socket.emit('message', {to:data.target, from: client.nick, text:data.message});
      if(current_user){
        if(logger_users[data.target] == current_user.username) {
          log_message(data.target, {user: client.nick, message: data.message});
        }
        if(data.target[0] !== '#'){
          var target;
          target = (client.nick == data.to) ? client.nick : data.target;
          logname = (client.nick < target) ? client.nick + target : target + client.nick;
          log_message(logname, {user: client.nick, message: data.message});
        }
      }
    });

    socket.on('action', function(data) {
      client.action(data.target, data.message);
      socket.emit('message', {
        to: data.target,
        from: client.nick,
        text: '\u0001ACTION ' + data.message}
      );
    });

    socket.on('topic', function(data){
      client.send('TOPIC ' + data.name + ' ' + data.topic);
    });

    socket.on('nick', function(data){
      client.send('NICK ' + data.nick);
      client.nick = data.nick;
      client.opt.nick = data.nick;
    });

    socket.on('command', function(text) { console.log(text); client.send(text); });

    socket.on('disconnect', function() {
      if(!current_user){
        client.disconnect();
      } else {
        clear_unreads(client.chans);
      }
    });

    socket.on('getOldMessages', function(data){
      Channel.find({name: data.channelName},
                   {messages: {$slice: [data.skip, data.amount]}},
        function(err, results) {
          if(results){
            if(results[0]){
              if(data.channelName[0] == '#'){
                results[0]['name'] = data.channelName;
              } else {
                results[0]['name'] = data.channelName.replace(client.nick, '');
              }
            }
            socket.emit('oldMessages', results[0]);
          }
      });
    });

    // Add a listener on client for the given event & argument names
    var activateListener = function(event, argNames) {
      //remove duplicate events
      client.listeners(event).forEach(function(item){
        client.removeListener(event, item);
      });
      client.addListener(event, function() {
        console.log('Event ' + event + ' sent');
        // Associate specified names with callback arguments
        // to avoid getting tripped up on the other side
        var callbackArgs = arguments;
        args = {};
        argNames.forEach(function(arg, index) {
            args[arg] = callbackArgs[index];
        });
        console.log(args);
        socket.emit(event, args);

        // This is the logic on what to do on a recieved message
        if(event == 'message'){
          if(current_user){
            var client = clients[current_user.username];
            if(logger_users[args.to] == current_user.username) {
              log_message(args.to, {user: args.from, message: args.text});
            }
            if(args.to[0] !== '#'){
              var target;
              target = (client.nick == args.from) ? args.to : args.from;
              logname = (client.nick < target) ? client.nick + target : target + client.nick;

            }
            if(socket.disconnected){
              var channel;
              if(args.to[0] !== '#'){
                if(client.chans[args.from] === undefined){
                  client.chans[args.from] = {serverName: args.from,
                    unread_messages: 0, unread_mentions: 0};
                }
                channel = client.chans[args.from];
                log_message(logname, {user: args.from, message: args.text});
              } else {
                channel = client.chans[args.to];
              }
              channel.unread_messages = channel.unread_messages+1;

              var re = new RegExp('\\b' + client.nick + '\\b', 'g');
              if(re.test(args.text)){
                channel.unread_mentions = channel.unread_mentions+1;
              }
            }
          }
        }

        // This is the logic to assign a user to log messages on join
        if(event == 'join') {
          if(current_user){
            if(!logger_users.hasOwnProperty(args.channel)){
              logger_users[args.channel] = current_user.username;
            }
          }
        }

      });
    };

    for (var event in events) { activateListener(event, events[event]); }
    console.log('Starting IRC client; wiring up socket events.');
  }