#pragma strict

/// <summary>
/// Item is only a template class used to create the base templates
/// in the ItemDatabase. ItemDatabase creates instances of type GameItem
/// which are the actual, usable in-game items.
/// </summary>

public class Item{

	//the ID is set to the array index of the item in Awake() of ItemDatabase
	//for easy lookup in GameItems
	@HideInInspector
	var ID : int; 
	
	var name : String;
	var iconSprite : String;
	var slot : Slot;
	var isTwoHandedWeapon : boolean;
	var maxQuality : Quality;
	var potentialModifiers : StatModifier[]; //first modifier should be base modifier
		
	public enum Slot{
		none = 0,
		mainHand = 1,
		offHand = 2,
		head = 3,
		body = 4,
		trinket = 5
	}
	
	public enum Quality{
		Common = 0,
		Uncommon = 1,
		Rare = 2,
		Epic = 3,
		Legendary = 4
	}
	
}

