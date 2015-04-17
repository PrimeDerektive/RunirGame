#pragma strict

var archeryLayer : int = 4;

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
	anim.SetLayerWeight(archeryLayer, 1.0);
}

function Update () {

	if(Input.GetButtonDown("Fire1")){
		anim.SetBool("attack", true);	
	}
	
	if(Input.GetButtonUp("Fire1")){
		anim.SetBool("attack", false);	
	}
	
	var walk : float = 0.0;
	if(anim.GetBool("attack")) walk = 1.0;
	
	anim.SetFloat("walk", walk, 0.5, Time.deltaTime);
	
}