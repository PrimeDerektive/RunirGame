#pragma strict

public class PlayerInventory extends MonoBehaviour{

	var displayInventory : boolean = false;
	
	private var equipSlots : EquipSlotPlayer[];
	private var bagSlots : GameItem[];

	public class EquipSlotPlayer{
		
		var item : GameItem;
		var slotType : Item.Slot;
		
		public function EquipSlotPlayer(i : GameItem, s : Item.Slot){
			item = i;
			slotType = s;
		}
		
	}

	function Start(){
	
		equipSlots = new EquipSlotPlayer[InventoryGUI.instance.equipSlots.length];
		//we need to set construct EquipSlotPlayers for each entry in equipSlots,
		//set the items to null for the exposed editor,
		//and also match the slot type to the inventory GUI
		for(var i = 0; i < equipSlots.length; i++){
			equipSlots[i] = new EquipSlotPlayer(null, InventoryGUI.instance.equipSlots[i].slotType);

		}
		
		bagSlots = new GameItem[InventoryGUI.instance.slots.length];
		//to keep the bagSlots array exposed to the editor, we need to explicitly set each 
		//spot to null so we can test it as a boolean
		for(i = 0; i < bagSlots.length; i++){
			bagSlots[i] = null;
		}
		
	}
	
	//called by the client on his local simulation
	function AddToInventory(item : GameItem){
		if(!InventoryFull()){
			for(var i = 0; i < bagSlots.length; i++){
				if(!bagSlots[i]){
					bagSlots[i] = item;
					if(uLink.NetworkView.Get(this).isMine) InventoryGUI.instance.slots[i].item = item;
					return;
				}
			}
		}
		else{
			Debug.Log("Error: inventory is full.");
		}
	}
	
	/*
	//called by the server
	function AddToInventory(seed : int){
		for(var i = 0; i < bagSlots.length; i++){
			if(!bagSlots[i]){
				var newItem = ItemDatabase_New.instance.GenerateRandomItem(seed);
				bagSlots[i] = newItem;
				break;
			}
		}
	}
	*/
	
	//equip the item in the array slot that corresponds
	//to the index of the clicked slot in the GUI
	//this gets called locally by a player from InventoryGUI, when he clicks on an item in his bag
	@RPC
	function EquipOnOwner(slotIndex : int){
	
		var equippable = bagSlots[slotIndex];
		EquipItem(equippable);
		
		//if we are not the server, tell the server we clicked on an item we want to equip
		if(uLink.Network.isClient)
			uLink.NetworkView.Get(this).RPC("EquipOnServer", uLink.RPCMode.Server, slotIndex);

	}
	
	//equip the item in the array slot that corresponds
	//to the index of the slot the player clicked on in his GUI
	//this gets called on the server, after a client tells him he clicked on a slot
	@RPC
	function EquipOnServer(slotIndex : int){
		var equippable = bagSlots[slotIndex];
		//the EquipItem function also returns a boolean if any part of the equip process fails
		var successfullyEquipped : boolean = EquipItem(equippable);
		//if it was a success, tell the proxies to equip it with the item seed
		if(successfullyEquipped) uLink.NetworkView.Get(this).RPC("EquipOnProxy", uLink.RPCMode.OthersExceptOwner, equippable.seed);
	}
	
	//proxies only receive an item seed, and re-generate the item from scratch to equip it
	@RPC
	function EquipOnProxy(itemSeed : int){
		//var item = ItemDatabase.instance.GenerateRandomItem(itemSeed);
		//var equippable = item as ItemDatabase.EquippableItem;
		//EquipItem(equippable);
	
	}
	
