#pragma strict


public class InventorySlot extends MonoBehaviour{

	//the item stored in this slot
	protected var _item : GameItem = null;

	//declare getter and setter for item as it needs to be a private variable in order to have a null state
	public function get item() : GameItem{
		return _item;
	}
	public function set item(value : GameItem){
		//set the new value
		_item = value;
		if(value == null){
			//if we're emptying the slot and currently hovered over it (we're probably equipping the item),
			//we need to disable to tooltip
			if(hovering) DisableTooltip();
			//and reset the sprite to be an empty slot graphic
			sprite.spriteName = emptySpriteName;
		}
		else{
			//if we're filling the slot with a new item, we need to set the slot sprite to the item's graphic
			sprite.spriteName = value.iconSprite;
			//and if we're hovering over this slot while it was filled (an equipment swap, most likely),
			//we need to enable the tooltip
			if(hovering) EnableTooltip();
		}
	}

	var sprite : UISprite;
	protected var emptySpriteName : String = "empty-slot";
	protected var invGUI : InventoryGUI;

	function Awake(){
		invGUI = GameObject.FindGameObjectWithTag("GUIRoot").GetComponentInChildren.<InventoryGUI>();
		if(!sprite) sprite = GetComponent.<UISprite>();
	}

	protected var hovering : boolean = false;

	function OnHover(isHovering : boolean){
		hovering = isHovering;
		if(isHovering && item) EnableTooltip();
		if(!isHovering && item) DisableTooltip();
	}	

	function OnClick(){
		//if we have an item in this slot, and its equippable
		if(item && item.slot != Item.Slot.none){
			//equip it
			invGUI.Equip(this);
		}
	}

	function EnableTooltip(){
		if(item){
			var tooltip = invGUI.tooltip;
			var tooltipText : String = item.GetTooltipText();
			/*
			var equippable : ItemDatabase.EquippableItem = item as ItemDatabase.EquippableItem;
			if(equippable){
				tooltipText = equippable.GetTooltipText();
			}
			*/
			tooltip.SetText(tooltipText);
			tooltip.gameObject.SetActive(true);
			tooltip.transform.localPosition.x = transform.localPosition.x - (tooltip.background.width * 0.5);
			tooltip.transform.localPosition.y = transform.localPosition.y + (tooltip.background.height * 0.5);
		}
	}

	function DisableTooltip(){
		invGUI.tooltip.gameObject.SetActive(false);
	}

}