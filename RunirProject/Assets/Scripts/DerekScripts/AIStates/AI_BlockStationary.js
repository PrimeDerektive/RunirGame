#pragma strict
import BehaviourMachine;

class AI_BlockStationary extends StateBehaviour{

	var minDuration : float = 1.0;
	var maxDuration : float = 4.0;
	
	private var targetObject : GameObjectVar;
	private var target : Transform;
	private var anim : Animator;
	private var motor : MecanimMotor_Base;
	
	private var stopTime : float = 0.0;

	function Awake(){
		targetObject = blackboard.GetGameObjectVar("target");
		anim = GetComponent.<Animator>();
		motor = GetComponent.<MecanimMotor_Base>();
		anim.SetLayerWeight(3, 1.0);
	 	anim.SetBool("melee", true);
	}
	
	function OnEnable(){
		target = targetObject.Value.transform;
		var duration = Random.Range(minDuration, maxDuration);
		stopTime = Time.time + duration;
		StartCoroutine(Block(duration));
		print("I am now blocking.");
	}
	
	function Block(dur : float){
		anim.SetBool("block", true);
		yield WaitForSeconds(dur);
		anim.SetBool("block", false);
		this.SendEvent("FINISHED");
	}
	
	function Update(){
		var targetDir = (target.position - transform.position).normalized;
		motor.SetTargetForward(targetDir); 
		//var targetAngle = Vector3.Angle(transform.forward, targetDir);
		//if(Mathf.Abs(targetAngle) > 80.0) motor.SetTargetForward(targetDir); 
	}
	
}