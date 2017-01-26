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
	if (moving_anchor !== null ) {
		var dx = currentPosition.x - moving_anchor.pv.x;
		var dy = currentPosition.y - moving_anchor.pv.y;
		if (dx !== 0 && dy !== 0) {
			moving_anchor.x = dx;
			moving_anchor.y = dy;
			moving_anchor.pv.angle = Math.atan2(moving_anchor.y, moving_anchor.x);
			renderPolyVertices();
		}
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
	}
	debug_mouse_event(event);
}

function debug_mouse_event(event){
	console.log("X: " + event.clientX + " Y: " + event.clientY);
	console.log("padding X: " + event.offsetX + " padding Y: " + event.offsetY);
}

function drawPointButton() {
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
	ctx.fillStyle = "black";
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

function renderPolyVertices() {
	ctx.clearRect(0, 0, 1280, 720);
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
}

drawBounds();
drawPointButton();