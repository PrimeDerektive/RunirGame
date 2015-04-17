using UnityEditor;
using UnityEngine;
using System;
using System.Threading;

namespace MeshTK
{
	public class ObjectEditor : MeshEditor
	{
		#region VARIABLES
		private Rect windowrect = new Rect (10, 100, 180, 200);
		private Vector2 scrollposition;
		#endregion
		
		#region PUBLIC METHODS
		//Calls the base constructor
		public ObjectEditor (MeshFilter filter): base(filter) {}
		public ObjectEditor (SkinnedMeshRenderer filter): base(filter) {}

		//Override the scene GUI
		public override void DrawSceneGUI()
		{
			Handles.BeginGUI ();
			windowrect = GUI.Window (0, windowrect, this.GUIWindow, "Object Tools");
			Handles.EndGUI ();
		}
		#endregion
		
		#region PRIVATE METHODS
		private void GUIWindow (int windowID)
		{
			GUI.DragWindow (new Rect (0, 0, 10000, 20));
			GUI.color = Color.white;
			scrollposition = GUILayout.BeginScrollView (scrollposition);
			targetsharedmesh.name = GUILayout.TextField (targetsharedmesh.name, GUILayout.MaxWidth(145f));
			GUILayout.Label ("verts: " + targetsharedmesh.vertexCount + ", tris: " + targetsharedmesh.triangles.Length / 3);
			GUILayout.Label ("UV: " + targetsharedmesh.uv.Length
				+ ", UV1: " + targetsharedmesh.uv2.Length
				+ ", UV2: " + targetsharedmesh.uv2.Length);
			if (AssetDatabase.Contains (targetsharedmesh)) {
				EditorGUILayout.HelpBox ("The attached mesh is in the Asset Database. If you edit it, it will affect any other objects using this mesh. Click 'Make mesh unique' below to prevent this.", MessageType.Warning);
			}
			//Save Mesh
			if (GUILayout.Button ("Save Mesh as Asset", EditorStyles.miniButton)) {
				AssetDatabase.CreateAsset (targetsharedmesh, "Assets/" + targetsharedmesh.name + ".asset");
				AssetDatabase.SaveAssets ();
			}
			if (GUILayout.Button ("Save as OBJ", EditorStyles.miniButton)) {
				string path = EditorUtility.SaveFilePanelInProject(
						"Save as OBJ",
						targettransform.name + ".obj",
						"obj",
						"");
				ExportTools.MeshToFile(targetsharedmesh, targettransform.GetComponent<Renderer>(), path);
				AssetDatabase.Refresh();
			}
			GUILayout.Space (15);
			//APPLY
			if (GUILayout.Button ("Apply/Bake Transform", EditorStyles.miniButton)){
				ApplyTransform (true, true, true);
			}
			GUILayout.Space (15);
			//MIRROR
			if (GUILayout.Button ("Mirror X Axis", EditorStyles.miniButton)) {
				VertexTools.MirrorAxis(targetsharedmesh, "x");
			}
			if (GUILayout.Button ("Mirror Y Axis", EditorStyles.miniButton)) {
				VertexTools.MirrorAxis(targetsharedmesh, "y");
			}
			if (GUILayout.Button ("Mirror Z Axis", EditorStyles.miniButton)) {
				VertexTools.MirrorAxis(targetsharedmesh, "z");
			}

			//********EDIT PIVOT*********
			GUILayout.Space (15);
			GUILayout.Label ("Pivot", "Helpbox");
			GUILayout.BeginHorizontal ();
			Vector3 center = targetsharedmesh.bounds.center;
			EditorGUI.BeginChangeCheck ();
			center.x = EditorGUILayout.FloatField (center.x, GUILayout.Width (45f));
			center.y = EditorGUILayout.FloatField (center.y, GUILayout.Width (45f));
			center.z = EditorGUILayout.FloatField (center.z, GUILayout.Width (45f));
			if (EditorGUI.EndChangeCheck ()) {
				PivotTools.Set(targetsharedmesh, center);
			}
			GUILayout.EndHorizontal ();
			if (GUILayout.Button ("Center Pivot", EditorStyles.miniButton)) {
				targettransform.position += PivotTools.Center(targetsharedmesh);
			}

			//********OPTIMIZE MESH********
			GUILayout.Space (15);
			GUILayout.Label ("Optimize Mesh", "Helpbox");
			if (GUILayout.Button ("Combine Children", EditorStyles.miniButton)){
				CombineTools.CombineChildren(targettransform.gameObject);
			}
			if (GUILayout.Button ("Remove Unused Verts", EditorStyles.miniButton)) {
				//targetsharedmesh.RemoveUnusedVertices();
				VertexTools.RemoveUnused(targetsharedmesh);
			}
			if (GUILayout.Button ("Split Shared Verts", EditorStyles.miniButton)){
				//targetsharedmesh.DoubleSharedVertices();
				VertexTools.SplitShared(targetsharedmesh);
			}
			if (GUILayout.Button ("Merge Double Verts", EditorStyles.miniButton)) {
				//targetsharedmesh.RemoveDoubles (0.001f);
				VertexTools.MergeDoubles(targetsharedmesh);
			}
			if (GUILayout.Button ("Generate Triangle Strips", EditorStyles.miniButton)) {
				targetsharedmesh.Optimize ();
			}
			GUILayout.EndScrollView ();
		}

		private void ApplyTransform (bool applyPos, bool applyRot, bool applySca)
		{
			//Get Mesh Data
			Mesh mesh = targetsharedmesh;
			Vector3[] vertices = mesh.vertices;
			Vector3[] normals = mesh.normals;
			//Get each vertex's world coorinates
			for (int i = 0; i < vertices.Length; i++) {
				vertices [i] = targettransform.TransformPoint (vertices [i]);
			}
			//Reset the object's transform
			if (applyPos) {
				//Reset position
				targettransform.localPosition = Vector3.zero;
			}
			if (applyRot) {
				//Fix Normals
				for (int i=0;i<normals.Length;i++){
					normals[i] = targettransform.localRotation * normals[i];
				}
				//Reset Rotation
				targettransform.localRotation = Quaternion.identity;
			}
			if (applySca) {
				//Reset scale
				targettransform.localScale = Vector3.one;
			}
			//Get each vertex's local coordinates from its global coordinate
			for (int i = 0; i < vertices.Length; i++) {
				vertices [i] = targettransform.InverseTransformPoint (vertices [i]);
			}
			mesh.vertices = vertices;
			mesh.normals = normals;
			mesh.RecalculateBounds ();
		}
		#endregion
	}
}