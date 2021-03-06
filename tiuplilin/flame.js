function Flame() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	var W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	canvas.style.backgroundPosition = Math.round(W/2-290) + "px " + Math.round(H/2 - 198) + "px";
	

	var particles = [];
	var backupParticles = [];
	var mouse = {x: W/2, y:H/2};
	
	var particle_count = 100;
	for(var i = 0; i < particle_count; i++)
	{
		particles.push(new particle());
	}


	function particle()
	{
		this.speed = {x: -2.5+Math.random()*5, y: -12+Math.random()*10};
		if(mouse.x && mouse.y)
		{
			this.location = {x: mouse.x, y: mouse.y};
		}
		else
		{
			this.location = {x: W/2, y: H/2};
		}
		
		this.radius = 20+Math.random()*20;
		
		this.life = 20+Math.random()*10;
		this.remaining_life = this.life;
		
		this.r = Math.round(Math.random()*120);
		this.g = Math.round(Math.random()*40);
		this.b = Math.round(Math.random()*25);
	}
	this.kill = function() {
		backupParticles = particles;
		particles = [];
	}
	this.liveAgain = function() {
		particles = backupParticles;
	}

	this.draw = function()
	{

		ctx.globalCompositeOperation = "source-over";
		// ctx.fillStyle = "transparent";
		ctx.clearRect(0, 0, W, H);
		ctx.globalCompositeOperation = "lighter";

		/*bikin lilin*/
		// ctx.fillStyle = "black";
		// ctx.fillRect(W/2-2, H/2+5, 4, 20);

		// ctx.fillStyle = "#ECE7E3";
		// ctx.fillRect(W/2-20, H/2+20, 40, H/2-50);

		for(var i = 0; i < particles.length; i++)
		{
			var p = particles[i];
			ctx.beginPath();
			
			p.opacity = Math.round(p.remaining_life/p.life*100)/100
			
			var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
			gradient.addColorStop(0, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
			gradient.addColorStop(0.5, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
			gradient.addColorStop(1, "rgba("+p.r+", "+p.g+", "+p.b+", 0)");
			ctx.fillStyle = gradient;
			ctx.arc(p.location.x, p.location.y, p.radius, Math.PI*2, false);
			ctx.fill();

			p.remaining_life--;
			p.radius--;
			p.location.x += p.speed.x;
			p.location.y += p.speed.y;
			
			if(p.remaining_life < 0 || p.radius < 0)
			{
				particles[i] = new particle();
			}
		}
	}
	setInterval(this.draw, 30);
}

var flame;
var isNyala = true;

function init() {
	var info = document.querySelector(".info");

	flame = new Flame();
	isNyala = true;

	socket = io();
	socket.on("connect", function() {
		console.log("connected");
		socket.emit("register server");
	});
	socket.on("register success", function(obj) {
		info.innerHTML = "Open <b>http://bit.ly/tiuplin#" + obj.id + "</b> to blow the candle out";
	});
	socket.on("padamkan", function() {
		console.log("disuruh padam");
		if (isNyala) {			
			flame.kill();
			isNyala = false;
		}
	});
	socket.on("nyalakan", function() {
		console.log("disuruh nyala");
		if (!isNyala) {
			flame.liveAgain();
			isNyala = true;
		}
	});
	socket.on("server disconnect", function() {
		alert("Koneksi terputus");
		info.innerHTML = "Koneksi terputus. Silakan menunggu.";
	});
	socket.on("disconnect", function() {
		alert("Koneksi terputus");
		info.innerHTML = "Koneksi terputus. Silakan menunggu.";
	});
}
window.addEventListener("load", init);