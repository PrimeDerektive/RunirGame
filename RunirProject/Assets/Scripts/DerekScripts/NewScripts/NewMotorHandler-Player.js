#pragma strict

var moveDamp : float = 0.3;

private var motor : NewMotor;

function Start () {
	motor = GetComponent.<NewMotor>();
}

function Update () {
	
	//movement input
	var xInput = Input.GetAxis("Horizontal");
	var yInput = Input.GetAxis("Vertical");
	
	//send input to motor
	motor.Move(xInput*0.35, yInput*0.35, moveDamp);
	
	//Rotate to match camera forward
	//if(GetComponent.<Animator>().GetCurrentAnimatorStateInfo(2).IsName("Nothing") || GetComponent.<Animator>().IsInTransition(2))
	motor.RotateTowards(Camera.main.transform.forward);
	
}