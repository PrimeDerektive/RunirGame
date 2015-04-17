#pragma strict
import BehaviourMachine;

class AI_Pursuit extends StateBehaviour{

	var attackDistance : float = 3.0;
	var escapeDistance : float = 15.0;

	private var targetObject : GameObjectVar;
	private var target : Transform;
	private var agent : NavMeshAgent;
	private var motor : MecanimMotor_Base;

	function Awake(){
		targetObject = blackboard.GetGameObjectVar("target");
		agent = GetComponent.<NavMeshAgent>();
		motor = GetComponent.<MecanimMotor_Base>();
	}
	
	function OnEnable(){
		target = targetObject.Value.transform;
		print("I am now pursuing.");
		agent.updatePosition = true;
		agent.updateRotation = true;
		//GetComponent.<Animator>().SetBool("block", true);
	}
	
	function OnDisable(){
		agent.Stop(true);
	}
	
	function Update(){
		if(target){
			//set target as NavMeshAgent path destination
			agent.SetDestination(target.position);
			var targetDir = (agent.steeringTarget - transform.position).normalized;
			//var targetDir = (target.position - transform.position).normalized;
			motor.SetTargetForward(targetDir);
			var distance = Vector3.Distance(transform.position, target.position);
			if(distance <= attackDistance){
				this.SendEvent("TargetInRange");
			}
			else if(distance >= escapeDistance){
				this.SendEvent("TargetLost");
			}
		}
	}
	
}