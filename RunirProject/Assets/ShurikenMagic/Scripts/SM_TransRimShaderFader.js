
var startStr:float=2;
var speed:float=3;
private var timeGoes:float=0;
private var currStr:float=0;
private var rend : Renderer;

function Start(){
	rend = GetComponent.<Renderer>();
}



function Update () {

timeGoes+=Time.deltaTime*speed*startStr;

currStr=startStr-timeGoes;

rend.material.SetFloat( "_AllPower", currStr );


}

