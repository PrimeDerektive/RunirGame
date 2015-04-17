#pragma strict

function Update () {
	if(Input.GetKeyDown ("escape"))
        Screen.lockCursor = false;
}

function OnGUI(){
	if(Screen.lockCursor){
		GUI.Label(Rect(25, 25, 200, 30), "Press ESC to unlock cursor.");
	}
	else{
		if(GUI.Button(Rect(25, 25, 100, 30), "Lock Cursor")){
			Screen.lockCursor = true;
		}
	}	
}