#pragma strict
public class CharStat{
	
	public enum Identifier{
		maxHealth,
		damageRating,
		armor,
		maxStamina,
		stability
	}
	
	var id : Identifier;
	var baseAmount: int;
	var bonusAmount : int;
	
	public function get totalAmount() : int{
		return baseAmount + bonusAmount;
	}
	
	public function CharStat(i : Identifier, base : int){
		id = i;
		baseAmount = base;
		bonusAmount = 0; //a newly created instance of a CharStat should have no innate bonus.
	}
	
}