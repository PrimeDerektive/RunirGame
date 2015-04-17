#pragma strict

var other : Transform;

function Update () {

	if(other){
	
		var dirToOther = (other.position - transform.position).normalized;
		dirToOther.y = transform.forward.y;
		var angle = Vector3.Angle(dirToOther, transform.forward);
		print(angle);
	
	}

}