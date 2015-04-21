#pragma strict

public class Rolling extends StateMachineBehaviour{

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		animator.SetBool("busy", true);
	}
	
	public override function OnStateUpdate(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int) {
		if(stateInfo.normalizedTime >= 0.75 && animator.GetBool("busy")){
			animator.SetBool("busy", false);
		}
	}
	
	public override function OnStateExit(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		animator.SetBool("roll", false);
	}
    
}