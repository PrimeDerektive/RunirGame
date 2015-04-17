#pragma strict

class AI_Wander extends StateBehaviour{

	//public variables
	
	//the distance within which the AI can detect targets
	var targetRange : float = 5.0;
	//the view angle within which the AI can detect targets
	var targetAngle : float = 60.0;
	//the LayerMask of colliders that can be considered targets (most likely Player)
	var targetLayers : LayerMask;
	
	//each time the AI wanders, it is a random distance from minDistance - maxDistance
	var minDistance : float = 4.0;
	var maxDistance : float = 8.0;
	//if the AI exceeds this distance from where he started, he will cease wandering and return to the origin
	var maxRangeFromOrigin : float = 20.0;
	//each time the AI reachs a wander destination, it waits  a random duration from minPause - maxPause
	var minPause : float = 2.0;
	var maxPause : float = 4.0;
	
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
		StartCoroutine("Wander");
	}
	
	function OnDisable(){
		StopCoroutine("Wander");
		agent.ResetPath(); //clear the NavMeshAgent's current path
	}
	
	function Wander(){
		while(true){
		
			//always check for targets first
			CheckForTarget();
			
			//if we find a target, 
			if(target.Value) this.SendEvent("TargetFound");		
			
			//calculate distance from origin
			var distanceFromOrigin = Vector3.Distance(transform.position, origin);
			
			//we've wandered too far, return to origin
			if(distanceFromOrigin > maxRangeFromOrigin){
				//set target position to origin
				wanderPos = origin;
			}
			
			//if we have a target destination
			if(wanderPos != Vector3.zero){
			
				//but we aren't pathing to it yet
				if(agent.destination != wanderPos){
					//start pathing to it
					agent.SetDestination(wanderPos);
				}
				else{ //we must be pathing to our destination, print remaining distance
					
					//if we've reached our destination
					if(agent.remainingDistance <= agent.stoppingDistance){
						//wait a couple seconds
						yield WaitForSeconds(Random.Range(minPause, maxPause)); 
						//unset wanderPos
						wanderPos = Vector3.zero;					
					}				
					
				}
				
			}
			else{ //we have no target destination, find a new one
				var randomDir = Quaternion.Euler(0, Random.Range(0.0, 359.9), 0) * transform.forward; //get a random direction on the y plane
				wanderPos = transform.position + randomDir * Random.Range(minDistance, maxDistance); //add a random distance from minDistance - maxDistance
			}
			
			yield WaitForSeconds(0.1);
		}
		
	} //eof Wander()
	
	function CheckForTarget(){

		//sweep for target colliders within range
		var potentialTargets : Collider[] = Physics.OverlapSphere(transform.position, targetRange, targetLayers);

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

			}
			
		} //eof potentialTargets loop
		
	} //eof CheckForTarget()

}