#pragma strict
import UnityEngine.Events;

class NewMeleeCombat extends MonoBehaviour{

	var animLayer : int;
	var animStates : String[];
	
	
	var comboCounter : int = 0;
	private var comboTime : float = 1.0;	
	
	var inputDownEvents : InputDownEvent[];

	private var inputDownLength : float = 0.0;	
	private var lastClick : float = 0.0;
	private var lastAttackEnded : float = 0.0;
	
	private var anim : Animator;

	function Start(){
		anim = GetComponent.<Animator>();
	}

	function Update () {
		if(animLayer && (animStates.Length > 0) && anim){
		
			var currentState = anim.GetCurrentAnimatorStateInfo(animLayer);
			var nextState = anim.GetNextAnimatorStateInfo(animLayer);
			
			if(Input.GetButton("Fire1")){
				inputDownLength += Time.deltaTime;
			}
			
			for(var event : InputDownEvent in inputDownEvents){
				if(inputDownLength >= event.time && !event.fired){
					Invoke(event.name, 0.0);
					event.fired = true;
				}
			}
			
			if(Input.GetButtonUp("Fire1")){ //if the fire key is released
				
				inputDownLength = 0.0; //reset down timer 
				//reset event triggers
				for(var event : InputDownEvent in inputDownEvents){
					event.fired = false;
				}
				
				if(!anim.GetBool("busy") && Time.time > (lastClick + 0.33)){
					
					if(Time.time > (lastAttackEnded + comboTime)) comboCounter = 0;
					
					var nextAttackState = animStates[comboCounter];	
					
					anim.CrossFade(nextAttackState, 0.1, animLayer);
					
					//anim.SetBool("busy", true);
					
					comboCounter++;
					if(comboCounter == 3) comboCounter = 0;
					
				}
				
				lastClick = Time.time;
				
			}
			
			
		
		}
	}

	function StartCharging(){
		Debug.Log("Starting to charge...");
		anim.CrossFade("ChargeUp", 0.1, animLayer);
	}

	class InputDownEvent{
		var name : String;
		var time : float;
		var fired : boolean = false;	
	}
	
	function MeleeStart(){
		BroadcastMessage("StartWeaponTrail");
	}
		
	function MeleeApex(){
	
	}
	
	function MeleeStop(){
		BroadcastMessage("StopWeaponTrail");
		//anim.SetBool("busy", false);
		lastAttackEnded = Time.time;
	}

}

/*
	
@HideInInspector
var flag : boolean;
@HideInInspector
var i : int = 1;

@CustomEditor(NewMeleeCombat)
class NewMeleeCombatEditor extends Editor{
	function OnInspectorGUI(){
		DrawDefaultInspector();
		var myScript = target as NewMeleeCombat;
		myScript.flag = GUILayout.Toggle(myScript.flag, "Flag");
		if(myScript.flag) myScript.i = EditorGUILayout.IntField("i", myScript.i);
	}
}
*/