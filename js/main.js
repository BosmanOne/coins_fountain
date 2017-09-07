var container, scene, camera, renderer, controls, stats;
var coinsAnim1, coinsAnim2; // animators
var coinsTexture, coinsGeometry;
var coinsAnimArray = [];
var clock = new THREE.Clock();

//SETTINGS
var numberOfCoins = 60;
var fountainHeight = 12;
var fountainWidthX = 3;
var fountainWidthZ = 0;

init();
animate();

function init() {
	scene = new THREE.Scene();
	
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,0,1000);	
	
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById('ThreeJS');
	container.appendChild(renderer.domElement);

	// MESHES WITH ANIMATED TEXTURES
	coinsTexture = new THREE.TextureLoader().load('images/coins.png');
	coinsTexture.needsUpdate = true;
	coinsGeometry = new THREE.PlaneGeometry(102, 102, 1, 1);
}

function animate() {
	requestAnimationFrame( animate );
	render();
	update();
}

function update() {
	var delta = clock.getDelta(); 
	
	if (coinsAnimArray.length < numberOfCoins){
		addCoin();
	}
	
	for (var coin in coinsAnimArray){
		coinsAnimArray[coin].update(1000 * delta);
	}

}

function render() {
	renderer.render(scene, camera);
}

function coinAnimator(id, texture, tilesHoriz, tilesVert, numTiles, tileDispDuration, vY, vX, vZ) {	
	this.coinId = id;
	
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

	this.tileDisplayDuration = tileDispDuration;
	this.currentDisplayTime = 0;
	this.currentTile = 0;
	
	this.vY = vY;
	this.vX = vX;
	this.vZ = vZ;
	
	this.update = function(milliSec){
		var coin = scene.getObjectById(this.coinId, true);
		if (coin == undefined || coin.position.y <= -300 ){
			scene.remove(coin);
			return;
		}
		
		this.currentDisplayTime += milliSec;
		//Rotating
		while (this.currentDisplayTime > this.tileDisplayDuration){
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
			texture.offset.y = currentRow / this.tilesVertical;
		}
		//Moving
		var acceleration = -0.015;
		if (vY >= -15){
			this.vY += acceleration*milliSec;
			this.vY = parseFloat(this.vY);
			this.vY.toFixed(3);
		}
		coin.translateY(this.vY*milliSec/20);
		coin.translateX(this.vX*milliSec/20);
		coin.translateZ(this.vZ*milliSec/20);
	};
}		

function addCoin(){
	var coinTexture = coinsTexture.clone();
	coinTexture.needsUpdate = true;
	var coinMaterial = new THREE.MeshBasicMaterial( { map: coinTexture, transparent: true } );
	var coin = new THREE.Mesh(coinsGeometry, coinMaterial);
	
	var randomRotationDuration = (5+(Math.random()*20)).toFixed(1);
	var randomYVelocity = (fountainHeight+(Math.random()*0.5*fountainHeight)).toFixed(1);
	var randomXVelocity = (-fountainWidthX+(Math.random()*2*fountainWidthX)).toFixed(1);
	var randomZVelocity = (-fountainWidthZ+(Math.random()*fountainWidthZ)).toFixed(1);
	
	var coinAnim = new coinAnimator(coin.id, coinTexture, 10, 5, 50, randomRotationDuration, randomYVelocity, randomXVelocity, randomZVelocity); // id, texture, #horiz, #vert, #total, duration, velocityX, velocityY, velocityZ
	coinsAnimArray.push(coinAnim);
	coin.position.x = 0;
	coin.position.y = -200;
	scene.add(coin);
}
