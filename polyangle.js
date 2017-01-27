var canvas = document.getElementById("canvas_area");

canvas.addEventListener("click", handle_click_mouse_event);
canvas.addEventListener("mousemove", update_current_position);
canvas.addEventListener("mousedown", handle_mouse_down_event);
canvas.addEventListener("mouseup", handle_mouse_up_event);

var ctx = canvas.getContext("2d");

var PV = [];

var currentPosition = new AnchorPoint(0, 0);

var addPoints = false;

var arePointsLocked = false;

var areAnglesLocked = false;

var moving_poly_vertex = null;

var moving_anchor = null;

function update_current_position(event) {
	currentPosition.x = event.offsetX;
	currentPosition.y = event.offsetY;
	if (moving_poly_vertex !== null) {
		console.log("x: " + currentPosition.x + " y: " + currentPosition.y + " vx: " + moving_poly_vertex.x + " vy: " + moving_poly_vertex.y);
		moving_poly_vertex.x = currentPosition.x;
		moving_poly_vertex.y = currentPosition.y;
		renderPolyVertices();
	}
	if (moving_anchor !== null && !areAnglesLocked) {
		var dx = currentPosition.x - moving_anchor.pv.x;
		var dy = currentPosition.y - moving_anchor.pv.y;
		if (dx !== 0 && dy !== 0) {
			moving_anchor.x = dx;
			moving_anchor.y = dy;
			moving_anchor.pv.angle = Math.atan2(moving_anchor.y, moving_anchor.x);
			renderPolyVertices();
		}
	}
	else if (moving_anchor !== null && areAnglesLocked) {
		var dx = currentPosition.x - moving_anchor.pv.x;
		var dy = currentPosition.y - moving_anchor.pv.y;
		//if (dx !== 0 && dy !== 0) {
			moving_anchor.x = dx;
			moving_anchor.y = dy;
			var rad_diff = Math.atan2(moving_anchor.y, moving_anchor.x) - moving_anchor.pv.angle;
			//moving_anchor.pv.angle = Math.atan2(moving_anchor.y, moving_anchor.x);
			for (var i = 0; i < PV.length; i++) {
				PV[i].angle = PV[i].angle + rad_diff;
				PV[i].anchor.x = Math.cos(PV[i].angle) * 100;
				PV[i].anchor.y = Math.sin(PV[i].angle) * 100;
			}
			renderPolyVertices();
		//}
	}
}

function get_declared_vtx(polyvtx) {
	for (var i = 0; i < PV.length; i++) {
		//if (PV[i].x == polyvtx.x && PV[i].y == polyvtx.y) {
		if (PV[i].x < (polyvtx.x + 5) && PV[i].x > (polyvtx.x - 5) && PV[i].y < (polyvtx.y + 5) && PV[i].y > (polyvtx.y - 5)) {

			return PV[i];
		}
	}
	return null;		//does not exist
}

function get_declared_anchor(vtx) {
	for (var i = 0; i < PV.length; i++) {
		//if ((PV[i].x + PV[i].anchor.x) == vtx.x && (PV[i].y + PV[i].anchor.y) == vtx.y) {
		if ((PV[i].x + PV[i].anchor.x) < (vtx.x + 5) && (PV[i].x + PV[i].anchor.x) > (vtx.x - 5) && (PV[i].y + PV[i].anchor.y) < (vtx.y + 5) && (PV[i].y + PV[i].anchor.y) > (vtx.y - 5)) {

			return PV[i].anchor;
		}
	}
	return null;		//does not exist
}

function check_declared_anchor(vtx) {
	for (var i = 0; i < PV.length; i++) {
		//if ((PV[i].x + PV[i].anchor.x) == vtx.x && (PV[i].y + PV[i].anchor.y) == vtx.y) {
		if ((PV[i].x + PV[i].anchor.x) < (vtx.x + 5) && (PV[i].x + PV[i].anchor.x) > (vtx.x - 5) && (PV[i].y + PV[i].anchor.y) < (vtx.y + 5) && (PV[i].y + PV[i].anchor.y) > (vtx.y - 5)) {
			return true;
		}
	}
	return false;		//does not exist
}

