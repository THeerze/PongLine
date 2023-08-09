
var express = require('express');
var app = express();
var server = app.listen(4000); //Zorgt er voor dat de server op port 4000 gaat runnen als hij aan staat

app.use(express.static('public')); //runt elke file die in de public directory staan

console.log("Server is running");

var socket = require('socket.io');
var io = socket(server);

var userCount = 0;

io.on('connection', (socket) => {
	var userId = socket.id;
	console.log('new connection: ' + userId);
	userCount += 1;
	io.emit('playerCount', userCount);

	socket.on('yPos', yMsg);

	function yMsg(yData) {
		yDataOther = yData;
		socket.broadcast.emit('yPosOther', yDataOther);
	}

	socket.on('disconnect', (socket) => {
		console.log(userId + ' disconnected');
		userCount -= 1;
		io.emit('playerCount', userCount);
		console.log(userCount);
	})
})


// <---Code graveyard--->

// namespaces (rooms) https://socket.io/docs/rooms-and-namespaces/

// const nsp = io.of('/my-namespace');

// nsp.on('connection', function(sockets){
//   console.log('someone connected to');
// });

// nsp.emit('hi', 'everyone!');