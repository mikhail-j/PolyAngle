var canvas2 = document.getElementById("canvas_area_2");
var ctx2 = canvas2.getContext("2d");

var circle_radius = null;
var large_radius = null;
var num_vertices = null;

var radiusDamage = false;

var central_angle = 0.0;		//zero radians

var vertexAngles = [];			//central angles

var edgeLengths = [];

canvas.addEventListener("mouseup", handle_ctx_mouse_event_ctx2);

function handleAnchor () {				//delay this function
	anchorMoved.pop();
}

function computeEdgeLengths() {
	edgeLengths = [];
	if (PV.length > 2) {
		for (var i = 1; i < PV.length; i++) {
			edgeLengths.push(norm_vec2(PV[i].x, PV[i-1].x, PV[i].y, PV[i-1].y));
		}
		edgeLengths.push(norm_vec2(PV[0].x, PV[PV.length - 1].x, PV[0].y, PV[PV.length - 1].y));
	}
}

function getLargestDistance() {		//whether it is a edge or a diagonal
	var largest = null;
	for (var i = 0; i < PV.length; i++) {
		for (var j = 0; j < PV.length; j++) {
			if (i !== j) {
				var current_dist = magnitude_vec2(new AnchorPoint(PV[i].x - PV[j].x, PV[i].y - PV[j].y));
				if (largest === null) {
					largest = current_dist;
				}
				else if (current_dist > largest) {
					largest = current_dist;
				}
			}
		}
	}
	return largest;				//this will be the upper bound on the radius of a circle
}

function computeCircumscribedTriangle() {
	//computeEdgeLengths();
	var a = edgeLengths[0];
	var b = edgeLengths[1];
	var c = edgeLengths[2];
	var circumradius = (a*b*c)/Math.sqrt((a+b+c)*(-a+b+c)*(a-b+c)*(a+b-c));	//half of circumdiameter
	var angle_A = Math.acos(((a*a)-((b*b)+(c*c)))/(-2*b*c));
	var angle_B = Math.acos(((b*b)-((a*a)+(c*c)))/(-2*a*c));
	var angle_C = Math.acos(((c*c)-((b*b)+(a*a)))/(-2*a*b));
	var total = 0.0;
	vertexAngles = [];
	vertexAngles.push(total);
	total = total + (2 * angle_A);
	vertexAngles.push(total);
	total = total + (2 * angle_B);
	vertexAngles.push(total);
	total = total + (2 * angle_C);
	vertexAngles.push(total);
	circle_radius = circumradius;
}

function handle_ctx_mouse_event_ctx2(event) {
	if (event.offsetY > 60 && anchorMoved.length > 0) {
		var new_radius = getLargestDistance();
		radiusDamage = true;
		if (large_radius === null) {
			num_vertices = PV.length;
			//large_radius = getLargestDistance();
			large_radius = new_radius * .5;
			circle_radius = large_radius;
		}
		else if (num_vertices !== PV.length) {
			large_radius = new_radius * .5;
			circle_radius = large_radius;
			num_vertices = PV.length;
		}
		console.log("attempt to minimize!");
		setTimeout(minimizeCircle, 500);
		handleAnchor();
	}
}

function getMax(an_array) {
	if (an_array.length === 0) {
		return null;
	}
	else {
		var max_val = an_array[0];
		for (var i = 1; i < an_array.length; i++) {
			max_val = Math.max(max_val, an_array[i]);
		}
		return max_val;
	}
}

function norm_vec2(ax, bx, ay, by) {
	return Math.sqrt(((ax - bx) * (ax - bx)) + ((ay - by) * (ay - by)))
}

function computeCentralAngle(cr, v0, v1) {
	var edge_dist = norm_vec2(v0.x, v1.x, v0.y, v1.y);		//original points selected with mouse clicks
	var edge_angle;
	edge_angle = Math.acos((((2 * cr * cr) - (edge_dist * edge_dist))/(2*cr))/cr);
	//console.log("edge angle: " + edge_angle + " edge length: " + edge_dist);
	return edge_angle;
}

function dynamicCircleApproximation() {
	//incrementEdge()
	circle_radius = .5 * getMax(edgeLengths);	//the circle needs to contain the edge, otherwise the circle is too small

	var stepsize = .01;
	var negative = -1;			//start the approximation by increasing the radius
	var angle_configuration;
	var best_diff = null;

	angle_configuration = checkPossibleAngleConfigurations();	//compute the best of 2^(n sides) combinations
	var counter = 0;
	if (angle_configuration.sum !== NaN) {
		best_diff = Math.abs((2 * Math.PI) - angle_configuration.sum);
	}
	//while ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.01) && circle_radius > 1 && counter < 10000) {	//counter over 10000 is basically infinite loopwhile ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.01) && circle_radius > 1) {	//counter over 10000 is basically infinite loop
	while (circle_radius > 1 && counter < 15000) {	//counter over 15000 is basically infinite loop
		circle_radius = circle_radius - (stepsize * negative);
		angle_configuration = checkPossibleAngleConfigurations();
		if (angle_configuration.sum !== NaN) {
			var new_diff = Math.abs((2 * Math.PI) - angle_configuration.sum);
			if (best_diff === null) {
				best_diff = new_diff;
			}
			else if (best_diff > new_diff) {
				best_diff = new_diff;
			}
			else if (best_diff < new_diff) {
				negative = -negative;
				stepsize = stepsize * .75;
			}
		}

		setAngleConfiguration(angle_configuration);
		//console.log("angle missing: " + best_diff + " radius: " + circle_radius + " config: " + angle_configuration.config);
		counter = counter + 1;
		if ((Math.abs((2 * Math.PI) - angle_configuration.sum) < 0.000001)) {
			break;
		}
	}
	console.log("out of loop! radius: " + circle_radius + " counter: " + counter);
}

