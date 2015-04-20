#pragma strict

public class AttackState extends StateMachineBehaviour{

	public var events : AnimEvent[];

    public override function OnStateUpdate(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int) {
		for(var event in events){
			if(stateInfo.normalizedTime >= event.time && !event.fired){
				event.Fire();
			}
		}
	}
	
	public override function OnStateExit(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		for(var event in events){
			event.fired = false;
		}
	}
    
}

public class AnimEvent{
	var name : String;
	@Range(0.0,1.0)
	var time : float;
	var fired : boolean = false;
	
	function Fire(){
		Debug.Log(name +" fired.");
		fired = true;
	}
	
}