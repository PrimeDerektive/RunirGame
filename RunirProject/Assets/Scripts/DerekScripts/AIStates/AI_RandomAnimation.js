#pragma strict
import BehaviourMachine;

class AI_RandomAnimation extends StateBehaviour{

	var possibleClips : AnimClip[];

	private var target : Transform;
	private var motor : NewMotor;
	private var anim : Animator;
	
	private class AnimClip{
		var name : String;
		var layer : int;
	}

	function Awake(){
		motor = GetComponent.<NewMotor>();
		anim = GetComponent.<Animator>();
	}
	
	private var clipToPlay : int;
	
	function OnEnable(){
		target = blackboard.GetGameObjectVar("target").Value.transform;
		//var duration = Random.Range(1.0, 4.0);
		//stopTime = Time.time + duration;
		//canAttack = false;
		clipToPlay = Random.Range(0, possibleClips.Length);
		anim.CrossFade(possibleClips[clipToPlay].name, 0.15, possibleClips[clipToPlay].layer);
	}
	
	
	function Update(){
		var dirToTarget = (target.position - transform.position).normalized;
		
		
		var currentState = anim.GetCurrentAnimatorStateInfo(possibleClips[clipToPlay].layer);
		//only rotate towards target for first half of clip, or if they're no longer in the animation state
		if(currentState.normalizedTime < 0.25 || !currentState.IsName(possibleClips[clipToPlay].name))
			motor.RotateTowards(dirToTarget);
		
		
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
	
	function Finished(){
		if(this.enabled) this.SendEvent("FINISHED");
	}
	
}