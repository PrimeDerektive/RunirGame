#pragma strict

class NewMeleeCombat extends MonoBehaviour{

	var animLayer : int;
	var animState : String;
	var animState1 : String;
	var animState2 : String;
	
	var comboCounter : int = 0;	
	
	var inputDownEvents : InputDownEvent[];

	private var anim : Animator;
	private var inputDownLength : float = 0.0;
	
	@HideInInspector
	var flag : boolean;
	@HideInInspector
	var i : int = 1;

	function Start(){
		anim = GetComponent.<Animator>();
	}
	
	private var lastClick : float = 0.0;

	function Update () {
		if(animLayer && animState && anim){
		
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
			
			Debug.Log(currentState.normalizedTime);
			if(Input.GetButtonUp("Fire1")){ //if the fire key is released
				if(!attacking){
					
					inputDownLength = 0.0; //reset down timer 
					//reset event triggers
					for(var event : InputDownEvent in inputDownEvents){
						event.fired = false;
					}
					
					var nextAttackState = animState;
					if(comboCounter == 1) nextAttackState = animState1;
					if(comboCounter == 2) nextAttackState = animState2;				
					
					anim.CrossFade(nextAttackState, 0.1, animLayer);
					
					attacking = true;
					
					comboCounter++;
					if(comboCounter == 3) comboCounter = 0;
					
				}
				//lastClick = Time.time;
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
	
	private var attacking : boolean = false;
	
	function MeleeStart(){
		
	}
	
	function MeleeApex(){
	
	}
	
	function MeleeStop(){
		attacking = false;
	}

}

/*
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