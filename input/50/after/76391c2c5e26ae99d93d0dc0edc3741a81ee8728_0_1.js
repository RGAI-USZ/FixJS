function(Networker, SocketIO) {



	function Client(location) {

		this.socket = SocketIO.connect(location);

		this.networker = new Networker(this.socket);

	}



	return Client;

	

}