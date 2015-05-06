#pragma strict
import BehaviourMachine;

class AI_Strafe extends StateBehaviour{

	private var target : Transform;
	private var agent : NavMeshAgent;	
	private var motor : NewMotor;
	private var cc : CharacterController;
	
	private var startTime = 0.0;
	private var stopTime : float = 0.0;

	function Awake(){
		agent = GetComponent.<NavMeshAgent>();
		motor = GetComponent.<NewMotor>();
		cc = GetComponent.<CharacterController>();
	}
	

	private var dirRoll : int;
	private var dir : Vector3;
			
	function OnEnable(){
		//agent.speed = 3.0;
		//agent.updatePosition = true;
		target = blackboard.GetGameObjectVar("target").Value.transform;
		agent.updateRotation = false;
		agent.Resume();
		var duration = Random.Range(1.5, 2.5);
		startTime = Time.time;
		stopTime = Time.time + duration;
		StartCoroutine(EnableSpeed());
	}
	
	function OnDisable(){
		agent.updateRotation = true;
		agent.Stop();
		stopping = false;
		//agent.speed = 0.0;
	}
	
	var moveSpeed : float = 1.5;
	private var speedToUse : float = 0.0;
	private var stopping : boolean = false;
	
	function Update(){
		
		if(Time.time > stopTime && ! stopping){
			StartCoroutine(DisableSpeed());
		}
		if(target){
			//agent.SetDestination(target.position + target.right * 3.0);				
			cc.Move(transform.right * speedToUse * Time.deltaTime);
			var dirToTarget = (target.position - transform.position).normalized;
			motor.RotateTowards(dirToTarget);

		}
				
	}
	
	function EnableSpeed(){
		var timer : float = 0.0;
		while(timer < 0.5){
			timer += Time.deltaTime;
			var t : float = timer/0.5;
			speedToUse = Mathf.Lerp(0.0, moveSpeed, t);
			yield;
		}
	}
	
	function DisableSpeed(){
		stopping = true;
		var timer : float = 0.0;
		while(timer < 0.5){
			timer += Time.deltaTime;
			var t : float = timer/0.5;
			speedToUse = Mathf.Lerp(moveSpeed, 0.0, t);
			yield;
		}
		this.SendEvent("FINISHED");
	}
	
}