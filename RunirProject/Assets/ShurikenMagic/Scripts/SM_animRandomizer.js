var animList : AnimationClip[];
var actualAnim:AnimationClip;

var minSpeed:float=0.7;
var maxSpeed:float=1.5;

private var anim : Animation;

function Start () {
var rnd=Mathf.Round(Random.Range(0,animList.length));
actualAnim = animList[rnd];
anim = GetComponent.<Animation>();
anim.Play(actualAnim.name);
anim[actualAnim.name].speed = Random.Range(minSpeed, maxSpeed);
}