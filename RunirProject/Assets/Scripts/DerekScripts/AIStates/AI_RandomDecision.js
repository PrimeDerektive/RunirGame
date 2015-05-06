#pragma strict
import BehaviourMachine;
import System.Collections.Generic;

class AI_RandomDecision extends StateBehaviour{

	var escapeRange : float = 3.0;
	var decisions : Decision[];
	
	private var target : Transform;
	var lastDecision : String;
	
	private class Decision{
		var transition : String;
		var probability : int; //chance this action will fire, sum of all action probabilites must equal 1.0
		var degradationRate : int; //the amount the probability is reduced every time this decision is made consecutively
		var currentProbability : int; //the current probability (probability minus consecutive degradations
		
		//var cannotRepeat : boolean = false;
	}
	
	function OnEnable(){
		target = blackboard.GetGameObjectVar("target").Value.transform;
		if(Vector3.Distance(target.position, transform.position) > escapeRange){
			this.SendEvent("TargetLost");
		}
		else{
			MakeDecision();
		}
	}
	
	var possibleDecisions : List.<Decision> = new List.<Decision>();
	
	function MakeDecision(){

		
		var totalProbability : int = 0;
		
		var possibleDecisions : List.<Decision> = new List.<Decision>();
		
		for(var decision : Decision in decisions){
			//if this is not a consecutive decision, set probability to max
			if(lastDecision != decision.transition){
				decision.currentProbability = decision.probability;
			}
			else{
				//this is a consecutive decision, reduce probability by degradation rate
				decision.currentProbability -= decision.degradationRate;
			}
			
			//only add decision to possible decision if their probability is greater than 0			
			if(decision.currentProbability > 0){
				possibleDecisions.Add(decision);
				//also add that decision current probability to the total for the roll
				totalProbability += decision.currentProbability;
			}
		}
		
		var roll = Random.Range(0, totalProbability);
		
		for(decision in possibleDecisions){
			roll -= decision.currentProbability;
			if(roll <= 0){
				lastDecision = decision.transition;
				Debug.Log(lastDecision);
				this.SendEvent(decision.transition);
				break;
			}
		}
		
		
		/*
		for(var i = 0; i < decisions.length; i++){
			if(lastDecision == decisions[i].transition && decisions[i].cannotRepeat){
			
			}
			else{ 
				totalProbability += decisions[i].probability;
			}
		}
		var roll = Random.Range(0, totalProbability);
		Debug.Log(roll+" "+totalProbability);
		for(i = 0; i < decisions.length; i++){
			if(lastDecision == decisions[i].transition && decisions[i].cannotRepeat){
			
			}
			else{ 
				roll -= decisions[i].probability;
				if(roll <= 0){
					lastDecision = decisions[i].transition;
					this.SendEvent(decisions[i].transition);
					break;
				}
			}
		}
		*/		
	}
	
}