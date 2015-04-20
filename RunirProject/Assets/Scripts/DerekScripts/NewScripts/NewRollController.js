#pragma strict

var animLayer : int;

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

function Update () {
	
	if(Input.GetButtonDown("Jump") && !anim.GetBool("roll") && !anim.GetBool("busy")){
		anim.SetBool("roll", true);
	}

}