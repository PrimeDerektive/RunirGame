#pragma strict



private var anim : Animator;
private var cam : Transform;

var doTurn : boolean = false;
private var angle : float;
private var targetRotation : Quaternion;

function Start () {
	anim = GetComponent.<Animator>();
	cam = Camera.main.transform;
	anim.SetLookAtWeight(1.0);
}

private var lerpAngle : float = 0.0;

function Update () {

	var h : float = Input.GetAxis("Horizontal");
	var v : float = Input.GetAxis("Vertical");

	anim.SetFloat("speedX", h, 0.15, Time.deltaTime);	
	anim.SetFloat("speedY", v, 0.15, Time.deltaTime);

	var camAngle = cam.forward;
	camAngle.y = transform.forward.y;
	angle = Vector3.Angle(camAngle, transform.forward);
	var cross : Vector3 = Vector3.Cross(camAngle, transform.forward); //need cross to determine turning dir
	if (cross.y > 0) angle = -angle; //turning left	
	
	lerpAngle = Mathf.Lerp(lerpAngle, angle, Time.deltaTime*4.0);
	
	if(lerpAngle > 30 || lerpAngle < -30){
		doTurn = true;
	}
	else
		doTurn = false;
	
	var angleDamp : float = 0.0;
	if (anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnInPlace") || anim.IsInTransition(0)) angleDamp = 1000000;
	
	anim.SetBool("turn", doTurn);
	anim.SetFloat("angle", angle, angleDamp, Time.deltaTime);

	if (anim.GetCurrentAnimatorStateInfo(0).IsName("Base.Locomotion"))
	{
		anim.speed = Mathf.Lerp(anim.speed, 1.0, Time.deltaTime*3.0);
		if (doTurn) // just triggered
		{								
			targetRotation = transform.rotation * Quaternion.AngleAxis(angle, Vector3.up); // Compute target rotation when doTurn is triggered
			doTurn = false;
		}
	}
	else if (anim.GetCurrentAnimatorStateInfo(0).IsName("Base.TurnInPlace"))
	{
		anim.speed = Mathf.Lerp(anim.speed, 1.0 + Mathf.Abs(angle/180.0), Time.deltaTime*3.0);
		anim.speed = Mathf.Clamp(anim.speed, 1.0, 2.0);
		//calls MatchTarget when in Turn state, subsequent calls are ignored until targetTime (0.9f) is reached .
		anim.MatchTarget(Vector3.one, targetRotation, AvatarTarget.Root, new MatchTargetWeightMask(Vector3.zero, 1), anim.GetCurrentAnimatorStateInfo(0).normalizedTime, 0.9);			
	}
	
	lookAtPos = cam.position + cam.forward * 15.0;

}

private var lookAtPos : Vector3;
private var lookAtWeight = 1.0;

function OnAnimatorIK(layerIndex : int){			
	anim.SetLookAtWeight(lookAtWeight, 0.75, 0.9, 1.0, 0.35);
	anim.SetLookAtPosition(lookAtPos);			
}