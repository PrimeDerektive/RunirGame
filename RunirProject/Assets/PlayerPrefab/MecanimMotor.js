#pragma strict

private var anim : Animator;

private var rollLayer : int = 1;

//for movement
private var moveDampTime : float = 0.3;
var walk : boolean = false;

//for turning
private var targetForward : Vector3 = Vector3.zero;

//for look IK
var lookTarget : Transform;
var lookAtPos : Vector3;
var doIK : boolean = true;
private var lookAtWeight : float = 1.0;

var rootBone : Transform;

function Start () {
	anim = GetComponent.<Animator>();
	anim.SetLayerWeight(1, 1.0);
	//anim.SetLayerWeight(2, 0.5);
	anim.SetLayerWeight(3, 1.0);
	InvokeRepeating("CalculateTurnSpeed", 0, 0.1);
	//Die();
}

var lastForward : Vector3;

function CalculateTurnSpeed(){
	lastForward.y = transform.forward.y;
	var turnDamp = 0.0;
	var turnSpeed = Vector3.Angle(transform.forward, lastForward)/0.1;
	anim.SetFloat("angularSpeed",  turnSpeed, 0.1, Time.deltaTime);
	lastForward = transform.forward;
}

function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if(uLink.NetworkView.Get(this).isMine) lookTarget = GameObject.FindWithTag("AimTarget").transform;
}

function Update () {

	
	//lookAtPos = Vector3.Lerp(lookAtPos, Camera.main.transform.position + Camera.main.transform.forward * 10.0, Time.deltaTime*10.0);

	if(!anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing")){
		anim.SetBool("roll", false);
		moveDampTime = 100000;
	}
	else if(moveDampTime == 100000){
		moveDampTime = 0.3;
	}
	
	//transform.forward = targetForward;
	
	
	
	//turning logic
	if(targetForward != Vector3.zero){
		
		var dir = Utilities.FindTurningAngle(transform.forward, targetForward);
		
	
		//if(anim.GetCurrentAnimatorStateInfo(0).IsName("TurnRight")) dir = 0.0;
		var dirDamp : float = 0.0;
		//if(anim.GetCurrentAnimatorStateInfo(0).IsName("TurnRight")) dirDamp = 0.0;
		if(anim.GetCurrentAnimatorStateInfo(0).IsName("TurnRight") || anim.GetNextAnimatorStateInfo(0).IsName("TurnRight")) dirDamp = 0.25;
		anim.SetFloat("direction", dir, dirDamp, Time.deltaTime);
		
		if(dir > 30 || dir < -30 || anim.GetCurrentAnimatorStateInfo(0).IsName("TurnRight"))
			transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*7.5);
		
		if(anim.applyRootMotion || !uLink.NetworkView.Get(this).isMine){
			if(
				(
				anim.GetFloat("speedX") > 0.1 ||
				anim.GetFloat("speedY") > 0.1 ||
				anim.GetFloat("speedX") < -0.1 ||
				anim.GetFloat("speedY") < -0.1
				)
			){
				transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*7.5);
			}
		}
		
		
		/*
		if(anim.GetCurrentAnimatorStateInfo(0).IsName("Turning") || anim.GetNextAnimatorStateInfo(0).IsName("TurningProxy") || anim.GetCurrentAnimatorStateInfo(0).IsName("TurnLeft") || anim.GetCurrentAnimatorStateInfo(0).IsName("TurnRight")  || anim.GetCurrentAnimatorStateInfo(0).IsName("TurnLeft")){
			anim.applyRootMotion = true;
			transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*7.5);
		}
		*/
		
		/*
		if(anim.GetNextAnimatorStateInfo(0).IsName("Locomotion")){
			if(uLink.NetworkView.Get(this).isMine){
				if(!anim.applyRootMotion) anim.applyRootMotion = true;
			}else{
				if(anim.applyRootMotion) anim.applyRootMotion = false;
			}
		}
		*/
		
		
			
	}	
	
	if(uLink.NetworkView.Get(this).isMine && lookTarget){
		lookAtPos = Camera.main.transform.position + Camera.main.transform.forward * 100.0;
	}

	//walk = (!anim.GetCurrentAnimatorStateInfo(3).IsName("Nothing") || anim.IsInTransition(3)) ? true : false;
	
}

function Move (x : float, y : float, dampTime : float) {
	var walkModifier : float = 1.0;
	if(walk) walkModifier = 0.3;
	anim.SetFloat("speedX", x*walkModifier, moveDampTime, Time.deltaTime);
	anim.SetFloat("speedY", y*walkModifier, moveDampTime, Time.deltaTime);
}

function SetTargetForward(newFwd : Vector3){
	targetForward = newFwd;
	targetForward.y = transform.forward.y; //kill Y so we only rotate on Y axis
}

function StopTurning(){
	targetForward = Vector3.zero;
}

function Roll(){
	if(anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing")){
		anim.SetBool("roll", true);
	}
}

function DisableRootMotion(){
	anim.applyRootMotion = false;
}

