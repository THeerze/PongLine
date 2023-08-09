//const sockets = io('/my-namespace');

let socket;
let xSize = 1280;
let ySize = 720;
let Player1;
let Player2;
let Ball;

let initGame = false;
let startGame = false;

let yPosPlayer2 = [{'y': 0}];

function setup() {
	createCanvas(xSize, ySize);
	socket = io.connect();
	socket.on('yPosOther', drawPlayer2);
}

function drawPlayer2(yDataOther) {
	console.log(yDataOther.y);

	setInterval(() => {
		yPosPlayer2.push(yDataOther);
	}, 17);
}


function draw() {
	background(1, 100);

	socket.on('playerCount', (userCount) => {
		if(userCount == 2) {
			console.log("users: " + userCount);
			initGame = true;
		}
	});

	if(initGame == true) {
		Player1 = new player1();
		Ball = new ball();
		Player2 = new player1();

		initGame = false;
		startGame = true;
		timeout = true;
	}

	else if (startGame == true) {

		let yData = {
			y: Player1.yPos
		}

		socket.emit('yPos', yData);
	
		Player1.display();
		Player1.move();

		Player2.display();
		Player2.xPos = xSize - 100;
		Player2.yPos = yPosPlayer2[yPosPlayer2.length-1]['y'];
		console.log(yPosPlayer2);

		Ball.display();
		Ball.move();
	}
}


class player1 {
	constructor() {
		this.xPos = 100;
		this.yPos = ySize/2 - 75;
		this.width = 20;
		this.height = 140;
		this.speed = 10;
	}

	display() {
		noStroke();
		fill("white");
		rect(this.xPos, this.yPos, this.width, this.height);
	}

	move() {
		if(keyIsDown(87) && this.yPos > 0) {
			this.yPos -= this.speed;
		}

		if(keyIsDown(83) && this.yPos < ySize - this.height) {
			this.yPos += this.speed;
		}
	}

}


class ball {
	constructor() {
		this.xPos = xSize/2;
		this.yPos = ySize/2;
		this.radius = 20;
		this.xSpeed = 10;
		this.ySpeed = 10;
	}

	display() {
		noStroke();
		fill("white");
		ellipse(this.xPos, this.yPos, this.radius, this.radius);
	}

	move() {
   		if (this.xPos > width - this.radius || this.xPos < this.radius) {
      		this.xSpeed = -this.xSpeed;
    	}

    	if (this.yPos > height - this.radius || this.yPos < this.radius) {
      		this.ySpeed = -this.ySpeed;
    	}

   		 this.xPos += this.xSpeed;
    	 this.yPos += this.ySpeed;
  	}
}



