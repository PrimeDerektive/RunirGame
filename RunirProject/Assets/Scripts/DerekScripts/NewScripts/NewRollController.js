#pragma strict

var animLayer : int;

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

function Update () {

	var currentState = anim.GetCurrentAnimatorStateInfo(animLayer);
	
	if(!currentState.IsName("Rolling") && !anim.IsInTransition(animLayer)){
	
		//raw input (for rolling, mostly)
		var xRaw = Input.GetAxisRaw("Horizontal");
		var yRaw = Input.GetAxisRaw("Vertical");
		
		//send input to animator
		anim.SetFloat("xRaw", xRaw);
		anim.SetFloat("yRaw", yRaw);
	
	}
	
	if(Input.GetButtonDown("Jump") && !anim.GetBool("busy")){
		anim.SetTrigger("roll");
	}

}