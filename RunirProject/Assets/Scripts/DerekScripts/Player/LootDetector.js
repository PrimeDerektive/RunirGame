#pragma strict

var aimTarget : Transform;
var lootLayer : LayerMask;
var lootLabel : UILabel;

private var cam : Transform;
private var activeLoot : Loot;

function Start () {
	if(!aimTarget) aimTarget = GameObject.FindGameObjectWithTag("AimTarget").transform;
	if(!lootLabel) lootLabel = GetComponent.<UILabel>();
	lootLabel.text = "";
	cam = Camera.main.transform;
}

function Update () {
	
	var dir = (aimTarget.position - cam.position).normalized;
	var hit : RaycastHit;
	if(Physics.Raycast(cam.position, dir, hit, 10.0, lootLayer)){
		if(!activeLoot) activeLoot = hit.collider.GetComponent.<Loot>();
	}
	else{
		lootLabel.text = "";
		activeLoot = null;
	}
	if(activeLoot){
		if(lootLabel.text == "") lootLabel.text = activeLoot.item.name;
		if(Input.GetKeyDown(KeyCode.F)){
			uLink.NetworkView.Get(transform.root).UnreliableRPC("RequestLoot", uLink.RPCMode.Server, activeLoot.item);
		}
	}
	
}

//RequestLoot is run on the server when a client sends a request to pick up loot
//it compares the item requested to the list of valid loot in LootManager
//to determine where or not to grant the request
@RPC
function RequestLoot(item : GameItem, info : uLink.NetworkMessageInfo){
	var isValidLoot = LootManager.instance.IsValidLoot(info.sender, item);
	if(isValidLoot){
		var playerObject = GameManager.instance.GetPlayer(info.sender).object;
		if(playerObject){
			//if this is me (the server), we don't want to add it to the serverside inventory
			//as it will get double-added
			if(playerObject != GameManager.instance.localPlayer){
				//this request didn't come from the server player. add the item to the requesting client's inventory on the server
				playerObject.GetComponent.<PlayerInventory>().AddToInventory(item); 
			}
			uLink.NetworkView.Get(transform.root).UnreliableRPC("LootGranted", info.sender, item);
			//remove that item from the player's loot list in the LootManager
			LootManager.instance.RemoveLoot(info.sender, item);
		}
	}
}

@RPC
function LootGranted(item : GameItem){
	var lootBags : Loot[] = FindObjectsOfType(Loot) as Loot[];
	for(var lootBag : Loot in lootBags){
		if(lootBag.item.Equals(item)){
			GameManager.instance.localPlayer.GetComponent.<PlayerInventory>().AddToInventory(lootBag.item);
			Destroy(lootBag.gameObject);
		}
	}
}
