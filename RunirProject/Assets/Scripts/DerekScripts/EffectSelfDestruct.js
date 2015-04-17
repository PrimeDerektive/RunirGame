#pragma strict

var lifetime = 1.0;
private var particleSys : ParticleSystem;

function Start () {
	particleSys = GetComponent.<ParticleSystem>();
	if(particleSys) lifetime = particleSys.duration;
	Invoke("KillSelf", lifetime);
}

function KillSelf () {
	Destroy(gameObject);
}