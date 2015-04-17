#pragma strict
import BehaviourMachine;

class AI_Attack extends StateBehaviour{

	var attackDistance : float = 3.0;
	
	private var targetObject : GameObjectVar;
	private var target : Transform;
	private var motor : MecanimMotor_Base;
	private var anim : Animator;
	
	private var startTime : float = 0.0;
	private var stopTime : float = 0.0;

	function Awake(){
		targetObject = blackboard.GetGameObjectVar("target");
		motor = GetComponent.<MecanimMotor_Base>();
		anim = GetComponent.<Animator>();
		anim.SetLayerWeight(3, 1.0);
	 	anim.SetBool("melee", true);
	}
	
	function OnEnable(){
		target = targetObject.Value.transform;
		var duration = Random.Range(1.0, 4.0);
		stopTime = Time.time + duration;
		canAttack = false;
		print("I am now attacking.");
	}
	
	private var canAttack : boolean = false;
	
	function Update(){
		if(!anim.GetBool("staggered")){
		
			if(Time.time >= stopTime && anim.GetCurrentAnimatorStateInfo(3).IsName("Nothing")) this.SendEvent("FINISHED");
			if(target && Time.time < stopTime){
				if(!canAttack){
					var dirToTarget = (target.position - transform.position).normalized;
					motor.SetTargetForward(dirToTarget);
					var angleToTarget = Vector3.Angle(transform.forward, dirToTarget);
					if(angleToTarget < 30.0) canAttack = true;
				}
				else{
					GetComponent.<MeleeCombat>().MeleeAttack();
				}
			}
			
		}
	}
	
}