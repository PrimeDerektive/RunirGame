#pragma strict
import BehaviourMachine;

class AI_Attack extends StateBehaviour{

	var escapeRange : float = 3.0;

	private var target : Transform;
	private var motor : NewMotor;
	private var anim : Animator;

	function Awake(){
		motor = GetComponent.<NewMotor>();
		anim = GetComponent.<Animator>();
	}
	
	function OnEnable(){
		target = blackboard.GetGameObjectVar("target").Value.transform;
		//var duration = Random.Range(1.0, 4.0);
		//stopTime = Time.time + duration;
		//canAttack = false;
		anim.SetTrigger("attack");
	}
	
	
	function Update(){
		var dirToTarget = (target.position - transform.position).normalized;
		motor.RotateTowards(dirToTarget);
		
		if(Vector3.Distance(target.position, transform.position) > escapeRange) this.SendEvent("TargetLost");
		
		/*
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
		*/
	}
	
	function AttackFinished(){
		this.SendEvent("FINISHED");
	}
	
}