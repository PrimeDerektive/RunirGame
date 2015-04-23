#pragma strict
public class BroadcastMsgOnEnter extends StateMachineBehaviour{

	var functionName : String;
	var floatValue : float;

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		if(floatValue > 0)
			animator.gameObject.BroadcastMessage(functionName, floatValue);
		else
			animator.gameObject.BroadcastMessage(functionName);
	}

}
	