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
					var color = alphaCoords.substring(index, index + 1);
					var layer = alphaCoords.substring(index+1, index + 2);
					var x = alphaCoords.substring(index + 2, index + 3);
					var y = alphaCoords.substring(index + 3, index + 4);
					
					if ( this.program[frameIndex] == undefined ) 
						this.program[frameIndex] = new Array();

					this.program[frameIndex].push({ x: y, y: x, z: layer - 1, color: color });
					//console.log('frame: ' + frameIndex + ' x: ' + vectorCoords.x + ' y: ' + layer + ' z: ' + vectorCoords.y);

					index += 2;
				}
			}
		}
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

	this.ledState = function (x, y, z, elapsedTime) {		
		var frame = this.whichFrame(elapsedTime);
		var vecArray = this.program[frame];
		var result = 'off';

		if (vecArray != undefined) {
			for (var iii in vecArray) {
				var vec = vecArray[iii];
				if (vec.x == x
					&& vec.y == y
					&& vec.z == z) {
					result = vec.color;
				}
			}
		}

		return result;
	};

	this.load(programString);
}
