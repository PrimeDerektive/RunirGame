#pragma strict

function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if(uLink.Network.isServer){
		//start sending updates to clients
		InvokeRepeating("SendState", 0, 1.0/15.0);
	}	
}

/*------------------------------------------------------------
Server logic
------------------------------------------------------------*/

//byte for denoting changes in the object' state
private enum ChangeFlags{
    None = 0x0,
    PosX = 0x1,
    PosY = 0x2,
    PosZ = 0x4,
    ViewX = 0x8,
    ViewY = 0x16,
    ViewZ = 0x32,
    Firing = 0x64
}

//save the last sent state values to compare against new onces
//to decide if they need to be sent
private var lastPosX : float;
private var lastPosY : float;
private var lastPosZ : float;

//send a full state update every 1-3 seconds in
//an attempt to compensate for packet loss
private var nextFullState : float = 0.0;	

function SendState(){

	var changeFlags = ChangeFlags.None;
	
	var sendFullState : boolean = false;
	if(uLink.Network.time > nextFullState){
		sendFullState = true;
		nextFullState = uLink.Network.time + Random.Range(1.0, 3.0);
	} 

	if(transform.position.x != lastPosX || sendFullState)
		changeFlags |= ChangeFlags.PosX;
	if(transform.position.y != lastPosY || sendFullState)
		changeFlags |= ChangeFlags.PosY;
	if(transform.position.z != lastPosZ || sendFullState)
		changeFlags |= ChangeFlags.PosZ;

	//if changeflags != none, something must have changed
	if(changeFlags != ChangeFlags.None){
		
		var stream : uLink.BitStream = new uLink.BitStream(false);
		//always write the changeflags and the timestamp to the stream
		stream.Write.<byte>(changeFlags);
		//only write the values that changed to the stream
		if((changeFlags & ChangeFlags.PosX) == ChangeFlags.PosX){
	    	stream.Write.<float>(transform.position.x);
	    	lastPosX = transform.position.x;
	    }
	    if((changeFlags & ChangeFlags.PosY) == ChangeFlags.PosY){
	    	stream.Write.<float>(transform.position.y);
	    	lastPosY = transform.position.y;
	    }
	    if((changeFlags & ChangeFlags.PosZ) == ChangeFlags.PosZ){
	    	stream.Write.<float>(transform.position.z);	
	    	lastPosZ = transform.position.z;
	    }		 	
	 	
	 	//send the stream unreliably to the clients
		uLink.NetworkView.Get(this).UnreliableRPC("UpdateState", uLink.RPCMode.Others, stream);			
	
	}

}

/*------------------------------------------------------------
Client logic
------------------------------------------------------------*/

var latestPos : Vector3;
var lastPos : Vector3;
var timeOfLastUpdate : float;

@RPC
function UpdateState(stream : uLink.BitStream){

	lastPos = transform.position;

	//Read in the change flags
	var changeFlags : ChangeFlags = stream.Read.<byte>();
	
	//Initialize the new state with the same values as the last state,
	//since we're only reading in what has changed since then
	latestPos = transform.position;	
	
	//Read in the new values
    if((changeFlags & ChangeFlags.PosX) == ChangeFlags.PosX)
    	latestPos.x = stream.Read.<float>();
    if((changeFlags & ChangeFlags.PosY) == ChangeFlags.PosY)
    	latestPos.y = stream.Read.<float>();
	if((changeFlags & ChangeFlags.PosZ) == ChangeFlags.PosZ)
    	latestPos.z = stream.Read.<float>();
    	
    timeOfLastUpdate = Time.time;
   
}


function Update(){
	
	//only clients perform corrections and view interpolation
	if(uLink.Network.isServer || uLink.NetworkView.Get(this).isMine)
		return;
	
	if((Time.time - timeOfLastUpdate) > 0.1){
		var extrapDir = (latestPos - lastPos).normalized;
		var extrapPos : Vector3 = transform.position + extrapDir * Time.deltaTime;
		transform.position = Vector3.Lerp(transform.position, extrapPos, Time.deltaTime*10.0);
	}
	else
		transform.position = Vector3.Lerp(transform.position, latestPos, Time.deltaTime*10.0);	

}