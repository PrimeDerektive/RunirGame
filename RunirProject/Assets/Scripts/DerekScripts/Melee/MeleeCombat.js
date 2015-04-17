#pragma strict
import System.Collections.Generic;

var attackRange : float = 3.0;
var attackLayer : LayerMask;
var rayOffset : Vector3 = Vector3(0, 1.0, 0);
var swordObject : GameObject;
var weaponTrail : MeleeWeaponTrail;
var rayOrigin : Transform;
var swingSound : AudioClip;
var attacking : boolean = false;

var chargeDelay : float = 1.0;
var chargeTime : float = 3.0;
var chargeAttack : ChargeAttack;

var aimTarget : Transform;
var anim : Animator;
var player : Player;
var tpsCam : TPSOrbit;
var audioSource : AudioSource;

function Awake(){
	if(!weaponTrail) weaponTrail = GetComponentInChildren.<MeleeWeaponTrail>();
	if(!aimTarget) aimTarget = GameObject.FindGameObjectWithTag("AimTarget").transform;
	if(!anim) anim = GetComponent.<Animator>();
	if(!player) player = GetComponent.<Player>();
	if(!tpsCam) tpsCam = GameObject.FindGameObjectWithTag("CameraHolder").GetComponent.<TPSOrbit>();
	if(!audioSource) audioSource = GetComponent.<AudioSource>();
	anim.SetLayerWeight(4, 1.0);
}

function Start(){
	if(chargeAttack) chargeAttack.enabled = true;
}

private var alreadyHit = new List.<Transform>();

/*
function Update(){

	if(attacking && uLink.Network.isServer){
	
		var attackDir = swordTip.position - swordBase.position;
		var hitsThisFrame : RaycastHit[] = Physics.RaycastAll(
			swordBase.position,
			attackDir,
			attackDir.magnitude,
			attackLayer
		);
		for(hit in hitsThisFrame){
			//System.Array.Sort (validHits, function (a : RaycastHit, b : RaycastHit) a.distance.CompareTo(b.distance));
			if(hit.transform.root != transform && !alreadyHit.Contains(hit.transform.root)){
				if(hit.collider.CompareTag("Head")) print("BOOM, Headshot!");
				var hitStatus : PlayerStatus = hit.transform.root.GetComponent.<PlayerStatus>();
				if(hitStatus) hitStatus.EvaluateHit(hit, uLink.NetworkView.Get(this).viewID); 
				alreadyHit.Add(hit.transform.root);
			}
		}
		
	}
	else{
		alreadyHit.Clear();
	}

}
*/

function FireDown(){
	yield WaitForSeconds(chargeDelay);
	uLink.NetworkView.Get(this).UnreliableRPC("StartChargingMelee", uLink.RPCMode.All);
}

@RPC
function StartChargingMelee(info : uLink.NetworkMessageInfo){
	
	var transitTime = uLink.Network.time - info.timestamp;
	
	//Start charging
	//Debug.Log("Started charging.");
	anim.SetBool("charging", true);
	swordObject.SendMessage("StartCharging", chargeTime, SendMessageOptions.DontRequireReceiver);
	
	//adjust charge time based on transit time so proxies charge up at same speed
	yield WaitForSeconds(chargeTime - transitTime); 
	
	//Fully charged
	//Debug.Log("Fully charging.");
	anim.SetBool("charged", true);
	swordObject.SendMessage("FullyCharged", SendMessageOptions.DontRequireReceiver);
	
}

private var lastClick : float = 0.0;

function MeleeAttack(){

print("attempting attack");
	
	//stop the charging coroutines
	StopAllCoroutines();
	
	//tell the sword object to stop the charging effects
	if(anim.GetBool("charging")) swordObject.SendMessage("StopCharging", 1.0, SendMessageOptions.DontRequireReceiver);
	
	if(
		anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing") && 
		//!attacking &&
		!anim.GetBool("attack") &&
		(Time.time > (lastClick + 0.3333))
	){
		
		anim.SetBool("charging", false);
		anim.SetBool("attack", true);
		
		
		/*
		
		var comboID : int = 1;
		if(!anim.GetBool("charged")){
			//combo solving
			if(anim.GetCurrentAnimatorStateInfo(3).IsName("Attack1"))
				comboID = 2;
			else if(anim.GetCurrentAnimatorStateInfo(3).IsName("Attack2"))
				comboID = 3;	
			anim.CrossFade("Attack"+comboID.ToString(), 0.15);
		}
		
		uLink.NetworkView.Get(this).UnreliableRPC("NetworkMeleeAttack", uLink.RPCMode.Others, comboID);
		*/
		
		
		
	}
	//lastClick = Time.time;
}

function Stagger(){
	MeleeStop();
}

@RPC
function NetworkMeleeAttack(comboID : int){

	//stop the charging coroutines
	StopAllCoroutines(); 
	//tell the sword object to stop the charging effects
	if(anim.GetBool("charging")) swordObject.SendMessage("StopCharging", 1.0, SendMessageOptions.DontRequireReceiver);
	anim.SetBool("charging", false);
	
	if(!anim.GetBool("charged")){
		anim.CrossFade("Attack"+comboID.ToString(), 0.15);
	}
	else{
		
		anim.SetBool("attack", true);
	
	}
	/*
	var nextID : int = 1;
	if(anim.GetCurrentAnimatorStateInfo(3).IsName("Attack1"))
		nextID = 2;
	else if(anim.GetCurrentAnimatorStateInfo(3).IsName("Attack2"))
		nextID = 3;
	if(nextID != comboID){
		//attack ID's don't match. there is a sync error
		//crossfade correct state
		anim.CrossFade("Attack"+comboID.ToString(), 0.15);
		print("Sync error.");
	}
	else{
		//timing is correct, rely on animator state machine
		anim.SetBool("attack", true);
	}
	*/
}

