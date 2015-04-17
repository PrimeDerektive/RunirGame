#pragma strict

function Start () {
	GetComponent.<Animator>().SetLayerWeight(3, 1.0);
	GetComponent.<Animator>().SetBool("block", true);
}