#pragma strict

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
	InvokeRepeating("ToggleTurn", 0, 5.0);
}

function Update () {
	if(anim.GetBool("turning")){
		transform.Rotate(Vector3.up * 60.0 * Time.deltaTime, Space.World);
	}
}

function ToggleTurn(){
	if(anim.GetBool("turning")) anim.SetBool("turning", false);
	else anim.SetBool("turning", true);
}