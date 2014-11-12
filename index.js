var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var inmo_template	= require('./inmo_template.js')(app);

app.use('/tiuplilin', express.static(__dirname + '/tiuplilin'));

app.get("/", function(req, res) {
	app.set("view engine", "html");
	res.render(__dirname + "/tiuplilin/index.html", {url: "bit.ly/pongmo1"});
});

/*SOCKET*/
var isNyala = true;
io.on("connection", function(socket) {
	
	socket.on("ambilposisi", function() {
		if (!isNyala) {
			socket.emit("padamkan");
		}
	});
	socket.on("padamkan", function() {
		isNyala = false;
		socket.broadcast.emit('padamkan');
	});
	socket.on("nyalakan", function() {
		isNyala = true;
		socket.broadcast.emit('nyalakan');
	});
});

// app.get("/control", function(req, res) {
// 	res.sendFile(__dirname + "/pong/control/index.html");
// });

// app.get("/pong/scss/:file", function(req, res) {
// 	app.set("view engine", "scss");
// 	res.type("css");
// 	res.render(__dirname + "/pong/scss/" + req.params.file);
// });

http.listen(80, function() {
	console.log("listen to 80");
});