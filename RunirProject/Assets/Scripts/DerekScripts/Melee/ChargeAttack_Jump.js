#pragma strict

class ChargeAttack_Jump extends ChargeAttack{

	var jumpSound : AudioClip;
	var jumpAttackSound : AudioClip;
	
	
	function JumpAttackStart(){
		melee.swordObject.SendMessage("StopCharging", 1.0, SendMessageOptions.DontRequireReceiver);
		audioSource.pitch = 1.0;
		audioSource.PlayOneShot(jumpSound, 1.0);
		melee.weaponTrail.Emit = true;
	}

	
	
	function JumpAttackApex(){
		audioSource.pitch = Random.Range(0.75, 1.0);
		audioSource.PlayOneShot(jumpAttackSound, 1.0);
		if(uLink.NetworkView.Get(this).isMine){
			//always reset before shaking to avoid accumulation errors
			Camera.main.transform.localRotation = Quaternion.identity;
			iTween.PunchRotation(Camera.main.gameObject, Vector3(1.0, 2.0, 1.0), 0.5);
		}
		
		
	}
	
	private var alreadyHit = new List.<Transform>();

	function JumpAttackFinish(){
	
		//Calculate hit on server
		if(uLink.Network.isServer){
			var attackDir = transform.forward;
			var hits : RaycastHit[] = Physics.SphereCastAll(
				melee.rayOrigin.position - attackDir * 0.35,
				0.35,
				attackDir,
				5.0,
				melee.attackLayer
			);
			for(hit in hits){
				if(hit.transform.root != transform && !alreadyHit.Contains(hit.transform.root)){
					var hitStatus : PlayerStatus = hit.transform.root.GetComponent.<PlayerStatus>();
					if(hitStatus) hitStatus.EvaluateHit(hit, uLink.NetworkView.Get(this).viewID); 
					alreadyHit.Add(hit.transform.root);
				}
			}
		}
		
		melee.weaponTrail.Emit = false;
		melee.anim.SetBool("charged", false);
		melee.anim.SetBool("attack", false);
	}

}