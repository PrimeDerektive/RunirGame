#pragma strict

#pragma strict

//maximum forward speed, based on forward locomotion animations in mecanim graph
var maxForwardSpeed : float = 5.668;

//maximum sideways speed, based on strafing locomotion animations in mecanim graph
var maxSidewaysSpeed : float = 4.007;

//maximum forward speed, based on forward locomotion animations in mecanim graph
var maxBackwardSpeed : float = 1.556;

private var anim : Animator;

private var rollLayer : int = 1;

//for movement
private var moveDampTime : float = 0.1;
var walk : boolean = false;

//for turning
var targetForward : Vector3 = Vector3.zero;

//for look IK
var lookTarget : Transform;
var lookAtPos : Vector3;
var doIK : boolean = true;
private var lookAtWeight : float = 1.0;

//for movement if not using root motion
private var lastPos : Vector3;


function Start () {
	anim = GetComponent.<Animator>();
	anim.SetLayerWeight(1, 1.0);
}

function Update () {

	if(!anim.applyRootMotion){
			//calculate velocity from last frame
			var velocity = (transform.position - lastPos)/Time.deltaTime;
			//convert to local space
			velocity = transform.InverseTransformDirection(velocity);
			
			//send speeds to motor to play animations
			//if(velocity.z < 0) zMax = 1.556;	
			Move(velocity.x/4.007, velocity.z/5.668, 0.0);

			//cache the last frame's position	
			lastPos = transform.position;	

	}

	/*
	if(!anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing")){
		anim.SetBool("roll", false);
		moveDampTime = 100000;
	}
	else if(moveDampTime == 100000){
		moveDampTime = 0.3;
	}
	*/
	
	//turning logic
	if(targetForward != Vector3.zero){
		
		var dir = Utilities.FindTurningAngle(transform.forward, targetForward);
		var dirDampTime = anim.GetCurrentAnimatorStateInfo(0).IsName("Turning") ? 0.25 : 0;
		anim.SetFloat("direction", dir, dirDampTime, Time.deltaTime);
		
		if(anim.GetCurrentAnimatorStateInfo(0).IsName("Turning") || dir > 30 || dir < -30)
			transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*7.5);
		
		/*
		if(anim.applyRootMotion || !uLink.NetworkView.Get(this).isMine){
			if(
				(
				anim.GetFloat("speedX") > 0.1 ||
				anim.GetFloat("speedY") > 0.1 ||
				anim.GetFloat("speedX") < -0.1 ||
				anim.GetFloat("speedY") < -0.1
				)
			){
				transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*10.0);
			}
		}
		if(
			anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnRight") ||
			anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnLeft")
		){
			anim.applyRootMotion = true;
			transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*5.0);
		}
		else anim.applyRootMotion = false;
		*/
		
		//if(anim.GetCurrentAnimatorStateInfo(3).IsName("Nothing") && Mathf.Abs(anim.GetFloat("speedX")) < 0.1 && Mathf.Abs(anim.GetFloat("speedY")) < 0.1)
			//transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*5.0);
		//if(anim.GetCurrentAnimatorStateInfo(3).normalizedTime < 0.25)
			//transform.forward = Vector3.Lerp(transform.forward, targetForward, Time.deltaTime*10.0);
	}
	
	/*
	if(lookTarget){
		var dirToTarget = (lookTarget.position - transform.position).normalized;
		var angle = Vector3.Angle(dirToTarget, transform.forward);
		var cross =  Vector3.Cross(transform.forward, dirToTarget);
		if(cross.y < 0) angle = -angle;
		var targetLookAtPos = lookTarget.position;
		var distance = Vector3.Distance(transform.position, lookTarget.position);
		if(angle > 90.0) targetLookAtPos = Vector3(transform.position.x + transform.right.x * distance, lookTarget.position.y, transform.position.z + transform.right.z  * distance);
		else if(angle < -90.0) targetLookAtPos = Vector3(transform.position.x - transform.right.x  * distance, lookTarget.position.y, transform.position.z - transform.right.z  * distance);
		var dirToAdjustedTarget = (targetLookAtPos - transform.position).normalized;
		var dirToLastLookAtPos = (lastLookAtPos - transform.position).normalized;
		var angleDiff = Vector3.Angle(dirToAdjustedTarget, dirToLastLookAtPos);
		var lerpSpeed = 5.0;
		if(Mathf.Abs(angle) > 90.0) lerpSpeed = 1.0;
		lookAtPos = Vector3.Slerp(lookAtPos, targetLookAtPos, Time.deltaTime * lerpSpeed);
		lastLookAtPos = lookAtPos;
	}
	*/

	//walk = (!anim.GetCurrentAnimatorStateInfo(3).IsName("Nothing") || anim.IsInTransition(3)) ? true : false;
}

private var lastGoodLookAtPos : Vector3;
private var lastLookAtPos : Vector3;

function OnAnimatorIK(layerIndex : int){
	
	if(doIK && lookTarget){		
		anim.SetLookAtWeight(lookAtWeight, 0.5, 0.5, 0.0, 0.5);
		//if(uLink.NetworkView.Get(this).isMine)
			//lookAtPos = Camera.main.transform.position + Camera.main.transform.forward * 5.0;
		anim.SetLookAtPosition(lookTarget.position);
		
	}
		
}

function LateUpdate(){
	
}

function Move (x : float, y : float, dampTime : float) {
	anim.SetFloat("speedX", x, moveDampTime, Time.deltaTime);
	anim.SetFloat("speedY", y, moveDampTime, Time.deltaTime);
}

function SetTargetForward(newFwd : Vector3){
	targetForward = newFwd;
	targetForward.y = transform.forward.y; //kill Y so we only rotate on Y axis
}

function StopTurning(){
	targetForward = Vector3.zero;
}

function DisableRootMotion(){
	anim.applyRootMotion = false;
}

