var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var inmo_template	= require('./inmo_template.js')(app);

app.use('/tiuplilin', express.static(__dirname + '/tiuplilin'));
app.use('/control', express.static(__dirname + '/control'));

app.get("/", function(req, res) {
	app.set("view engine", "html");
	res.render(__dirname + "/tiuplilin/index.html");
});

/*SOCKET*/
var arId = [];
var isNyalaObj = {};
io.on("connection", function(socket) {
	var isServer = false;
	var id = "";
	
	socket.on("register server", function() {
		id = makeid(3);
		console.log("register server", id);
		socket.emit("register success", {id:id});

		socket.join(id);
		arId.push(id);
		isServer = true;
		isNyalaObj[id] = true;
	});
	socket.on("register client", function(sid) {
		if (arId.indexOf(sid) >= 0) {
			id = sid;
			socket.join(id);
			socket.emit("register success", {id: id, isNyala: isNyalaObj[id]});
			console.log("client masuk berhasil", sid);
		} else {
			socket.emit("register fail", "tidak ada lilin dengan id " + id.toString() + ", periksa kembali URL");
			console.log("client masuk gagal", sid);
		}
	});
	socket.on("disconnect", function() {
		if ((id != "") && isServer) { //berarti server
			io.to(id).emit("server disconnect");
			if (arId.indexOf(id) >= 0) {
				arId.splice(arId.indexOf(id), 1);
				console.log("splice server", id)
			}
		}
	});
	socket.on("padamkan", function() {
		isNyalaObj[id] = false;
		io.to(id).emit("padamkan");
		// socket.broadcast.emit('padamkan');
	});
	socket.on("nyalakan", function() {
		isNyalaObj[id] = true;
		io.to(id).emit("nyalakan");
		// socket.broadcast.emit('nyalakan');
	});
});

function makeid(num) {
	num = num || 5;
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz23456780";

	for( var i=0; i < num; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}	

	return text;
}

http.listen(3000, function() {
	console.log("listen to 3000");
});