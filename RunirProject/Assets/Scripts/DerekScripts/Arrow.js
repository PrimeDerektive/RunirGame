#pragma strict

var rayDistance = 5.0;
var lifetime = 5.0;
var layerMask : LayerMask;
var creator : Transform;
var ID : byte = 0;

private var trail : TrailRenderer;
private var rb : Rigidbody;

function Start () {
	trail = GetComponent.<TrailRenderer>();
	rb = GetComponent.<Rigidbody>();
}

function FixedUpdate () {
	if(!rb.isKinematic) transform.forward = rb.velocity;
}

function Update(){
	var hit : RaycastHit;
	if(Physics.Raycast(transform.position - (transform.forward*rayDistance), transform.forward, hit, rayDistance, layerMask) && !rb.isKinematic){
		if(hit.transform.root != creator){
			rb.isKinematic = true;
			if(
				//hit.collider.gameObject.layer == LayerMask.NameToLayer("Hitbox") ||
				hit.collider.gameObject.layer == LayerMask.NameToLayer("NPCHitbox")
			){
				if(uLink.NetworkView.Get(creator).isMine){
					var hitViewID = uLink.NetworkView.Get(hit.collider.transform.root).viewID;
					//var hitPos = transform.position;
					creator.GetComponent.<RangedCombat>().ClaimHit(hitViewID, hit.collider.transform.root.InverseTransformPoint(hit.point));
				}
				transform.parent = hit.collider.transform;			
			}
			if(trail) Invoke("DestroyTrail", trail.time);
			Invoke("KillSelf", lifetime);
		}
	}
}

function DestroyTrail(){
	Destroy(trail);
}

function KillSelf(){
	creator.GetComponent.<RangedCombat>().RemoveArrow(this);
	Destroy(gameObject);
}