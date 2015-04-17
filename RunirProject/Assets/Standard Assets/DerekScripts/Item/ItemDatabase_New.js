#pragma strict
import System.Collections.Generic;

public class ItemDatabase_New extends MonoBehaviour{

	var baseItems : Item[];

	//the following are populated in Awake()
	//they are meant to function as buckets of array indices (ID's) of baseItems[]
	//for item with max qualities that correspond to the bucket
	var legendaryItems : List.<int> = new List.<int>();
	var epicItems : List.<int> = new List.<int>();
	var rareItems : List.<int> = new List.<int>();
	var uncommonItems : List.<int> = new List.<int>();

	static var instance : ItemDatabase_New;

	function Awake(){

		instance = this;
		
		for(var i = 0; i < baseItems.length; i++){
			
			baseItems[i].ID = i; //save the indicies in the base items
			
			//store the epic bucket
			if(baseItems[i].maxQuality == Item.Quality.Epic){
				epicItems.Add(i);
			}
		
		}

	}
	
	function Start(){
		GenerateRandomItem(Item.Quality.Epic);
	}
	

	function GenerateRandomItem(quality : Item.Quality) : GameItem{
		var baseItemID : int;
		switch(quality){
			case Item.Quality.Epic:
				baseItemID = epicItems[Random.Range(0, epicItems.Count)];
				break;
		}
		var seed : int = Random.Range(0, 65535);
		var item : Item = new GameItem(baseItemID, seed, quality);
		return item;
	}
	
	/*
	function GetItem(ID : int, seed : int, quality : Item.Quality) : GameItem{
		
		var baseItem : Item = baseItems[ID];
		var item : GameItem = new GameItem();
		item.Copy(baseItem);
		item.seed = seed;
		item.quality = quality;
		
		//we're going to temporarily just give all items a base modifier and one bonus
		item.modifiers = new StatModifier[2];
		item.modifiers[0] = item.potentialModifiers[0]; //first modifier is always base
		Random.seed = item.seed; //set the seed for random rolls
		if(item.potentialModifiers.length > 1)
			item.modifiers[1] = item.potentialModifiers[Random.Range(0, (item.potentialModifiers.length)-1)];	
		
		//just a test
		print(item.name);
		print(item.modifiers[0].stat +" "+ item.modifiers[0].amount);
		print(item.modifiers[1].stat +" "+ item.modifiers[0].amount);
		
		
		return item;
	}
	*/

}