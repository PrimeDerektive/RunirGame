#pragma strict

class AI_Chase extends StateBehaviour{

	//private variables
	
	//cached reference to blackboard target variable
	private var target : GameObjectVar;
	
	//cached references
	
	private var agent : NavMeshAgent;
	
	function Awake(){
		//cache references
		agent = GetComponent.<NavMeshAgent>();
		target = blackboard.GetGameObjectVar("target");
	}
	
	function Update(){
		if(target.Value){
			var targetDir = (target.Value.transform.position - transform.position).normalized;
			GetComponent.<NewMotor>().RotateTowards(targetDir);
			agent.SetDestination(target.Value.transform.position);
		}
	}

}