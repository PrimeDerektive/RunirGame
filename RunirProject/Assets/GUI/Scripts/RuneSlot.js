#pragma strict

var normalState : String;
var hoverState : String;
var activeState : String;
var disabledState : String;

var hoverSound : AudioClip;
var activateSound : AudioClip;
var activateTween : TweenScale;
var activeParticles : ParticleSystem;

var currentState : RuneState = RuneState.normal;

public enum RuneState{
	normal, hover, active, disabled
}

private var sprite : UISprite;


function Start () {
	if(activeParticles){
		activeParticles.GetComponent.<Renderer>().sortingLayerName = "UI";	
		activeParticles.Stop();
	}
	sprite = GetComponent.<UISprite>();
	SetState(RuneState.normal);
}

function SetState(state : RuneState){
	switch(state){
		case RuneState.normal:
			sprite.spriteName = normalState;
			currentState = RuneState.normal;
			break;
		case RuneState.hover:
			sprite.spriteName = hoverState;
			NGUITools.PlaySound(hoverSound, 0.15, Random.Range(0.75, 1.0));
			currentState = RuneState.hover;
			break;
		case RuneState.active:
			sprite.spriteName = activeState;
			NGUITools.PlaySound(activateSound, 0.75, Random.Range(0.75, 1.0));
			if(activeParticles) activeParticles.Play();
			StartCoroutine(PlayActivateTween());
			currentState = RuneState.active;
			break;
		case RuneState.disabled:
			currentState = RuneState.disabled;
			break;
	}
}

function PlayActivateTween(){
	if(activateTween){
		activateTween.PlayForward();
		yield WaitForSeconds(0.1);
		if(GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Play();
	}
}

function OnDisable(){
	SetState(RuneState.normal);
}


