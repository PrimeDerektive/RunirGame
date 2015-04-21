#pragma strict

var animLayer : int;
private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

function Update () {

	if(Input.GetButtonUp("Fire1") && !anim.GetBool("busy")){
		anim.SetTrigger("fireUp");
	}

}

function MeleeStart(){
	BroadcastMessage("StartWeaponTrail");
	anim.SetBool("busy", true);
	
}
	
function MeleeApex(){

}

function MeleeStop(){
	BroadcastMessage("StopWeaponTrail");
	anim.SetBool("busy", false);
}