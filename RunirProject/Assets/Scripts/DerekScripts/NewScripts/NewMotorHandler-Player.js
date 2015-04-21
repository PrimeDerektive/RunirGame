#pragma strict

var moveDamp : float = 0.3;

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

function Update () {
	
	//movement input
	var xInput = Input.GetAxis("Horizontal");
	var yInput = Input.GetAxis("Vertical");
	
	//send input to animator
	anim.SetFloat("speedX", xInput, moveDamp, Time.deltaTime);
	anim.SetFloat("speedY", yInput, moveDamp, Time.deltaTime);
	
	//Rotate to match camera forward
	RotateTowards(Camera.main.transform.forward);
	
}

function RotateTowards(targetDir : Vector3){
	targetDir.y = transform.forward.y; //kill Y so we only rotate on Y axis
	var angleDifference = Utilities.FindTurningAngle(transform.forward, targetDir);
	anim.SetFloat("direction", angleDifference);
	transform.forward = Vector3.Lerp(transform.forward, targetDir, Time.deltaTime*7.5);
}