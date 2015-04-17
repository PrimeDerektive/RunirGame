#pragma strict


var interpDuration : float = 0.1; //amount of time for convergence

var cc : CharacterController;
var anim : Animator;
var aimTarget : Transform;
var tpsCam : TPSOrbit;
var motor : MecanimMotor;
var player : Player;
var rootBone : Transform;
 
private var latestState : ExtrapState;
private var lastState : ExtrapState;
private var accumDelta : float = 0.0;
private var interpDirection : Vector3;

class ExtrapState{
	
	var pos : Vector3;
	var vel : Vector3;
	var timestamp : float;
	var speedX : float;
	var speedY : float;
	
	function ExtrapState(p : Vector3, v : Vector3, t : float, sX : float, sY : float){
		pos = p;
		vel = v;
		timestamp = t;
		speedX = sX;
		speedY = sY;
	}
	
}

function Start () {
	if(!cc) cc = GetComponent.<CharacterController>();
	if(!anim) anim = GetComponent.<Animator>();
	if(!aimTarget) aimTarget = GameObject.FindGameObjectWithTag("AimTarget").transform;
	if(!tpsCam) tpsCam = GameObject.FindGameObjectWithTag("CameraHolder").GetComponent.<TPSOrbit>();
	if(!motor) motor = GetComponent.<MecanimMotor>();
	if(!player) player = GetComponent.<Player>();	
}


function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	if (!uLink.NetworkView.Get(this).isMine){
		GetComponent(Player).enabled = false;
		GetComponent(Block).enabled = false;
		GetComponent(RollController).enabled = false;
		//anim.applyRootMotion = false;
		GetComponent(Animator).SetBool("proxy", true);
	}
	else{
		GameObject.FindGameObjectWithTag("CameraHolder").GetComponent.<TPSOrbit>().SetTarget(transform);
		GameManager.instance.localPlayer = gameObject;
		
		//GetComponent.<MecanimMotor>().doIK = true;
	}
}

function uLink_OnSerializeNetworkView(stream : uLink.BitStream, info : uLink.NetworkMessageInfo){

    if (stream.isWriting){
       
        var pos = transform.position;
        var vel = cc.velocity;
        var speedX = anim.GetFloat("speedX");
		var speedY = anim.GetFloat("speedY");
        stream.Serialize(pos);
        stream.Serialize(vel);
        stream.Serialize(speedX);
        stream.Serialize(speedY);
        
        //var estCamPos : Vector3 = tpsCam.;
		var dirToAimTarget = aimTarget.position - Camera.main.transform.position;
		var targetRot = Quaternion.LookRotation(dirToAimTarget); //send the x and y euler of this value over network, compressed to bytes
    	var eulerX = targetRot.eulerAngles.x;
    	var eulerY = targetRot.eulerAngles.y;
    	stream.Serialize(eulerX);
    	stream.Serialize(eulerY);
    	
    	var block : boolean = anim.GetBool("block");
    	var roll : boolean = anim.GetBool("roll");
    	stream.Serialize(block);
    	stream.Serialize(roll);
        
    }
    else{

        pos = Vector3.zero;
        vel = Vector3.zero;
        stream.Serialize(pos);
        stream.Serialize(vel);
        stream.Serialize(speedX);
        stream.Serialize(speedY);
        stream.Serialize(eulerX);
        stream.Serialize(eulerY);
        stream.Serialize(block);
        stream.Serialize(roll);
        
        var newState = new ExtrapState(pos, vel, info.timestamp, speedX, speedY);
        lastState = latestState;
        latestState = newState;
        
        //if we only have one state, use latest velocity
		var extrapVel : Vector3 = latestState.vel;
		//if we have two states, use extrapolated velocity
		if(lastState) extrapVel = latestState.vel + (latestState.vel - lastState.vel);
	 
		latestState.pos += extrapVel * (uLink.Network.time - info.timestamp);
	 
		accumDelta = 0.0;
		interpDirection = latestState.pos - transform.position;	
		
		var receivedRot = Quaternion.Euler(eulerX, eulerY, 0);
		var estimatedDirToAimTarget : Vector3 = receivedRot * Vector3.forward;
		motor.SetTargetForward(estimatedDirToAimTarget);
		
		var estCamPos = transform.position + transform.TransformDirection(Vector3(tpsCam.targetOffset.x, tpsCam.targetOffset.y, 0));
		var aimPos = player.AimCast(estCamPos, estimatedDirToAimTarget, player.aimRayDistance);
		player.aimPos = aimPos;
		motor.lookAtPos = transform.position + estimatedDirToAimTarget * 10;
		
		anim.SetBool("block", block);
		anim.SetBool("roll", roll);  

    }

}

function Update(){
	
	if(latestState){
 
		//if we only have one state, use latest velocity
		var extrapVel : Vector3 = latestState.vel;
		//if we have two states, use extrapolated velocity
		if(lastState) extrapVel = latestState.vel + (latestState.vel - lastState.vel);
		
		if(Mathf.Approximately(latestState.speedX, 0) && Mathf.Approximately(latestState.speedY, 0))
			extrapVel = Vector3.zero;
 
		//extrapolate a bit
		transform.position += extrapVel * Time.deltaTime;
 
		if(accumDelta >= interpDuration) return;
 
		// calculate how much to shift for this frame
		var max : float = interpDuration - accumDelta;
		var delta : float = Mathf.Min(max, Time.deltaTime);
		accumDelta += delta;
 
		transform.position += interpDirection * delta / interpDuration;
		
		//set animator variables
		if(lastState){
			anim.SetFloat("speedX", Mathf.Lerp(lastState.speedX, latestState.speedX, 0.75));
            anim.SetFloat("speedY", Mathf.Lerp(lastState.speedY, latestState.speedY, 0.75));
		}
		else{
			anim.SetFloat("speedX", latestState.speedX);
			anim.SetFloat("speedY", latestState.speedY);
		}
 
	}
	
}
