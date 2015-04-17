#pragma strict
/*
public class ItemDatabase extends MonoBehaviour{

	var equippableItems : EquippableItem[];
	
	static var instance : ItemDatabase;
	
	function Awake(){
		instance = this;
	}

	public class Item{
		
		var name : String;
		var iconSprite : String;
		var seed : int;	
		
		function GetTooltipText() : String{
			return "[bc2300]"+name+"[ffffff]";
		}
		
	}
	
	public enum EquipSlotType{
		mainHand, offHand, head, body, trinket
	}
	
	public class StatModifier{
		
		var stat : CharStat.Identifier;
		var amount : int;
		
		function GetStatName() : String{
			var statName : String;
			switch(stat){
				case CharStat.Identifier.maxHealth:
					statName = "Health";
					break;
				case CharStat.Identifier.damageRating:
					statName = "Damage Rating";
					break;
				case CharStat.Identifier.armor:
					statName = "Armor";
					break;
			}
			return statName;
		}
		
	}

	public class EquippableItem extends Item{
		
		var slot : EquipSlotType;
		var isTwoHandedWeapon : boolean = false;
		var baseModifier : StatModifier;
		var potentialBonuses : StatModifier[];
		var bonusModifier : StatModifier;
		
		function GetTooltipText() : String{
			var text = super.GetTooltipText();
			text += "\n[666666][sup]";
			switch(slot){
				case EquipSlotType.mainHand:
					if(isTwoHandedWeapon) text += "TWO-HANDED WEAPON";
					else text += "ONE-HANDED WEAPON";
					break;
				case EquipSlotType.offHand:
					text += "OFF-HAND ITEM";
					break;
				case EquipSlotType.head:
					text += "HELMET";
					break;
				case EquipSlotType.body:
					text += "ARMOR";
					break;
				case EquipSlotType.trinket:
					text += "TRINKET";
					break;
			}
			text += "[/sup][ffffff]";
			text += "\n"+baseModifier.amount+" "+baseModifier.GetStatName();
			text += "[78c400]"; //change color to green for bonus modifiers
			text += "\n   +"+bonusModifier.amount+" "+bonusModifier.GetStatName();
			//text += "\n\n[ff9000]Has a chance to smite foes with righteous lightning.";
			return text;
		}
		
	}
	
	function GenerateRandomItem(seed : int) : EquippableItem{
		Random.seed = seed;
		var itemRoll : int = Random.Range(0, equippableItems.Length);
		var templateItem = equippableItems[itemRoll];
		//create the new item
		var newItem : EquippableItem = new EquippableItem();
		//copy all the parameters from the template
		newItem.name = templateItem.name;
		newItem.iconSprite = templateItem.iconSprite;
		newItem.slot = templateItem.slot;
		newItem.isTwoHandedWeapon = templateItem.isTwoHandedWeapon;
		newItem.baseModifier = templateItem.baseModifier;
		var bonusModRoll = Random.Range(0, templateItem.potentialBonuses.Length);
		newItem.bonusModifier = templateItem.potentialBonuses[bonusModRoll];
		newItem.seed = seed;
		return newItem;		
	}

}
*/