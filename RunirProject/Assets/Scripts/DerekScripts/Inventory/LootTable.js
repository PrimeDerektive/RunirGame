#pragma strict

var minDrops : int = 1; //minimum number of items to drop
var maxDrops : int = 4; //maximum number of items to drop

var lootEmitter : Transform; //the position from which loot shall fly
var chestTop : GameObject;

var alreadyOpened = new List.<uLink.NetworkPlayer>();

/*

public class ItemDrop{
	var chanceForLegendary : float;
	var chanceForEpic : float;
	var chanceForRare : float;
	var chanceForUncommon : float;
}

*/

function OnTriggerEnter(other : Collider){
	//only the server determines spawns loot
	if(other.CompareTag("Player") && uLink.Network.isServer){
		var networkPlayer = uLink.NetworkView.Get(other).owner;
		if(!alreadyOpened.Contains(networkPlayer)){
			var seed : int = Random.Range(0, 65535);
			AddToLootManager(networkPlayer, seed);
			uLink.NetworkView.Get(this).RPC("DropLoot", networkPlayer, seed);
			alreadyOpened.Add(networkPlayer);
		}
	}
}

function AddToLootManager(player : uLink.NetworkPlayer, seed : int){
	Random.seed = seed;
	var numberOfDrops : int = Random.Range(minDrops, maxDrops);
	for(var i = 0; i < numberOfDrops; i++){
		var item : GameItem = ItemDatabase_New.instance.GenerateRandomItem(Item.Quality.Epic);
		LootManager.instance.AddLoot(player, item);
	}
}

@RPC
function DropLoot(seed : int){
	Destroy(chestTop);
	Random.seed = seed;
	var numberOfDrops : int = Random.Range(minDrops, maxDrops);
	var items : GameItem[] = new GameItem[numberOfDrops];
	for(var i = 0; i < numberOfDrops; i++){
		items[i] = ItemDatabase_New.instance.GenerateRandomItem(Item.Quality.Epic);
	}
	//you have to do two loops because the RNG is finicky when you're setting the seed and want identical results
	for(i = 0; i < items.length; i++){
		var lootBag : GameObject = Instantiate(Resources.Load("LootBag", GameObject), lootEmitter.position, lootEmitter.rotation);
		var loot : Loot = lootBag.GetComponent.<Loot>();
		loot.item = items[i];
		lootBag.GetComponent.<Rigidbody>().velocity = Random.onUnitSphere * 5.0; //shoot loot in random direction
		lootBag.GetComponent.<Rigidbody>().AddTorque(Random.onUnitSphere * 5.0, ForceMode.Impulse);//give it a nice random spin, too
		yield;
	}
}