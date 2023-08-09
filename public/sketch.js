let socket;
let xSize = 1280;
let ySize = 720;

let initGame = false;
let startGame = false;

let yPosOther = [{'y': ySize / 2 - 75}];
let ballPosList = [{'x': 50,
					'y': 50}];

let playerCount;
let playerNo;

function setup() {

	createCanvas(xSize, ySize);
	socket = io.connect();
	socket.on('yPosOther', syncOtherPlayer);
	socket.on('ballPos', syncBallPos);
	socket.on('playerNumber', (playerNumber) => {
		playerNo = playerNumber;
	});
}

function syncOtherPlayer(yDataOther) {

	yPosOther.push(yDataOther);
}

function syncBallPos(ballPos) {

	ballPosList.push(ballPos);
}


function draw() {

	background(1, 100);

	socket.on('playerCount', (userCount) => {
		playerCount = userCount;
		if(playerCount == 2) {
			initGame = true;
		}
	});

	if(initGame == true) {

		switch (playerNo) {
			case 1:
				localPlayer = new player1();
				otherPlayer = new player2();

			case 2:
				localPlayer = new player2();
				otherPlayer = new player1();
		}

		Ball = new ball();

		initGame = false;
		startGame = true;
	}

	else if (startGame == true) {

		let yData = {
			y: localPlayer.yPos
		};

		socket.emit('yPos', yData);

		localPlayer.display();
		localPlayer.move();

		otherPlayer.display();
		otherPlayer.yPos = yPosOther[yPosOther.length-1]['y'];

		// mirrors the player position so P1 is left / P2 is right on both clients
		switch (playerNo) {
			case 1:
				localPlayer.xPos = 100;
				otherPlayer.xPos = xSize - 100;
			
			case 2:
		}

		Ball.display();
		Ball.move();
		syncBall(Ball);

		if (playerCount < 2) {
			startGame = false;
		}
	}
}

function syncBall(Ball) {

	if (playerNo == 1) {
		let ballPos = {
			x: Ball.xPos,
			y: Ball.yPos
		}
		socket.emit('ballPos', ballPos);
	}
	if (playerNo == 2) {
		Ball.xPos = ballPosList[ballPosList.length-1]['x'];
		Ball.yPos = ballPosList[ballPosList.length-1]['y'];
	}
}


class player1 {
	constructor() {
		this.xPos = 100;
		this.yPos = ySize/2 - 70;
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

class player2 {
	constructor() {
		this.xPos = xSize - 100;
		this.yPos = ySize/2 - 70;
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



