#pragma strict
import BehaviourMachine;

class AI_RandomDecision extends StateBehaviour{

	var escapeDistance : float = 3.0;
	var possibleDecisions : Decision[];
	
	private var target : Transform;
	var lastDecision : String;
	
	private class Decision{
		var transition : String;
		var probability : int; //chance this action will fire, sum of all action probabilites must equal 1.0
		var cannotRepeat : boolean = false;
	}
	
	function OnEnable(){
		target = blackboard.GetGameObjectVar("target").Value.transform;
		var distance = Vector3.Distance(transform.position, target.position);
		if(distance > escapeDistance){
			this.SendEvent("TargetLost");
		}
		ChooseAction();
	}
	
	function ChooseAction(){
		var totalProbability : float = 0.0;
		for(var i = 0; i < possibleDecisions.length; i++){
			if(
				!possibleDecisions[i].cannotRepeat || //if this decision can repeat
				(
					possibleDecisions[i].cannotRepeat && //or this decision can't repeat
					lastDecision != possibleDecisions[i].transition //but the last decision wasn't this one
				)
			){
				totalProbability += possibleDecisions[i].probability;
			}
		}
		var roll = Random.Range(0, totalProbability);
		for(i = 0; i < possibleDecisions.length; i++){
			roll -= possibleDecisions[i].probability;
			if(roll <= 0){
				lastDecision = possibleDecisions[i].transition;
				this.SendEvent(possibleDecisions[i].transition);
				break;
			}
		}		
	}
	
}