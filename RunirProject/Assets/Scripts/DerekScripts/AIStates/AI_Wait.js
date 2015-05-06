#pragma strict

class AI_Wait extends StateBehaviour{

	
	var minWaitTime : float = 2.0;
	var maxWaitTime : float = 4.0;
	
	//private variables
	
	//cached reference to blackboard target variable
	private var target : GameObjectVar;
	//position chosen to move toward each time the entity wanders
	private var wanderPos : Vector3 = Vector3.zero; 
	
	//cached references
	private var agent : NavMeshAgent;
	private var motor : NewMotor;
	private var baseAI : BaseAI;
	
	function Awake(){
		//cache references
		agent = GetComponent.<NavMeshAgent>();
		motor = GetComponent.<NewMotor>();
		baseAI = GetComponent.<BaseAI>();
		target = blackboard.GetGameObjectVar("target");
	}

	function OnEnable(){
		StartCoroutine(Wait());
	}
	
	function OnDisable(){
		StopCoroutine("Wait");
		//agent.ResetPath(); //clear the NavMeshAgent's current path
	}	
	
	function Wait(){
		yield WaitForSeconds(Random.Range(minWaitTime, maxWaitTime));
		this.SendEvent("FINISHED");
	}
	
	private var nextTargetCheck : float = 0.0;
	
	function Update(){
		
		//always check for targets first, if we don't have one
		if(!target.Value){
			if(Time.time > nextTargetCheck){
				var newTarget = baseAI.CheckForTarget();
				if(newTarget){
					target.Value = newTarget;
					this.SendEvent("TargetFound");
				}
				nextTargetCheck = Time.time + 0.1;
			}
		}
		else{
			//we have a target, rotate towards him
			var dirToTarget = (target.Value.transform.position - transform.position).normalized;
			motor.RotateTowards(dirToTarget);
		}
		
	}		

}