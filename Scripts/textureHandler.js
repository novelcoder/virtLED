

function textureHandler() {
	this.sphereOnTexture = null;
	this.sphereOffTexture = null;

	this.init = function (gl) {
		var handler = this;
		this.sphereOffTexture = gl.createTexture();
		this.sphereOffTexture.image = new Image();
		this.sphereOffTexture.image.onload = function () {
			handler.handleLoadedTexture(gl, handler.sphereOffTexture)
		}

		this.sphereOffTexture.image.src = "images\\nehe.gif";

		this.sphereOnTexture = gl.createTexture();
		this.sphereOnTexture.image = new Image();
		this.sphereOnTexture.image.onload = function () {
			handler.handleLoadedTexture(gl, handler.sphereOnTexture)
		}

		this.sphereOnTexture.image.src = "images\\purple.gif";
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