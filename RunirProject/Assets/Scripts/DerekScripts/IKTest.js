#pragma strict

var offset : Vector3 = Vector3(0, 80.0, 0);
var distance : float = 5.0;
var rightHand : Transform;

private var targetPos : Vector3;
private var cam : Transform;
private var anim : Animator;

function Start(){
	anim = GetComponent.<Animator>();
	cam = Camera.main.transform;
}

function Update(){
	targetPos = rightHand.position + cam.forward * distance;
}

function OnAnimatorIK(layerIndex: int) {
	if(rightHand){
		var handRotation = Quaternion.LookRotation(targetPos - rightHand.position);
		handRotation *= Quaternion.Euler(offset);
		anim.SetIKRotationWeight(AvatarIKGoal.RightHand, anim.GetFloat("swordIK"));
		anim.SetIKRotation(AvatarIKGoal.RightHand, handRotation); 
	}                   
}