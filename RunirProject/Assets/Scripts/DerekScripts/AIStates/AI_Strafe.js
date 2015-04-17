#pragma strict
import BehaviourMachine;

class AI_Strafe extends StateBehaviour{

	private var targetObject : GameObjectVar;
	private var target : Transform;
	
	private var agent : NavMeshAgent;
	//we store the original angular speed of the NavMeshAgent so we 
	//can set it to zero while strafing, but return to it when we're done
	private var origAngSpeed : float; 
	private var anim : Animator;
	
	private var motor : MecanimMotor_Base;
	private var cc : CharacterController;
	
	private var startTime = 0.0;
	private var stopTime : float = 0.0;

	function Awake(){
		targetObject = blackboard.GetGameObjectVar("target");
		agent = GetComponent.<NavMeshAgent>();
		motor = GetComponent.<MecanimMotor_Base>();
		cc = GetComponent.<CharacterController>();
		anim = GetComponent.<Animator>();
	}
	

	private var dirRoll : int;
	private var dir : Vector3;
			
	function OnEnable(){
		agent.speed = 3.0;
		agent.updatePosition = true;
		agent.updateRotation = false;
		target = targetObject.Value.transform;
		var duration = Random.Range(1.5, 3.0);
		startTime = Time.time;
		stopTime = Time.time + duration;
		/*
		dirRoll = Random.Range(0, 3);
		dir = transform.right;
		if(dirRoll == 1) dir = -transform.forward;
		else if(dirRoll == 2) dir = -transform.right;
		*/
		print("I am now strafing.");
	}
	
	function OnDisable(){
		agent.speed = 0.0;
	}
	
	function Update(){
	
		if(!anim.GetBool("staggered")){
	
			if(Time.time > stopTime){
				this.SendEvent("FINISHED");
			}
			if(target){
				agent.SetDestination(target.position - target.forward * 3.0);
				
				//cc.Move(transform.right * 3.0 * Time.deltaTime);
				var targetDir = (target.position - transform.position).normalized;
				targetDir.y = transform.forward.y;
				//transform.forward = Vector3.Lerp(transform.forward, targetDir, Time.deltaTime*7.5);
				motor.SetTargetForward(targetDir);
				/*
				var head : Transform = target.gameObject.FindWithTag("Head").transform;
				var targetToUse : Transform = target;
				if(head) targetToUse = head;
				var targetPos = target.position;
				var offsetToUse = allOffsets[Random.Range(0, allOffsets.Length)];
				targetPos += targetToUse.InverseTransformDirection(offsetToUse);
				var targetDir = (target.position - transform.position).normalized;
				agent.SetDestination(targetPos);
				motor.SetTargetForward(targetDir);
				var distance = Vector3.Distance(transform.position, targetPos);
				if(Mathf.Approximately(0, distance)) stopTime = Time.time;
				*/
			}
		
		}
		
	}
	
}