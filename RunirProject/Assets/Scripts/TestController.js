#pragma strict

private var anim : Animator;
private var h : float;
private var v : float;

function Start () {
	anim = GetComponent.<Animator>();
}

function Update () {
	//locomotion driving
	h  = Input.GetAxis("Horizontal");
	v  = Input.GetAxis("Vertical");
	anim.SetFloat("speedX", h, 0.1, Time.deltaTime);	
	anim.SetFloat("speedY", v, 0.1, Time.deltaTime);
}