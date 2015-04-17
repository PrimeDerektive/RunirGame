var interpolationBackTime = 0.1;
var anim : Animator;
var aimTarget : Transform;
var tpsCam : TPSOrbit;
var motor : MecanimMotor;
var player : Player;
var rootBone : Transform;

// Holds information about the controllers movements and last sent information from the network
class State{
    var timeStamp : float;
    var pos : Vector3;
    var speedX : float;
    var speedY : float;
    var aimPos : Vector3;
    var eulerX : float;
    var eulerY : float;
}

var m_BufferedState : State[] = new State[20]; // where we store the State of our controller
private var m_TimestampCount : int; // keeps track of what slots are used

function Awake(){
	if(!anim) anim = GetComponent.<Animator>();
	if(!aimTarget) aimTarget = GameObject.FindGameObjectWithTag("AimTarget").transform;
	if(!tpsCam) tpsCam = GameObject.FindGameObjectWithTag("CameraHolder").GetComponent.<TPSOrbit>();
	if(!motor) motor = GetComponent.<MecanimMotor>();
	if(!player) player = GetComponent.<Player>();	
}

function uLink_OnNetworkInstantiate(info : uLink.NetworkMessageInfo){
	/*
	var rigidbodies = GetComponentsInChildren(Rigidbody);
	for(var rb : Rigidbody in rigidbodies){
		if(rb != rigidbody) Destroy(rb);
	}
	*/
	if (!uLink.NetworkView.Get(this).isMine){
		GetComponent(Player).enabled = false;
		GetComponent(Block).enabled = false;
		GetComponent(RollController).enabled = false;
		GetComponent(Animator).SetBool("proxy", true);
		//anim.applyRootMotion = false;
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
        var speedX = anim.GetFloat("speedX");
		var speedY = anim.GetFloat("speedY");
        stream.Serialize(pos);
        stream.Serialize(speedX);
        stream.Serialize(speedY);
        
        var estCamPos : Vector3 = transform.position + transform.TransformDirection(tpsCam.targetOffset);
		var dirToAimTarget = aimTarget.position - estCamPos;
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
        rot = Quaternion.identity;
        stream.Serialize(pos);
        stream.Serialize(speedX);
        stream.Serialize(speedY);
        stream.Serialize(eulerX);
        stream.Serialize(eulerY);
        stream.Serialize(block);
        stream.Serialize(roll);

        for (var i = m_BufferedState.length - 1; i >= 1; i --){
            m_BufferedState[i] = m_BufferedState[i-1];
        }

        var state = new State();
        state.timeStamp = info.timestamp;
        state.pos = pos;
        state.speedX = speedX;
        state.speedY = speedY;
        state.eulerX = eulerX;
        state.eulerY = eulerY;
        
        var receivedRot = Quaternion.Euler(eulerX, eulerY, 0);
		var estimatedDirToAimTarget : Vector3 = receivedRot * Vector3.forward;
		motor.SetTargetForward(estimatedDirToAimTarget);
		
		estCamPos = transform.position + transform.TransformDirection(Vector3(tpsCam.targetOffset.x, tpsCam.targetOffset.y, 0));
		var aimPos = player.AimCast(estCamPos, estimatedDirToAimTarget, player.aimRayDistance);
		player.aimPos = aimPos;
		motor.lookAtPos = transform.position + estimatedDirToAimTarget * 10;
		
		anim.SetBool("block", block);
		anim.SetBool("roll", roll);
		
        m_BufferedState[0] = state;
        m_TimestampCount = Mathf.Min(m_TimestampCount + 1, m_BufferedState.length);

        for (i = 0; i < m_TimestampCount-1; i++){
            if (m_BufferedState[i].timeStamp < m_BufferedState[i+1].timeStamp){
                Debug.Log("State inconsistent");
            }
        }

    }

}

 

function Update (){
    if (!uLink.NetworkView.Get(this).isMine){       

        var currentTime = uLink.Network.time;
        var interpolationTime = currentTime - interpolationBackTime;

        if(m_BufferedState[0] != null && m_BufferedState[0].timeStamp > interpolationTime){
            
            for(var i = 0; i < m_TimestampCount; i++){
                
                if(m_BufferedState[i].timeStamp <= interpolationTime || i == m_TimestampCount - 1){
                    
                    // The state one slot newer (<100ms) than the best playback state
                    var rhs : State = m_BufferedState[Mathf.Max(i-1, 0)];
                    // The best playback state (closest to 100 ms old (default time))
                    var lhs : State = m_BufferedState[i];
                    // Use the time between the two slots to determine if interpolation is necessary
                    var length = rhs.timeStamp - lhs.timeStamp;
                    var t : float = 0.0;
                    if (length > 0.0001){
                        t = ((interpolationTime - lhs.timeStamp) / length);
                    }

                    // if t=0 => lhs is used directly
                    transform.position = Vector3.Lerp(lhs.pos, rhs.pos, t);
                    anim.SetFloat("speedX", Mathf.Lerp(lhs.speedX, rhs.speedX, t));
                    anim.SetFloat("speedY", Mathf.Lerp(lhs.speedY, rhs.speedY, t));
                    return;  

                }

            }

        }
        else{

            if (m_BufferedState[0] != null){
                var latest = m_BufferedState[0];
                transform.position = latest.pos;
                anim.SetFloat("speedX", latest.speedX);
                anim.SetFloat("speedY", latest.speedY);
            }

        }

    }
}