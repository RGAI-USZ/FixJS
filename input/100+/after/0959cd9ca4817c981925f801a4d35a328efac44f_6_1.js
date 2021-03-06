function(data) {
    var connection;
    if(current_user){
      connection = connections[current_user.username];
    }
    if(connection === undefined) {
      connection = new IRCLink(data.server, data.port, data.secure, data.selfSigned, data.nick, data.realName, data.password, data.rejoin, data.away);
      
      // save this connection
      if(current_user){
        // bind this socket to the proper IRC instance
        connection.associateUser(current_user.username);
        
        var conn = new Connection({ user: current_user.username,
                                    hostname: data.server,
                                    port: data.port || (data.secure ? 6697 : 6667),
                                    ssl: data.secure,
                                    rejoin: data.rejoin,
                                    away: data.away,
                                    realName: data.realName,
                                    selfSigned: data.selfSigned,
                                    channels: data.channels,
                                    nick: data.nick,
                                    password: data.password });
                                    
        conn.save();
        connections[current_user.username] = connection;
      }
    } else {
      socket.emit('restore_connection', {nick: connection.client.nick,
        server: connection.client.opt.server, channels: connection.client.chans});
      connection.clearUnreads();
      
      // set ourselves as not being away
      if (connection.sockets.length == 0)
        connection.client.send('AWAY', '');
    }
    
    // register this socket with our user's IRC connection
    connection.addSocket(socket);
    
    // Socket events sent FROM the front-end
    socket.on('join', function(name) {
      if (name[0] != '#')
        name = '#' + name;
        
      connection.client.join(name);
    });

    socket.on('part_pm', function(name){
      if(connection.clients.chans[name.toLowerCase()] !== undefined){
        delete connection.clients.chans[name.toLowerCase()];
      }
    });

    socket.on('part', function(name) {
      if (name[0] != '#')
        name = '#' + name;
      
      connection.client.part(name);
      if(current_user){
        // update the user's connection / channel list
        Connection.update({ user: current_user.username }, { $pull: { channels: name.toLowerCase() } }, function(err) {});
      }
    });

    socket.on('say', function(data) {
      connection.client.say(data.target, data.message);
      socket.emit('message', {to:data.target.toLowerCase(), from: connection.client.nick.toLowerCase(), text:data.message});
      if(current_user){
        connection.logMessage(data.target, {user: connection.client.nick, message: data.message});
      }
    });

    socket.on('action', function(data) {
      connection.client.action(data.target, data.message);
      socket.emit('message', {
        to: data.target.toLowerCase(),
        from: connection.client.nick.toLowerCase(),
        text: '\u0001ACTION ' + data.message}
      );
    });

    socket.on('topic', function(data){
      connection.client.send('TOPIC ', data.name, data.topic);
    });

    socket.on('nick', function(data){
      connection.client.send('NICK', data.nick);
      connection.client.nick = data.nick.toLowerCase();
      connection.client.opt.nick = client.nick;
    });

    socket.on('command', function(text) {
      connection.client.send(text);
    });

    socket.on('disconnect', function() {
      if(!current_user){
        // not logged in, drop this session
        connection.disconnect();
      } else {
        // keep the session alive, remove this socket, and clear unreads
        connection.removeSocket(socket);
        connection.clearUnreads();
        
        // set ourselves as away
        if (connection.sockets.length == 0)
          connection.client.send('AWAY', connection.away);
      }
    });

    socket.on('getOldMessages', function(data){
      if (current_user) {
        Channel.find({name: data.channelName.toLowerCase(), server: connection.client.opt.server.toLowerCase(), user: current_user.username},
                     {messages: {$slice: [data.skip, data.amount]}},
          function(err, results) {
            if(results){
              if(results[0]){
                results[0]['name'] = data.channelName.toLowerCase();
              }
              socket.emit('oldMessages', results[0]);
            }
        });
      }
    });
  }