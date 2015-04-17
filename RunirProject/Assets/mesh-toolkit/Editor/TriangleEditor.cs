using UnityEditor;
using UnityEngine;
using System.Linq;
using System.Collections.Generic;

namespace MeshTK
{
	public class TriangleEditor : MeshEditor
	{
		#region VARIABLES
		private Color SelectionColor = new Color(1f, 0.25f, 0.25f, 0.6f);
		private Vector3[] meshvertices;
		private int[] meshtriangles;
		private HashSet<int> selectedVertices = new HashSet<int> ();
		private HashSet<int> selectedTriangles = new HashSet<int> ();
		//private int selectiontype = 0;
		private int selectiontype = PlayerPrefs.GetInt ("meshtk-selection", 0);
		private Rect windowrect = new Rect (10, 100, 150, 200);
		private Material selectionmaterial = new Material("Shader \"Lines/Colored Blended\" {" +
			                                 "SubShader { Pass { " +
			                                 "    Offset -1, -1 " +
			                                 "    Blend SrcAlpha OneMinusSrcAlpha " +
			                                 "    ZWrite Off Cull Off Fog { Mode Off } " +
			                                 "    BindChannels {" +
			                                 "      Bind \"vertex\", vertex Bind \"color\", color }" +
			                                 "} } }");
		private Quaternion rotationHandle = Quaternion.identity;
		private Vector3 scaleHandle = Vector3.one;
		private Vector3 worldselectioncenter;
		private Vector3 localselectioncenter;
		//Settings
		bool showExtrusionSettings = false;
		bool showDeleteSettings = false;
		bool showSubdivideSettings = false;
		float extrusiondistance = 1.0f;
		enum SubdivisionType {EDGE, CENTER};
		SubdivisionType subdividetype = SubdivisionType.EDGE;
		bool autoWeld = true;
		bool removeUnusedVerts = true;
		#endregion
		
		#region PUBLIC METHODS
		//Calls the base constructor
		public TriangleEditor (MeshFilter filter): base(filter) {}
		public TriangleEditor (SkinnedMeshRenderer filter): base(filter) {}

		//Override the scene GUI
		public override void DrawSceneGUI()
		{
			if (!(Tools.current == Tool.View || (Event.current.isMouse && Event.current.button > 0) || Event.current.type == EventType.ScrollWheel)) {
				if (Event.current.type == EventType.Layout) {
					HandleUtility.AddDefaultControl (GUIUtility.GetControlID (FocusType.Passive));
				}
				DrawTriangles ();
				if (!TryTranslation ()) {
					if (selectiontype==0){
						TrySingleSelect ();
					} else if (selectiontype==1){
						TryBoxSelect ();
					} else {
						TryPaintSelect ();
					}
				}
				Handles.BeginGUI ();
				windowrect = GUI.Window (0, windowrect, this.GUIWindow, "Triangle Tools");
				Handles.EndGUI ();
			}
		}
		
		//Override the reload method
		public override void ReloadData()
		{
			if (targetsharedmesh.vertices != meshvertices || targetsharedmesh.triangles != meshtriangles) {
				meshvertices = targetsharedmesh.vertices;
				meshtriangles = targetsharedmesh.triangles;
				selectedVertices.Clear ();
				selectedTriangles.Clear ();
			}
		}
		
		public void UpdateMesh()
		{
			targetsharedmesh.vertices = meshvertices;
			targetsharedmesh.RecalculateBounds ();
		}
		#endregion
		
		#region PRIVATE METHODS
		private void DrawTriangles(){
			selectionmaterial.SetPass (0);
			GL.Begin(GL.TRIANGLES);
			GL.Color(SelectionColor);
			
			for (int i = 0; i < meshtriangles.Length; i+=3) {
				if (selectedTriangles.Contains (i/3)){
					GL.Vertex(targettransform.TransformPoint(meshvertices[meshtriangles[i]]));
					GL.Vertex(targettransform.TransformPoint(meshvertices[meshtriangles[i+1]]));
					GL.Vertex(targettransform.TransformPoint(meshvertices[meshtriangles[i+2]]));
				}
			}
			
			GL.End();
		}

