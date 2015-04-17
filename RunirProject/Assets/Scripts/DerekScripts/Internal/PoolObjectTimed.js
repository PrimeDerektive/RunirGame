#pragma strict

var lifetime : float = 5.0;
private var particles : ParticleSystem[];

function OnEnable(){
	Pool();
}

function Pool(){
	yield WaitForSeconds(lifetime);
	ObjectPool.instance.PoolObject(gameObject);
}