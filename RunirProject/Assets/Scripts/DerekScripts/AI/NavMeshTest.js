#pragma strict

var target : Transform;

private var agent : NavMeshAgent;
private var motor : MecanimMotor;
private var velocity : Vector3;
private var lastPos : Vector3;

private var anim : Animator;

function Start () {
	agent = GetComponent.<NavMeshAgent>();
	anim = GetComponent.<Animator>();
	motor = GetComponent.<MecanimMotor>();
	motor.DisableRootMotion();
}

function Update () {

	if(
		(
			anim.GetCurrentAnimatorStateInfo(0).IsName("TurnRight") ||
			anim.GetCurrentAnimatorStateInfo(0).IsName("TurnLeft") || 
			anim.GetNextAnimatorStateInfo(0).IsName("TurnRight") ||
			anim.GetNextAnimatorStateInfo(0).IsName("TurnLeft") 
		)&&
		!anim.applyRootMotion
	){
		anim.applyRootMotion = true;
	}
	else if(anim.applyRootMotion) anim.applyRootMotion = false;
		
	

	var distanceToTarget = Vector3.Distance(target.position, transform.position);
	if(distanceToTarget > 3.0)
		agent.SetDestination(target.position);
	else
		agent.Stop();
	
	velocity = (transform.position - lastPos)/Time.deltaTime;
	velocity = transform.InverseTransformDirection(velocity);
	
	var zMax = 3;
	if(velocity.z < 0) zMax = 1.556;
	
	anim.SetFloat("speedY", velocity.z/zMax, 0.2, Time.deltaTime);
	
	motor.Move(velocity.x/5.0, velocity.z/zMax, 0.3);

	var targetDir = (agent.steeringTarget - transform.position).normalized;
	if(distanceToTarget < 3.0) targetDir = (target.position - transform.position).normalized;
	motor.SetTargetForward(targetDir);
	
	lastPos = transform.position;
}