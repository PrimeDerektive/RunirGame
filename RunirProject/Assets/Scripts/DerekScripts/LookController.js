#pragma strict

var lookTarget : Transform;
var doIK : boolean = true;

private var anim : Animator;
private var cam : Transform;
private var lookAtPos : Vector3;

function Start () {
	anim = GetComponent.<Animator>();
	cam = Camera.main.transform;
}

private var lastGoodLookAtPos : Vector3;

function Update () {

	lookAtPos = lookTarget.position;
}

function OnAnimatorIK(layerIndex : int){
	if(doIK){		
		anim.SetLookAtWeight(1.0, 0.4, 0.75, 0.0, 0.75);
		//lookAtOffset += cam.right * 10.0 * Mathf.Clamp((anim.GetFloat("direction")/60.0), -1.0, 1.0);
		//lookAtOffset.y -= 2.0;
		anim.SetLookAtPosition(lookAtPos);
	}		
}