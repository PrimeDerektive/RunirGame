#pragma strict

var meleeCombatLayer : int = 2;
var enemyLayer : LayerMask;
var weaponTrail : MeleeWeaponTrail;
var swordBase : Transform;
var swordTip : Transform;
var hitEffect : GameObject;

private var anim : Animator;
private var attackedThisClip : boolean = false;

function Start () {
	anim = GetComponent.<Animator>();
	anim.SetLayerWeight(2, 0.5);
	anim.SetLayerWeight(meleeCombatLayer, 1.0);
}

function Update () {

	var meleeCombatState = anim.GetCurrentAnimatorStateInfo(meleeCombatLayer);
	
	if(
	//the fire button is pressed
	Input.GetButtonDown("Fire1") &&
	//and we're not currently rolling
	anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing") &&
	//and we're not in the middle of an attack transition
	!anim.IsInTransition(meleeCombatLayer) && 
	//and we're not currently attacking, OR we're close the end of an attack for a chain
	(meleeCombatState.IsName("MeleeCombat.Nothing") || meleeCombatState.normalizedTime > 0.6)
	){
		anim.SetBool("attack", true);
	}
	
	//reset attack bools during transitions
	if(anim.IsInTransition(meleeCombatLayer)){
		anim.SetBool("attack", false);
		attackedThisClip = false;
	}
	
	//fire melee attack function
	if(
	//if we're not doing nothing in the melee combat layer
	!meleeCombatState.IsName("MeleeCombat.Nothing") &&
	//and we're not in a transition either
	!anim.IsInTransition(meleeCombatLayer)
	//we must be doing an attack!
	){
		if(meleeCombatState.normalizedTime > 0.2 && !attackedThisClip){
			StartCoroutine(Attack());
			attackedThisClip = true;
		}
	}
	
	/*
	if(!meleeCombatState.IsName("MeleeCombat.Nothing")){
		GetComponent.<MoveController>().walking = 0.6;
	}
	else{
		GetComponent.<MoveController>().walking = 1.0;
	}
	*/
	
}

function Attack(){
	var timer = 0.5;
	print("boobies");
	weaponTrail.Emit = true;
	while(timer > 0.0){
		timer -= Time.deltaTime;
		var hit : RaycastHit;
		Debug.DrawLine(swordBase.position, swordTip.position, Color.red);
		var swordDir = swordTip.position - swordBase.position;
		if(Physics.SphereCast(swordBase.position, 0.2, swordDir, hit, swordDir.magnitude, enemyLayer)){
			Instantiate(hitEffect, hit.point, Quaternion.FromToRotation(Vector3.up, hit.normal));
			return;
		}
		yield;
	}
	weaponTrail.Emit = false;
}