#pragma strict
/*
//state declaration
private enum AIState{ Patrolling, Pursuing, Attacking }

//the current AI state
var state : AIState = AIState.Patrolling;

//interval at which to determine current state
var determineStateInterval : float = 0.25;

//distance from target to start attacking
var attackDistance : float = 3.0;

//the maximum distance this unit can sense valid targets
var targetCheckDistance : float = 30.0;

//the layers to check for potential targets
var targetCheckLayers : LayerMask;

//the visibility angle the target needs to be in for this unit to "see" it
var targetCheckAngle : float = 90.0;

//the actual target
var target : Transform;

//navmesh agent reference
var agent : NavMeshAgent;

//the mecanim motor, used for movement and rotation animation
var motor : MecanimMotor_Base;

//variable used to store calculated movement speed as nav agents do not use root motion
var velocity : Vector3 = Vector3.zero;

//used to calculate velocity over time (currentPos - lastPos)/deltaTime
private var lastPos : Vector3 = Vector3.zero;


function Start(){

	//cache references
	if(!agent) agent = GetComponent.<NavMeshAgent>();
	if(!motor) motor = GetComponent.<MecanimMotor_Base>(); 
	
	GetComponent.<Animator>().SetLayerWeight(3, 1.0);
	 GetComponent.<Animator>().SetBool("melee", true);
	//GetComponent.<Animator>().SetBool("block", true);
	
	SetState(AIState.Patrolling);
	
	//start determining current state every determineStateInterval seconds
	//InvokeRepeating("DetermineState", 0.0, determineStateInterval);
	
}

function Update(){

	//calculate velocity from last frame
	velocity = (transform.position - lastPos)/Time.deltaTime;
	//convert to local space
	velocity = transform.InverseTransformDirection(velocity);
	
	//send speeds to motor to play animations
	//if(velocity.z < 0) zMax = 1.556;	
	motor.Move(velocity.x/4.007, velocity.z/5.668, 0.3);

	//cache the last frame's position	
	lastPos = transform.position;	

}


function DetermineState(){
	
	//if we have a target
	if(target){
		
		//check distance to target
		var distanceToTarget = Vector3.Distance(target.position, transform.position);
		
		//if we're within attack range
		if(distanceToTarget <= attackDistance){
		
			//start attacking if not already
			SetState(AIState.Attacking);
			
		}
		//if the target has escaped the awareness distance of target checks
		else if(distanceToTarget >= targetCheckDistance){
		
			//drop the target, as he has escaped
			target = null;
			
			//don't forget to also unset the motor's ik look target
			motor.lookTarget = null;
			
			//stop pathing towards target
			agent.Stop();
		
		}
		//we are not within attack range
		else{
					
			//start pursuing if not already
			SetState(AIState.Pursuing);
			
		}
	
	}
	//we have no target
	else{
	
		//check for new targets
		CheckForTargets();
		
		
		//if we still have no target
		if(!target){
	
			//return to patrolling if not already
			SetState(AIState.Patrolling);
		
		}
	
	}
		
}



function CheckForTarget(){
	
	//we already have a target, no reason to look for more
	if(target) return;
	
	//sweep for target colliders within range
	var targetColliders = Physics.OverlapSphere(transform.position, targetCheckDistance, targetCheckLayers);
	
	//loop through potential targets
	for (var i = 0; i < targetColliders.Length; i++){
		
		//get direction to target
		var dirToPotentialTarget = targetColliders[i].transform.position - transform.position;
		
		//get angle between forward and target dir
		var angleToPotentialTarget : float = Vector3.Angle(transform.forward, dirToPotentialTarget);
		
		//if the target is within visible angle range
		if(angleToPotentialTarget <= targetCheckAngle){
		
			//set him as the target
			target = targetColliders[i].transform;
			
			//set lookTarget to the target's head 
			var lookTarget = target.gameObject.FindWithTag("Head").transform;
			
			//but if we couldn't find a head, set it to the root transform of the target
			if(!lookTarget) lookTarget = target;
			
			//set ik target in the motor
			motor.lookTarget = lookTarget;
		
		}
		
	}

}


function SetState(newState : AIState){
	
	//cancel the last states routine
	StopCoroutine(state.ToString());
	
	//set new state
	state = newState;
	
	//start new state's routine
	StartCoroutine(state.ToString());

}


function Patrolling(){
	while(state == AIState.Patrolling){
		//do patrol stuff
		
		//check for new target
		CheckForTarget();
		
		//move to Pursuing state if we find a target
		if(target) SetState(AIState.Pursuing);
						
		yield WaitForSeconds(determineStateInterval);
	}
}


function Pursuing(){
	while(state == AIState.Pursuing){
		//do pursuit stuff

		//move back to Patrolling state if we lost our target
		if(!target) SetState(AIState.Patrolling);
		
		//get distance to target
		var distanceToTarget = Vector3.Distance(target.position, transform.position);
		
		if(distanceToTarget > targetCheckDistance){
			target = null;
			motor.lookTarget = null;
			agent.Stop();
			SetState(AIState.Patrolling);
		}
		else if(distanceToTarget < attackDistance){
			SetState(AIState.Attacking);
		}

		//set target as NavMeshAgent path destination
		agent.SetDestination(target.position);
		
		//set rotation target to next path steering target if currently pathing
		if(agent.hasPath) motor.SetTargetForward( (agent.steeringTarget - transform.position).normalized );
		
		yield;
	}
}


function Attacking(){
	while(state == AIState.Attacking){
		//do attack stuff
		
		//return if we lost our target
		if(!target) return;
		
		//do not path during the attack state
		agent.Stop();
		
		print("attack round");
		
		//rotate towards target while attacking
		//motor.SetTargetForward( (target.position - transform.position).normalized );
		
		Debug.DrawRay(transform.position, (target.position - transform.position).normalized * 5, Color.red, 1.0);
		
		var attackDecision : int = Random.Range(0, 10);
				
		//if(attackDecision <= 6){
			yield MeleeAttack();
		//}
		//else{
			//yield BackPedal();
		//}
		
		var distanceToTarget = Vector3.Distance(target.position, transform.position);
		if(distanceToTarget > attackDistance){
			SetState(AIState.Pursuing);
		}
				
		yield;
	}
}

function MeleeAttack(){
	var duration : float = Random.Range(2.0, 3.5);
	var angleToTarget : float = 180.0;
	while(angleToTarget > 10.0){
		var dirToTarget = (target.position - transform.position).normalized;
		angleToTarget = Vector3.Angle(transform.forward, dirToTarget);
		motor.SetTargetForward(dirToTarget);
		yield;
	}
	var timer : float = 0.0;
	while(timer <= duration){
		timer += Time.deltaTime;
		GetComponent.<MeleeCombat>().MeleeAttack();
		yield;
	}
	return;
}

function Strafe(){
	if(!target) return;
	var duration : float = 2.0;
	var timer : float = 0.0;
	agent.stoppingDistance = 0.5;
	while(timer < duration){
		timer += Time.deltaTime;
		agent.SetDestination(target.position + (target.right * 3.0) + (-target.forward * 0.5));
		motor.SetTargetForward( (target.position - transform.position).normalized );
		if(Mathf.Approximately(0, agent.remainingDistance)) timer = duration;
		yield;
	}
	agent.stoppingDistance = 2.0;
}

function BackPedal(){
	if(!target) return;
	var duration : float = 2.0;
	var timer : float = 0.0;
	agent.stoppingDistance = 0.5;
	while(timer < duration){
		timer += Time.deltaTime;
		agent.SetDestination(transform.position - transform.forward * 2.0);
		motor.SetTargetForward( (target.position - transform.position).normalized );
		if(Mathf.Approximately(0, agent.remainingDistance)) timer = duration;
		yield;
	}
	agent.stoppingDistance = 2.0;
}

function Block(){
	GetComponent.<Animator>().SetBool("block", true);
	var duration : float = Random.Range(1.0, 4.0);
	var timer : float = 0.0;
	while(timer < duration){
		timer += Time.deltaTime;
		motor.SetTargetForward( (target.position - transform.position).normalized );
		yield;
	} 
	GetComponent.<Animator>().SetBool("block", false);
}




*/