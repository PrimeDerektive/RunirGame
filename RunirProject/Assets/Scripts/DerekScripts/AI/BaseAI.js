﻿#pragma strict


//the distance within which the AI can detect targets
var targetRange : float = 10.0;
//the view angle within which the AI can detect targets
var targetAngle : float = 60.0;
//the LayerMask of colliders that can be considered targets (most likely Player)
var targetLayers : LayerMask;

function CheckForTarget() : GameObject{

	//sweep for target colliders within range
	var potentialTargets : Collider[] = Physics.OverlapSphere(transform.position, targetRange, targetLayers);
	
	var target : GameObject = null;

	//loop through potential targets
	for(var i = 0; i < potentialTargets.Length; i++){
		
		//get direction to target
		var dirToPotentialTarget : Vector3 = potentialTargets[i].transform.position - transform.position;
		
		//get angle between forward and target dir
		var angleToPotentialTarget : float = Vector3.Angle(transform.forward, dirToPotentialTarget);
		
		//if the target is within visible angle range
		if(angleToPotentialTarget <= targetAngle){
			
			//set him as the target
			target = potentialTargets[i].gameObject;

		}
		
	} //eof potentialTargets loop
	
	return target;
	
} //eof CheckForTarget()