#pragma strict

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
	anim.SetLayerWeight(1, 1.0);
}

function Update () {

	var speedX = anim.GetFloat("speedX");
	var speedY = anim.GetFloat("speedY");

	if(
		anim.GetCurrentAnimatorStateInfo(3).IsName("MeleeCombat.Nothing") &&
		Input.GetButtonDown("Jump") && //if the jump button is pressed
		!anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling") && //and we're not already rolling
		(speedX > 0.2 || speedX < -0.2 || speedY > 0.2 || speedY < -0.2) //and we're in motion
		
	){
		anim.SetFloat("speedX", Input.GetAxisRaw("Horizontal"));
		anim.SetFloat("speedY", Input.GetAxisRaw("Vertical"));
		SendMessage("DisableLookIK", SendMessageOptions.DontRequireReceiver);
		anim.SetBool("roll", true);
	}
	
	//reset roll bool when the roll is in progress
	if(!anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing") && anim.GetBool("roll")){
		anim.SetBool("roll", false);
	}
	
}