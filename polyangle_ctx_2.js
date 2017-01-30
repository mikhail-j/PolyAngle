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
			edgeLengths.push(magnitude_vec2(new AnchorPoint(PV[i].x - PV[i-1].x, PV[i].y - PV[i-1].y)));
		}
		edgeLengths.push(magnitude_vec2(new AnchorPoint(PV[0].x - PV[PV.length - 1].x, PV[0].y - PV[PV.length - 1].y)));
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
	computeEdgeLengths();
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
			large_radius = getLargestDistance();
			circle_radius = large_radius;
		}
		else if (num_vertices !== PV.length) {
			large_radius = new_radius;
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

function incrementEdge() {
	central_angle = 0.0;
	vertexAngles = [0.0];
	edgeLengths = [];
	for (var i = 1; i < PV.length; i++) {
		var edge_dist = magnitude_vec2(new AnchorPoint(PV[i].x - PV[i-1].x, PV[i].y - PV[i-1].y));
		var edge_angle = 0.0;
		var nx = circle_radius * Math.cos(edge_angle + central_angle);
		var ny = circle_radius * Math.sin(edge_angle + central_angle);
		var new_edge_dist = magnitude_vec2(new AnchorPoint(nx - (circle_radius * Math.cos(central_angle)), ny - (circle_radius * Math.sin(central_angle))));
		while (!(Math.abs(edge_dist - new_edge_dist) < 0.5)) {
			edge_angle = edge_angle + 0.00001;
			nx = circle_radius * Math.cos(edge_angle + central_angle);
			ny = circle_radius * Math.sin(edge_angle + central_angle);
			new_edge_dist = magnitude_vec2(new AnchorPoint(nx - (circle_radius * Math.cos(central_angle)), ny - (circle_radius * Math.sin(central_angle))));
			//console.log("edge angle: " + edge_angle + " edge difference: " + (new_edge_dist - edge_dist));
		}
		//console.log("old edge: " + edge_dist + " new edge: " + new_edge_dist);
		central_angle = central_angle + edge_angle;
		vertexAngles.push(central_angle);
		edgeLengths.push(edge_dist);
		//drawEdges();
	}
	var edge_dist = magnitude_vec2(new AnchorPoint(PV[0].x - PV[PV.length - 1].x, PV[0].y - PV[PV.length - 1].y));
	var edge_angle = 0.0;
	var nx = circle_radius * Math.cos(edge_angle + central_angle);
	var ny = circle_radius * Math.sin(edge_angle + central_angle);
	var new_edge_dist = magnitude_vec2(new AnchorPoint(nx - (circle_radius * Math.cos(central_angle)), ny + (circle_radius * Math.sin(central_angle))));
	while (!(Math.abs(edge_dist - new_edge_dist) < 0.5)) {
		edge_angle = edge_angle + 0.00001;
		nx = circle_radius * Math.cos(edge_angle + central_angle);
		ny = circle_radius * Math.sin(edge_angle + central_angle);
		new_edge_dist = magnitude_vec2(new AnchorPoint(nx - (circle_radius * Math.cos(central_angle)), ny + (circle_radius * Math.sin(central_angle))));
		//console.log("edge angle: " + edge_angle + " edge difference: " + (new_edge_dist - edge_dist));
	}
	//console.log("old edge: " + edge_dist + " new edge: " + new_edge_dist);
	central_angle = central_angle + edge_angle;
	vertexAngles.push(central_angle);
	edgeLengths.push(edge_dist);
	//drawEdges();
}

function minimizeCircle() {
	renderSecondCtxFigure();
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
			incrementEdge();
			//while ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.11 || ((2 * Math.PI) - getMax(vertexAngles)) < 0) && circle_radius > 2) {
			while ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.02) && circle_radius > 2) {
				if ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.4)) {
					circle_radius = circle_radius - 0.2;
				}
				else if ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) > 0.2)) {
					circle_radius = circle_radius - 0.1;
				}
				else {
					circle_radius = circle_radius - 0.01;
				}
				incrementEdge();
				if ((Math.abs((2 * Math.PI) - getMax(vertexAngles)) < 0.02 && ((2 * Math.PI) - getMax(vertexAngles)) > 0)) {
					break;
				}
				console.log("angle missing: " + ((2 * Math.PI) - getMax(vertexAngles)) + " radius: " + circle_radius);
			}
			console.log("out of loop!");
			renderSecondCtxFigure();
			radiusDamage = false;
		}
	}
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