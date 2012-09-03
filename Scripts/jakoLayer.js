/*
nX...:ms\n

arrays are 
frameTimes = [ frame ] = time
program = [frame [x, y, z ] ] = 1
maxTime = total of all frame durations
*/
function jakoLayer(programString) {

	this.program = new Array();
	this.frameTimes = new Array();
	this.coordTrans = [
		{ n: 'A', x: 0, y: 0 },
		{ n: 'B', x: 1, y: 0 },
		{ n: 'C', x: 2, y: 0 },
		{ n: 'D', x: 3, y: 0 },
		{ n: 'E', x: 4, y: 0 },
		{ n: 'F', x: 4, y: 1 },
		{ n: 'G', x: 3, y: 1 },
		{ n: 'H', x: 2, y: 1 },
		{ n: 'I', x: 1, y: 1 },
		{ n: 'J', x: 0, y: 1 },
		{ n: 'K', x: 0, y: 2 },
		{ n: 'L', x: 1, y: 2 },
		{ n: 'M', x: 2, y: 2 },
		{ n: 'N', x: 3, y: 2 },
		{ n: 'O', x: 4, y: 2 },
		{ n: 'P', x: 4, y: 3 },
		{ n: 'Q', x: 3, y: 3 },
		{ n: 'R', x: 2, y: 3 },
		{ n: 'S', x: 1, y: 3 },
		{ n: 'T', x: 0, y: 3 },
		{ n: 'U', x: 0, y: 4 },
		{ n: 'V', x: 1, y: 4 },
		{ n: 'W', x: 2, y: 4 },
		{ n: 'X', x: 3, y: 4 },
		{ n: 'Y', x: 4, y: 4 } ];
					  

	this.load = function (programString) {
		var frames = programString.split('\n');
		this.maxTime = 0;
		
		for (var frameIndex in frames) {
			var currentFrame = frames[frameIndex];
			var tokens = currentFrame.split(':');
			if (tokens.length > 1) {
				var alphaCoords = tokens[0];
				var elapsedTime = tokens[1];
				this.maxTime += parseInt(elapsedTime);
				this.frameTimes.push(this.maxTime);

				var index = 0;
				while (index + 1 < alphaCoords.length) {
					var layer = alphaCoords.substring(index, index + 1);
					var position = alphaCoords.substring(index + 1, index + 2);
					
					vectorCoords = this.coords(position);
					if ( this.program[frameIndex] == undefined ) 
						this.program[frameIndex] = new Array();

					this.program[frameIndex].push({ x: vectorCoords.y, y: vectorCoords.x, z: layer - 1 });
					console.log('frame: ' + frameIndex + ' x: ' + vectorCoords.x + ' y: ' + layer + ' z: ' + vectorCoords.y);

					index += 2;
				}
			}
		}
	};

	this.coords = function( charCoord ) {
		var result = null;
		for ( var coordIndex in this.coordTrans ) {
			if ( this.coordTrans[coordIndex].n == charCoord ) {
				result = { x: this.coordTrans[coordIndex].x, 
					y: this.coordTrans[coordIndex].y };
				break;
			}
		}
		return result;
	};

	this.whichFrame = function(elapsedTime) {
		var result = -1;
		var adjustedTime = elapsedTime % this.maxTime;

		for (var frameIndex in this.frameTimes) {
			var time = this.frameTimes[frameIndex];
			if (adjustedTime < time) {
				result = frameIndex;
				break;
			} 
		}

		return result;
	}

	this.isOn = function (x, y, z, elapsedTime) {		
		var frame = this.whichFrame(elapsedTime);
		var vecArray = this.program[frame];

		if (vecArray != undefined) {
			for (var iii in vecArray) {
				var vec = vecArray[iii];
				if (vec.x == x
					&& vec.y == y
					&& vec.z == z) {
					return true;
				}
			}
		}

		return false;
	};

	this.load(programString);
}