		private void GUIWindow (int windowID)
		{
			GUI.DragWindow (new Rect (0, 0, 10000, 20));
			GUI.color = Color.white;
			EditorGUI.BeginChangeCheck ();
			selectiontype = EditorGUILayout.Popup (selectiontype, new string[3]{"Single Select", "Box Select", "Paint Select"});
			if (EditorGUI.EndChangeCheck ()) {
				PlayerPrefs.SetInt ("meshtk-selection", selectiontype);
			}
			EditorGUILayout.HelpBox ("Current tool: "+Tools.current.ToString(), MessageType.None);
			if (GUILayout.Button ("Select All", EditorStyles.miniButton)){
				for(int i=0;i<meshtriangles.Length;++i){
					selectedTriangles.Add (i);
				}
				UpdateSelectedVertices();
				UpdateSelectionCenter();
			}
			if (GUILayout.Button ("Flip Selection", EditorStyles.miniButton)) {
				TriangleTools.Flip (targetsharedmesh, selectedTriangles.ToArray());
				ReloadData();
			}
			//EXTRUDE
			GUILayout.BeginHorizontal();
			if (GUILayout.Button ("Extrude", EditorStyles.miniButtonLeft)) {
				TriangleTools.Extrude(targetsharedmesh, selectedTriangles.ToArray (), extrusiondistance);
				ReloadData();
			}
			showExtrusionSettings = GUILayout.Toggle (showExtrusionSettings, "+", EditorStyles.miniButtonRight, GUILayout.Width(30f));
			GUILayout.EndHorizontal();
			if (showExtrusionSettings){
				extrusiondistance = EditorGUILayout.FloatField(extrusiondistance);
			}
			//SUBDIVIDE
			GUILayout.BeginHorizontal();
			if (GUILayout.Button ("Subdivide", EditorStyles.miniButtonLeft)) {
				if (subdividetype==SubdivisionType.EDGE){
					TriangleTools.SubdivideByEdge(targetsharedmesh, selectedTriangles.ToArray(), autoWeld);
				} else {
					TriangleTools.SubdivideByCenter(targetsharedmesh, selectedTriangles.ToArray ());
				}
				ReloadData();
			}
			showSubdivideSettings = GUILayout.Toggle (showSubdivideSettings, "+", EditorStyles.miniButtonRight, GUILayout.Width(30f));
			GUILayout.EndHorizontal();
			if (showSubdivideSettings){
				subdividetype = (SubdivisionType)EditorGUILayout.EnumPopup (subdividetype);
				autoWeld = GUILayout.Toggle (autoWeld, "Auto-Weld");
			}
			//DELETE
			GUILayout.BeginHorizontal ();
			if (GUILayout.Button ("Delete Selection", EditorStyles.miniButtonLeft)) {
				TriangleTools.Remove (targetsharedmesh, selectedTriangles.ToArray ());
				if(removeUnusedVerts){
					VertexTools.RemoveUnused(targetsharedmesh);
				}
				ReloadData();
			}
			showDeleteSettings = GUILayout.Toggle (showDeleteSettings, "+", EditorStyles.miniButtonRight, GUILayout.Width(30f));
			GUILayout.EndHorizontal ();
			if (showDeleteSettings) {
				removeUnusedVerts = GUILayout.Toggle (removeUnusedVerts, "Remove Verts");
			}
		}

		private bool TryTranslation()
		{
			//<summary>
			//Attempts to translate the selected vertices. Returns true if anything was translated.
			//If not, it returns false
			//</summary>
			if (selectedVertices.Count < 1) { return false;}
			if (Tools.current == Tool.Move) {
				return TryMove();
			} else if (Tools.current == Tool.Rotate) {
				return TryRotate ();
			} else if (Tools.current == Tool.Scale) {
				return TryScale ();
			}
			return false;
		}
		private bool TryMove()
		{
			Vector3 newPosition = Handles.PositionHandle (worldselectioncenter, Quaternion.identity);
			if (newPosition != worldselectioncenter) {
				Vector3 offset = EditorTools.InverseScale (Quaternion.Inverse(targettransform.rotation)*(newPosition - worldselectioncenter), targettransform.localScale);
				foreach (int index in selectedVertices) {
					meshvertices [index] += offset;
				}
				worldselectioncenter = newPosition;
				localselectioncenter += offset;
				UpdateMesh ();
				return true;
			}
			return false;
		}
		private bool TryRotate()
		{
			Quaternion newRotation = Handles.RotationHandle (rotationHandle, worldselectioncenter);
			if (newRotation != rotationHandle) {
				foreach (int index in selectedVertices) {
					meshvertices [index] = Quaternion.Euler (newRotation.eulerAngles - rotationHandle.eulerAngles) * (meshvertices[index] - localselectioncenter) + localselectioncenter;
				}
				rotationHandle = newRotation;
				UpdateMesh ();
				return true;
			}
			return false;
		}
		
		private bool TryScale()
		{
			Vector3 newScale = Handles.ScaleHandle (scaleHandle, worldselectioncenter, Quaternion.identity, HandleUtility.GetHandleSize (worldselectioncenter));
			if (newScale != scaleHandle) {
				foreach (int index in selectedVertices) {
					meshvertices [index] += Vector3.Scale(newScale - scaleHandle, meshvertices [index] - localselectioncenter);
				}
				scaleHandle = newScale;
				UpdateMesh ();
				return true;
			}
			return false;
		}

