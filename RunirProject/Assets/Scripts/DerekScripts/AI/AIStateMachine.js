#pragma strict
import System.Collections.Generic;

//state declaration
private enum AIState{ Patrolling, Pursuing, Attacking }

//the current AI state
var state : AIState = AIState.Patrolling;

//AIState / Script pair container object
private class AIStateContainer{
	var state : AIState;
	var script : MonoBehaviour;
}

//array of all AIStateScript objects
var stateContainers : AIStateContainer[];

//the layers on which we check for targets
var targetLayers : LayerMask;

//the distance to which this unit can detect and begin pursuing targets
var pursuitDistance : float = 20.0;

//the angle within which a target must be to be seen and pursued
var pursuitAngle : float = 90.0;

//the current target
var target : Transform;

function Start(){
	//set the initial state to patrolling
	SetState(AIState.Patrolling);
}

function SetState(newState : AIState){
	//iterate through all state containers
	for(var stateContainer : AIStateContainer in stateContainers){
		//disable state script
		stateContainer.script.enabled = false;
		//except we need to enable the script that corresponds to the new state
		if(stateContainer.state == newState) stateContainer.script.enabled = true;
	}
	//update current state
	state = newState;
}

function UpdateState(){
	switch(state){
		
		case AIState.Patrolling:
		
			break;
			
		case AIState.Pursuing:
			
			break;
			
		case AIState.Attacking:
			
			break;	
		
	}
}


function CheckForTarget(){
	
	//we already have a target, no reason to look for more
	if(target) return;
	
	//sweep for target colliders within range
	var targetColliders = Physics.OverlapSphere(transform.position, pursuitDistance, targetLayers);
	
	//loop through potential targets
	for (var i = 0; i < targetColliders.Length; i++){
		
		//get direction to target
		var dirToPotentialTarget = targetColliders[i].transform.position - transform.position;
		
		//get angle between forward and target dir
		var angleToPotentialTarget : float = Vector3.Angle(transform.forward, dirToPotentialTarget);
		
		//if the target is within visible angle range
		if(angleToPotentialTarget <= pursuitAngle){
		
			//set him as the target
			target = targetColliders[i].transform;
			
			//set lookTarget to the target's head 
			//var lookTarget = target.gameObject.FindWithTag("Head").transform;
			
			//but if we couldn't find a head, set it to the root transform of the target
			//if(!lookTarget) lookTarget = target;
			
			//set ik target in the motor
			//motor.lookTarget = lookTarget;
		
		}
		
	}

}



