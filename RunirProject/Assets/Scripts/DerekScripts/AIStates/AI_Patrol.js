#pragma strict
import BehaviourMachine;

class AI_Patrol extends StateBehaviour{

	var targetLayers : LayerMask;
	var targetDistance : float = 20.0;
	var targetAngle : float = 90.0;

	private var target : GameObjectVar;

	function Awake(){
		target = blackboard.GetGameObjectVar("target");
	}

	function OnEnable(){
		target.Value = null; //we can only be in this state without a target
		StartCoroutine(BeginState());
	}

	function OnDisable(){
		StopAllCoroutines();
	}

	function BeginState(){
		while(true){
			print("I am now patrolling.");
			CheckForTarget();
			if(target.Value){
				print ("I found a target!");
				this.SendEvent("TargetFound");
			}
			yield WaitForSeconds(0.25);
		}
	}

	function CheckForTarget(){

		//we already have a target, no reason to look for more
		//if(target) return;

		//sweep for target colliders within range
		var potentialTargets : Collider[] = Physics.OverlapSphere(transform.position, targetDistance, targetLayers);

		//loop through potential targets
		for(var i = 0; i < potentialTargets.Length; i++){
			
			//get direction to target
			var dirToPotentialTarget : Vector3 = potentialTargets[i].transform.position - transform.position;
			
			//get angle between forward and target dir
			var angleToPotentialTarget : float = Vector3.Angle(transform.forward, dirToPotentialTarget);
			
			//if the target is within visible angle range
			if(angleToPotentialTarget <= targetAngle){
				
				//set him as the target
				target.Value = potentialTargets[i].gameObject;
				
				//set lookTarget to the target transform
				var lookTarget = target.Value.transform;
				
				//look through the lookTarget to see if it has a head, because if it does we should look at that instead
				
				var allChildren = lookTarget.GetComponentsInChildren(Transform);
				for (var child : Transform in allChildren) {
				    if(child.CompareTag("Head")) lookTarget = child;
				}
				
				
				//but if we couldn't find a head, set it to the root transform of the target
				if(!lookTarget) lookTarget = target.Value.transform;
				
				//set ik target in the motor
				GetComponent.<MecanimMotor_Base>().lookTarget = lookTarget;

			}
			
		}
		
	} //eof CheckForTarget()

}