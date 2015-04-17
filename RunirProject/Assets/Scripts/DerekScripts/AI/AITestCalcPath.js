#pragma strict
import System.Collections.Generic;

var target : Transform;

//obstacle avoidance vars
var avoidDistance : float = 5.0;
var avoidLayers : LayerMask;
var avoidRayAngle : int = 15;

private var motor : MecanimMotor;

function Start () {
	motor = GetComponent.<MecanimMotor>();
	//lastPathNode = transform.position;
	path.Add(transform.position);
	InvokeRepeating("CalculatePath", 0.0, 0.5);
}

private var moveSpeed : float;
private var targetDir : Vector3;
var avoiding : boolean = false;

/*
function Update () {

	if(target){
	
		//test for obstacles straight ahead
		var hit : RaycastHit;
		if(
			Physics.SphereCast(
				(transform.position + Vector3.up) - transform.forward*0.5,
				0.5,
				transform.forward,
				hit,
				avoidDistance,
				avoidLayers
			) &&
			!avoiding
		){
			avoiding = true;
		}
		if(avoiding){
		
			
			if(
				!Physics.SphereCast(
					(transform.position + Vector3.up) - (target.transform.position - transform.position).normalized*0.5,
					0.5,
					(target.transform.position - transform.position).normalized,
					hit,
					avoidDistance,
					avoidLayers
				)
			){
				avoiding = false;
			}
			
		
			var max : int = 360/avoidRayAngle;
			for (var i : int = 0; i < max; i++){
				var rayAngle : int;
				if(i%2 == 0){
					rayAngle = ( (i+1) - (i*0.5) ) * avoidRayAngle;
				}
				else{
					rayAngle = ( i - ((i-1)*0.5) ) * -avoidRayAngle;
				}
				var rayDir = Quaternion.Euler(0, rayAngle, 0) * transform.forward;		
				Debug.DrawRay(transform.position + Vector3.up, rayDir*avoidDistance, Color.green);
				if(!Physics.SphereCast((transform.position + Vector3.up) - rayDir*0.5, 0.5, rayDir, hit, avoidDistance, avoidLayers)){
					print("found exit");
					Debug.DrawRay(transform.position + Vector3.up, rayDir*avoidDistance, Color.red);
					targetDir = Vector3.Lerp(targetDir, rayDir, Time.deltaTime*3.0);
					break;
				}
			}
				
						
		}
		else{
			targetDir = (target.transform.position - transform.position).normalized;
		}
			
		motor.SetTargetForward(targetDir);
		
		var distanceToTarget = Vector3.Distance(transform.position, target.position);
		if(distanceToTarget > 2.0){
			moveSpeed = Mathf.Lerp(moveSpeed, 0.8, Time.deltaTime*3.0);
		}
		else{
			moveSpeed = Mathf.Lerp(moveSpeed, 0.0, Time.deltaTime*3.0);
		}
		motor.Move(0.0, moveSpeed, 0.3);
		
	}
	
}
*/

var path : List.<Vector3> = new List.<Vector3>();

function Update(){	
	for(var i = 0; i < path.Count; i++){
		if(i < (path.Count-1)){
			Debug.DrawLine(path[i], path[i+1], Color.red);
		}	
	}
}

function CalculatePath(){
	var distanceToTarget = Vector3.Distance(path[path.Count - 1], target.position);
	if(distanceToTarget > 3.0){
		FindNextPathNode();
	}
}

private var nextPathNode : Vector3;
private var lastGoodRay : Vector3 = Vector3.zero;

function FindNextPathNode(){

	var dirToTarget = (target.transform.position - path[path.Count - 1]).normalized;
	
	if(
		!Physics.Raycast(
			(path[path.Count - 1] + Vector3.up),
			dirToTarget,
			avoidDistance,
			avoidLayers
		)
	){
		nextPathNode = path[path.Count - 1] + dirToTarget*avoidDistance;
	}
	else{
	
		var max : int = 360/avoidRayAngle;
		for (var i : int = 0; i < max; i++){
			var rayAngle : int;
			if(i%2 == 0){
				rayAngle = ( (i+1) - (i*0.5) ) * avoidRayAngle;
			}
			else{
				rayAngle = ( i - ((i-1)*0.5) ) * -avoidRayAngle;
			}
			var dirToUse = dirToTarget;
			if(path.Count >= 2) dirToUse = (path[path.Count - 1] - path[path.Count - 2]).normalized;
			var rayDir = Quaternion.Euler(0, rayAngle, 0) * dirToUse;
			var lastRayStillGood : boolean = false; 
			if(!Physics.Raycast((path[path.Count - 1] + Vector3.up), dirToUse, avoidDistance, avoidLayers) && dirToUse != dirToTarget){
				lastRayStillGood = true;
			}
			var lastRayAngle = Vector3.Angle(dirToUse, dirToTarget);
			var newRayAngle = Vector3.Angle(rayDir, dirToTarget);
			if(lastRayStillGood && lastRayAngle < newRayAngle){
				nextPathNode = path[path.Count - 1] + dirToUse*avoidDistance;
				break;
			}
			//Debug.DrawRay(path[path.Count - 1] , rayDir * 3.0, Color.green);	
			if(!Physics.Raycast((path[path.Count - 1] + Vector3.up), rayDir, avoidDistance, avoidLayers)){
				nextPathNode = path[path.Count - 1] + rayDir*avoidDistance;
				break;
			}
		}
	
	}
	
	path.Add(nextPathNode);
	
}