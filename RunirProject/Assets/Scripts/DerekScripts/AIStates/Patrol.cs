using UnityEngine;
using System.Collections;
using BehaviourMachine;

namespace AIStates{

	public class Patrol : StateBehaviour {

		public LayerMask targetLayers;
		public float targetDistance = 20.0f;
		public float targetAngle = 90.0f;

		GameObjectVar target;

		void Awake(){
			target = blackboard.GetGameObjectVar("target");
		}

		void OnEnable(){
			StartCoroutine(BeginState());
		}

		void OnDisable(){
			StopAllCoroutines();
		}

		IEnumerator BeginState(){
			while(true){
				print("I am now patrolling.");
				CheckForTarget();
				if(target.Value){
					print ("I found a target!");
					this.SendEvent("TargetFound");
				}
				yield return new WaitForSeconds(0.25f);
			}
		}

		void CheckForTarget(){

			//we already have a target, no reason to look for more
			//if(target) return;

			//sweep for target colliders within range
			Collider[] potentialTargets = Physics.OverlapSphere(transform.position, targetDistance, targetLayers);

			//loop through potential targets
			for(int i = 0; i < potentialTargets.Length; i++){
				
				//get direction to target
				Vector3 dirToPotentialTarget = potentialTargets[i].transform.position - transform.position;
				
				//get angle between forward and target dir
				float angleToPotentialTarget = Vector3.Angle(transform.forward, dirToPotentialTarget);
				
				//if the target is within visible angle range
				if(angleToPotentialTarget <= targetAngle){
					
					//set him as the target
					target.Value = potentialTargets[i].gameObject;
					
					//set lookTarget to the target's head 
					//var lookTarget = target.gameObject.FindWithTag("Head").transform;
					
					//but if we couldn't find a head, set it to the root transform of the target
					//if(!lookTarget) lookTarget = target;
					
					//set ik target in the motor
					//motor.lookTarget = lookTarget;
					
				}
				
			}
			
		}

	}

}