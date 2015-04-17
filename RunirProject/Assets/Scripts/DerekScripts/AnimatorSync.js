#pragma strict

private var anim : Animator;

function Start () {
	anim = GetComponent.<Animator>();
}

private var sentThisState : boolean = false;

function Update(){
	
	if(uLink.NetworkView.Get(this).isMine && uLink.Network.isClient){
		
		//if we are in a transition and haven't sent the next state yet
		if(anim.IsInTransition(3) && !sentThisState){
			var nextState = anim.GetNextAnimatorStateInfo(3);
			if(!nextState.IsName("Nothing")){
				uLink.NetworkView.Get(this).RPC("UpdateAnimState", uLink.RPCMode.Server, nextState.nameHash);
				sentThisState = true;
			}
		}
		
		//if we are no longer in transition and already sent the next (current state)
		if(!anim.IsInTransition(3) && sentThisState){
			sentThisState = false; //reset boolean
		}
		
	}
	
}

@RPC
function UpdateAnimState(latestState : int){
	print("received new state");
	var currentState = anim.GetCurrentAnimatorStateInfo(3).nameHash;
	var nextState = anim.GetNextAnimatorStateInfo(3).nameHash;
	if(latestState != currentState && nextState != latestState){
		anim.CrossFade(latestState, 0.1, 3);
	}
}