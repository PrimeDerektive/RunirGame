#pragma strict

class GUIMenu extends MonoBehaviour{

	var input : String;
	var toggleTweens : UITweener[];
	var toggleSound : AudioClip;

	private var particles : ParticleSystem[];

	function Start(){
		particles = GetComponentsInChildren.<ParticleSystem>();
	}

	function Activate(){
		gameObject.SetActive(true);
		if(toggleTweens.length != 0){
			for(var tween : UITweener in toggleTweens){
				tween.PlayForward();
			}
		}
		if(toggleSound) NGUITools.PlaySound(toggleSound, 0.75);
	}

	function Deactivate(){
		if(particles){
			for(var particleSystem : ParticleSystem in particles){
				particleSystem.Stop();
			}
		}
		if(toggleTweens.length != 0){
			var tweenDuration : float = 0.0;
			for(var tween : UITweener in toggleTweens){
				tween.PlayReverse();
				if(tween.duration > tweenDuration) tweenDuration = tween.duration;
			}
			yield WaitForSeconds(tweenDuration);
		}
		gameObject.SetActive(false);
	}

}

