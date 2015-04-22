#pragma strict
public class ResetFloatOnEnter extends StateMachineBehaviour{

	var floatParam : String;

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		animator.SetFloat(floatParam, 0.0);
	}

}
	