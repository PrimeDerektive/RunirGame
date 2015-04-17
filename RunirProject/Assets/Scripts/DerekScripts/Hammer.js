#pragma strict

var hammerObject : GameObject;
var activateSound : AudioClip;
var deactivateSound : AudioClip;
var targetScale : Vector3 = Vector3 (0.3, 0.3,0.3);

var activateParticles : ParticleSystem;

function ActivateHammer(){
	if(!hammerObject.activeInHierarchy) hammerObject.SetActive(true);
	iTween.ScaleTo(hammerObject, targetScale, 0.3);
	GetComponent.<AudioSource>().PlayOneShot(activateSound, 0.75);
	activateParticles.Play();
}

function DeactivateHammer(){
	/*
	audio.PlayOneShot(deactivateSound, 0.75);
	yield WaitForSeconds(0.3);
	iTween.ScaleTo(hammerObject, Vector3.zero, 0.3);
	yield WaitForSeconds(0.3);
	hammerObject.SetActive(false);
	*/
}