function check_declared_points(polyvtx) {
	for (var i = 0; i < PV.length; i++) {
		//if (PV[i].x == polyvtx.x && PV[i].y == polyvtx.y) {
		if (PV[i].x < (polyvtx.x + 5) && PV[i].x > (polyvtx.x - 5) && PV[i].y < (polyvtx.y + 5) && PV[i].y > (polyvtx.y - 5)) {
			return true;
		}
	}
	return false;		//does not exist
}

function PolyVertex(x, y) {		//PolyVertex contains the fields necessary to draw the vertices and angle of rays
	this.x = x;
	this.y = y;
	this.angle = 0;		//in radians
	this.anchor = new AnchorPoint(15, 0);		//x and y component vectors
	this.anchor.pv = this;
}

function AnchorPoint(x, y) {
	this.x = x;
	this.y = y;
	this.pv = null;
}

function Vec3(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

function cross_product_vec3(a, b) {
	return new Vec3((a.y*b.z)-(a.z*b.y),(a.z*b.x)-(a.x*b.z),(a.x*b.y)-(a.y*b.x));
}

function magnitude_vec3(v) {
	return Math.sqrt((v.x*v.x) + (v.y*v.y) + (v.z*v.z));
}
function magnitude_vec2(v) {
	return Math.sqrt((v.x*v.x) + (v.y*v.y));
}

function handle_mouse_down_event(event) {
	if (!addPoints && !arePointsLocked) {
		console.log("addPoints: " + addPoints + " arePointsLocked: " + arePointsLocked);
		var evt_point = new AnchorPoint(event.offsetX, event.offsetY);
		if (check_declared_points(evt_point)) {
			moving_poly_vertex = get_declared_vtx(evt_point);
		}
		else if (check_declared_anchor(evt_point)) {
			moving_anchor = get_declared_anchor(evt_point);
		}
	}
}

function handle_mouse_up_event(event) {
	moving_poly_vertex = null;
	moving_anchor = null;
}

function handle_click_mouse_event(event){
	var tmp_vtx = new PolyVertex(event.offsetX, event.offsetY);
	if (event.offsetY > 60 && addPoints && !check_declared_points(tmp_vtx) && !check_declared_anchor(tmp_vtx)) {		//don't allow y-coordinates to be too high
		PV.push(tmp_vtx);
		renderPolyVertices();
	}
	else {
		if (event.offsetY < 50 && event.offsetY > 10) {
			if (event.offsetX > 10 && event.offsetX < 130) {
				addPoints = !addPoints;
				drawPointButton();
			}
		}
		if (event.offsetY < 50 && event.offsetY > 10) {
			if (event.offsetX > 150 && event.offsetX < 300) {
				areAnglesLocked = !areAnglesLocked;
				drawLockButton();
			}
		}
	}
	debug_mouse_event(event);
}

function debug_mouse_event(event){
	console.log("X: " + event.clientX + " Y: " + event.clientY);
	console.log("padding X: " + event.offsetX + " padding Y: " + event.offsetY);
}

function drawPointButton() {
	ctx.beginPath();
	if (addPoints) {
		ctx.fillStyle = "blue";
		ctx.fillRect(10, 10, 120, 40);
	}
	else {
		ctx.fillStyle = "red";
		ctx.fillRect(10, 10, 120, 40);
	}
	ctx.fillStyle = "white";
	ctx.font = "24px 'Lato'";
	ctx.fillText("Add Points", 18, 40, 104);
	ctx.closePath();
}

function drawLockButton() {
	ctx.beginPath();
	if (areAnglesLocked) {
		ctx.fillStyle = "blue";
		ctx.fillRect(150, 10, 150, 40);
	}
	else {
		ctx.fillStyle = "red";
		ctx.fillRect(150, 10, 150, 40);
	}
	ctx.fillStyle = "white";
	ctx.font = "24px 'Lato'";
	ctx.fillText("Lock Angles", 158, 40, 130);
	ctx.closePath();
}

function drawBounds() {
	ctx.beginPath();
	ctx.fillStyle = "#e2e2e2";
	ctx.fillRect(0, 0, 1280, 60);
	ctx.fillStyle = "white";
	ctx.closePath();
}

function drawPolyFigure() {
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.moveTo(PV[0].x, PV[0].y);
	for (var i = 1; i < PV.length; i++) {
		ctx.lineTo(PV[i].x, PV[i].y);
	}
	ctx.lineTo(PV[0].x, PV[0].y);
	ctx.stroke();
	ctx.closePath();
}

function drawIntersectingArea() {
	for (var i = 0; i < PV.length; i++) {			//this checks non-consecutive edge intersection
		for (var j = 0; j < PV.length; j++) {
			if (i != j) {
				var third_point = findIntersection(PV[i], PV[j]);
				if (third_point !== null) {
					drawGreenTriangle(PV[i], PV[j], third_point);
				}
			}
		}
	}
	//for (var i = 1; i < PV.length; i++) {			//this checks consecutive edge intersection
	//	var third_point = findIntersection(PV[i], PV[i - 1]);
	//	if (third_point !== null) {
	//		drawGreenTriangle(PV[i], PV[i - 1], third_point);
	//	}
	//}
	//var third_point = findIntersection(PV[0], PV[PV.length - 1]);
	//if (third_point !== null) {
	//	drawGreenTriangle(PV[0], PV[PV.length - 1], third_point);
	//}
}

function findIntersection(A, B) {
	var pA = A;
	var pB = B;
	var dA = pA.angle;	//radian form
	var dB = pB.angle;	//radian form
	var Ay = Math.sin(dA);
	var Ax = Math.cos(dA);
	var By = Math.sin(dB);
	var Bx = Math.cos(dB);
	var bdAx = pB.x - pA.x;
	var bdAy = pB.y - pA.y;
	var bdBx = pA.x - pB.x;
	var bdBy = pA.y - pB.y;
	//var bdA = Math.atan2(pB.y - pA.y, pB.x - pA.x);		//angle of vector from A to B
	//var bdB = Math.atan2(pA.y - pB.y, pA.x - pB.x);		//angle of vector from B to A
	var aA = Math.abs(Math.acos(((Ax*bdAx) + (Ay*bdAy))/((Math.sqrt((Ax*Ax) + (Ay*Ay)) * (Math.sqrt((bdAx*bdAx) + (bdAy*bdAy)))))));
	var aB = Math.abs(Math.acos(((Bx*bdBx) + (By*bdBy))/((Math.sqrt((Bx*Bx) + (By*By)) * (Math.sqrt((bdBx*bdBx) + (bdBy*bdBy)))))));
	if (aA + aB < Math.PI) {		//we have a triangle
		console.log("found triangle! A rad: " + aA * (180/Math.PI) + " B rad: " + aB * (180/Math.PI));
		console.log("A rad: " + 
			(magnitude_vec3(cross_product_vec3(new Vec3(Ax, Ay, 0), new Vec3(bdAx,bdAy, 0)))/(magnitude_vec2(new AnchorPoint(Ax, Ay))*magnitude_vec2(new AnchorPoint(bdAx,bdAy)))) +
			" A deg: " + 
			Math.asin(magnitude_vec3(cross_product_vec3(new Vec3(Ax, Ay, 0), new Vec3(bdAx,bdAy, 0)))/(magnitude_vec2(new AnchorPoint(Ax, Ay))*magnitude_vec2(new AnchorPoint(bdAx,bdAy)))) * (180/Math.PI) +
			" A x bdA: " +
			(magnitude_vec3(cross_product_vec3(new Vec3(Ax, Ay, 0), new Vec3(bdAx,bdAy, 0)))) + 
			" |A|: " +
			(magnitude_vec2(new AnchorPoint(Ax, Ay))) + 
			" |B|: " +
			(magnitude_vec2(new AnchorPoint(bdAx,bdAy))) + 
			" B rad: " + 
			(magnitude_vec3(cross_product_vec3(new Vec3(bdBx, bdBy, 0), new Vec3(Bx, By, 0)))/
				(magnitude_vec2(new AnchorPoint(bdBx, bdBy))*magnitude_vec2(new AnchorPoint(Bx, By))))+
			" B deg: " + 
			Math.asin(magnitude_vec3(cross_product_vec3(new Vec3(bdBx, bdBy, 0), new Vec3(Bx, By, 0)))/
				(magnitude_vec2(new AnchorPoint(bdBx, bdBy))*magnitude_vec2(new AnchorPoint(Bx, By)))) * (180/Math.PI));
		if (Ay != 0) {
			var slope = Ax/Ay;
			//if (slope != 0 && ((pA.x - (slope * pA.y)) - (pB.x - (slope * pB.y)))/(Bx - (slope * By)) > 0) {
			if (slope != 0) {
				var B_multiple = ((pA.x - (slope * pA.y)) - (pB.x - (slope * pB.y)))/(Bx - (slope * By));
				var intersection = new AnchorPoint(pB.x + (B_multiple * Bx), pB.y + (B_multiple * By));
				var Am0 = ((pB.x + (B_multiple * Bx)) - pA.x)/Ax;	//find the magnitude of the x component vector of A
				if (Am0 >= 0 && B_multiple >= 0) {
					//drawGreenTriangle(pA, pB, intersection);
					return intersection;
				}
			}
		}
		else if (Ax != 0) {
			var slope = Ay/Ax;
			if (slope != 0) {
				var B_multiple = ((pA.y - (slope * pA.x)) - (pB.y - (pB.x * slope)))/(By - (Bx * slope));
				var intersection = new AnchorPoint(pB.x + (B_multiple * Bx), pB.y + (B_multiple * By));
				var Am0 = ((pB.y + (B_multiple * By)) - pA.y)/Ay;	//find the magnitude of the y component vector of A
				if (Am0 >= 0 && B_multiple >= 0) {
					//drawGreenTriangle(pA, pB, intersection);
					return intersection;
				}
			}
		}
		else if (By != 0) {
			var slope = Bx/By;
			//if (slope != 0 && (((pB.x - (slope * pB.y)) - (pA.x - (slope * pA.y)))/(Ax - (slope * Ay))) > 0) {
			if (slope != 0) {
				var A_multiple = ((pB.x - (slope * pB.y)) - (pA.x - (slope * pA.y)))/(Ax - (Ay * slope));
				var intersection = new AnchorPoint(pA.x + (A_multiple * Ax), pA.y + (A_multiple * Ay));
				var Bm0 = ((pA.x + (A_multiple * Ax)) - pB.x)/Bx;	//find the magnitude of the x component vector of B
				if (Bm0 >= 0 &&  A_multiple >= 0) {
					//drawGreenTriangle(pA, pB, intersection);
					return intersection;
				}
			}
		}
		else if (Bx != 0) {
			var slope = By/Bx;
			if (slope != 0) {
				var A_multiple = ((pA.x - (slope * pB.x)) - (pA.y - (slope * pA.x)))/(Ay - (Ax * slope));
				var intersection = new AnchorPoint(pA.x + (A_multiple * Ax), pA.y + (A_multiple * Ay));
				var Bm0 = ((pA.y + (A_multiple * Ay)) - pB.y)/By;	//find the magnitude of the y component vector of B
				if (Bm0 >= 0 &&  A_multiple >= 0) {
					//drawGreenTriangle(pA, pB, intersection);
					return intersection;
				}
			}
		}
	}
	return null;
}

function drawGreenTriangle(A, B, C) {
	ctx.beginPath()
	ctx.fillStyle = "green";
	ctx.moveTo(A.x, A.y);
	ctx.lineTo(B.x, B.y);
	ctx.lineTo(C.x, C.y);
	ctx.lineTo(A.x, A.y);
	ctx.fill();
	ctx.closePath()
}

function renderPolyVertices() {
	ctx.clearRect(0, 0, 1280, 720);
	drawIntersectingArea();
	for (var i = 0; i < PV.length; i++) {
		ctx.beginPath();
		//ctx.ellipse(event.clientX, event.clientY, 2, 2, 0, 0, 2 * Math.PI);
		ctx.strokeStyle = "black";
		ctx.ellipse(PV[i].x, PV[i].y, 2, 2, 0, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.strokeStyle = "red";
		ctx.moveTo(PV[i].x, PV[i].y);
		ctx.lineTo(PV[i].x + (Math.cos(PV[i].angle)*2000), PV[i].y + (Math.sin(PV[i].angle)*2000));
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.ellipse(PV[i].x + PV[i].anchor.x, PV[i].y + PV[i].anchor.y, 2, 2, 0, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.closePath();
	}
	drawPolyFigure();
	drawBounds();
	drawPointButton();
	drawLockButton();
}

drawBounds();
drawPointButton();
drawLockButton();