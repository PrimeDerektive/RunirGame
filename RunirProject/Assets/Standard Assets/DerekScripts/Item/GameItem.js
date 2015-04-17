#pragma strict

public class GameItem extends Item{
	
	var seed : int; //this is used as both a unique identifier and to roll the stats of the item
	var quality : Quality;
	var modifiers : StatModifier[];
	
	function Equals(otherItem : GameItem) : boolean{
		var isEqual = false;
		if(
			ID == otherItem.ID &&
			seed == otherItem.seed &&
			quality == otherItem.quality
		){
			isEqual = true;
		}
		return isEqual;	
	}
	
	function GameItem(i : int, s : int, q : Item.Quality){
		
		//get the base item and copy all the relevant values
		var baseItem : Item = ItemDatabase_New.instance.baseItems[i];
		ID = baseItem.ID;
		name = baseItem.name;
		iconSprite = baseItem.iconSprite;
		slot = baseItem.slot;
		isTwoHandedWeapon = baseItem.isTwoHandedWeapon;
		maxQuality = baseItem.maxQuality;
		potentialModifiers = baseItem.potentialModifiers;
		
		//set the seed and quality
		seed = s;
		quality = q;
		
		//we're going to temporarily just give all items a base modifier and one bonus
		modifiers = new StatModifier[2];
		modifiers[0] = potentialModifiers[0]; //first modifier is always base
	 	Random.seed = seed; //set the seed for random rolls
		if(potentialModifiers.length > 1)
			modifiers[1] = potentialModifiers[Random.Range(1, (potentialModifiers.length)-1)];
		
	}
	
	function GetTooltipText() : String{
		var nameColor : String = "[ffffff]";
		switch(quality){
			case Item.Quality.Epic:
				nameColor = "[8400ff]";
				break;
			case Item.Quality.Legendary:
				nameColor = "[bc2300]";
				break;
		}
		var text : String = nameColor+name+"[ffffff]";
		text += "\n[666666][sup]";
		switch(slot){
			case Slot.mainHand:
				if(isTwoHandedWeapon) text += "TWO-HANDED WEAPON";
				else text += "ONE-HANDED WEAPON";
				break;
			case Slot.offHand:
				text += "OFF-HAND ITEM";
				break;
			case Slot.head:
				text += "HELMET";
				break;
			case Slot.body:
				text += "ARMOR";
				break;
			case Slot.trinket:
				text += "TRINKET";
				break;
		}
		text += "[/sup][ffffff]";
		if(modifiers.length != 0){
			text += "\n"+modifiers[0].amount+" "+modifiers[0].GetStatName();
		}
		if(modifiers.length > 1){
			text += "[78c400]"; //change color to green for bonus modifiers
			for(var i = 1; i<modifiers.length; i++){
				text += "\n   +"+modifiers[i].amount+" "+modifiers[i].GetStatName();
			}
		}
		return text;
	}
	
	
		
}