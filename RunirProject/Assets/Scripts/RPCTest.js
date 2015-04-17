#pragma strict


function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if(uLink.Network.isClient){
		uLink.NetworkView.Get(this).UnreliableRPC("Hello", uLink.RPCMode.Server, "Hi!");
	}
}

@RPC
function Hello(message : String){
	print(message);
}