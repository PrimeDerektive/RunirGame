#pragma strict

var background : UISprite;
var text : UILabel;

private var tweens : UITweener[];

function Start(){
	tweens = GetComponentsInChildren.<UITweener>();
}

function SetText(newText : String){
	text.text = newText;
	var textTrans : Transform = text.transform;
	var offset : Vector3 = textTrans.localPosition;
	var textScale : Vector3 = textTrans.localScale;
	// Calculate the dimensions of the printed text
	var mSize = text.printedSize;
	// Scale by the transform and adjust by the padding offset
	var padding = 0.15;
	mSize.y *= textScale.y + padding;
	var border : Vector4 = background.border;
	mSize.y += border.y + border.w + (-offset.y - border.y) * 2f;
	//background.width = Mathf.RoundToInt(mSize.x);
	background.height = Mathf.RoundToInt(mSize.y);	
}

function OnEnable(){
	if(tweens != null){
		for(var tween : UITweener in tweens){
			tween.ResetToBeginning();
			tween.PlayForward();
		}
	}
}