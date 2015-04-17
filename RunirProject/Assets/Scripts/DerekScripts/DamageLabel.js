#pragma strict

var _text : String = "0";
public function get text() : String{
	return _text;
}
function set text(value : String){
	for(var textMesh : TextMesh in textMeshes)
		textMesh.text = value;
	_text = value;
}

var critColor : Color;
var punchMagnitude : Vector3 = Vector3(2.0, 2.0, 2.0);

private var floatSpeedH = 1.0;
private var floatSpeedV = 0.0;

private var cam : Transform;
private var textMeshes : TextMesh[];

private var randomDir : float;

function Awake(){
	textMeshes = GetComponentsInChildren.<TextMesh>();
	print(textMeshes[0].characterSize);
}

function OnDisable(){
	//reset the TextMesh values when this object is pooled
	textMeshes[0].color = Color.white;
	for(var textMesh : TextMesh in textMeshes){
		textMesh.characterSize = 0.025;
		textMesh.GetComponent.<Renderer>().material.color.a = 1.0;
	}
}

function OnEnable () {

	var critRoll : int = Random.Range(0, 2);
	if(critRoll == 1){
		textMeshes[0].color = critColor;
		for(var textMesh : TextMesh in textMeshes)
			textMesh.characterSize *= 2.0; //double font size
		punchMagnitude *= 1.5;
	}

	cam = Camera.main.transform;
	transform.parent = cam;
	transform.LookAt(cam);
	transform.Rotate(Vector3.up * 180.0);
	randomDir = Random.Range(-1.0, 1.0);
	
	StartCoroutine(LerpFloatSpeeds());
	
	iTween.PunchScale(gameObject, punchMagnitude, 0.75);
	
	StartCoroutine(Fade());
	

}

function LerpFloatSpeeds(){
	yield WaitForSeconds(0.25);
	var i = 0.0;
    var rate = 1.0/1.0;
    while (i < 1.0){
        i += Time.deltaTime * rate;
        floatSpeedH = Mathf.Lerp(1.0, 0.0, i);
        floatSpeedV = Mathf.Lerp(0.0, 1.0, i);
        yield; 
    }
}

function Fade(){
	yield WaitForSeconds(0.5);
	iTween.FadeTo(gameObject, 0, 1.0);
}

function Update () {
	transform.position += (cam.right * randomDir) * Time.deltaTime;
	transform.position += Vector3.up * floatSpeedV * Time.deltaTime;
}