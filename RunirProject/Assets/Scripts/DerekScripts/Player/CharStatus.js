#pragma strict

var stats : CharStat[];

//all characters with stats must have a health value
var health : float;
//and a stamina value
var stamina : float;

function Start () {
	health = GetStat(CharStat.Identifier.maxHealth).totalAmount;
	stamina = GetStat(CharStat.Identifier.maxStamina).totalAmount;
}

/*
//this function is called when the character is hit by another network entity (NPC or PC)
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

//this function is called by EvaluateHit
function TakeDamage(amount : float){
	//only apply the damage if the character has more than 0
	if(health > 0) health -= amount;
	//test the character's stability to see if this attack staggered them
	CheckStagger();
	//character death placeholder, ragdoll crap
	if(health <= 0){
		GetComponent.<RagdollController>().ragdolled = true;
		yield WaitForSeconds(0.1);
		GetComponentInChildren.<Rigidbody>().AddForceAtPosition((-latestHit.normal * 30.0) + (Vector3.up * 15.0), latestHit.point, ForceMode.VelocityChange);
		yield WaitForSeconds(5.0);
		//revive test
		health = GetStat(CharStat.Identifier.maxHealth).totalAmount;
		GetComponent.<RagdollController>().ragdolled = false;
	}
}

function CheckStagger(){
	//retrieve our stability stat
	var stability : int = GetStat(CharStat.Identifier.stability).totalAmount;
	//roll to see if the character succeeds in a stability save
	var roll : int = Random.Range(0, 100);
	//if they failed
	if(roll > stability){
		//broadcast the Stagger function
		SendMessage("Stagger");
	}
}

*/

/*
function OnGUI(){
	GUILayout.BeginArea(Rect(Screen.width - 150, 50, 150, 300));
		GUILayout.BeginVertical();
			for(var stat : CharStat in stats){
				GUILayout.Label(stat.id.ToString() +" "+ stat.totalAmount);
			}
		GUILayout.EndVertical();
	GUILayout.EndArea();
}
*/

function GetStat(id : CharStat.Identifier) : CharStat{
	for(var stat : CharStat in stats){
		if(stat.id == id){
			return stat;
		}
	}
}

function AddBonus(id : CharStat.Identifier, amount : int){
	var stat = GetStat(id);
	stat.bonusAmount += amount;
}

function RemoveBonus(id : CharStat.Identifier, amount : int){
	var stat = GetStat(id);
	stat.bonusAmount -= amount;
}