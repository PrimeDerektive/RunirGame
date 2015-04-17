#pragma strict

class MecanimAction extends MonoBehaviour{

	var firingConditions : ActionCondition[];
	
	private var anim : Animator;
	
	function Start () {
		anim = GetComponent.<Animator>();
	}
	
	function Fire () {
		for(var cond in firingConditions){
			if(anim.GetCurrentAnimatorStateInfo(cond.layer).IsName(cond.stateName) != cond.reqToBe){
				Debug.Log("Cannot fire "+ this.GetType().Name +", wrong state.");
				return;
			}
		}
		Debug.Log("Firing "+ this.GetType().Name);
	}
	
	private class ActionCondition{
		var layer : int;
		var stateName : String;
		var reqToBe : boolean; //as in: this condition is required to be true, or required to be false
	}

}