#pragma strict
public class MoveSpeedModifier extends StateMachineBehaviour{

	var modifier : float = 0.35;
	
	private var motor : NewMotor;

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		motor = animator.GetComponent.<NewMotor>();
		if(motor) motor.moveSpeedModifier = modifier;
	}
	
	public override function OnStateUpdate(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		//does seem to work if we don't do this?
		if(motor) motor.moveSpeedModifier = modifier;
	}
	
	public override function OnStateExit(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		if(motor) motor.moveSpeedModifier = 1.0;
	}
	
}
	