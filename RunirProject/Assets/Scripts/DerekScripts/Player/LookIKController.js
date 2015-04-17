#pragma strict

var lookTarget : Transform;
var lookAtPos : Vector3;

private var anim : Animator;
private var lookAtWeight : float = 0.0;
private var changingTarget : boolean = false;

function Start(){
	anim = GetComponent.<Animator>();
}

function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if(uLink.NetworkView.Get(this).isMine) lookTarget = GameObject.FindWithTag("AimTarget").transform;
	StartCoroutine(EnableLookIK());
}

function Update () {

	if(lookTarget && !changingTarget){
		var dirToLookTarget : Vector3 = (lookTarget.position - transform.position).normalized;
		//var newLookAtPos = lookTarget.position;
		lookAtPos = Vector3.Lerp(lookAtPos, lookTarget.position, Time.deltaTime * 7.5);
	}

}

function ChangeTarget(newTarget : Transform){
	changingTarget = true;
	var startPos = lookAtPos;
	var duration : float = 0.5;
	var timer : float = 0.0;
	while(timer <= duration){
		timer += Time.deltaTime;
		var dirToNewTarget : Vector3 = (newTarget.position - transform.position).normalized;
		var newLookAtPos = transform.position + dirToNewTarget * 10.0;
		lookAtPos = Vector3.Lerp(startPos, newLookAtPos, timer/duration);
		yield;
	}
	lookTarget = newTarget;
	changingTarget = false;
}

function OnAnimatorIK(layerIndex : int){
	anim.SetLookAtWeight(lookAtWeight, 0.5, 0.5, 0.0, 0.5);
	anim.SetLookAtPosition(lookAtPos);	
}

function EnableLookIK(){
	StopCoroutine("DisableLookIK");
	var startWeight = lookAtWeight;
	var duration : float = 0.5;
	var timer : float = 0.0;
	while(timer <= duration){
		timer += Time.deltaTime;
		lookAtWeight = Mathf.Lerp(startWeight, 1.0, timer/duration);
		yield;
	}
}

function DisableLookIK(){
	StopCoroutine("EnableLookIK");
	var startWeight = lookAtWeight;
	var duration : float = 0.5;
	var timer : float = 0.0;
	while(timer <= duration){
		timer += Time.deltaTime;
		lookAtWeight = Mathf.Lerp(startWeight, 0.0, timer/duration);
		yield;
	}
}