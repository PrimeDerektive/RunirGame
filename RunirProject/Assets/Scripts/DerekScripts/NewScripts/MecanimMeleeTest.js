﻿#pragma strict

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
	var nextState = anim.GetNextAnimatorStateInfo(animLayer);

	if(Input.GetButtonDown("Fire1") && (currentState.IsName("Nothing") || currentState.IsName("BowFire")) && !anim.GetBool("busy")){
		anim.SetTrigger("fireDown");
	}
	
	
	if(Input.GetButton("Fire1") && (currentState.IsName("Nothing") || currentState.IsName("ChargeUp")) && !anim.GetBool("busy")){
		fireDownTime = anim.GetFloat("fireDownTime");
		anim.SetFloat("fireDownTime", fireDownTime+Time.deltaTime);
	}
	
	if(anim.GetFloat("fireDownTime") > 0.0 && anim.IsInTransition(animLayer) && !nextState.IsName("ChargeUp") && !nextState.IsName("FullyCharged")){
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
	
function MeleeApex(){
	audioSource.pitch = Random.Range(0.9, 1.0);
	audioSource.PlayOneShot(swingSound, 1.0);
}

function MeleeStop(){
	BroadcastMessage("StopWeaponTrail");
	anim.SetBool("busy", false);
}