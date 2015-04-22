#pragma strict

public class PlaySoundOnEnter extends StateMachineBehaviour{

	var clip : AudioClip;

	public override function OnStateEnter(animator : Animator, stateInfo : AnimatorStateInfo, layerIndex : int){
		var audioSource = animator.GetComponent.<AudioSource>();
		if(audioSource){
			audioSource.PlayOneShot(clip, 1.0);
		}
	}

}
	