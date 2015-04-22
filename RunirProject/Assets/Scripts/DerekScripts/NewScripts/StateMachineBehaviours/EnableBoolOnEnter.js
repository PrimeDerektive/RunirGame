#pragma strict
public class EnableBoolOnEnter extends StateMachineBehaviour{

	var bool : String;

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		animator.SetBool(bool, true);
	}

}
	