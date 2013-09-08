var socket = io.connect('/');
$(document).ready(function(){
	console.log('jquery test : success');
	//Establish a socket conenction with the server for future stuff
	socket.get = function (channel, data, callback) {
		socket.emit(channel, data);
		socket.on(channel+'Success', callback);
	}
	socket.get('test', {}, function(data) {
		console.log('test successful, here\'s the data : ', data);
	})
});