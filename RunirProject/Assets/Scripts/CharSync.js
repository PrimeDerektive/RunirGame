#pragma strict

private var newPos : Vector3;

function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if(uLink.Network.isServer)
		InvokeRepeating("SendToClients", 0, 1.0/uLink.Network.sendRate);
	if(uLink.NetworkView.Get(this).isMine){
		//start sending updates to clients
		if(uLink.Network.isClient)
			InvokeRepeating("SendToServer", 0, 1.0/uLink.Network.sendRate);
	}
	else{
		GetComponent.<CharacterMotor>().canControl = false;
		GetComponent.<FPSInputController>().enabled = false;
		lastTimestamp = uLink.Network.time;
	}
}

function SendToClients(){
	uLink.NetworkView.Get(this).UnreliableRPC("Move", uLink.RPCMode.Others, transform.position);
}

function SendToServer(){
	uLink.NetworkView.Get(this).UnreliableRPC("Move", uLink.RPCMode.Server, transform.position);
}

private var firstMove : boolean = true;
private var lastTimestamp : float;
private var newTimestamp : float;

@RPC
function Move(pos : Vector3, info : uLink.NetworkMessageInfo){
	if(!firstMove)
		lastTimestamp = newTimestamp;
	newPos = pos;
	newTimestamp = info.timestamp;
	firstMove = false;
}

function Update(){
	if(uLink.NetworkView.Get(this).isMine)
		return;
	if(!firstMove)
		transform.position = Vector3.Lerp(transform.position, newPos, Time.deltaTime*(1.0/(newTimestamp - lastTimestamp)));
}

