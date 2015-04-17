using UnityEngine;
using UnityEditor;

namespace MeshTK
{
	[CustomEditor(typeof(SkinnedMeshRenderer))]
	public class SkinnedMeshEditor : Editor
	{
		//GUI Variables
		bool menuExpanded = false;
		int EditingMode = -1;
		//GUIContent
		GUIContent OpenGUI;
		GUIContent OpenUniqueGUI;
		GUIContent CloseGUI;
		GUIContent ObjectGUI;
		GUIContent VertexGUI;
		GUIContent TriangleGUI;
		GUIContent NormalGUI;
		GUIContent UVsGUI;
		GUIContent RevertGUI;
		GUIContent[] ToolbarIcons;
		//Editors
		MeshEditor currentmode;
		//Store for undo
		Mesh previousMesh;
		//toolbar
		Rect toolbarrect = new Rect (10, 20, 89, 62);
		//target
		SkinnedMeshRenderer targetMeshFilter;
		
		Vector2 buttonsize = new Vector2(37f, 37f);
		
		void OnEnable ()
		{
			//Get target MeshFilter
			targetMeshFilter = (target as SkinnedMeshRenderer);
			//LOAD ICONS
			OpenGUI = new GUIContent(Resources.Load("Icons/wrench_icon") as Texture2D, "Edit");
			if (OpenGUI.image == null){OpenGUI.text = "EDIT";}
			OpenUniqueGUI = new GUIContent(Resources.Load("Icons/wrench_plus_icon") as Texture2D, "Edit as Unique");
			if (OpenUniqueGUI.image == null){OpenUniqueGUI.text = "EDIT";}
			CloseGUI = new GUIContent(Resources.Load("Icons/exit_icon") as Texture2D, "Save and Exit");
			if (CloseGUI.image == null){CloseGUI.text = "DONE";}
			ObjectGUI = new GUIContent (Resources.Load("Icons/object_icon") as Texture2D, "Object Tools");
			if (ObjectGUI.image == null){ObjectGUI.text = "OBJ";}
			VertexGUI = new GUIContent (Resources.Load("Icons/vertex_icon") as Texture2D, "Vertex Tools");
			if (VertexGUI.image == null){VertexGUI.text = "VERT";}
			TriangleGUI = new GUIContent (Resources.Load("Icons/triangle_icon") as Texture2D, "Triangle Tools");
			if (TriangleGUI.image == null){TriangleGUI.text = "TRIS";}
			NormalGUI = new GUIContent(Resources.Load("Icons/normal_icon") as Texture2D, "Normal Tools");
			if (NormalGUI.image == null){NormalGUI.text = "NORM";}
			UVsGUI = new GUIContent(Resources.Load("Icons/uv_icon") as Texture2D, "UV Tools");
			if (UVsGUI.image == null){UVsGUI.text = "UVs";}
			RevertGUI = new GUIContent(Resources.Load("Icons/undo_icon") as Texture2D, "Revert Mesh");
			if (RevertGUI.image == null){RevertGUI.text = "UNDO";}
			ToolbarIcons = new GUIContent[5]{ObjectGUI, VertexGUI, TriangleGUI, NormalGUI, UVsGUI};
		}
		
		void OnDisable() {EditorTools.HideDefaultHandles = false;}
		
		public override void OnInspectorGUI ()
		{
			DrawDefaultInspector();
			GUILayout.Label ("Using Mesh TK Editor - By EJM Software", "HelpBox");
		}
		
		public void DrawSceneGUI (SceneView sceneview){this.OnSceneGUI();}
		
