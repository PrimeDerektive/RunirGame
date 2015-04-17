#pragma strict
import System.Collections.Generic;

//static instance of this script
//static var instance : GameManager; 

var proxyBackTime : float = 0.1;

//spawning variables
var playerPrefab : GameObject;
var spawnPoint : Transform;
//general references
var aimTarget : Transform;

static var instance : GameManager;

var localPlayer : GameObject;

//player list variables
var players : List.<PlayerNode> = new List.<PlayerNode>();

public class PlayerNode{
	var player : uLink.NetworkPlayer;
	var name : String;
	var object : GameObject;
}

//Creates a new PlayerNode for a newly connected player and adds him to the list of players
function AddPlayer(player : uLink.NetworkPlayer, name : String, playerObject : GameObject){
	var newPlayer = new PlayerNode();
	newPlayer.player = player;
	newPlayer.name = name;
	newPlayer.object = playerObject;
	players.Add(newPlayer);
}


function GetPlayer(player : uLink.NetworkPlayer) : PlayerNode{
	for(var p : PlayerNode in players){
		if(p.player == player){
			return p;
		}
	}
}

function Awake(){

	//set static reference
	instance = this;
	
	if(uLink.Network.peerType == uLink.NetworkPeerType.Disconnected){
		uLink.Network.InitializeServer(32, 7100);
	}
	
	//Re-enable network messages now that we've loaded into the level
	uLink.Network.isMessageQueueRunning = true;	
	
}

function Start(){

	//get my player name from PlayerPrefs
	var myName = PlayerPrefs.GetString("PlayerName");
	
	//If we intend to allow listen servers, the host needs a player object
	if(uLink.Network.isServer){
		Debug.Log("Connected and loaded into game as host.");
		//server can't send an RPC to himself, so he calls PlayerConnected locally
		PlayerConnected(uLink.Network.player, myName);
	}
	else if(uLink.Network.isClient){
		Debug.Log("Connected and loaded into game as client.");
		//tell the server we're connected
		uLink.NetworkView.Get(this).RPC("PlayerConnected", uLink.RPCMode.Server, uLink.Network.player, myName);
	}

}

//PlayerConnected is only called by the server
@RPC
function PlayerConnected(player : uLink.NetworkPlayer, name : String){
	
	//Create player's object for him (called by the server), initialize for all players so they know who the 'owner' is
	var newPlayerPrefab = uLink.Network.Instantiate(player, playerPrefab, spawnPoint.position, spawnPoint.rotation, 0);
	
	//Add the new player to the player list on the server
	AddPlayer(player, name, newPlayerPrefab);
	
	//add player to loot manager
	LootManager.instance.AddPlayer(player);
	
	//Determine if player is on the red team
	//var isRedTeam : boolean = false;
	
	//Add the new player to the player list on the server
	//AddPlayerNode(player, name, isRedTeam, newPlayerPrefab);

	//Initialize the player for everyone
	//newPlayerPrefab.networkView.RPC("NetworkInit", RPCMode.AllBuffered, player, name, isRedTeamInt);
	
}
//OnPlayerDisconnected is only called by the server
//Cleans up after disconnecting players
function uLink_OnPlayerDisconnected(player : uLink.NetworkPlayer){

	//we need to cache a reference to the node to remove,
	//because removing it in the middle of iteration errors out
	var nodeToRemove : PlayerNode; //variable to store reference to node to be removed
	//Find the disconnecting player in the list of players
	for(var node : PlayerNode in players){
		if(node.player == player){
			uLink.Network.RemoveInstantiate(uLink.NetworkView.Get(node.object).viewID); //Removes the Network.Instantiate call from the buffer
			uLink.Network.Destroy(node.object); //Destroy the object across the network
			nodeToRemove = node; //set the reference to the node to be remove
		}
	}
	players.Remove(nodeToRemove); //Remove the player from the list
	
	//Standard cleanup. The player probably shouldn't have ever spawned anything
	//but we'll do these just to be safe
	uLink.Network.RemoveRPCs(player);
    uLink.Network.DestroyPlayerObjects(player);
    
}

function OnGUI(){

	if(GUI.Button(Rect(25, Screen.height - 50, 100, 30), "Disconnect")){
		uLink.Network.Disconnect();
	}

}

/*
function OnGUI(){
	//if(Network.isServer){
		GUILayout.BeginArea(Rect(Screen.width - 130, 30, 100, 300));
		    GUILayout.BeginVertical();
			    for(var playerNode : PlayerNode in players)
			    	GUILayout.Label(playerNode.name);
		    GUILayout.EndVertical();
		GUILayout.EndArea();
	//}
}
*/