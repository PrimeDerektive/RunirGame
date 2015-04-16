#pragma strict

var menus : GUIMenu[];

function Update(){

	for(var menu : GUIMenu in menus){
		
		if(Input.GetButtonDown(menu.input)){
			//if this menu isn't already active,
			if(!menu.gameObject.activeInHierarchy){
				//deactivate all menus that aren't this one
				for(var otherMenu : GUIMenu in menus){
					if(menu != otherMenu) otherMenu.Deactivate();
				}
				//activate this menu 
				menu.Activate();
			}
			//else deactivate this menu 
			else
				menu.Deactivate();
		}
		
	}

}