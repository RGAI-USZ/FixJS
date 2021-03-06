function(obj) {
		var xMax = (obj.deadline && typeof obj.deadline === 'number') ? obj.deadline + .5 : undefined,
	        data = [],
	        scores = obj.scores;

		obj.container = (obj.container && obj.container !== '' && obj.container !== 'undefined') ? obj.container : 'body';
		obj.width     = (obj.width && typeof obj.width === 'number') ? obj.width : undefined;
        obj.height    = (obj.height && typeof obj.height === 'number') ? obj.height : undefined;

        // Map scores to a usable format
        for (var i in scores) {
        	if (scores.hasOwnProperty(i)) {
        		console.log(i, scores[i]);
        		data.push({
        			x: i,
        			y: scores[i]
        		});
        	}
        }

        // sort data
        data.sort(function(curr,next) {
        	if (curr.x < next.x) return -1;
        	if (curr.x > next.x) return 1;
        	return 0;
        })

		this.line({
			time: false,
			data: data,
			title: 'Reading Level',
			xlabel: 'Time',
			ylabel: 'DRA Score',
			xMax: xMax,
			yMax: 60,
			xMarker: obj.deadline,
			yMarker: obj.goal,
			container: obj.container,
			width:  obj.width,
			height: obj.height
		});
	}