#pragma strict

function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if(uLink.NetworkView.Get(this).isMine){
		GameObject.FindGameObjectWithTag("CameraHolder").GetComponent.<TPSOrbit>().SetTarget(transform);
	}
}