using UnityEngine;

namespace MeshTK
{
	/// <summary>
	/// Mesh editor base class
	/// Copyright EJM Software 2014
	/// </summary>
	public abstract class MeshEditor
	{
		//Mesh Data Variables
		public Mesh targetsharedmesh;
		public Transform targettransform;
		//Settings
		public bool isskinnedmesh;

		public MeshEditor(MeshFilter filter)
		{
			this.isskinnedmesh = false;
			this.targetsharedmesh = filter.sharedMesh;
			this.targettransform = filter.transform;
			this.ReloadData ();
		}
		public MeshEditor(SkinnedMeshRenderer filter)
		{
			this.isskinnedmesh = true;
			this.targetsharedmesh = filter.sharedMesh;
			this.targettransform = filter.transform;
			this.ReloadData ();
		}
		
		public abstract void DrawSceneGUI();
		public virtual void ReloadData(){return;}
	}
}