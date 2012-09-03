var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;
var shaderProgram;
var keyDown = new Array();

function initGL(canvas) {
	try {
		//gl = canvas.getContext("experimental-webgl");
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

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {

	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = [
      // Front face
      -1.0, -1.0, 1.0,
       1.0, -1.0, 1.0,
       1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
       1.0, 1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0,
      -1.0, 1.0, 1.0,
       1.0, 1.0, 1.0,
       1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0, 1.0, -1.0,
       1.0, 1.0, 1.0,
       1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	// square vertex colors

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	colors = [
      [1.0, 0.0, 0.0, 1.0],     // Front face
      [1.0, 1.0, 0.0, 1.0],     // Back face
      [0.0, 1.0, 0.0, 1.0],     // Top face
      [1.0, 0.5, 0.5, 1.0],     // Bottom face
      [1.0, 0.0, 1.0, 1.0],     // Right face
      [0.0, 0.0, 1.0, 1.0],     // Left face
	];
	var unpackedColors = [];
	for (var i in colors) {
		var color = colors[i];
		for (var j = 0; j < 4; j++) {
			unpackedColors = unpackedColors.concat(color);
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = unpackedColors/4;

	// cube vertex index

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var cubeVertexIndices = [
      0, 1, 2, 0, 2, 3,    // Front face
      4, 5, 6, 4, 6, 7,    // Back face
      8, 9, 10, 8, 10, 11,  // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23  // Left face
	]
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

function webGLInit() {
	var canvas = document.getElementById("mainCanvas");
	initGL(canvas);
	initShaders();
	initBuffers();

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

function drawScene() {
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
				mat4.translate(mvMatrix, [ (x-2) * 8, (layer-2) * -8, (y-2) * -8]);

				if (layer == 2 && x ==2 && y ==2)
					mat4.rotate(mvMatrix, toRadians(-1*rotateCubes), [1, 0, 0]);
				else
					mat4.rotate(mvMatrix, toRadians(rotateCubes), [1, 0, 0]);

				gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
				setMatrixUniforms();
				gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
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
    }
    return false;
}
function onMouseDown(event) {
    if (event.button == 2) {
        rightButtonDown = true;
        lastMouseX = event.screenX;
        lastMouseY = event.screenY;
    }
    return false;
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
    var radiusChange = Math.max( 1, Math.abs(viewRadius) / 10);
    if (event.wheelDelta > 0) {
        viewRadius -= radiusChange;
    } else if ( event.wheelDelta < 0 ) {
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

	if (! handleKeyDown(elapsedTime)) {
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
	pitch =  - degreesViewLongitude;

	/*xPos = 120 * Math.cos(toRadians(degreesViewLatitude));
	zPos = 120 * Math.sin(toRadians(degreesViewLatitude));
	yPos = 0;
	yaw = 90 - degreesViewLatitude; */

	drawScene();
}

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
});