let socket;
let xSize = 1280;
let ySize = 720;

let yPosOther = [{ 'y': ySize / 2 - 75 }];
let ballPosList = [{
	'x': 50,
	'y': 50
}];

let playerCount;
let playerNo;

let scoreP1;
let scoreP2;
let winner;

let ping;
let pingStart;

let gameState;

function preload() {
	font = loadFont('content/fonts/astron-boy_rg-regular.otf');
	italic = loadFont('content/fonts/astron-boy_rg-italic.otf');
	cutout = loadFont('content/fonts/astron-boy_wonder-regular.otf');
}

function setup() {

	createCanvas(xSize, ySize);
	socket = io.connect();

	socket.on('yPosOther', (yDataOther) => {
		yPosOther.push(yDataOther);
	});

	socket.on('ballPos', (ballPos) => {
		ballPosList.push(ballPos);
	});

	socket.on('playerNumber', (playerNumber) => {
		playerNo = playerNumber;
	});

	socket.on('scoreP1', (syncedScoreP1) => {
		scoreP1 = syncedScoreP1;
	});

	socket.on('scoreP2', (syncedScoreP2) => {
		scoreP2 = syncedScoreP2;
	});

	checkPing();
}


function draw() {

	background(1, 100);
	noCursor();

	scoreboard = new Scoreboard();
	scoreboard.pingDisplay();

	mouse = new Mouse();


	socket.on('playerCount', (userCount) => {
		playerCount = userCount;
		if (playerCount == 2) {
			gameState = 'end';
			winner = 'p2';
		}
	});

	switch (gameState) {
		case 'menu': {
			textSize(96);
			text('main menu', xSize / 2, ySize / 2);
			mouse.display();
		}

		case 'wait': {
			if (playerCount == 2) {
				gameState = 'init';
			}
		}

		case 'init': {

			switch (playerNo) {
				case 1:
					localPlayer = new player1();
					otherPlayer = new player2();

				case 2:
					localPlayer = new player2();
					otherPlayer = new player1();
			}

			ball = new Ball();

			scoreP1 = 0;
			scoreP2 = 0;

			winner = '';
			gameState = 'start';
		}

		case 'start': {
			let yData = {
				y: localPlayer.yPos
			};

			socket.emit('yPos', yData);

			localPlayer.display();
			localPlayer.move();

			otherPlayer.display();
			otherPlayer.yPos = yPosOther[yPosOther.length - 1]['y'];

			// mirrors the player position so P1 is left / P2 is right on both clients
			switch (playerNo) {
				case 1:
					localPlayer.xPos = 100;
					otherPlayer.xPos = xSize - 100;

				case 2:
			}

			ball.display();
			ball.move();
			playerCollision(ball, localPlayer);
			playerCollision(ball, otherPlayer);

			score(ball);

			syncBall(ball);

			scoreboard.scoreDisplay();

			if (playerCount < 2) {
				gameState = 'wait';
			}
		}

		case 'end': {
			victoryScreen();
			mouse.display();
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
		Ball.xPos = ballPosList[ballPosList.length - 1]['x'];
		Ball.yPos = ballPosList[ballPosList.length - 1]['y'];
	}
}

function playerCollision(Ball, Player) {
	if (Ball.xPos > Player.xPos &&
		Ball.xPos < Player.xPos + Player.width + Ball.radius &&
		Ball.yPos > Player.yPos &&
		Ball.yPos < Player.yPos + Player.height + Ball.radius) {
		Ball.xSpeed = -Ball.xSpeed;
		Ball.ySpeed = random(-9, 9);
	}
}

function score(Ball) {
	if (Ball.xPos <= 0 + Ball.radius) {
		Ball.xSpeed = -Ball.xSpeed;
		scoreP2 += 1;

		switch (playerNo) {
			case 1:
				socket.emit('scoreP1', scoreP1);
			case 2:
		}

		Ball.xPos = xSize / 2;
		Ball.yPos = ySize / 2;

		Ball.xSpeed = 10;
		Ball.ySpeed = 10;
	}

	if (Ball.xPos >= xSize - Ball.radius) {
		Ball.xSpeed = -Ball.xSpeed;
		scoreP1 += 1;

		switch (playerNo) {
			case 1:
			case 2:
				socket.emit('scoreP2', scoreP2);
		}

		Ball.xPos = xSize / 2;
		Ball.yPos = ySize / 2;

		Ball.xSpeed = -10;
		ball.ySpeed = -10;
	}

	if (scoreP1 == 11) {
		winner = 'p1';
		gameState = 'end';
	}

	if (scoreP2 == 11) {
		winner = 'p2';
		gameState = 'end'
	}
}

function checkPing() {
	setInterval(() => {
		pingStart = Date.now();
		socket.emit('send')
	}, 500);

	socket.on('receive', () => {
		ping = Date.now() - pingStart;
		console.log(ping + ' ms');
	});
}

function victoryScreen() {
	switch (winner) {
		case 'p1': {
			textSize(96);
			fill("white");
			text('PLAYER 1 WINS', xSize / 2, ySize / 2);
		}

		case 'p2': {
			textSize(96);
			fill("white");
			text('PLAYER 2 WINS', xSize / 2, ySize / 2);
		}

			button(150, 550, 350, 75, 'rgba(100%, 100%, 100%, 0.85)', 'n', '', 10, 'Quit', 56, 'black', 'n', '', 2, 'menu');
			button(xSize - 150 - 350, 550, 350, 75, 'rgba(100%, 100%, 100%, 0.85)', 'n', '', 10, 'Replay', 56, 'black', 'n', '', 2, 'wait');

	}
}

function button(xPos, yPos, width, height, colour, btnStroke, strokeCol, btnStrokeSize,
	message, textsize, textCol, textStroke, textStrokeCol, textStrokeSize,
	target) {
	if (btnStroke == 'y') {
		strokeWeight(btnStrokeSize);
		stroke(strokeCol);
	}
	if (btnStroke == 'n') {
		noStroke();
	}
	fill(colour);
	rect(xPos, yPos, width, height);


	if (textStroke == 'y') {
		strokeWeight(textStrokeSize);
		stroke(textStrokeCol);
	}
	if (textStroke == 'n') {
		noStroke();
	}
	textSize(textsize);
	fill(textCol);
	textAlign(CENTER, CENTER);
	text(message, xPos + width / 2, yPos + height / 2);

	click(target, xPos, yPos, width, height);
}

function click(target, xPos, yPos, width, height) {

	if (mouseIsPressed &&
		mouseX > xPos &&
		mouseX < xPos + width &&
		mouseY > yPos &&
		mouseY < yPos + height) {
		
		switch (gameState) {
			case 'end': {
				gameState = target;
				console.log(target);
			}
		}
	}

}
class Scoreboard {
	constructor() {
		this.xPos = xSize / 2;
		this.yPos = 0;
		this.width = 350;
		this.height = 100;
	}

	scoreDisplay() {
		noStroke();
		fill("white");
		textSize(56);

		// player 1
		text(scoreP1, xSize / 2 - 100, 75);

		//player 2
		text(scoreP2, xSize / 2 + 100, 75);

	}

	pingDisplay() {
		textSize(12);
		textAlign(CENTER);
		if (ping < 50) {
			fill("gray");
		}
		else if (ping < 100) {
			fill("orange");
		}
		else {
			fill("red");
		}

		text(ping + ' ms', this.xPos, this.yPos + 2 / 3 * this.height);
	}
}

class player1 {
	constructor() {
		this.xPos = 100;
		this.yPos = ySize / 2 - 70;
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
		if (keyIsDown(87) && this.yPos > 0) {
			this.yPos -= this.speed;
		}

		if (keyIsDown(83) && this.yPos < ySize - this.height) {
			this.yPos += this.speed;
		}
	}

}

class player2 {
	constructor() {
		this.xPos = xSize - 100;
		this.yPos = ySize / 2 - 70;
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
		if (keyIsDown(87) && this.yPos > 0) {
			this.yPos -= this.speed;
		}

		if (keyIsDown(83) && this.yPos < ySize - this.height) {
			this.yPos += this.speed;
		}
	}

}


class Ball {
	constructor() {
		this.xPos = xSize / 2;
		this.yPos = ySize / 2;
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

class Mouse {
	display() {
	  fill('white');
	  stroke(2)
	  ellipse(mouseX, mouseY, 10, 10);
	}
  }

