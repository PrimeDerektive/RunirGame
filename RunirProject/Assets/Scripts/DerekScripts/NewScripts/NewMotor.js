#pragma strict

/**
The motor is a basic humanoid Animator
it requires that the controller have speedX and speedY variables to drive movement,
as well as direction and turnSpeed variables for rotation

**/ 

//used in calculating angular speed
private var lastForward : Vector3;

//cached references
private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

function Update(){
	//calculate and set turnSpeed in animator
	lastForward.y = transform.forward.y;
	var turnSpeed = Vector3.Angle(transform.forward, lastForward)/Time.deltaTime;
	anim.SetFloat("turnSpeed", turnSpeed);
	lastForward = transform.forward;	
}

/**
the Move() function is designed to be called by a handler script
to drive the motor either horizontally (x) or vertically (y)
**/
function Move(x : float, y : float, dampTime : float) {
	anim.SetFloat("speedX", x, dampTime, Time.deltaTime);
	anim.SetFloat("speedY", y, dampTime, Time.deltaTime);
}

function RotateTowards(targetDir : Vector3){
	targetDir.y = transform.forward.y; //kill Y so we only rotate on Y axis
	var angleDifference = Utilities.FindTurningAngle(transform.forward, targetDir);
	anim.SetFloat("direction", angleDifference);
	transform.forward = Vector3.Lerp(transform.forward, targetDir, Time.deltaTime*7.5);
}