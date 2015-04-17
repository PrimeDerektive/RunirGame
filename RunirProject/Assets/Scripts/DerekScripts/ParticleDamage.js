#pragma strict

/*
var owner : Transform;
var ownerID : uLink.NetworkViewID;
var hitOffset : Vector3 = Vector3(0, 1.0, 0);

private var collisionEvents = new ParticleSystem.CollisionEvent[64];
private var alreadyHit = new List.<Transform>();

function Start(){
	if(!uLink.Network.isServer) Destroy(this);
}

function OnParticleCollision(other : GameObject) {
	
	if(other.transform.root != owner){
	
		// adjust array length
		var safeLength = particleSystem.safeCollisionEventSize;
		if (collisionEvents.Length < safeLength) {
			collisionEvents = new ParticleSystem.CollisionEvent[safeLength];
		}
		// get collision events for the gameObject that the script is attached to
		var numCollisionEvents = particleSystem.GetCollisionEvents(other, collisionEvents);
		
		// apply some force to RigidBody components
		for (var i = 0; i < numCollisionEvents; i++) {
			var hitStatus : PlayerStatus = other.transform.root.GetComponent.<PlayerStatus>();
			if (hitStatus && !alreadyHit.Contains(other.transform.root)){
				var hit : RaycastHit;
				hit.point = collisionEvents[i].intersection + hitOffset;
				hit.normal = collisionEvents[i].normal;
				hit.distance = collisionEvents[i].velocity.magnitude;
				hitStatus.EvaluateHit(hit, ownerID);
				alreadyHit.Add(other.transform.root);
			}
		}
	
	}

}

function SetOwner(id : uLink.NetworkViewID, tr : Transform){
	ownerID = id;
	owner = tr;
}

function OnDisable(){
	alreadyHit.Clear();
}

*/