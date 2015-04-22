#pragma strict

var animLayer : int;
var swingSound : AudioClip;

private var anim : Animator;
private var audioSource : AudioSource;

function Start () {
	anim = GetComponent.<Animator>();
	audioSource = GetComponent.<AudioSource>();
}

private var fireDownTime : float = 0.0;

function Update () {

	var currentState = anim.GetCurrentAnimatorStateInfo(animLayer);

	if(Input.GetButtonDown("Fire1") && (currentState.IsName("Nothing") || currentState.IsName("Rolling"))){
		anim.SetTrigger("fireDown");
	}
	
	
	if(Input.GetButton("Fire1") && (currentState.IsName("Nothing") || currentState.IsName("ChargeUp"))){
		fireDownTime += Time.deltaTime;
		anim.SetFloat("fireDownTime", fireDownTime);
	}


	if(Input.GetButtonUp("Fire1") && !anim.GetBool("busy")){
		anim.SetTrigger("fireUp");
	}

}

function MeleeStart(){
	BroadcastMessage("StartWeaponTrail");
	anim.SetBool("busy", true);
	
}
	
function MeleeApex(){
	audioSource.pitch = Random.Range(0.9, 1.0);
	audioSource.PlayOneShot(swingSound, 1.0);
}

function MeleeStop(){
	BroadcastMessage("StopWeaponTrail");
	anim.SetBool("busy", false);
}