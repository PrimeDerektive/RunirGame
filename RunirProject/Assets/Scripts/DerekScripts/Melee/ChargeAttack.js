#pragma strict

class ChargeAttack extends MonoBehaviour{

	var melee : MeleeCombat;
	
	var audioSource : AudioSource;
	
	function Awake(){
		if(!melee) melee = GetComponent.<MeleeCombat>();
		if(!audioSource) audioSource = GetComponent.<AudioSource>();
		this.enabled = false;
	}
	
	function OnEnable(){
		melee.anim.SetBool(this.GetType().Name, true);
	}

}