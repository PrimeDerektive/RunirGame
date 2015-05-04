#pragma strict

var hitEffect : GameObject;

function TakeDamage(hit : RaycastHit){
	yield WaitForSeconds(0.1);
	var newHitEffect : GameObject = GameObject.Instantiate(hitEffect, hit.point, Quaternion.LookRotation(hit.normal));
	newHitEffect.transform.parent = transform;
}