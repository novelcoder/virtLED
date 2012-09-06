

function textureHandler() {
	this.redTexture = null;
	this.offTexture = null;
	this.greenTexture = null;

	this.init = function (gl) {
		var handler = this;
		this.offTexture = gl.createTexture();
		this.offTexture.image = new Image();
		this.offTexture.image.onload = function () {
			handler.handleLoadedTexture(gl, handler.offTexture)
		}

		this.offTexture.image.src = "images\\nehe.gif";

		this.redTexture = gl.createTexture();
		this.redTexture.image = new Image();
		this.redTexture.image.onload = function () {
			handler.handleLoadedTexture(gl, handler.redTexture)
		}

		this.redTexture.image.src = "images\\purple.gif";

		this.greenTexture = gl.createTexture();
		this.greenTexture.image = new Image();
		this.greenTexture.image.onload = function () {
			handler.handleLoadedTexture(gl, handler.greenTexture)
		}

		this.greenTexture.image.src = "images\\green.gif";
		
	}

	this.handleLoadedTexture = function(gl, texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}