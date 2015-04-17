#pragma strict

var doIK : boolean = true;
var targetLayers : LayerMask;

var crosshairTexture : Texture2D;
var crosshairPos : Vector3;

private var anim : Animator;
private var cam : Transform;
private var h : float;
private var v : float;
private var direction : float = 0.0;
private var turning : boolean = false;

function Start () {
	anim = GetComponent.<Animator>();
	cam = Camera.main.transform;
	anim.SetLookAtWeight(1.0);
}

function Update () {

	if(!anim.GetCurrentAnimatorStateInfo(1).IsName("Rolling.Nothing"))
		doIK = false;
	else
		doIK = true;

	//locomotion driving
	h  = Input.GetAxis("Horizontal");
	v  = Input.GetAxis("Vertical");
	anim.SetFloat("speedX", h, 0.1, Time.deltaTime);	
	anim.SetFloat("speedY", v, 0.1, Time.deltaTime);

	//calculate angle between cam and player forward
	var camForward = cam.forward;
    camForward.y = transform.forward.y; // kill Y
    var axis = Vector3.Cross(transform.forward, camForward);
	direction = Vector3.Angle(transform.forward, camForward) * (axis.y < 0 ? -1 : 1); //direction is clamped from 0-1
		
	if(
	anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnLeftBlock") ||
	anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnRightBlock")
	){
		direction = 0.0;
		anim.SetFloat("direction", direction);
	}		

	anim.SetFloat("direction", direction, 0.2, Time.deltaTime);
    	
}

var rotateLookTarget : boolean = true;

function FixedUpdate(){

	var hit : RaycastHit;
	//if(Physics.Raycast(cam.position, cam.forward, hit, 100.0, targetLayers)){
	//	lookAtPos = hit.point;
	//}
	//else{
		lookAtPos = cam.position + cam.forward * 10.0;
	//}
	
	crosshairPos = Camera.main.WorldToScreenPoint(lookAtPos);
	
	lookTarget.position = lookAtPos;
	if(rotateLookTarget){
		lookTarget.rotation = cam.rotation;
		lookTarget.Rotate(Vector3(0, 85.0, 0));
	}
		
	var camForward = cam.forward;
	camForward.y = transform.forward.y;
	if(direction > 60 || direction < -60 && !turning) turning = true;
	if(h > 0.1 || h < -0.1 || v > 0.1 || v < -0.1 || anim.GetBool("block")){
		transform.forward = Vector3.Lerp(transform.forward, camForward, Time.deltaTime*10.0);
	}	
	else if(
	anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnRight") ||
	anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnLeft")
	){
		transform.forward = Vector3.Slerp(transform.forward, camForward, Time.deltaTime*5.0);
		
	}
	if(turning && direction < 15.0 && direction > -15.0) turning = false;
	anim.SetBool("turn", turning);
	
}

private var lookAtPos : Vector3;
private var lookAtWeight = 1.0;
var lookTarget : Transform;
var rightHand : Transform;

function OnAnimatorIK(layerIndex : int){
	if(doIK){		
		anim.SetLookAtWeight(lookAtWeight, 0.35, 0.75, 0.0, 0.5);
		var lookAtOffset : Vector3 = lookAtPos;
		//lookAtOffset += cam.right * 5.0;
		//lookAtOffset.y -= 2.0;
		anim.SetLookAtPosition(lookAtOffset);
	}		
}

function OnGUI(){
	GUI.DrawTexture(Rect(crosshairPos.x - 12, crosshairPos.y - 12, 24, 24), crosshairTexture);
}