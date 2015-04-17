#pragma strict

var blocking : boolean = false;
private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

var blockHand : Transform;
var aimTarget : Transform;
private var blockHandWeight : float = 0.0; 

function Update () {

	if(
	//the fire button is pressed
	Input.GetButtonDown("Fire2") &&
	//and we're not currently attacking
	anim.GetCurrentAnimatorStateInfo(3).IsName("MeleeCombat.Nothing") && 
	//and we're not currently rolling
	anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing") &&
	//and we're not currently blocking
	!blocking
	){
		blocking = true;
		anim.SetBool("block", true);
	}
	
	if(
	//the fire button is released
	Input.GetButtonUp("Fire2") &&
	//and we're blocking
	blocking
	){
		blocking = false;
		anim.SetBool("block", false);
	}	
	
	blockHand.LookAt(aimTarget);
	blockHand.Rotate(190, -105, -90);
	
	if(blocking){
		var speedX = anim.GetFloat("speedX");
		//anim.SetFloat("speedX", speedX*0.25, 0.1, Time.deltaTime);
		var speedY = anim.GetFloat("speedY");
		//anim.SetFloat("speedY", speedY*0.25, 0.1, Time.deltaTime);
		blockHandWeight = Mathf.Lerp(blockHandWeight, 1.0, Time.deltaTime*3.0);
	}
	else{
		blockHandWeight = Mathf.Lerp(blockHandWeight, 0.0, Time.deltaTime*10.0);
	}
	
	var walk : float = 0.0;
	if(blocking) walk = 1.0;
	
	anim.SetFloat("walk", walk, 0.5, Time.deltaTime);
	
	

}

function OnAnimatorIK(layerIndex : int){
		anim.SetIKPositionWeight(AvatarIKGoal.LeftHand, blockHandWeight);
		anim.SetIKPosition(AvatarIKGoal.LeftHand, blockHand.position);
		anim.SetIKRotationWeight(AvatarIKGoal.LeftHand, blockHandWeight);
		anim.SetIKRotation(AvatarIKGoal.LeftHand, blockHand.rotation);
}