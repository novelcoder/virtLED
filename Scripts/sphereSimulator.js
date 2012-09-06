///references <script src="textureHandler.js" />
var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var sphereVertexPositionBuffer;
var sphereVertexIndexBuffer;
var sphereTextureCoordBuffer;

var shaderProgram;
var keyDown = new Array();

function initGL(canvas) {
	try {
		gl = WebGLUtils.setupWebGL(canvas);
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function onKeyDown(ev) {
	keyDown[ev.keyCode] = true;
}

function onKeyUp(ev) {
	keyDown[ev.keyCode] = false;
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);


	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {

	var latitudeBands = 30;
	var longitudeBands = 30;
	var radius = 2;

	var vertexPositionData = [];

	var normalData = [];
	var textureCoordData = [];

	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = 1 - (latNumber / latitudeBands);


			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
			textureCoordData.push(u);
			textureCoordData.push(v);

			//console.log("u: " + u + "v: " + v);


			vertexPositionData.push(radius * x);
			vertexPositionData.push(radius * y);
			vertexPositionData.push(radius * z);
		}
	}

	sphereVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	sphereVertexPositionBuffer.itemSize = 3;
	sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;

	sphereTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
	sphereTextureCoordBuffer.itemSize = 2;
	sphereTextureCoordBuffer.numItems = textureCoordData / 2;

	// cube vertex index
	sphereVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
	
	var indexData = [];
	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);

			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}
	
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
	sphereVertexIndexBuffer.itemSize = 1;
	sphereVertexIndexBuffer.numItems = indexData.length;
}

var textureHandler = new textureHandler();
function webGLInit() {
	var canvas = document.getElementById("mainCanvas");
	initGL(canvas);
	initShaders();
	initBuffers();
	textureHandler.init(gl);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
}

var mvMatrixStack = [];
function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

var pitch = 0;
var yaw = 0;
var xPos = 0, yPos = 0, zPos = 90;
var startTime = new Date().getTime();

function drawScene() {

	var timeNow = new Date().getTime();
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 200.0, pMatrix);

	mat4.identity(mvMatrix);

	// rotate for the camera
	mat4.rotate(mvMatrix, toRadians(-pitch), [1, 0, 0]);
	mat4.rotate(mvMatrix, toRadians(-yaw), [0, 1, 0]);
	mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);

	for (var layer = 0; layer < 5; layer++) {
		for (var x = 0; x < 5; x++) {
			for (var y = 0; y < 5; y++) {
				mvPushMatrix();
				mat4.translate(mvMatrix, [(x - 2) * 8, (layer - 2) * -8, (y - 2) * -8]);

			
				mat4.rotate(mvMatrix, toRadians(rotateCubes), [1, 0, 0]);

				gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureCoordBuffer);
				gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.activeTexture(gl.TEXTURE0);
				var color = cubePgm.ledState(x, y, layer, timeNow - startTime);
				switch (color) {
					case 'r':
						gl.bindTexture(gl.TEXTURE_2D, textureHandler.redTexture);
						break;
					case 'g':
						gl.bindTexture(gl.TEXTURE_2D, textureHandler.greenTexture);
						break;
					default: // should always be off
						gl.bindTexture(gl.TEXTURE_2D, textureHandler.offTexture);
						break;
				}
				gl.uniform1i(shaderProgram.samplerUniform, 0);

				var blending = true; // for testing
				if (blending) {
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
					gl.enable(gl.BLEND);
					gl.disable(gl.DEPTH_TEST);
					gl.uniform1f(shaderProgram.alphaUniform, parseFloat(.8));
				} else {
					gl.disable(gl.BLEND);
					gl.enable(gl.DEPTH_TEST);
				}

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
				setMatrixUniforms();
				gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
				mvPopMatrix();
			}
		}
	}
}

function handleKeyDown(elapsedTime) {
	var handled = false;
	var acceleration = elapsedTime / 500;
	if (keyDown[39]) {
		rotateViewLatitude += acceleration;
		rotateViewLatitude = Math.min(rotateViewLatitude, 10);
		handled = true;
	} else if (keyDown[37]) {
		rotateViewLatitude -= acceleration;
		rotateViewLatitude = Math.max(rotateViewLatitude, -10);
		handled = true;
	}

	if (keyDown[38]) {
		rotateViewLongitude += acceleration;
		rotateViewLongitude = Math.min(rotateViewLongitude, 10);
		handled = true;
	} else if (keyDown[40]) {
		rotateViewLongitude -= acceleration;
		rotateViewLongitude = Math.max(rotateViewLongitude, -10);
		handled = true;
	}

	if (keyDown[32]) {
		displayConsole();
	}

	return handled;
}