		private void TrySingleSelect()
		{
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedVertices.Clear ();
				selectedTriangles.Clear ();
			} else if (Event.current.type==EventType.MouseUp){
				Ray ray = HandleUtility.GUIPointToWorldRay(Event.current.mousePosition);
				ray.origin = targettransform.InverseTransformPoint(ray.origin);
				ray.direction = targettransform.InverseTransformDirection(ray.direction);
				float closestdist = Mathf.Infinity;
				int closestindex = -1;
				for (int i = 0; i < meshtriangles.Length; i+=3) {
					float intersectdist = EditorTools.RayTriangleIntersection(ray, meshvertices[meshtriangles[i]], meshvertices[meshtriangles[i+1]], meshvertices[meshtriangles[i+2]]);
					if (intersectdist!=-1 && intersectdist < closestdist)
					{
						closestindex = i/3;
						closestdist = intersectdist;
					}
				}
				if (closestindex!=-1){
					if (selectedTriangles.Contains (closestindex)) {
						selectedTriangles.Remove (closestindex);
					} else {
						selectedTriangles.Add (closestindex);
					}
				}
				UpdateSelectedVertices();
				UpdateSelectionCenter();
			}
		}

		private void TryBoxSelect(){
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedVertices.Clear ();
				selectedTriangles.Clear ();
			}
			Rect? temprect = EditorTools.TryBoxSelect ();
			if (temprect != null) {
				Rect selectedRect = EditorTools.GUIToScreenRect(temprect.GetValueOrDefault ());
				for (int i = 0; i < meshvertices.Length; i++) {
					if (selectedRect.Contains (Camera.current.WorldToScreenPoint (targettransform.TransformPoint (meshvertices [i])))) {
						selectedVertices.Add (i);
					}
				}
				for (int i=0; i<meshtriangles.Length; i+=3) {
					if (selectedVertices.Contains (meshtriangles [i]) && selectedVertices.Contains (meshtriangles [i + 1]) && selectedVertices.Contains (meshtriangles [i + 2])) {
						if (!selectedTriangles.Contains (i / 3)) {
							selectedTriangles.Add (i / 3);
						} else {
							selectedTriangles.Remove (i / 3);
						}
					}
				}
				UpdateSelectedVertices();
				UpdateSelectionCenter();
			}
		}
		
		private void TryPaintSelect()
		{
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedVertices.Clear ();
				selectedTriangles.Clear ();
			} else if (Event.current.type==EventType.MouseDrag){
				Ray ray = HandleUtility.GUIPointToWorldRay(Event.current.mousePosition);
				ray.origin = targettransform.InverseTransformPoint(ray.origin);
				ray.direction = targettransform.InverseTransformDirection(ray.direction);
				float closestdist = Mathf.Infinity;
				int closestindex = -1;
				for (int i = 0; i < meshtriangles.Length; i+=3) {
					float intersectdist = EditorTools.RayTriangleIntersection(ray, meshvertices[meshtriangles[i]], meshvertices[meshtriangles[i+1]], meshvertices[meshtriangles[i+2]]);
					if (intersectdist!=-1 && intersectdist < closestdist)
					{
						closestindex = i/3;
						closestdist = intersectdist;
					}
				}
				if (closestindex!=-1){
					if (!selectedTriangles.Contains (closestindex)) {
						selectedTriangles.Add (closestindex);
					}
				}
			} else if (Event.current.type==EventType.MouseUp){
				UpdateSelectedVertices();
				UpdateSelectionCenter();
			}
		}
		
		private void UpdateSelectedVertices(){
			//<summary>
			//Sets the selected Vertices to the indices of the vertices in the selected triangles
			//</summary>
			selectedVertices.Clear ();
			for (int i=0;i<meshtriangles.Length;i+=3){
				if (selectedTriangles.Contains(i/3)){
					if (!selectedVertices.Contains (meshtriangles[i])) {
						selectedVertices.Add (meshtriangles[i]);
					}
					if (!selectedVertices.Contains (meshtriangles[i+1])) {
						selectedVertices.Add (meshtriangles[i+1]);
					}
					if (!selectedVertices.Contains (meshtriangles[i+2])) {
						selectedVertices.Add (meshtriangles[i+2]);
					}
				}
			}
		}
		public void UpdateSelectionCenter()
		{
			Vector3 average = Vector3.zero;
			foreach (int index in selectedVertices) {
				average += meshvertices [index];
			}
			localselectioncenter = average / selectedVertices.Count;
			worldselectioncenter = targettransform.TransformPoint(localselectioncenter);
		}
		#endregion
	}
}