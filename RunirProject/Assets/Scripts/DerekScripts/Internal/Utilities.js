#pragma strict

//this function calculates the target rotation angle of an object
//that is turning, relative to the target direction
static function FindTurningAngle(currentForward : Vector3, targetForward : Vector3) : float{
	targetForward.y = currentForward.y; // kill Y
    var axis = Vector3.Cross(currentForward, targetForward);
	return Vector3.Angle(currentForward, targetForward) * (axis.y < 0 ? -1 : 1);
}

static function LerpPositionOverTime(tr : Transform, start : Vector3, end : Vector3, duration : float) : IEnumerator{
    var i = 0.0;
    var rate = 1.0/duration;
    while (i < 1.0){
        i += Time.deltaTime * rate;
        tr.position = Vector3.Lerp(start, end, i);
        yield; 
    }
}