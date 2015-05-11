#pragma strict

public class BlockKnockback extends StateMachineBehaviour{

	private var speed = 15.0;

	private var trans : Transform;
	private var controller : CharacterController;
	private var speedToUse : float = 0.0;
	

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		trans = animator.GetComponent.<Transform>();
		controller = animator.GetComponent.<CharacterController>();
		speedToUse = speed;
	}
	
	public override function OnStateUpdate(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int) {
		if(controller && speedToUse > 0){
			speedToUse -= Time.deltaTime*25.0;
			controller.Move(-trans.forward * speedToUse * Time.deltaTime);
		}
	}
	
	public override function OnStateExit(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		
	}
    
}