function minimizeCircle() {
	renderSecondCtxFigure();

	computeEdgeLengths();
	//if (radiusDamage && PV.length > 2) {
	if (radiusDamage) {

		if (PV.length <= 2) {
			central_angle = 0;
			radiusDamage = false;
		}
		else if (PV.length === 3) {
			//incrementEdge();
			//while ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.11 || ((2 * Math.PI) - getMax(vertexAngles)) < 0) && circle_radius > 2) {
			computeCircumscribedTriangle();
			renderSecondCtxFigure();
			radiusDamage = false;
		}
		else {
			dynamicCircleApproximation();
			renderSecondCtxFigure();
			radiusDamage = false;
		}
	}
}

function getCentralAngles() {		//(2*pi) - angle[i] should yield other possible central angle
	var angles = [];		//this should contain n elements used to compute 2^(n sides) combinations
	for (var i = 1; i < PV.length; i++) {
		var edge_angle = computeCentralAngle(circle_radius, PV[i], PV[i-1]);
		angles.push(edge_angle);
	}
	var edge_angle = computeCentralAngle(circle_radius, PV[0], PV[PV.length - 1]);
	angles.push(edge_angle);
	//console.log("angles: " + angles);
	return angles;
}

function AngleConfig(angle_array) {
	this.angle = angle_array;
	this.sum = null;
	this.config = null;			//should refect whether edge was theta or (2 * pi) - theta in a string form
}

function checkPossibleAngleConfigurations() {
	var radians = getCentralAngles();
	var solution = new AngleConfig(radians);

	sumAngles(radians, -1, 0.0, solution, "");		//solution.config will have incorrect configurations if NaN occurs from edges that don't fit in the circle
	//console.log("best sum: " + solution.sum + " angles: " + solution.config + "\nradians: " + radians);

	return solution;
}

function setAngleConfiguration(anglecfg) {
	vertexAngles = [0.0];
	var c_angle = 0.0;
	for (var i = 0; i < anglecfg.angle.length; i++) {
		if (parseInt(anglecfg.config[i], 10) === 0) {
			c_angle = c_angle + anglecfg.angle[i];
		}
		else if (parseInt(anglecfg.config[i], 10) === 1) {
			c_angle = c_angle + ((2 * Math.PI) - anglecfg.angle[i]);
		}
		vertexAngles.push(c_angle);
	}
	//console.log("number of vertices: " + PV.length + " angles: " + vertexAngles);
}

function sumAngles(angle_array, index, angle_sum, angle_config, history) {		//have a object field store best sum, check when index = angle_array.length
	
	var new_sum = 0.0;		//resort to zero when index is -1

	if (index !== -1) {
		if (parseInt(history[history.length - 1], 10) === 0) {
			new_sum = angle_sum + angle_array[index];
		}
		else if (parseInt(history[history.length - 1], 10) === 1) {
			new_sum = angle_sum + ((2 * Math.PI) - angle_array[index]);
		}
	}

	if (history.length === angle_array.length && angle_array.length > 0) {
		//var history_sum = computeConfigSum(angle_array, history);
		if (angle_config.config === null) {
			angle_config.config = history;
			angle_config.sum = new_sum;
		}
		else {		//config and sum has been set
			var best_diff = Math.abs((2 * Math.PI) - angle_config.sum);
			var new_diff = Math.abs((2 * Math.PI) - new_sum);
			if (new_diff < best_diff) {
				angle_config.config = history;
				angle_config.sum = new_sum;
			}
		}
	}
	else if (history.length < angle_array.length) {
		sumAngles(angle_array, index + 1, new_sum, angle_config, history + Number(0).toString());
		sumAngles(angle_array, index + 1, new_sum, angle_config, history + Number(1).toString());
	}
}

function computeConfigSum(angle_array, arrangement) {		//calculate sum by arrangement
	var sum = 0.0;
	for (var i = 0; i < angle_array.length; i++) {
		if (parseInt(arrangement[i], 10) === 0) {
			sum = sum + angle_array[i];
		}
		else if (parseInt(arrangement[i], 10) === 1) {
			sum = sum + ((2 * Math.PI) - angle_array[i]);
		}
	}
	return sum;
}

function drawBoundingCircle() {
	ctx2.beginPath();
	ctx2.strokeStyle = "black";
	ctx2.ellipse(canvas2.width*0.5, canvas.height*0.5, circle_radius, circle_radius, 0, 0, 2*Math.PI);
	ctx2.stroke();
	ctx2.closePath();
}

function drawEdges() {
	for (var i = 1; i < vertexAngles.length; i++) {
		ctx2.beginPath();
		ctx2.strokeStyle = "black";
		ctx2.moveTo((1280 * 0.5) + (circle_radius * Math.cos(vertexAngles[i - 1])), (720 * 0.5) - (circle_radius * Math.sin(vertexAngles[i - 1])));
		ctx2.lineTo((1280 * 0.5) + (circle_radius * Math.cos(vertexAngles[i])), (720 * 0.5) - (circle_radius * Math.sin(vertexAngles[i])));
		ctx2.stroke();
		ctx2.closePath();
	}

}

function renderSecondCtxFigure() {
	ctx2.clearRect(0, 0, 1280, 720);
	drawBoundingCircle();
	drawEdges();
}