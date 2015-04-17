#pragma strict

public class EquipmentSlot extends InventorySlot{

	var slotType : Item.Slot;
	
	function OnClick(){
		if(item){ //if there is an item equipped in this slot
			invGUI.Unequip(this);
		}
	}

}