	function EquipItem(equippable : GameItem) : boolean{
		
		//find the equipment slot that corresponds to this item's slot type
		var equipSlot : EquipSlotPlayer = GetEquipmentSlot(equippable.slot);
		
		if(equipSlot){
		
			//only the server and the owning client need do two handed/offhand checks
			//and clear the bag slot. Proxies do not sync player bags, only equipment
			if(uLink.NetworkView.Get(this).isMine || uLink.Network.isServer){
			
				//two handed weapons are a special case
				if(equippable.isTwoHandedWeapon){
					var offHandSlot : EquipSlotPlayer = GetEquipmentSlot(Item.Slot.offHand);	
					if(offHandSlot.item){
						Debug.Log("Error: unequip off-hand item first.");
						return false;
					}
				}
				
				//offhand items are also a special case
				if(equippable.slot == Item.Slot.offHand){
					var mainHandSlot : EquipSlotPlayer = GetEquipmentSlot(Item.Slot.mainHand);	
					var mainHandItem = mainHandSlot.item;
					if(mainHandItem && mainHandItem.isTwoHandedWeapon){
						Debug.Log("Error: unequip two-hand item first.");
						return false;
					}
				}
				
				//find the bag slot that the item was in
				var bagSlotIndex = FindItemBagSlotIndex(equippable.seed);
				
				//we found it
				if(bagSlotIndex != null){
					
					//empty the bag slot, because we're moving it to the equipment slot
					bagSlots[bagSlotIndex] = null;
					
					//don't forget to clear the corresponding GUI bag slot if this is our inventory
					if(uLink.NetworkView.Get(this).isMine) InventoryGUI.instance.slots[bagSlotIndex].item = null;
				}
				else{
				
					Debug.Log("Error: couldn't find the requested item in bag.");
					return false;
				
				}
			
			}
			
			//unequip the item in this equipment slot, if there is one
			if(equipSlot.item) UnequipItem(GetEquipmentSlotIndex(equipSlot));
			
			//and move the new item into this equipment slot
			equipSlot.item = equippable;
			
			//don't forget to move it into the corresponding GUI equipment slot if this is our inventory
			if(uLink.NetworkView.Get(this).isMine)
				InventoryGUI.instance.equipSlots[GetEquipmentSlotIndex(equipSlot)].item = equippable;
				
			Debug.Log("Item successfully equipped.");
			return true;
			
			//var status : CharStatus = GameManager.instance.localPlayer.GetComponent.<CharStatus>();
			//status.AddBonus(equippable.baseModifier.stat, equippable.baseModifier.amount);
			//status.AddBonus(equippable.bonusModifier.stat, equippable.bonusModifier.amount);
		
		}
		else{
		
			Debug.Log("Error: not a valid equipment slot. How the hell did this happen?");
			return false;
		
		}
		
	}
	
	//Unequip the item in the array slot that corresponds
	//to the index of the clicked slot in the GUI
	//this gets called locally by a player from InventoryGUI, when he clicks on a piece of his equipment
	@RPC
	function UnequipOnOwner(slotIndex : int){
		
		//only the owner should have triggered this function from the InventoryGUI
		if(!uLink.NetworkView.Get(this).isMine) return;
		
		//if we are not the server, 
		if(uLink.Network.isClient){
			print("We are a client.");
			//Unequip the item locally
			UnequipItem(slotIndex); 
			//tell the server we clicked on an item we want to equip
			uLink.NetworkView.Get(this).RPC("UnequipOnServer", uLink.RPCMode.Server, slotIndex);
		}
		else if(uLink.Network.isServer){ //we are the server
			//call UnequipOnServer() directly
			UnequipOnServer(slotIndex);
		}
		
	}
	
	//Unequip the item in the array slot that corresponds
	//to the index of the slot the player clicked on in his GUI
	//this gets called on the server, after a client tells him he clicked on a slot
	@RPC
	function UnequipOnServer(slotIndex : int){
		//return if the inventory is full.
		if(InventoryFull()){
			print("Newp. Can't fit in inventory.");
			return;
		}
		//we made it this far so there's room in the inventory,
		//so unequip the item in that slot, and tell the proxies to unequip it too
		UnequipItem(slotIndex);
		uLink.NetworkView.Get(this).RPC("UnequipOnProxy", uLink.RPCMode.OthersExceptOwner, slotIndex);
	}
	
	@RPC
	function UnequipOnProxy(slotIndex : int){
		UnequipItem(slotIndex);	
	}
	
	function UnequipItem(slotIndex : int){
		
		//if we are the owner or the server, return if the inventory is full
		//because we can't unequip the item if there's no room in our bag
		if((uLink.NetworkView.Get(this).isMine || uLink.Network.isServer) && InventoryFull()){
			print("Newp. Can't fit in inventory.");
			return;
		}
		
		var item = equipSlots[slotIndex].item;
		
		if(item){
			//TODO: remove stats here
			/*
			var equippable = item as ItemDatabase.EquippableItem;
			var status : CharStatus = GameManager.instance.localPlayer.GetComponent.<CharStatus>();
			status.RemoveBonus(equippable.baseModifier.stat, equippable.baseModifier.amount);
			status.RemoveBonus(equippable.bonusModifier.stat, equippable.bonusModifier.amount);
			*/
			//remove the item from the equipment slot
			equipSlots[slotIndex].item = null;
			//don't forget to also remove it from the corresponding GUI slot if we are the owner
			if(uLink.NetworkView.Get(this).isMine) InventoryGUI.instance.equipSlots[slotIndex].item = null;
			//if we are the owner or the server, add the item back into the inventory bag
			if(uLink.NetworkView.Get(this).isMine || uLink.Network.isServer) AddToInventory(item);
		}
		
	}
	
