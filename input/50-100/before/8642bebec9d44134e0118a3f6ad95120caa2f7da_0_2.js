function (socket) {

	sockets.push(socket);

    socket.data('Connecting', function (data) {
      console.log("There are now", sockets.length);

      for(var i=0, l=sockets.length; i<l; i++) {
      	sockets[i].send('Broadcasting', data);
      }
      console.dir(data);
    });

}