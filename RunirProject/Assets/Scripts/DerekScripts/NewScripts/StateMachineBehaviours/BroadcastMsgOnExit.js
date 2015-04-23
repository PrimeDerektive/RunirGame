#pragma strict
public class BroadcastMsgOnExit extends StateMachineBehaviour{

	var functionName : String;
	var floatValue : float;

	public override function OnStateExit(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		if(floatValue > 0)
			animator.gameObject.BroadcastMessage(functionName, floatValue);
		else
			animator.gameObject.BroadcastMessage(functionName);
	}

}
	