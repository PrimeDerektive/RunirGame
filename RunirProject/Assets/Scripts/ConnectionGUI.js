#pragma strict
private var playerName : String;
private var connectToIP : String = "127.0.0.1";
private var connectPort : int = 7100;

function Awake(){
	var defaultNameNumber : int = Random.Range(0, 9999);
	var defaultName : String = "RandomGuy" + defaultNameNumber.ToString();
	playerName = PlayerPrefs.GetString("PlayerName", defaultName);
}

function OnGUI(){
   
	//We are currently disconnected: Neither client nor host
   	if (uLink.Network.peerType == uLink.NetworkPeerType.Disconnected){
			
	    GUI.Box(Rect(Screen.width/2 - 160, Screen.height/2 - 60, 320, 145), "");
	    GUILayout.BeginArea(Rect(Screen.width/2 - 150, Screen.height/2 - 50, 300, 150));
	    	GUILayout.BeginVertical();
	    	
	    		//label and text field for player name
	    		GUILayout.BeginHorizontal();
		    		GUILayout.Label("Player Name:");
		    		playerName = GUILayout.TextField(playerName, GUILayout.Width(175));
	    		GUILayout.EndHorizontal();
	    	
	    		GUILayout.Space(2);
	    	
	    		//label and text field for entering server ip address
		    	GUILayout.BeginHorizontal();
		    		GUILayout.Label("Server IP:");
		    		connectToIP = GUILayout.TextField(connectToIP, GUILayout.Width(175));
		    	GUILayout.EndHorizontal();
		    	
		    	GUILayout.Space(2);
		    	
		    	//label and text field for entering server port
		    	GUILayout.BeginHorizontal();
			    	GUILayout.Label("Server Port:");
			    	connectPort = parseInt(GUILayout.TextField(connectPort.ToString(), GUILayout.Width(175)));
		    	GUILayout.EndHorizontal();
		    	
		    	GUILayout.Space(2);
		    	
		    	//need to save player name in both buttons, because
		    	//we're not sure which one the user might press
		    	if (GUILayout.Button ("Connect as client")){
		    		//save player name to PlayerPrefs
					PlayerPrefs.SetString("PlayerName", playerName);
					//connect to the "connectToIP" and "connectPort" as entered via the GUI
					uLink.Network.Connect(connectToIP, connectPort);
				}
				
		    	if (GUILayout.Button ("Start Server")){
					//save player name to PlayerPrefs
					PlayerPrefs.SetString("PlayerName", playerName);
					//start a server for 32 clients using the "connectPort" given via the GUI
					//ignore the NAT setting for now (False)
					uLink.Network.InitializeServer(32, connectPort);
				}
	    	
	    	GUILayout.EndVertical();
	    GUILayout.EndArea();
    
    }

}

function uLink_OnConnectedToServer(){
	//disable network messages during level load
	print("connected to ulink server.");
    uLink.Network.isMessageQueueRunning = false;
    Application.LoadLevel("Game");  
}

function uLink_OnServerInitialized(){
    print("ulink server started.");
    Application.LoadLevel("Game"); 
}