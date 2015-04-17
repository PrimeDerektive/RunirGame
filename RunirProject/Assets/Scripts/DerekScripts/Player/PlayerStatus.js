#pragma strict

var maxHealth : float = 100.0;
var currentHealth : float;

var maxStamina : float = 100.0;
var currentStamina : float;

var damage : float = 25.0;
var damageLabel : DamageLabel;

var blockEffect : GameObject;
var blockTransform : Transform;

var hitEffect : GameObject;

//Component reference
var anim : Animator;

function Start(){
	if(!anim) anim = GetComponent.<Animator>();
	currentHealth = maxHealth;
	currentStamina = maxStamina;
}

function Update(){
	if(anim.GetBool("block") && currentStamina > 0){
		currentStamina -= 5.0*Time.deltaTime;
	}
	else if(currentStamina < maxStamina){
		currentStamina += 58.0*Time.deltaTime;
	}
}

function LateUpdate(){
	if(anim.GetBool("gotHit")) anim.SetBool("gotHit", false);
}

function TakeStaminaDamage(){
	currentStamina -= 10.0;
	if(currentStamina < 0) currentStamina = 0;
}

function TakeDamage(amount : float){
	if(currentHealth > 0) currentHealth -= amount;
	var randomRoll = Random.value;
	if(randomRoll < 0.5)
		anim.SetTrigger("staggerFrontLeft");
	else
		anim.SetTrigger("staggerFrontRight");
	BroadcastMessage("Stagger");
	if(currentHealth <= 0){
		GetComponent.<RagdollController>().ragdolled = true;
		yield WaitForSeconds(0.1);
		GetComponentInChildren.<Rigidbody>().AddForceAtPosition((-latestHit.normal * 30.0) + (Vector3.up * 15.0), latestHit.point, ForceMode.VelocityChange);
		yield WaitForSeconds(5.0);
		//revive test
		currentHealth = maxHealth;
		GetComponent.<RagdollController>().ragdolled = false;
	}
}

private var latestHit : RaycastHit;

//this function is only used when the player is hit by another network entity (NPC or PC)
function EvaluateHit(hit : RaycastHit, attackerViewID : uLink.NetworkViewID){
	latestHit = hit;
	//test if attack was blocked successfully
	var blocked : boolean = BlockCheck(hit, attackerViewID);
	
	if(blocked){
		//successfully blocked
		Block(attackerViewID);
		uLink.NetworkView.Get(this).UnreliableRPC("Block", uLink.RPCMode.Others, attackerViewID);
	}
	else{
		//wasn't blocked. Take hit
		TakeHit(hit.point, attackerViewID);
		//we send the local position of the hit to remotes so it actually appears
		//on the character, and so we can compress it to bytes later
		var localHitPos = transform.InverseTransformPoint(hit.point);
		uLink.NetworkView.Get(this).UnreliableRPC("TakeHit", uLink.RPCMode.Others, localHitPos, attackerViewID);
	}
}

//test if attack was blocked successfully
function BlockCheck(hit : RaycastHit, attackerViewID : uLink.NetworkViewID) : boolean{
	var attacker : Transform = uLink.NetworkView.Find(attackerViewID).transform;
	
	//calculate direction of attack on my transform plane
	var hitPos = hit.point;
	hitPos.y = transform.position.y;
	var dirAway = (hitPos - transform.position).normalized;
	var attackDir = (Vector3(attacker.position.x, hitPos.y, attacker.position.z) - hitPos).normalized;
	Debug.DrawLine(hit.point, dirAway * 5.0, Color.green, 1.0);
	
	//calculate block direction  on my transform plane
	var blockPos = blockTransform.position;
	blockPos.y = transform.position.y;
	var blockDir = (blockPos - transform.position).normalized;
	
	//calculate angle. if its in the front 120 degree cone, block is successful
	var blockAngle = Vector3.Angle(attackDir, blockDir);	
	if((blockAngle <= 60 && blockAngle >= -60) && anim.GetBool("block")) return true; else return false;	
}

//Block() is called on both the server and remotes
@RPC
function Block(attackerViewID : uLink.NetworkViewID){
	var attacker : Transform = uLink.NetworkView.Find(attackerViewID).transform;
	var blockDir = (attacker.position - blockTransform.position).normalized;
	if(blockEffect) ObjectPool.instance.GetObject(blockEffect.name, blockTransform.position, Quaternion.FromToRotation(Vector3.up, blockDir));
	//if we are the attacker or the defender of this block, shake the camera
	if(uLink.NetworkView.Find(attackerViewID).isMine || uLink.NetworkView.Get(this).isMine){
		//always reset before shaking to avoid accumulation errors
		Camera.main.transform.localRotation = Quaternion.identity;
		iTween.PunchRotation(Camera.main.gameObject, Vector3(1.0, 2.0, 1.0), 0.5);
	}
	TakeStaminaDamage();
}

//TakeHit() is called on both the server and remotes
@RPC
function TakeHit(hitPos : Vector3, attackerViewID : uLink.NetworkViewID){
	if(uLink.Network.isServer){
		//if called on the server, he uses the private variable "LatestHit"
		//to determine hit effect rotation, as to avoid having to do viewID lookup and raycast
		if(hitEffect) ObjectPool.instance.GetObject(hitEffect.name, hitPos, Quaternion.FromToRotation(Vector3.up, latestHit.normal));
		TakeDamage(25.0);
		if(damageLabel){
			var label = ObjectPool.instance.GetObject(damageLabel.name, hitPos, Quaternion.identity);
			//var label : DamageLabel = Instantiate(damageLabel, hitPos, Quaternion.identity);
			label.GetComponent.<DamageLabel>().text = "25";
		}
	}
	else{
		//if called on a remote,  We need to look up the attacker's
		//transform via the NetworkViewID sent with the RPC
		var attacker : Transform = uLink.NetworkView.Find(attackerViewID).transform;
		//Server sends attack pos to remotes in local space
		var worldHitPos = transform.TransformPoint(hitPos);
		var rayPos = worldHitPos + (worldHitPos - attacker.position).normalized;
		var rayDir = (worldHitPos - rayPos).normalized;
		var hit : RaycastHit;
		//use identity as default in case the raycast fails somehow
		var effectRotation = Quaternion.identity;
		if(Physics.Raycast(rayPos, rayDir, hit, 5.0))
			effectRotation = Quaternion.FromToRotation(Vector3.up, hit.normal);
		if(hitEffect) ObjectPool.instance.GetObject(hitEffect.name, worldHitPos, effectRotation);
	}
	Camera.main.transform.localRotation = Quaternion.identity;
	iTween.PunchRotation(Camera.main.gameObject, Vector3(0.75, 1.5, 0.75), 0.5);
}