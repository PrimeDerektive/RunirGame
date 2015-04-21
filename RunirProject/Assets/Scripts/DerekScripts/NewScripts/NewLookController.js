#pragma strict

private var anim : Animator;
private var cam : Transform;
private var lookAtPos : Vector3;

function Start(){
	anim = GetComponent.<Animator>();
	cam = GameObject.FindGameObjectWithTag("MainCamera").transform;
}

function Update(){
	lookAtPos = cam.position + cam.forward * 10.0;
}

function OnAnimatorIK(layerIndex : int){
	anim.SetLookAtWeight(1.0, 0.4, 0.75, 0.0, 0.75);
	anim.SetLookAtPosition(lookAtPos);	
}