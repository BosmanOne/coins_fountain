var container, scene, camera, renderer, controls, stats;
var coinsAnim1, coinsAnim2; // animators
var coinsTexture, coinsGeometry;
var coinsAnimArray = [];
var clock = new THREE.Clock();


init();
animate();

function init() {
	scene = new THREE.Scene();

	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 75, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,0,300);	

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById('ThreeJS');
	container.appendChild(renderer.domElement);

	// MESHES WITH ANIMATED TEXTURES
	coinsTexture = new THREE.TextureLoader().load('images/coins.png');
	coinsTexture.needsUpdate = true;
	coinsTexture.generateMipmaps = false;
	coinsTexture.magFilter = THREE.LinearFilter;
	coinsTexture.minFilter = THREE.LinearFilter;
	coinsGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
}

function animate() {
  setTimeout( function() {
		requestAnimationFrame( animate );
		update();
		render();
	}, 1000 / 60 );

	
}

function update() {
	var delta = clock.getDelta(); 
	
	if (coinsAnimArray.length < 60){
		addCoin();
	}

	for (var coin in coinsAnimArray){
		coinsAnimArray[coin].update(1000 * delta);
	}
}

function render() {
	renderer.render(scene, camera);
}

function coinAnimator(id, texture, tilesHoriz, tilesVert, numTiles, tileDispDuration, vHoriz, vVert) {	
	this.coinId = id;
	
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

	this.tileDisplayDuration = tileDispDuration;
	this.currentDisplayTime = 0;
	this.currentTile = 0;
	
	this.vHoriz = vHoriz;
	this.vVert = vVert;
	
	this.update = function(milliSec){
		var coin = scene.getObjectById(this.coinId, true);
		if (coin == undefined || coin.position.y <= -200 ){
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
		if (vHoriz >= -10){
			this.vHoriz -= milliSec/100;
			this.vHoriz.toFixed(2)
		}
		
		coin.translateY(this.vHoriz*milliSec/15);
		coin.translateX(this.vVert*milliSec/15);

		
	};
}		

function addCoin(){
	var coinTexture = coinsTexture.clone();
	coinTexture.generateMipmaps = false;
	coinTexture.magFilter = THREE.LinearFilter;
	coinTexture.minFilter = THREE.LinearFilter;
	coinTexture.needsUpdate = true;
	var coinMaterial = new THREE.MeshBasicMaterial( { map: coinTexture, side: THREE.DoubleSide, transparent: true } );
	var coin = new THREE.Mesh(coinsGeometry, coinMaterial);
	
	var randomRotationSpeed = (10+(Math.random()*10)).toFixed(1);
	var randomHorizVelocity = (5+(Math.random()*5)).toFixed(1);
	var randomVertVelocity = (-2+(Math.random()*4)).toFixed(1);

	var coinAnim = new coinAnimator(coin.id, coinTexture, 50, 1, 50, randomRotationSpeed, randomHorizVelocity, randomVertVelocity); // id, texture, #horiz, #vert, #total, duration, vHoriz, vVert.
	coinsAnimArray.push(coinAnim);
	coin.position.x = 0;
	coin.position.y = -100;
	scene.add(coin);
}
