#pragma strict

public class InventoryGUI extends MonoBehaviour{

	var equipSlots : EquipmentSlot[];
	var slots : InventorySlot[];
	var tooltip : Tooltip;	
	
	static var instance : InventoryGUI;
	
	function Awake(){
		instance = this;
	}
	
	///<summary>
	///EquipRequest is sent from a client to the server when he attempts to equip something locally
	///the server checks if the player actually owns that item, to determine whether or not it is safe
	///to broadcast the Equip() RPC to proxies of that player
	///</summary>
	
	/*
	@RPC
	function EquipRequest(seed : int, info : NetworkMessageInfo){
		var inventory = GetPlayerInventory(info.sender);
		var canEquip : boolean = false;
		for(var i = 0; i < inventory.items.length; i++){
			if(inventory.items[i] == seed){
				canEquip = true;
				break;
			}
		}
		
	}
	*/

	//this function is called locally when the player clicks on an equippable item in his inventory bag
	//it needs to tell the PlayerInventory script on his player object to move this
	function Equip(invSlot : InventorySlot){
		
		//first we need to find the array index of the slot that was clicked
		//so we can tell the PlayerInventory script what slot was clicked on
		//and the array indicies match up
		var slotIndex : int;
		for(var i = 0; i < slots.length; i++){
			if(slots[i] == invSlot) slotIndex = i;
		}
		
		//tell the PlayerInventory of the local player script to equip the item in that slotIndex
		GameManager.instance.localPlayer.GetComponent.<PlayerInventory>().EquipOnOwner(slotIndex);
	
	}

	function Unequip(equipSlot : EquipmentSlot){
		var slotIndex : int;
		for(var i = 0; i < equipSlots.length; i++){
			if(equipSlots[i] == equipSlot) slotIndex = i;
		}
		GameManager.instance.localPlayer.GetComponent.<PlayerInventory>().UnequipOnOwner(slotIndex);
	}

}