	function GetEquipmentSlot(slotType : Item.Slot) : EquipSlotPlayer{
		for(var equipSlot : EquipSlotPlayer in equipSlots){
			if(equipSlot.slotType == slotType){
				return equipSlot;
			}
		}
	}
	
	function GetEquipmentSlotIndex(equipSlot : EquipSlotPlayer) : int{
		for(var i = 0; i < equipSlots.length; i++){
			if(equipSlots[i] == equipSlot){
				return i;
			}
		}
	}
	
	function FindItemBagSlotIndex(seed : int) : int{
		for(var i = 0; i < bagSlots.length; i++){
			if(bagSlots[i] && bagSlots[i].seed == seed) return i;
		}
	}
	
	function InventoryFull() : boolean{
		//start by assuming the inventory is full
		var full = true;
		//loop through all inventory slots
		for(var i = 0; i < bagSlots.Length; i++){
			//if we find an empty slot
			if(!bagSlots[i]){
				//the inventory must not be full
				full = false;
				//exit the loop
				break;
			}
		}
		return full;
	}
	
	/*
	function SaveInventory(){
		//the string in which everything will be stored
		var inventory : String;
		//loop through equipSlots, add them all to the string, in "index:seed;" format
		for(var i = 0; i < equipSlots.length; i++){
			var itemSeed : String = (equipSlots[i].item) ? equipSlots[i].item.seed.ToString() : "empty";
			inventory += itemSeed+",";
		}
		//loop through inventory, add them all to the string, in "(index + equipSlots.length):seed;" format
		for(i = 0; i<bagSlots.length; i++){
			itemSeed = (bagSlots[i]) ? bagSlots[i].seed.ToString() : "empty";
			inventory += itemSeed;
			if(i < (bagSlots.length-1)) inventory += ","; //comma separate all but last slot
		}
		PlayerPrefs.SetString(
			GameManager.instance.GetPlayer(uLink.NetworkView.Get(this).owner).name +"-inventory",
			inventory
		);
		
	}

	function LoadInventory(){
		Debug.Log("Attempting to load "+GameManager.instance.GetPlayer(uLink.NetworkView.Get(this).owner).name+"'s inventory.");
		var inventory = PlayerPrefs.GetString(
			GameManager.instance.GetPlayer(uLink.NetworkView.Get(this).owner).name +"-inventory"
		);
		if(inventory != ""){
			var itemSeeds : String[] = inventory.Split(","[0]);
			for(var i = 0; i < itemSeeds.length; i++){
				if(itemSeeds[i] != "empty"){
					if(i < equipSlots.length)
						equipSlots[i].item = ItemDatabase.instance.GenerateRandomItem(parseInt(itemSeeds[i]));
					else
						bagSlots[i - equipSlots.length] = ItemDatabase.instance.GenerateRandomItem(parseInt(itemSeeds[i]));
				}
			}
		}
		else
			Debug.Log("No inventory for this player to load.");
	}
	
	function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
		yield WaitForSeconds(0.5);
		if (uLink.NetworkView.Get(this).isMine) displayInventory = true;
		//if(uLink.Network.isServer) LoadInventory();
	}
	
	function uLink_OnServerUninitialized() { 
	   Debug.Log("Saving all players' (including server's) inventory on shutdown.");
	   //SaveInventory(); 
	   PlayerPrefs.Save();
	}
	
	function uLink_OnPlayerDisconnected(player : uLink.NetworkPlayer){
		if(player == uLink.NetworkView.Get(this).owner){
			Debug.Log("Saving remote player's inventory.");
			//SaveInventory();
		}
	}

	/*
	function ClearInventory(){
		for(var equipSlot : EquipSlotPlayer in equipSlots)
			equipSlot.item = null;
		for(var slot : Item in bagSlots)
			slot = null;
	}
	*/
	
	function OnGUI(){
		if(displayInventory){
			GUILayout.BeginArea(Rect(Screen.width - 150, 50, 150, 500));
				GUILayout.BeginVertical();
					for(var equipSlot : EquipSlotPlayer in equipSlots){
						var equipSlotString = equipSlot.slotType.ToString()+": ";
						if(equipSlot.item) equipSlotString += equipSlot.item.name;
						else equipSlotString += "Empty";
						GUILayout.Label(equipSlotString);
					}
					for(var bagSlot : GameItem in bagSlots){
						if(bagSlot) GUILayout.Label(bagSlot.name);
						else GUILayout.Label("Empty");
					}
				GUILayout.EndVertical();
			GUILayout.EndArea();
		}
	}

}

