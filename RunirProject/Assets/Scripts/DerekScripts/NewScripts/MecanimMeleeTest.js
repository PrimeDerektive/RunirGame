#pragma strict

var animLayer : int;
var swingSound : AudioClip;

private var anim : Animator;
private var audioSource : AudioSource;

function Start () {
	anim = GetComponent.<Animator>();
	audioSource = GetComponent.<AudioSource>();
	yield WaitForSeconds(5.0);
	anim.SetTrigger("blockKnockback");
}

private var fireDownTime : float = 0.0;

function Update () {

	var currentState = anim.GetCurrentAnimatorStateInfo(animLayer);
	var nextState = anim.GetNextAnimatorStateInfo(animLayer);

	if(Input.GetButtonDown("Fire1") && (currentState.IsName("Nothing") || currentState.IsName("BowFire")) && !anim.GetBool("busy")){
		anim.SetTrigger("fireDown");
	}
	
	if(Input.GetButton("Fire1") && (currentState.IsName("Nothing") || currentState.IsName("ChargeUp") || currentState.IsName("2hChargeUp")) && !anim.GetBool("busy")){
		fireDownTime = anim.GetFloat("fireDownTime");
		anim.SetFloat("fireDownTime", fireDownTime+Time.deltaTime);
	}
	
	if(anim.GetFloat("fireDownTime") > 0.0 && anim.IsInTransition(animLayer) && !nextState.IsName("ChargeUp") && !nextState.IsName("FullyCharged") && !nextState.IsName("2hChargeUp") && !nextState.IsName("2hFullyCharged")){
		anim.SetFloat("fireDownTime", 0.0);
	}

	if(Input.GetButtonUp("Fire1") && !anim.GetBool("busy") /*&& currentState.IsName("BowDraw")*/){
		anim.SetTrigger("fireUp");
	}
	
	if(Input.GetButtonDown("Fire2")){
		anim.SetBool("block", true);
	}
	
	if(Input.GetButtonUp("Fire2")){
		anim.SetBool("block", false);
	}

}

function MeleeStart(){
	BroadcastMessage("StartWeaponTrail");	
}

var attackLayers : LayerMask;
	
function MeleeApex(){
	audioSource.pitch = Random.Range(0.9, 1.0);
	audioSource.PlayOneShot(swingSound, 1.0);
	var hit : RaycastHit;
	var dir = (Camera.main.transform.position - Camera.main.transform.forward * 5.0) + Camera.main.transform.forward;
	if(Physics.SphereCast(dir, 5.0, Camera.main.transform.forward, hit, 4.0, attackLayers)){
		hit.collider.gameObject.SendMessage("TakeDamage", hit);
	}
}

function MeleeStop(){
	BroadcastMessage("StopWeaponTrail");
	anim.SetBool("busy", false);
}

function FireArrow(){
	anim.SetBool("busy", false);
}