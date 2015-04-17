#pragma strict

/// <summary>
/// Loot Manager -- This component is used by the server only. It maintains a lists of all dropped loot for each network player,
/// so when they request to pick up or add an item to their inventory, the server can check to make sure that the item is actually
/// an item that dropped for that player.
/// </summary>

//allLootLists is a list of all connected players' loot lists
var allLootLists : List.<PlayerLootList> = new List.<PlayerLootList>();

//a static instance for easy access from other script
static var instance : LootManager;

function Awake(){
	instance = this;
}

public class PlayerLootList{
	//the player whose list this is
	var player : uLink.NetworkPlayer;
	//the list of dropped loot
	var loot : List.<GameItem> = new List.<GameItem>();
}

function AddPlayer(player : uLink.NetworkPlayer){
	var newPlayerLootList = new PlayerLootList();
	newPlayerLootList.player = player;
	allLootLists.Add(newPlayerLootList);
}

function AddLoot(player : uLink.NetworkPlayer, item : GameItem){
	var lootList = GetLootList(player);
	if(lootList){
		lootList.loot.Add(item);
	}
	else{
		Debug.Log("Error: that NetworkPlayer doesn't appear to have a loot list.");
	}
}

function RemoveLoot(player : uLink.NetworkPlayer, item : GameItem){
	var lootList = GetLootList(player);
	if(lootList){
		//we need to loop through the loot list instead of just using Remove because the comparer won't find it
		for(var listItem : GameItem in lootList.loot){
			if(item.Equals(listItem)){
				lootList.loot.Remove(listItem);
				break;
			}
		}
	}
	else{
		Debug.Log("Error: that NetworkPlayer doesn't appear to have a loot list.");
	}
}

function IsValidLoot(player : uLink.NetworkPlayer, item : GameItem) : boolean{
	var isValid = false;
	var lootList = GetLootList(player);
	if(lootList){
		for(var listItem : GameItem in lootList.loot){
			if(item.Equals(listItem)){
				isValid = true;
				break;
			}
		}
	}
	return isValid;
}

function GetLootList(player : uLink.NetworkPlayer) : PlayerLootList{
	for(var lootList in allLootLists){
		if(lootList.player == player){
			return lootList;
		}
	}
}

function uLink_OnPlayerDisconnected(player : uLink.NetworkPlayer){
	var listToRemove : PlayerLootList = GetLootList(player);
	allLootLists.Remove(listToRemove);    
}