		public void OnSceneGUI ()
		{
			//Quit if there is no mesh or no Camera
			if (targetMeshFilter.sharedMesh==null){
				Mesh newmesh = new Mesh();
				newmesh.name = "Empty Mesh";
				targetMeshFilter.sharedMesh = newmesh;
			}
			if (targetMeshFilter.sharedMesh==null || Camera.current == null)
				return;
			#region Editor GUI
			if (-1 < EditingMode){
				currentmode.DrawSceneGUI();
				HandleUtility.Repaint();
			}
			#endregion
			#region Toolbar Menu
			Handles.BeginGUI ();
			toolbarrect = GUI.Window (GUIUtility.GetControlID(FocusType.Passive), toolbarrect, this.ToolbarWindow, "Mesh Toolkit");
			Handles.EndGUI();
			#endregion
		}
		void ToolbarWindow(int windowID)
		{
			GUI.DragWindow (new Rect (0, 0, 1000, 20));
			if (menuExpanded) {
				if (GUI.Button (new Rect (5, 20, buttonsize.x, buttonsize.y), CloseGUI)) {
					menuExpanded = false;
					EditingMode = -1;
					EditorTools.HideDefaultHandles = false;
					toolbarrect.width = 89;
				}
				//toolbar
				EditingMode = GUI.SelectionGrid(new Rect(10+buttonsize.x, 20, ToolbarIcons.Length*(buttonsize.x+5), buttonsize.y), EditingMode, ToolbarIcons, ToolbarIcons.Length);
				if (GUI.Button (new Rect(262, 20, buttonsize.x, buttonsize.y), RevertGUI)){
					ImportData (targetMeshFilter.sharedMesh, previousMesh);
				}
			} else {
				if (GUI.Button (new Rect (5, 20, buttonsize.x, buttonsize.y), OpenGUI)) {
					//Set previous Mesh
					previousMesh = (Mesh)Instantiate((Object)targetMeshFilter.sharedMesh);
					//Hide the default Handles
					EditorTools.HideDefaultHandles = true;
					//Expand the menu
					menuExpanded = true;
					toolbarrect.width = 304;
				} else if (GUI.Button (new Rect (10+buttonsize.x, 20, buttonsize.x, buttonsize.y), OpenUniqueGUI)){
					//Set mesh to Unique
					targetMeshFilter.sharedMesh = (Mesh)Instantiate((Object)targetMeshFilter.sharedMesh);
					//Set previous Mesh
					previousMesh = (Mesh)Instantiate((Object)targetMeshFilter.sharedMesh);
					//Hide the default Handles
					EditorTools.HideDefaultHandles = true;
					//Expand the menu
					menuExpanded = true;
					toolbarrect.width = 304;
				}
			}
			if (GUI.changed && GUIUtility.hotControl==0){
				if (EditingMode == 0){currentmode = new ObjectEditor (targetMeshFilter);}
				if (EditingMode == 1){currentmode = new VertexEditor (targetMeshFilter);}
				if (EditingMode == 2){currentmode = new TriangleEditor (targetMeshFilter);}
				if (EditingMode == 3){currentmode = new NormalEditor (targetMeshFilter);}
				if (EditingMode == 4){currentmode = new UVEditor (targetMeshFilter);}
				MeshCollider col = targetMeshFilter.GetComponent<MeshCollider>();
				if (col != null){
					UpdateMeshCollider(col);
				}
			}
		}
		
		void UpdateMeshCollider(MeshCollider collider){
			collider.sharedMesh = null;
			collider.sharedMesh = targetMeshFilter.sharedMesh;
		}
		static void ImportData (Mesh mesh, Mesh dataMesh)
		{
			mesh.Clear ();
			mesh.vertices = dataMesh.vertices;
			mesh.uv = dataMesh.uv;
			mesh.uv2 = dataMesh.uv2;
			mesh.uv2 = dataMesh.uv2;
			mesh.colors = dataMesh.colors;
			mesh.normals = dataMesh.normals;
			mesh.tangents = dataMesh.tangents;
			mesh.triangles = dataMesh.triangles;
			mesh.bindposes = dataMesh.bindposes;
			mesh.boneWeights = dataMesh.boneWeights;
			mesh.RecalculateBounds();
		}
	}
}