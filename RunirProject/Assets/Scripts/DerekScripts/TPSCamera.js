//camera positioning variables
public var target : Transform;
public var pivotOffset : Vector3 = Vector3(1.0, 0.25,  0.0);
public var camOffset : Vector3 = Vector3(0.0, 0.5, -2.5);
public var closeOffset : Vector3 = Vector3(0.25, 1.5, 0.0);
public var horizontalAimingSpeed : float = 270;
public var verticalAimingSpeed : float = 270;
public var maxVerticalAngle : float = 80;
public var minVerticalAngle : float = -80;
public var maxHorizontalAngle : float = 60;
public var minHorizontalAngle : float = -60;
public var mouseSensitivity : float = 0.1;
public var lineOfSightMask : LayerMask = 0;	

private var angleH : float = 0;
private var angleV : float = 0;
private var angleHSmooth : float = 0;
private var angleVSmooth : float = 0;
private var hVelocity : float = 0;
private var vVelocity : float = 0;
private var maxCamDist : float = 3;

function FixedUpdate(){

	if (!target) 
		return;
	
	//capture and smooth mouse input angles
	angleH += Input.GetAxis("Mouse X") * horizontalAimingSpeed * 0.02;
	angleV += Input.GetAxis("Mouse Y") * verticalAimingSpeed * 0.02;
	angleV = ClampAngle(angleV, minVerticalAngle, maxVerticalAngle);
	angleHSmooth = Mathf.SmoothDamp(angleHSmooth, angleH, hVelocity, 0.05);
    angleVSmooth = Mathf.SmoothDamp(angleVSmooth, angleV, vVelocity, 0.05);
    //angleVSmooth = ClampAngle(angleVSmooth, minVerticalAngle, maxVerticalAngle);
	
	// Set aim rotation
	var aimRotation : Quaternion = Quaternion.Euler(-angleVSmooth, angleHSmooth, 0);
	var camYRotation : Quaternion = Quaternion.Euler(0, angleHSmooth, 0);
	transform.rotation = aimRotation;
	
	// Find far and close position for the camera
	var farCamPoint : Vector3 = target.position + camYRotation * pivotOffset + aimRotation * camOffset;
	var closeCamPoint : Vector3 = target.position + camYRotation * closeOffset;
	var farDist : float = Vector3.Distance(farCamPoint, closeCamPoint);
	
	// Smoothly increase maxCamDist up to the distance of farDist
	maxCamDist = Mathf.Lerp(maxCamDist, farDist, 5 * Time.deltaTime);
	
	// Make sure camera doesn't intersect geometry
	// Move camera towards closeOffset if ray back towards camera position intersects something 
	var hit : RaycastHit;
	var closeToFarDir : Vector3 = (farCamPoint - closeCamPoint) / farDist;
	if (Physics.Raycast(closeCamPoint, closeToFarDir, hit, maxCamDist, lineOfSightMask))
		maxCamDist = hit.distance;
	transform.position  = closeCamPoint + closeToFarDir * maxCamDist;
		
}

static function ClampAngle (angle : float, min : float, max : float) {
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}