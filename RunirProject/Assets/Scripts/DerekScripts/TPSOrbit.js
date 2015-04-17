#pragma strict

var target : Transform;

function SetTarget(newTarget : Transform){
	target = newTarget;
	Initialize();
}

var startOffset : Vector3 = Vector3(0.35, 10.0, -5.0);
var targetOffset : Vector3 = Vector3(0.35, 1.65, -2.0);
var ragdollOffset : Vector3 = Vector3(0.0, 1.65, -5.0);

var xSpeed = 120.0;
var ySpeed = 120.0;

var yMinLimit = -60;
var yMaxLimit = 45;

private var x = 0.0;
private var y = 0.0;

enum camState { AtStart, AtTarget }

/*
function Update(){

		var targetZOffset : float = -2 - (target.GetComponent.<Animator>().GetFloat("speedY"));
        offset.z = Mathf.Lerp(offset.z, targetZOffset, Time.deltaTime*2.0);
        
        var targetXOffset : float = 0.35 + (0.65 * target.GetComponent.<Animator>().GetFloat("speedX"));
        targetXOffset += Mathf.Clamp(
        					target.GetComponent.<Animator>().GetFloat("direction")*0.0666,
        					-1.0,
        					1.0
        				) * 0.5;
        offset.x = Mathf.Lerp(offset.x, targetXOffset, Time.deltaTime*2.0);

}
*/

function Initialize(){
	transform.forward = target.forward;
	transform.position = target.position + transform.TransformDirection(startOffset);
	//StartCoroutine(Utilities.LerpPositionOverTime(transform, transform.position, target.position + transform.TransformDirection(offset), 1.0));
	//yield WaitForSeconds(1.0);
	//Initialized();
	iTween.MoveTo(
		gameObject,
		{
			"position": target.position + transform.TransformDirection(targetOffset),
			"easeType": "easeInQuart",
			"time": 1.0,
			"oncomplete": "Initialized"
		}
	);
	yield WaitForSeconds(1.0);
	var angles = transform.eulerAngles;
    x = angles.y;
    y = angles.x;
	initialized = true;
}

private var initialized : boolean = false;

function LateUpdate () {

    if (target && initialized) {
        
        //calculate angle between cam and player forward
        //var angleDifference = Utilities.FindTurningAngle(target.forward, transform.forward);
		//angleDifference *= 0.0083; //same as dividing by 120
		//angleDifference = Mathf.Clamp(angleDifference, -1.0, 1.0);
		//angleDifference is now -1.0 when the camera is -120 degrees from the player forward,
		//and 1.0 when +120 degrees from the camera forward
		
		//we will smoothly reduce the x rotation speed to 0 the closer the camera forward
		//gets to being 120 degrees away from the player forward, but only if rotating away
		//from the player forward (this is why we have to wait until here to get the Abs value)
		/*
		var xSpeedToUse = xSpeed;
		if(
			(angleDifference > 0.0 && Input.GetAxis("Mouse X") > 0.0) ||
			(angleDifference < 0.0 && Input.GetAxis("Mouse X") < 0.0)
		){
			xSpeedToUse = xSpeed - (xSpeed * Mathf.Abs(angleDifference));
		}
		x += Input.GetAxis("Mouse X") * xSpeedToUse * 0.02;
       	y -= Input.GetAxis("Mouse Y") * ySpeed * 0.02;   
       	y = ClampAngle(y, yMinLimit, yMaxLimit); 
       	*/
       	
       	x += Input.GetAxis("Mouse X") * xSpeed * 0.02;
       	y -= Input.GetAxis("Mouse Y") * ySpeed * 0.02;   
       	y = ClampAngle(y, yMinLimit, yMaxLimit);     
       	        

		var targetRot = Quaternion.Euler(y, x, 0);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, Time.deltaTime*10.0);;
        transform.position = transform.rotation * targetOffset + target.position; 
        
    }
    
}

static function ClampAngle (angle : float, min : float, max : float) {
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}