
var topStr:float=2;
var botStr:float=1;
var minSpeed:float=1;
var maxSpeed:float=1;
private var speed:float=0;
private var timeGoes:float;
private var timeGoesUp:boolean=true;
private var rend : Renderer;

//********CUSTOM
function RandomizeSpeed ()
{
speed=Random.Range(minSpeed, maxSpeed);
}

//********START
function Start () {
timeGoes=botStr;
speed=Random.Range(minSpeed, maxSpeed);
rend = GetComponent.<Renderer>();
}


//********UPDATE
function Update () {

if (timeGoes>topStr)
{
timeGoesUp=false;
RandomizeSpeed ();
}


if (timeGoes<botStr)
{
timeGoesUp=true;
RandomizeSpeed ();
}


if (timeGoesUp){timeGoes+=Time.deltaTime*speed;}
if (!timeGoesUp){timeGoes-=Time.deltaTime*speed;}

var currStr=timeGoes;

rend.material.SetFloat( "_AllPower", currStr );
}

