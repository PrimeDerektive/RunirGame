#pragma strict

class ChargeAttack_GaleStrike extends ChargeAttack{

	var galeEffect : GameObject;
	var swingSound : AudioClip;
	var galeSound : AudioClip;
	
	function GaleStrikeStart(){
		melee.swordObject.SendMessage("StopCharging", 1.0, SendMessageOptions.DontRequireReceiver);
		audioSource.pitch = 1.0;
		audioSource.PlayOneShot(swingSound, 1.0);
		melee.weaponTrail.Emit = true;
	}
	
	private var alreadyHit = new List.<Transform>();

	function GaleStrikeApex(){
		
		var effect = ObjectPool.instance.GetObject(galeEffect.name, transform.position + (Vector3.up * 0.5), Quaternion.LookRotation(transform.forward, Vector3.up));
		//var effect = Instantiate(galeEffect, transform.position + (Vector3.up * 0.5), Quaternion.LookRotation(transform.forward, Vector3.up)); 
		//effect.GetComponentInChildren(ParticleDamage).SetOwner(uLink.NetworkView.Get(this).viewID, transform);
		audioSource.pitch = 1.0;
		audioSource.PlayOneShot(galeSound, 1.0);
		if(uLink.NetworkView.Get(this).isMine){
			//always reset before shaking to avoid accumulation errors
			Camera.main.transform.localRotation = Quaternion.identity;
			iTween.PunchRotation(Camera.main.gameObject, Vector3(8.0, 16.0, 8.0), 0.75);
		}
		
	}

	function GaleStrikeFinish(){
		melee.weaponTrail.Emit = false;
		melee.anim.SetBool("charged", false);
		melee.anim.SetBool("attack", false);
	}

}