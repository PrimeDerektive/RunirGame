#pragma strict
var point1 : Transform;
var point2 : Transform;
var point3 : Transform;

var lr : LineRenderer;

function Start () {
	lr = GetComponentInChildren.<LineRenderer>();
}

function Update(){
	lr.SetPosition(0, point1.position);
	lr.SetPosition(1, point3.position);
	lr.SetPosition(2, point3.position);
}