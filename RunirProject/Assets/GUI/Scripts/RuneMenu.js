#pragma strict
import System.Collections.Generic;

class RuneMenu extends GUIMenu{

	var RuneA : RuneSlot;
	var RuneB : RuneSlot;
	var RuneC : RuneSlot;
	var RuneD : RuneSlot;
	var RuneE : RuneSlot;
	var RuneF : RuneSlot;
	var RuneG : RuneSlot;
	var RuneH : RuneSlot;

	public var hoverRune : RuneSlot;

	var sequenceBar : TweenAlpha;
	var sequenceLabel : UILabel;
	var runeSequence : String;
	private var lastInSequence : RuneSlot;

	var runeLines : RuneLine[];

	var shakeTween : TweenPosition;


	public class RuneLine{
		var lineTween : TweenAlpha;
		var connectedRunes : List.<RuneSlot> = new List.<RuneSlot>();
	}

	function Start(){
		super.Start();
		Cursor.visible = false;
	}

	function Update () {

		var mousePoint = Camera.main.ScreenToWorldPoint (Vector3 (Input.mousePosition.x, Input.mousePosition.y, Camera.main.nearClipPlane));
		var screenCenter = Camera.main.ScreenToWorldPoint (Vector3 (Screen.width*0.5, Screen.height*0.5, Camera.main.nearClipPlane));
		
		var xDiff = mousePoint.x - screenCenter.x;
		var yDiff = mousePoint.y - screenCenter.y;

		if(hoverRune){
			if(Input.GetButtonDown("Fire1")){
				hoverRune.SetState(RuneState.active);
				AddToSequence(hoverRune);
				UnsetHoverRune();
			}
		}
		
		//unset last hover rune if moved to dead zone
		if((yDiff < 0.05 && yDiff > -0.05) && (xDiff < 0.05 && xDiff > -0.05)){
			UnsetHoverRune();
		}
		
		//North Rune
		if(yDiff > 0.05 && (xDiff < 0.05 && xDiff > -0.05)){
			SetHoverRune(RuneA);
		}
		
		//Northeast Rune
		if(yDiff > 0.05 && xDiff > 0.05){
			SetHoverRune(RuneB);
		}
		
		//East Rune
		if(xDiff > 0.05 && (yDiff < 0.05 && yDiff > -0.05)){
			SetHoverRune(RuneC);
		}
		
		//Southeast Rune
		if(yDiff < -0.05 && xDiff > 0.05){
			SetHoverRune(RuneD);
		}
		
		//South Rune
		if(yDiff < -0.05 && (xDiff < 0.05 && xDiff > -0.05)){
			SetHoverRune(RuneE);
		}
		
		//Southwest Rune
		if(yDiff < -0.05 && xDiff < -0.05){
			SetHoverRune(RuneF);
		}
		
		//West Rune
		if(xDiff < -0.05 && (yDiff < 0.05 && yDiff > -0.05)){
			SetHoverRune(RuneG);
		}
		
		//Northwest Rune
		if(yDiff > 0.05 && xDiff < -0.05){
			SetHoverRune(RuneH);
		}
		
	}

	function SetHoverRune(rune : RuneSlot){
		if(hoverRune != rune){
			//print("hovering "+ rune.gameObject.name);
			//unset previous hover rune
			UnsetHoverRune();
			//only hover if rune is normal (not activated and not disabled)
			if(rune.currentState == RuneState.normal){
				rune.SetState(RuneState.hover);
				hoverRune = rune;
			}
		}	
	}

	function UnsetHoverRune(){
		if(hoverRune){
			if(hoverRune.currentState == RuneState.hover) hoverRune.SetState(RuneState.normal);
			hoverRune = null;
		}	
	}

	function AddToSequence(rune : RuneSlot){
		if(runeSequence.Length == 0) sequenceBar.PlayForward();
		else{
			shakeTween.duration = 0.5 - (0.05 * runeSequence.Length);
			shakeTween.from = Vector3(runeSequence.Length*0.5, runeSequence.Length*0.5, 0);
			shakeTween.to = Vector3(-runeSequence.Length*0.5, -runeSequence.Length*0.5, 0);
		}
		if(lastInSequence) EnableLine(rune, lastInSequence);
		switch(rune){
			case RuneA:
				runeSequence += "A";
				break;
			case RuneB:
				runeSequence += "B";
				break;
			case RuneC:
				runeSequence += "Y";
				break;
			case RuneD:
				runeSequence += "X";
				break;
			case RuneE:
				runeSequence += "F";
				break;
			case RuneF:
				runeSequence += "S";
				break;
			case RuneG:
				runeSequence += "W";
				break;
			case RuneH:
				runeSequence += "J";
				break;
		}
		sequenceLabel.text = runeSequence;
		lastInSequence = rune;
	}

	function EnableLine(runeA : RuneSlot, runeB : RuneSlot){
		for(var line : RuneLine in runeLines){
			if(line.connectedRunes.Contains(runeA) && line.connectedRunes.Contains(runeB)){
				line.lineTween.PlayForward();
			}
		}
	}

	function OnDisable(){
		sequenceBar.ResetToBeginning();
		runeSequence = "";
		sequenceLabel.text = "";
		for(var line : RuneLine in runeLines){
				line.lineTween.ResetToBeginning();
		}
		lastInSequence = null;
		shakeTween.duration = 0.5;
		shakeTween.from = Vector3.zero;
		shakeTween.to = Vector3.zero;
	}

}