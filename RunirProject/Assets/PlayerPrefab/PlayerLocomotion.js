#pragma strict

var motor : MecanimMotor;
private var camTrans : Transform;

function Start(){
	if(!motor) motor = GetComponent.<MecanimMotor>();
	camTrans = Camera.main.transform;
}

function Update () {
	motor.Move(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"), 0.3);
	motor.SetTargetForward(camTrans.forward);	
}