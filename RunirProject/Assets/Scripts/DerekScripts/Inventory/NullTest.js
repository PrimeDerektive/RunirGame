#pragma strict

public class NullTest extends MonoBehaviour{

	var foo : Bar = null;

	function Update(){
		print(foo);
	}

	public class Bar{
		var parameter : int;
	}

}
