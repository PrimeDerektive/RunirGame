#pragma strict

var hitEffect : GameObject;

function TakeDamage(hit : RaycastHit){
	yield WaitForSeconds(0.1);
	GameObject.Instantiate(hitEffect, hit.point, Quaternion.FromToRotation(Vector3.up, hit.normal));
}