var displayTimeout = null;
function displayConsole() {
	if (displayTimeout != null) {
		clearTimeout(displayTimeout);
	}

	displayTimeout = setTimeout(function () {
		displayTimeout = null;
		console.log(' rot lat: ' + rotateViewLatitude + ' rot lon: ' + rotateViewLongitude);
		console.log(' lat: ' + degreesViewLatitude + ' lon: ' + degreesViewLongitude);
		console.log(' radius: ' + viewRadius);

	}, 200);
}

var rightButtonDown = false;
function onMouseUp(event) {
	if (event.button == 2) {
		rightButtonDown = false;
		return false;
	}
}
function onMouseDown(event) {
	if (event.button == 2) {
		rightButtonDown = true;
		lastMouseX = event.screenX;
		lastMouseY = event.screenY;
		return false;
	}
	
}

var lastMouseX = 0;
var lastMouseY = 0;
var mouseChangeX = 0;
var mouseChangeY = 0;
function onMouseMove(event) {
	if (rightButtonDown) {
		mouseChangeX += event.screenX - lastMouseX;
		mouseChangeY += event.screenY - lastMouseY;

		lastMouseX = event.screenX;
		lastMouseY = event.screenY;
	}
}

function onMouseWheel(event) {
	var radiusChange = Math.max(1, Math.abs(viewRadius) / 10);
	if (event.wheelDelta > 0) {
		viewRadius -= radiusChange;
	} else if (event.wheelDelta < 0) {
		viewRadius += radiusChange;
	}
}

function addFriction(rotation, amountToDegrade) {
	if (rotation != 0) {
		if (rotation > 0) {
			rotation -= amountToDegrade;
		} else {
			rotation += amountToDegrade;
		}
		if (Math.abs(rotation) < .01) {
			rotation = 0;
		}
	}

	return rotation;
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

var rotateCubes = 0;
var rotateViewLatitude = 0;
var rotateViewLongitude = 0;
var lastTime = 0;
var degreesViewLatitude = 0;
var degreesViewLongitude = 0;
var viewRadius = 90;

function render() {
	window.requestAnimFrame(render);
	var M;
	var timeNow = new Date().getTime();
	var elapsedTime = 0;
	if (lastTime != 0) {
		elapsedTime = timeNow - lastTime;
		rotateCubes += (90 * elapsedTime) / 1000;
		if (rotateCubes > 360) {
			rotateCubes = 0;
		}
	}
	lastTime = timeNow;

	if (!handleKeyDown(elapsedTime)) {
		rotateViewLongitude = addFriction(rotateViewLongitude, elapsedTime / 5000);
		rotateViewLatitude = addFriction(rotateViewLatitude, elapsedTime / 5000);
	}

	degreesViewLongitude += rotateViewLongitude;
	rotateViewLongitude += mouseChangeY / 100;
	mouseChangeY = 0;
	if (degreesViewLongitude < 0) {
		degreesViewLongitude = 0;
		rotateViewLongitude = 0;
	} else if (degreesViewLongitude > 180) {
		degreesViewLongitude = 180;
		rotateViewLongitude = 0;
	}

	degreesViewLatitude += rotateViewLatitude;
	if (degreesViewLongitude > 90) {
		mouseChangeX *= -1;
	}
	rotateViewLatitude += mouseChangeX / 100;
	mouseChangeX = 0;
	if (degreesViewLatitude < 0) {
		degreesViewLatitude = 360;
	} else if (degreesViewLatitude > 360) {
		degreesViewLatitude = 0;
	}

	M = viewRadius * Math.cos(toRadians(degreesViewLongitude));
	xPos = M * Math.cos(toRadians(degreesViewLatitude));
	yPos = viewRadius * Math.sin(toRadians(degreesViewLongitude));
	zPos = M * Math.sin(toRadians(degreesViewLatitude));

	yaw = 90 - degreesViewLatitude;
	pitch = -degreesViewLongitude;

	setTimeout(drawScene(), 50);
}

function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.

	var reader = new FileReader();
	reader.onload = function () {
		cubePgm = new jakoLayer(reader.result);
	};
	reader.readAsText(files[0]);
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// decent registration program
var cubePgm = new jakoLayer("r100g120r140r122r322g504r524g544:500\n");

$().ready(function () {
	webGLInit();
	render();

	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;
	document.onmousewheel = onMouseWheel;
	document.onmousemove = onMouseMove;
	document.onmousedown = onMouseDown;
	document.onmouseup = onMouseUp;
	document.oncontextmenu = window.oncontextmenu = function (event) {
		event.srcElement.id == 'mainCanvas';
		event.preventDefault();
		event.stopPropagation();
		return false;
	};

	//document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);


	// Setup the dnd listeners.
	var dropZone = document.getElementById('dropZone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
});