#pragma strict

var randomPitch : boolean;
var volume : float = 1.0;
var sound : AudioClip;

function OnEnable(){
	var audioSource : AudioSource = GetComponent.<AudioSource>();
	if(randomPitch) audioSource.pitch = Random.Range(0.75, 1.0);
	audioSource.PlayOneShot(sound, volume);
}