var d = "xD";
var x = 0;
var y = 0;
var dx;
var dy;
var angle = 0;
var count = 20;

function setup() {
	if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		const canvasElt = createCanvas(window.innerWidth/2, window.innerHeight/2).elt;
		canvasElt.style.width = '100%', canvasElt.style.height = '100%';
	} else {
		createCanvas(window.innerWidth, window.innerHeight);
	}
	frameRate(60);
	angleMode(DEGREES);
	dx = random(100000);
	dy = random(100000);
}

function draw() {
	dx += 100;
	dy += 100;
	if (d == "cD") {
		background(255, 0, 0);
		x += (noise(dx) - 0.5)*100;
		y += (noise(dy) - 0.5)*100;
	} else {
		background(255);
	}
	if (count == 20) {
		count = 0;
		d = String.fromCharCode(random(97, 122)) + "D";
		textAlign(CENTER, CENTER);
		angle = random(360);
		if (d == "cD") {
			fill(255, 255, 255);
			background(255, 0, 0);
			textSize(150, 250);
		} else {
			fill(255, 0, 0);
			background(255);
			x = random(200, width - 200);
			y = random(200, height - 200);
			textSize(random(40, 100));
		}
	}
	translate(x, y);
	rotate(angle);
	translate(-x, -y);
	text(d, x, y);
	count++;
}
