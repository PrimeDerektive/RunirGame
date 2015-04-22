#pragma strict

public class PlaySoundAtTime extends StateMachineBehaviour{

	var clip : AudioClip;
	@Range(0.0, 1.0)
	var time : float = 0.0;
	
	private var audioSource : AudioSource;
	private var played : boolean = false;

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		audioSource = animator.GetComponent.<AudioSource>();
	}
	
	public override function OnStateUpdate(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		//if the specified time has elapsed, and we're not in a transition, and the sound hasn't been played yet, and we have an audio source
		if(stateInfo.normalizedTime >= time && !animator.IsInTransition(layerIndex) && !played && audioSource){
			audioSource.PlayOneShot(clip, 1.0);
			played = true;
		}
	}
	
	public override function OnStateExit(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		//reset the played boolean
		played = false;
	}

}
	