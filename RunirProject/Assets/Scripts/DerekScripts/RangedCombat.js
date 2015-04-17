#pragma strict

var bowObject : GameObject;
var bowString : LineRenderer;
var bowTop : Transform;
var bowBottom : Transform;
var rightHand : Transform;

var arrowPrefab : Rigidbody;
var redSphere : Transform;
var aimTarget : Transform;
var arrowVelocity : float = 50.0;

private var anim : Animator;

function Awake(){
	anim = GetComponent.<Animator>();
	if(!aimTarget) aimTarget = GameObject.FindGameObjectWithTag("AimTarget").transform;
}

function Update(){

	if(anim.GetCurrentAnimatorStateInfo(3).IsName("Drawing") && !anim.IsInTransition(3)){
		bowString.SetPosition(0, bowTop.position);
		bowString.SetPosition(1, rightHand.position);
		bowString.SetPosition(2, bowBottom.position);
	}
	else if(!anim.GetBool("charged")){
		bowString.SetPosition(0, bowTop.position);
		bowString.SetPosition(1, bowBottom.position);
		bowString.SetPosition(2, bowBottom.position);
	}
		
}

private var nextFireDownAllowed : float = 0.0;

//this function is called by Player.js when the left mouse button is depressed
function FireDown(){
	if(
		anim.GetCurrentAnimatorStateInfo(1).IsName("Nothing") //if we're not rolling
		&& (
			anim.GetCurrentAnimatorStateInfo(3).IsName("Nothing") //and upper body layer is idle
			|| anim.GetNextAnimatorStateInfo(3).IsName("Nothing") //or transitioning to idle
		)
		&& Time.time > nextFireDownAllowed
	){
		anim.SetBool("attack", true); //this will move us from Nothing to Drawing
		nextFireDownAllowed = Time.time + 0.5; //prevent spamming
		//if(uLink.Network.isClient) uLink.NetworkView.Get(this).RPC("StartDrawing", uLink.RPCMode.Server);
	}
}

@RPC
function StartDrawing(){
	anim.CrossFade("Drawing", 0.15);
}

//ReadyToFire() is a mecanim event in the Drawing animation 
function ReadyToFire(){
	if(!anim.IsInTransition(3))
		anim.SetBool("charged", true); 
}

function FireUp(){
	if(anim.GetBool("attack")){ //if the attack bool was flagged, drawing was successfully started
		anim.SetBool("attack", false); //set it back to false
		if(anim.GetBool("charged")){ //drawing was successfully completed because charged was set by ReadyToFire()
			anim.CrossFade("Firing", 0.1); //crossfade to Firing animation
		}
	}
}



private var arrowIDIterator : byte = 0;
private var arrows : List.<Arrow> = new List.<Arrow>();
var myArrows : List.<Transform> = new List.<Transform>();

function FireArrow(){
	anim.SetBool("charged", false);
	var newArrow : Rigidbody = Instantiate(arrowPrefab, rightHand.position, rightHand.rotation);
	myArrows.Add(newArrow.transform);
	newArrow.GetComponent.<Arrow>().creator = transform;
	newArrow.GetComponent.<Arrow>().ID = arrowIDIterator;
	if(uLink.NetworkView.Get(this).isMine)
		newArrow.transform.LookAt(aimTarget);
	else
		newArrow.transform.LookAt(GetComponent.<Player>().aimPos);
	newArrow.velocity = newArrow.transform.forward * arrowVelocity;
	
	if(uLink.Network.isClient) uLink.NetworkView.Get(this).RPC("ServerFireArrow", uLink.RPCMode.Server, aimTarget.position);
}


@RPC
function ServerFireArrow(aimPos : Vector3){
	print("firing remote arrow.");
	anim.SetBool("charged", false);
	//anim.CrossFade("Firing", 0.1); //crossfade to Firing animation
	var newArrow : Rigidbody = Instantiate(arrowPrefab, rightHand.position, rightHand.rotation);
	myArrows.Add(newArrow.transform);
	newArrow.GetComponent.<Arrow>().creator = transform;
	newArrow.transform.LookAt(aimPos);
	newArrow.velocity = newArrow.transform.forward * arrowVelocity;
}

function ClaimHit(hitViewID : uLink.NetworkViewID, hitLocalPos : Vector3){
	if(uLink.Network.isClient)
		uLink.NetworkView.Get(this).RPC("HitClaim", uLink.RPCMode.Server, hitViewID, hitLocalPos);	
}


@RPC
function HitClaim(hitViewID : uLink.NetworkViewID, hitLocalPos : Vector3){

	//find the transform of the entity that was supposedly hit
	var target : Transform = uLink.NetworkView.Find(hitViewID).transform;
	var hitPos = target.TransformPoint(hitLocalPos);
	var arrow : Transform = FindClosestArrow(hitPos);
	var distance = Vector3.Distance(arrow.transform.position, hitPos);
	
	var hit : RaycastHit;
	var rayDir : Vector3 = (hitPos - rightHand.position).normalized;
	var rayLength = Vector3.Distance(rightHand.position, arrow.position) + 5.0;
	Debug.DrawLine(rightHand.position, hitPos, Color.green, 2.0);
	if(Physics.Raycast(rightHand.position, rayDir, hit, rayLength, arrow.GetComponent.<Arrow>().layerMask)){
		var sphere : Transform = Instantiate(redSphere, hit.point, Quaternion.identity);
		sphere.forward = rayDir;
		var headShotDistance = hit.point.y - arrow.transform.position.y;
		var headshot : boolean = hit.collider.CompareTag("Head");
		print("hit connected. distance: "+distance+" headshot: "+headshot);
	}
	else{
		print("not a valid hit.");
	}
	
}

function FindArrow(ID : byte) : Arrow{
	for(var arrow : Arrow in arrows){
		if(arrow.ID == ID){
			return arrow;
		}
	}
}

function FindClosestArrow(pos : Vector3) : Transform{
	var closestArrow : Transform;
	var closestDistance : float = 100.0;
	for(var arrow : Transform in myArrows){
		var distance = Vector3.Distance(arrow.position, pos);
		if(distance < closestDistance){
			closestArrow = arrow;
			closestDistance = distance;
		}
	}
	return closestArrow;
}

function RemoveArrow(arrow : Arrow){
	myArrows.Remove(arrow.transform);
}


function OnEnable(){
	bowObject.SetActive(true);
	anim.SetBool("ranged", true);
}

function OnDisable(){
	bowObject.SetActive(false);
	anim.SetBool("ranged", false);
}
