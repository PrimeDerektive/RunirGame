#pragma strict
import BehaviourMachine;

class AI_AttackDecision extends StateBehaviour{

	var escapeDistance : float = 4.0;
	var attackActions : AttackAction[];
	
	private var targetObject : GameObjectVar;
	private var target : Transform;
	var lastActionType : AttackType;
	
	private class AttackAction{
		var type : AttackType;
		var transition : String;
		var probability : float; //chance this action will fire, sum of all action probabilites must equal 1.0
		var repeatable : boolean = false;
	}
	
	private enum AttackType{ meleeAttack, strafe, block }

	function Awake(){
		targetObject = blackboard.GetGameObjectVar("target");
	}
	
	function OnEnable(){
		target = targetObject.Value.transform;
		var distance = Vector3.Distance(transform.position, target.position);
		if(distance > escapeDistance){
			this.SendEvent("TargetOutOfRange");
		}
		ChooseAction();
		print("I am now making an attack decision.");
	}
	
	function ChooseAction(){
		var roll = Random.value;
		for(var i = 0; i < attackActions.length; i++){
			roll -= attackActions[i].probability;
			if(roll <= 0){
				if(!attackActions[i].repeatable && lastActionType == attackActions[i].type){
					ChooseAction();
					break;
				}
				else{
					lastActionType = attackActions[i].type;
					this.SendEvent(attackActions[i].transition);
					break;
				}				
			}
		}		
	}
	
}