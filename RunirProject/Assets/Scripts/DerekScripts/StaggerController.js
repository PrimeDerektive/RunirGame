#pragma strict

private var anim : Animator;

function Start(){
	anim = GetComponent.<Animator>();
}

function Update(){
	var currentState = anim.GetNextAnimatorStateInfo(5);
	if((currentState.IsName("StaggerFrontLeft") || currentState.IsName("StaggerFrontRight"))){
		anim.SetBool("staggered", true);
	}
	else if(currentState.IsName("Nothing") && anim.GetBool("staggered")){
		anim.SetBool("staggered", false);
	}
}