
var express = require('express');
var app = express();
var server = app.listen(4000); //Zorgt er voor dat de server op port 4000 gaat runnen als hij aan staat

app.use(express.static('public')); //runt elke file die in de public directory staan

console.log("Server is running");

var socket = require('socket.io');
var io = socket(server);


io.sockets.on('connection', newConnection);

function newConnection(socket) {
	console.log('new connection: ' + socket.id);

	socket.on('yPos', yMsg);

	function yMsg(yData) {
		socket.broadcast.emit('yPos', yData);
	}
}

// namespaces (rooms) https://socket.io/docs/rooms-and-namespaces/

// const nsp = io.of('/my-namespace');

// nsp.on('connection', function(sockets){
//   console.log('someone connected to');
// });

// nsp.emit('hi', 'everyone!');