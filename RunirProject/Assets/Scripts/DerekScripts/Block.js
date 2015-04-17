#pragma strict

private var anim : Animator;
private var motor : MecanimMotor;

function Start () {
	anim = GetComponent.<Animator>();
	motor = GetComponent.<MecanimMotor>();
}

function Update () {

	if(Input.GetButtonDown("Fire2")){
		anim.SetBool("block", true);
	}
	
	if(Input.GetButtonUp("Fire2")){
		anim.SetBool("block", false);
	}

}