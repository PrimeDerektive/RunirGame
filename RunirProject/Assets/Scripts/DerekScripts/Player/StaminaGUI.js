#pragma strict

private var sprite : UISprite;
private var status : PlayerStatus;

function Start () {
	sprite = GetComponent.<UISprite>();
	yield WaitForSeconds(0.1);
	status = GameManager.instance.localPlayer.GetComponent.<PlayerStatus>();
}

function Update (){
	if(status){
		sprite.fillAmount = Mathf.Lerp(sprite.fillAmount, Mathf.Clamp(status.currentStamina/status.maxStamina, 0, 1.0), Time.deltaTime*5.0);
	}
}