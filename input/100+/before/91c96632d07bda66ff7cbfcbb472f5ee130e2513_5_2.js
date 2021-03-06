function(socket, connections) {
  var current_user;
  
  socket.on('getDatabaseState', function(){
    socket.emit('databaseState', {state: mongoose.connection.readyState});
  });
  
  socket.on('register', function(data) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(data.password, salt, function(err, hash) {
        // Store hash in your password DB.
        var user = new User();
        user.username = data.username;
        user.password = hash;
        user.save();
        socket.emit('register_success', {username: user.username});
        current_user = user;
      });
    });
  });

  socket.on('login', function(data){
    User.findOne({username: data.username}, function(err, user) {
      if(user){
        bcrypt.compare(data.password, user.password, function(err, res) {
          if(res === true){
            var exists;
            current_user = user;
            if(connections[user.username] !== undefined){
              exists = true;
            } else {
              exists = false;
            }
            socket.emit('login_success', {username: user.username, exists: exists});
          } else {
            socket.emit('login_error', {message: 'Wrong password'});
          }
        });
      } else {
      }
    });
  });

  socket.on('connect', function(data) {
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
      socket.emit('message', {to:data.target.toLowerCase(), from: connection.client.nick, text:data.message});
      if(current_user){
        connection.logMessage(data.target, {user: connection.client.nick, message: data.message});
      }
    });

    socket.on('action', function(data) {
      connection.client.action(data.target, data.message);
      socket.emit('message', {
        to: data.target.toLowerCase(),
        from: connection.client.nick,
        text: '\u0001ACTION ' + data.message}
      );
    });

    socket.on('topic', function(data){
      connection.client.send('TOPIC ', data.name, data.topic);
    });

    socket.on('nick', function(data){
      connection.client.send('NICK', data.nick);
      connection.client.nick = data.nick;
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
  });
}