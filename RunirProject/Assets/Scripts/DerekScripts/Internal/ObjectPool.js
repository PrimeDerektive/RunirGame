#pragma strict

import System.Collections.Generic;
 
static var instance : ObjectPool;
 
public var objectsToPool : GameObject[];
 
public var objectPool : List.<GameObject>[];
 
public var amountToBuffer : int;
 
protected var container : GameObject;
 
function Awake(){
 
	instance = this;
 
}
 
 
 
function Start(){
 
	container = new GameObject("ObjectPool");
 
	objectPool = new List.<GameObject>[objectsToPool.length];
 
	for(var i=0; i<objectsToPool.length; i++){
 
		var pooledObjects : List.<GameObject> = new List.<GameObject>();
 
		objectPool[i] = pooledObjects;
 
		for(var j=0; j<amountToBuffer; j++){
 
			var newObj : GameObject = Instantiate(objectsToPool[i]);
 
			newObj.name = objectsToPool[i].name;
 
			PoolObject(newObj);
 
		}
 
	}
 
}
 
 
 
function GetObject(name : String, pos : Vector3, rot : Quaternion) : GameObject{ 
 
	for(var i=0; i<objectsToPool.length; i++){
 
		if(name == objectsToPool[i].name){
 
			if(objectPool[i].Count > 0){
 
				var obj : GameObject = objectPool[i][0];
 
				objectPool[i].RemoveAt(0);
 
				obj.transform.parent = null;
 
				obj.transform.position = pos;
 
				obj.transform.rotation = rot;
 
				obj.SetActiveRecursively(true);
 
				return(obj);
 
			}
 
			else{
 
				//Debug.Log("No objects available in pool! Instantiating a new one.");
 
				var newObj : GameObject = Instantiate(objectsToPool[i], pos, rot);
				
				newObj.name = newObj.name.Replace("(Clone)","");
 
				return(newObj);
 
			}
 
		}
 
	}
 
}
 
 
 
function PoolObject(obj : GameObject){
 
	var pooled : boolean = false;
	
	for(var i=0; i<objectsToPool.length; i++){
 
		if(obj.name == objectsToPool[i].name){
 
			//Debug.Log("Pooling object.");
 
			obj.SetActiveRecursively(false);
 
			obj.transform.parent = container.transform;
 
			objectPool[i].Add(obj);
			
			pooled = true;
 
		}
 
	}
	
	if(!pooled){
	
		//Debug.Log("Error: there are no pools of this object.");
	
	}
 
}