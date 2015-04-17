#pragma strict
var rayDistance : float = 100.0;
var targetLayers : LayerMask;
var aimTarget : Transform;
var crosshairTexture : Texture2D;

private var cam : Transform;
private var crosshairPos : Vector3;

function Start () {
	cam = Camera.main.transform;
}

function LateUpdate () {
	var hit : RaycastHit;
	if(Physics.Raycast(cam.position, cam.forward, hit, rayDistance, targetLayers)){
		aimTarget.position = hit.point;
	}
	else{
		aimTarget.position = cam.position + cam.forward * 10.0;
	}
	aimTarget.Rotate(Vector3(0, 85.0, 0));
	crosshairPos = Camera.main.WorldToScreenPoint(aimTarget.position);
}

function OnGUI(){
	GUI.DrawTexture(Rect(crosshairPos.x - 12, crosshairPos.y - 12, 24, 24), crosshairTexture);
}