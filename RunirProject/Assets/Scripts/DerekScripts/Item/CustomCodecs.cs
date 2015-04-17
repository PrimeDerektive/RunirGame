using UnityEngine;
using System.Collections;

public class CustomCodecs : uLink.MonoBehaviour{
	
	//Method conforming to the Serializer delegate.
	public static void WriteGameItem(uLink.BitStream stream, object value, params object[] codecOptions){
		GameItem item = (GameItem) value;
		stream.Write<int>(item.ID);
		stream.Write<int>(item.seed);
		stream.Write<int>((int)item.quality);
	}
	
	//Method conforming to the Deserializer delegate.
	public static object ReadGameItem(uLink.BitStream stream, params object[] codecOptions){
		int ID = stream.Read<int>();
		int seed = stream.Read<int>();
		Item.Quality quality = (Item.Quality)stream.Read<int>();
		GameItem item = new GameItem(ID, seed, quality);
		return item;
	}


	void Awake(){
		// This method call must be made on both the client and the server.
		uLink.BitStreamCodec.Add<GameItem>(ReadGameItem, WriteGameItem);
	}

}