private var timeOfLastAttack : float = 0.0;

function MeleeStart () {
	weaponTrail.Emit = true;
	//attacking = true;
}

class EnemyHit{

	var hit : RaycastHit;
	var status : PlayerStatus;
	var headshot : boolean;
	
	public function EnemyHit(h : RaycastHit, s : PlayerStatus, hs : boolean){
	    hit = h;
	    status = s;
	    headshot = hs;
	}
	
}

function MeleeApex(){

	if(anim.IsInTransition(3) || anim.GetBool("staggered")) return;
	
	audioSource.pitch = Random.Range(0.9, 1.0);
	audioSource.PlayOneShot(swingSound, 1.0);
	
	var origin = rayOrigin.position;
	var targetPos = aimTarget.position;
	if(GetComponent.<Blackboard>()){
		targetPos = origin + GetComponent.<MecanimMotor_Base>().targetForward;
		//targetPos.y = GetComponent.<Blackboard>().GetGameObjectVar("target").Value.transform.position.y;
		//targetPos.y += 1.5;
	}
	var dir = (targetPos - origin).normalized;
	var rayCount = 8;
	var attackArc = 90.0; //frontal 120 degree
	var rayArc = attackArc / rayCount;
	var firstAngle = attackArc * -0.5;
	var enemyHits = new List.<EnemyHit>(); //running list of enemies hit by this attack
	
	for(var i = 0; i < rayCount; i++){
	
		var rayDir = Quaternion.AngleAxis(firstAngle + (i * rayArc), transform.up) * dir;
		Debug.DrawRay(origin, rayDir*attackRange, Color.red, 1.0);
		var hit : RaycastHit;
		if(Physics.Raycast(origin, rayDir, hit, attackRange, attackLayer)){
			
			//store the enemy's status script
			var hitStatus : PlayerStatus = hit.transform.root.GetComponent.<PlayerStatus>();
			//store whether or not this hit was a headshot
			var headshot : boolean = hit.collider.CompareTag("Head");
			
			//check if this enemy was already hit
			var alreadyHit : boolean = false;
			for(var enemyHit : EnemyHit in enemyHits){
				//if this enemy was already hit
				if(enemyHit.status == hitStatus){
					//if the new hit is a headshot and the existing headshot wasn't:
					if(headshot && !enemyHit.headshot){
						//override existing hit with new hitinfo (headshot)
						enemyHit.hit = hit;
						//flag headshot as true
						enemyHit.headshot = true;						
					}
					//flag already hit as true so we don't store an extra hit for this enemy
					alreadyHit = true;					
				}
			}
			
			//if alreadyHit is still false, this EnemyHit must be added to the list
			if(!alreadyHit){ 
				enemyHits.Add(new EnemyHit(hit, hitStatus, headshot));
			}			
			
		}
		
	}
	
	//process all enemy hits
	for(var enemyHit : EnemyHit in enemyHits){
		if(enemyHit.headshot) print("BOOM, Headshot!");
		enemyHit.status.EvaluateHit(enemyHit.hit, uLink.NetworkView.Get(this).viewID);
	}
	
	//clear the list, attack is over
	enemyHits.Clear();
	
	/*
	var hits : RaycastHit[] = Physics.RaycastAll(origin, dir, attackRange, attackLayer);
	for(var hit : RaycastHit in hits){
		if(hit.transform.root != transform && !alreadyHit.Contains(hit.transform.root)){
			var hitStatus : PlayerStatus = hit.transform.root.GetComponent.<PlayerStatus>();
			if(hit.collider.CompareTag("Head")) print("BOOM, Headshot!");
			if(hitStatus) hitStatus.EvaluateHit(hit, uLink.NetworkView.Get(this).viewID); 
			alreadyHit.Add(hit.transform.root);
		}
	}
	alreadyHit.Clear();
	*/
	
	
	/*
	var origin = transform.position + transform.InverseTransformDirection(rayOffset);
	var dir = (aimTarget.position - origin).normalized;
	Debug.DrawRay(origin, dir, Color.red, 1.0);
	var hits : RaycastHit[] = Physics.RaycastAll(origin, dir, attackRange, attackLayer);
	for(var hit : RaycastHit in hits){
		if(hit.transform.root != transform && !alreadyHit.Contains(hit.transform.root)){
			var hitStatus : PlayerStatus = hit.transform.root.GetComponent.<PlayerStatus>();
			if(hit.collider.CompareTag("Head")) print("BOOM, Headshot!");
			if(hitStatus) hitStatus.EvaluateHit(hit, uLink.NetworkView.Get(this).viewID); 
			alreadyHit.Add(hit.transform.root);
		}
	}
	alreadyHit.Clear();
	*/	
}

function MeleeStop () {
	weaponTrail.Emit = false;
	//don't forget reset the attack bool in the animator
	anim.SetBool("attack", false);
	//attacking = false;

}

function OnEnable(){
	swordObject.SetActive(true);
	anim.SetBool("melee", true);
}

function OnDisable(){	
	swordObject.SetActive(false);
	anim.SetBool("melee", false);
}

var chargeHand : Transform;

function OnAnimatorIK() {
	if(anim.GetBool("charging")){
		anim.SetIKPositionWeight(AvatarIKGoal.LeftHand, 1.0);
		anim.SetIKPosition(AvatarIKGoal.LeftHand, chargeHand.position);         
		anim.SetIKRotationWeight(AvatarIKGoal.LeftHand, 1.0); 
		anim.SetIKRotation(AvatarIKGoal.LeftHand, chargeHand.rotation);
	} 
}