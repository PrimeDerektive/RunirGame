#pragma strict
import BehaviourMachine;

class AI_Pursuit extends StateBehaviour{

	var attackDistance : float = 3.0;
	var escapeDistance : float = 15.0;

	private var target : Transform;
	private var agent : NavMeshAgent;

	function Awake(){
		agent = GetComponent.<NavMeshAgent>();
	}
	
	function OnEnable(){
		target = blackboard.GetGameObjectVar("target").Value.transform;
		agent.Resume();
		print("I am now pursuing.");
	}
	
	function OnDisable(){
		agent.ResetPath();
	}
	
	function Update(){
		if(target){
			//set target as NavMeshAgent path destination
			agent.SetDestination(target.position);
			//var targetDir = (agent.steeringTarget - transform.position).normalized;
			//var targetDir = (target.position - transform.position).normalized;
			var distance = Vector3.Distance(transform.position, target.position);
			if(distance <= attackDistance){
				this.SendEvent("TargetInRange");
			}
			else if(distance >= escapeDistance){
				this.SendEvent("TargetLost");
			}
		}
		else{
			//not sure how this could happen, but just in case
			this.SendEvent("TargetLost");
		}
	}
	
}