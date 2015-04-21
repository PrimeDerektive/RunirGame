#pragma strict

var moveDamp : float = 0.3;
var motor : NewMotor;

function Start () {
	motor = GetComponent.<NewMotor>();
}

function Update () {
	
	//movement input
	var xInput = Input.GetAxis("Horizontal");
	var yInput = Input.GetAxis("Vertical");
	
	var damp = moveDamp;
	if(GetComponent.<Animator>().GetBool("roll")) damp = 1000000;
	
	//send input to motor
	motor.Move(xInput, yInput, damp); 
	
	//tell motor to rotate to match camera forward
	motor.RotateTowards(Camera.main.transform.forward);
	
}