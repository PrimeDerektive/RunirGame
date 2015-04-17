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
}

private var moveSpeed : float = 0.8;
private var targetDir : Vector3;

var avoidOffset : float = 0.0;

function Update () {

	if(target){
	
		var hit : RaycastHit;
		
		if(
			Physics.Raycast(
				transform.position + Vector3.up,
				Quaternion.Euler(0, 45, 0) * transform.forward,
				hit,
				avoidDistance,
				avoidLayers
			)
		){
			Debug.DrawRay((transform.position + Vector3.up), Quaternion.Euler(0, 45, 0) * transform.forward * avoidDistance, Color.red);
			avoidOffset -= (90 - (90 * hit.distance/avoidDistance)) * Time.deltaTime;
			moveSpeed = (hit.distance)/(avoidDistance) * 0.8;
		}
		else if(
			Physics.Raycast(
				transform.position + Vector3.up,
				Quaternion.Euler(0, -45, 0) * transform.forward,
				hit,
				avoidDistance,
				avoidLayers
			)
		){
			Debug.DrawRay((transform.position + Vector3.up), Quaternion.Euler(0, -45, 0) * transform.forward * avoidDistance, Color.yellow);
			avoidOffset += (90 - (90 * hit.distance/avoidDistance)) * Time.deltaTime;
			print(hit.distance+1 +" "+ avoidDistance+1);
			moveSpeed = (hit.distance)/(avoidDistance) * 0.8;
		}
		else if(avoidOffset != 0.0){
			avoidOffset = Mathf.Lerp(avoidOffset, 0.0, Time.deltaTime);
		}
		
		Debug.DrawRay((transform.position + Vector3.up), Quaternion.Euler(0, avoidOffset, 0) * (target.transform.position - transform.position).normalized * avoidDistance, Color.green);
		var targetDir = Quaternion.Euler(0, avoidOffset, 0) * (target.transform.position - transform.position).normalized;
		
		motor.SetTargetForward(targetDir);
		var targetDistance = Vector3.Distance(transform.position, target.position);
		if(targetDistance < 2.0) moveSpeed = 0.0;	
		motor.Move(0.0, moveSpeed, 0.0);
			
	}
	
}
