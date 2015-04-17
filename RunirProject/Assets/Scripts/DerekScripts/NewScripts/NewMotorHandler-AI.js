#pragma strict

var maxSpeed : float = 4.0;

private var lastPos : Vector3;

private var motor : NewMotor;
private var anim : Animator;

function Start () {
	motor = GetComponent.<NewMotor>();
	anim = GetComponent.<Animator>();
}

function Update () {
	
	if(!anim.applyRootMotion){
		
		//calculate velocity from last frame
		var velocity = (transform.position - lastPos)/Time.deltaTime;
		//convert to local space
		velocity = transform.InverseTransformDirection(velocity);
		
		//send speeds to motor to play animations
		//if(velocity.z < 0) zMax = 1.556;	
		motor.Move(velocity.x/maxSpeed, velocity.z/maxSpeed, 0.0);

		//cache the last frame's position	
		lastPos = transform.position;	

	}
	
}