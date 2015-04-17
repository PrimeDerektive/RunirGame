#pragma strict


var motor : NewMotor;

function Start () {
	motor = GetComponent.<NewMotor>();
}

function Update () {
	
	//movement input
	var xInput = Input.GetAxis("Horizontal") * 0.35;
	var yInput = Input.GetAxis("Vertical") * 0.35;
	//send input to motor
	motor.Move(xInput, yInput, 0.3); 
	
	//tell motor to rotate to match camera forward
	motor.RotateTowards(Camera.main.transform.forward);
	
}