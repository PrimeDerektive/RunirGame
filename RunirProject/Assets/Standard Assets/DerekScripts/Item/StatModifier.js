#pragma strict

public class StatModifier{
		
	var stat : CharStat.Identifier;
	var amount : int;
	
	function GetStatName() : String{
		var statName : String;
		switch(stat){
			case CharStat.Identifier.maxHealth:
				statName = "Health";
				break;
			case CharStat.Identifier.damageRating:
				statName = "Damage Rating";
				break;
			case CharStat.Identifier.armor:
				statName = "Armor";
				break;
		}
		return statName;
	}
	
}