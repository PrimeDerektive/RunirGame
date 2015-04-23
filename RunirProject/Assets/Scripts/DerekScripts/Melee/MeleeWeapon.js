#pragma strict

var chargingEffects : ParticleSystem[];
var chargedEffects : ParticleSystem[];
var chargedSound : AudioClip;

var glowRenderer : Renderer;
var glowColor : Color;
var audioSource : AudioSource;

function Start(){
	if(!audioSource) audioSource = GetComponent.<AudioSource>();
	glowRenderer.material.SetColor("_GlowColorMult", Color.black);
}

function StartCharging(chargeTime : float){
	EnableEffects(chargingEffects);
	audioSource.Play();
	var timer : float = 0.0;
	while(timer < chargeTime){
		timer += Time.deltaTime;
		var t : float = timer/chargeTime;
		glowRenderer.material.SetColor(
			"_GlowColorMult",
			Color.Lerp(Color.black, glowColor, t)
		);
		audioSource.volume = Mathf.Lerp(0.25, 0.75, t);
		audioSource.pitch = Mathf.Lerp(0.75, 0.9, t);
		yield;
	}
}

function StopCharging(transitionTime : float){
	StopCoroutine("StartCharging");
	DisableEffects(chargingEffects);
	DisableEffects(chargedEffects);
	audioSource.Stop();
	var timer : float = 0.0;
	while(timer < transitionTime){
		timer += Time.deltaTime;
		var t : float = timer/transitionTime;
		glowRenderer.material.SetColor(
			"_GlowColorMult",
			Color.Lerp(glowColor, Color.black, t)
		);
		yield;
	}
}

function FullyCharged(){
	glowRenderer.material.SetColor("_GlowColorMult", glowColor);
	DisableEffects(chargingEffects);
	EnableEffects(chargedEffects);
	//audioSource.pitch = 1.0;
	audioSource.PlayOneShot(chargedSound, 1.0);
}


function EnableEffects(effects : ParticleSystem[]){
	for(var effect : ParticleSystem in effects){
		effect.Play();
	}
}

function DisableEffects(effects : ParticleSystem[]){
	for(var effect : ParticleSystem in effects){
		effect.Stop();
	}
}