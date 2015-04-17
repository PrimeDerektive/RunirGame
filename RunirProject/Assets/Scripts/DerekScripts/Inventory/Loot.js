#pragma strict

var item : GameItem;

private var checkForSleep : boolean = false;

private var rb : Rigidbody;

function Start(){
	rb = GetComponent.<Rigidbody>();
	yield WaitForSeconds(5.0);
	checkForSleep = true;
}

function FixedUpdate(){
	if(checkForSleep && rb.IsSleeping && rb){
		Destroy(rb);
	}
}