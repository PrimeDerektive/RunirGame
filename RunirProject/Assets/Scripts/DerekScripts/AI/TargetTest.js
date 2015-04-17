#pragma strict

var moveSpeed = 4.0;
var switchTime = 2.0;

private var nextSwitch : float = 0.0;
private var moveDir = Vector3.right;

function Start () {
	nextSwitch = Time.time + switchTime;
	if(uLink.Network.isServer) InvokeRepeating("SyncPosition", 0.0, 0.1);
}

private var newPos : Vector3;

function Update(){
	if(uLink.Network.isServer){
		transform.Translate(moveDir * moveSpeed * Time.deltaTime);
		if(Time.time >= nextSwitch){
			moveDir *= -1.0;
			nextSwitch = Time.time + switchTime;
		}
	}
	else{
		transform.position = Vector3.Lerp(transform.position, newPos, Time.deltaTime * 10.0);
	}
}

function SyncPosition(){
	uLink.NetworkView.Get(this).RPC("SyncPosRPC", uLink.RPCMode.Others, transform.position);
}

@RPC
function SyncPosRPC(pos : Vector3){
	newPos = pos;
}