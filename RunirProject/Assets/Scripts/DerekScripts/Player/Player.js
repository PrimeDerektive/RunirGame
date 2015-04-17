#pragma strict

//a reference to the mecanim motor. this script captures input
//for the local player and broadcasts it to the motor
var motor : MecanimMotor;
var stopMovingLayers : LayerMask;

//these variables are for changing weapons
//they enable and disable the weapons scripts and set the current weapon 
var startingWeapon : WeaponType;
var meleeScript : MeleeCombat;
var rangedScript : RangedCombat;
enum WeaponType{ melee, ranged }
private var currentWeapon : WeaponType;

//these variables are used to position the AimTarget for the local player in Update()
//as well as render the crosshair texture at the position of the AimTarget
var camTrans : Transform;
var aimTarget : Transform;
var aimRayDistance : float = 100.0;
var aimLayers : LayerMask;
var crosshairTexture : Texture2D;
private var crosshairPos : Vector3;

//aimPos is used for both local and remote entities
//it is set to aimTarget.position on local, or set to
//latest estimated aim position from serialization
var aimPos : Vector3;

function Start(){
	
	//cache motor reference if not set
	if(!motor) motor = GetComponent.<MecanimMotor>();
	
	//cache weapon references if not set
	if(!meleeScript) meleeScript = GetComponent.<MeleeCombat>();
	if(!rangedScript) rangedScript = GetComponent.<RangedCombat>();
	SwitchWeaponType(startingWeapon); //set initial weapon
	
	//cache aiming references if not set
	if(!camTrans) camTrans = Camera.main.transform;
	if(!aimTarget) aimTarget = GameObject.FindGameObjectWithTag("AimTarget").transform;
	
}

function Update () {
	
	//movement input
	var xInput = Input.GetAxis("Horizontal");
	var yInput = Input.GetAxis("Vertical");
	//the following code casts a ray in the local direction of the input
	//to determine if we're trying to move into another character controller, or a wall
	var inputDir : Vector3 = new Vector3(xInput, 0, yInput);
	var moveDir : Vector3 = transform.TransformDirection(inputDir);
	Debug.DrawRay(transform.position + Vector3.up, moveDir * 5.0, Color.red);
	var hits : RaycastHit[] = Physics.RaycastAll(
		transform.position + Vector3.up, //have to add the up because our player model pivot point is dumb
		moveDir,
		1.0, //short
		stopMovingLayers
	);
	//reduce movement to 0 if we're trying to move into something
	for(var hit : RaycastHit in hits){
		if(hit.transform.root != transform){ //but not ourselves
			xInput = 0;
			yInput = 0;
		}
	}
	//send input to motor
	motor.Move(xInput, yInput, 0.3); 
	
	motor.SetTargetForward(camTrans.forward);
	if(Input.GetButtonDown("Jump")) motor.Roll();	
	
	if(Input.GetButtonDown("Fire1")){
		
		switch(currentWeapon){
			case WeaponType.melee:
				meleeScript.StartCoroutine("FireDown");
				break;
			case WeaponType.ranged:
				rangedScript.FireDown();
				break;
		}
	
	}
	
	if(Input.GetButtonUp("Fire1")){
		
		switch(currentWeapon){
			case WeaponType.melee:
				meleeScript.MeleeAttack();
				break;
			case WeaponType.ranged:
				rangedScript.FireUp();
				break;
		}
	
	}
	
	//this code sets the aimtarget location and aimPos var for the local player
	//aimPos is received in the serializer for remote entities
	aimTarget.position = AimCast(camTrans.position, camTrans.forward, aimRayDistance);
	aimPos = aimTarget.position;
	//print(transform.InverseTransformPoint(aimPos));	
	crosshairPos = Camera.main.WorldToScreenPoint(aimTarget.position);
	
	/* //this stuff is for ragdoll transitioning. to be moved
	if(Input.GetKeyDown(KeyCode.Q)){
		uLink.NetworkView.Get(this).UnreliableRPC("FallDown", uLink.RPCMode.All);
	}
	
	if(targetRootBonePos != Vector3.zero && ragdollHelper.ragdolled){
		rootBone.localPosition = Vector3.Lerp(rootBone.localPosition, targetRootBonePos, Time.deltaTime*5.0);
	}
	
	if(rootBone.rigidbody.IsSleeping() && ragdollHelper.ragdolled){
		ragdollHelper.ragdolled = false;
	}
	*/
	
}

function SwitchWeaponType(type : WeaponType){
	if(type == WeaponType.melee){
		rangedScript.enabled = false;
		meleeScript.enabled = true;
		currentWeapon = WeaponType.melee;
	}
	else if(type == WeaponType.ranged){
		rangedScript.enabled = true;
		meleeScript.enabled = false;
		currentWeapon = WeaponType.ranged;
	}
}

function OnGUI(){
	GUI.DrawTexture(Rect(crosshairPos.x - 12, crosshairPos.y - 12, 24, 24), crosshairTexture);
}

function AimCast(origin : Vector3, dir : Vector3, dist : float) : Vector3{
	var hits : RaycastHit[] = Physics.RaycastAll(origin, dir, dist, aimLayers);
	var bestHit : RaycastHit;
	if(hits.length > 0){
		bestHit = hits[0];
		for(var hit : RaycastHit in hits){
			if(hit.distance < bestHit.distance && hit.transform.root != transform){
				bestHit = hit;
			}
			if(bestHit.transform.root == transform) bestHit.point = Vector3.zero;
		}
	}
	if(bestHit.point != Vector3.zero)
		return bestHit.point;
	else
		return origin + dir * dist;
}

/*
@RPC
function FallDown(){
	ragdollHelper.ragdolled = true;
	Camera.main.GetComponent.<TPSOrbit>().target = rootBone;
	rootBone.rigidbody.AddForce(Vector3.up * 10000);
	if(uLink.NetworkView.Get(this).isMine){
		var timer : float = 1.0;
		while(timer > 0){
			timer -= 0.15;
			uLink.NetworkView.Get(this).UnreliableRPC("CorrectRootBone", uLink.RPCMode.Others, rootBone.localPosition);
			yield WaitForSeconds(0.15);
		}
	}

}

@RPC
function CorrectRootBone(boneLocalPos : Vector3){
	targetRootBonePos = boneLocalPos;
}

//@RPC
function GetUp(){
	ragdollHelper.ragdolled = false;
}
*/