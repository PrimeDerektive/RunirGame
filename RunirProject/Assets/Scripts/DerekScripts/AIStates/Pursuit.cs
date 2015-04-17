using UnityEngine;
using System.Collections;
using BehaviourMachine;

namespace AIStates{
	
	public class Pursuit : StateBehaviour {

		GameObjectVar target;
		Transform targetTrans;

		void Awake(){
			target = blackboard.GetGameObjectVar("target");
			targetTrans = target.Value.transform;
		}
		
		void OnEnable(){
			print("I am now pursuing.");
		}
		
	}
	
}