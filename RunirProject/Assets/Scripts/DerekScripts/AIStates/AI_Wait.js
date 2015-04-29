#pragma strict

#pragma strict

class AI_Wait extends StateBehaviour{

	
	var minWaitTime : float = 2.0;
	var maxWaitTime : float = 4.0;
	
	//private variables
	
	//cached reference to blackboard target variable
	private var target : GameObjectVar;
	//starting position, stored in Awake()	
	private var origin : Vector3; 
	//position chosen to move toward each time the entity wanders
	private var wanderPos : Vector3 = Vector3.zero; 
	
	//cached references
	
	private var agent : NavMeshAgent;
	
	function Awake(){
		//cache references
		agent = GetComponent.<NavMeshAgent>();
		target = blackboard.GetGameObjectVar("target");
		//store origin
		origin = transform.position;
	}

	function OnEnable(){
		target.Value = null; //we can only be in this state without a target
		//StartCoroutine("Wander");
	}
	
	function OnDisable(){
		//StopCoroutine("Wander");
		//agent.ResetPath(); //clear the NavMeshAgent's current path
	}	

}