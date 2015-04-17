using UnityEngine;
using UnityEditor;
using System.Linq;
using System.Collections.Generic;

namespace MeshTK
{
	public class VertexEditor : MeshEditor
	{
		#region VARIABLES
		private Color DefaultColor = new Color(0f, 0.2f, 1.0f, 0.95f);
		private Color SelectionColor = new Color(1f, 0.25f, 0.25f, 0.9f);
		private Vector3[] meshvertices;
		private Rect windowrect = new Rect (10, 100, 150, 200);
		private Quaternion rotationHandle = Quaternion.identity;
		private Vector3 scaleHandle = Vector3.one;
		//Selection data
		HashSet<int> selectedVertices = new HashSet<int> ();
		//private int selectiontype = 0;
		private int selectiontype = PlayerPrefs.GetInt ("meshtk-selection", 0);
		Color selectedCol = Color.white;
		Vector3 worldselectioncenter;
		Vector3 localselectioncenter;
		//Settings
		bool showColorSettings = false;
		#endregion
		
		#region PUBLIC METHODS
		//Calls the base constructor
		public VertexEditor (MeshFilter filter): base(filter) {}
		public VertexEditor (SkinnedMeshRenderer filter): base(filter) {}

		//Override the scene GUI
		public override void DrawSceneGUI()
		{
			if (!(Tools.current == Tool.View || (Event.current.isMouse && Event.current.button > 0) || Event.current.type == EventType.ScrollWheel)) {
				if (Event.current.type == EventType.Layout) {
					HandleUtility.AddDefaultControl (GUIUtility.GetControlID (FocusType.Passive));
				}
				DrawVertices ();
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
				windowrect = GUI.Window (0, windowrect, this.GUIWindow, "Vertex Tools");
				Handles.EndGUI ();
			}
		}
		
		//override the reload method
		public override void ReloadData()
		{
			Vector3[] newverts = targetsharedmesh.vertices;
			if (newverts != meshvertices) {
				meshvertices = newverts;
				selectedVertices.Clear ();
			}
		}
		
		public void UpdateMesh()
		{
			targetsharedmesh.vertices = meshvertices;
			targetsharedmesh.RecalculateBounds ();
		}
		#endregion
		
		#region PRIVATE METHODS
		private void GUIWindow (int windowID)
		{
			GUI.DragWindow (new Rect (0, 0, 1000, 20));
			GUI.color = Color.white;
			EditorGUI.BeginChangeCheck ();
			selectiontype = EditorGUILayout.Popup (selectiontype, new string[3]{"Single Select", "Box Select", "Paint Select"});
			if (EditorGUI.EndChangeCheck ()) {
				PlayerPrefs.SetInt ("meshtk-selection", selectiontype);
			}
			if (GUILayout.Button ("Select All", EditorStyles.miniButton)){
				selectedVertices.Clear ();
				foreach (int item in Enumerable.Range(0,meshvertices.Length)){
	            	selectedVertices.Add(item);
	       		}
				UpdateSelectionCenter();
			}
			EditorGUILayout.HelpBox ("Current tool: "+Tools.current.ToString(), MessageType.None);
			//Color
			GUILayout.BeginHorizontal();
			if (GUILayout.Button ("Set Color", EditorStyles.miniButtonLeft)) {
				Color[] cols = targetsharedmesh.colors;
				if (cols.Length<meshvertices.Length){
					cols = new Color[meshvertices.Length];
				}
				foreach(int i in selectedVertices){
					cols[i] = selectedCol;
				}
				targetsharedmesh.colors = cols;
			}
			showColorSettings = GUILayout.Toggle (showColorSettings, "+", EditorStyles.miniButtonRight, GUILayout.Width(30f));
			GUILayout.EndHorizontal();
			if (showColorSettings){
				selectedCol = EditorTools.ColorPicker(selectedCol);
			}
			//Weld
			if (GUILayout.Button ("Weld", EditorStyles.miniButton)) {
				//targetsharedmesh.WeldVertices (selectedVertices.ToArray());
				VertexTools.Weld (targetsharedmesh, selectedVertices.ToArray ());
				ReloadData();
			}
			//Delete
			if (GUILayout.Button ("Delete Selected", EditorStyles.miniButton)) {
				//targetsharedmesh.RemoveVertices (selectedVertices.ToArray ());
				VertexTools.Remove (targetsharedmesh, selectedVertices.ToArray ());
				ReloadData();
			}
		}

		private void DrawVertices()
		{
			Handles.matrix = targettransform.localToWorldMatrix;
			for (int i = 0; i<meshvertices.Length; i++){
				if (selectedVertices.Contains(i))
					Handles.color = SelectionColor;
				else
					Handles.color = DefaultColor;
				Handles.DotCap (0, meshvertices [i], Quaternion.identity, HandleUtility.GetHandleSize (meshvertices [i]) * 0.04f);
			}
			Handles.matrix = Matrix4x4.identity;
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
				return TryVertexRotate ();
			} else if (Tools.current == Tool.Scale) {
				return TryVerticesScale ();
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
		private bool TryVertexRotate()
		{
			Quaternion newRotation = Handles.RotationHandle (rotationHandle, worldselectioncenter);
			if (newRotation != rotationHandle) {
				Quaternion offsetRotation = Quaternion.Euler (newRotation.eulerAngles - rotationHandle.eulerAngles);
				foreach (int index in selectedVertices) {
					meshvertices [index] = offsetRotation * (meshvertices[index] - localselectioncenter) + localselectioncenter;
				}
				rotationHandle = newRotation;
				UpdateMesh ();
				return true;
			}
			return false;
		}

		private bool TryVerticesScale()
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
		/*
		private void ConstructFaces()
		{
			if (selectedVertices.Count >=3){
				int[] tris = targetMesh.sharedMesh.triangles;
				List<int> newtris = new List<int>();
				newtris.AddRange(tris);
				for (int i=0;i<selectedVertices.Count;i++){
					for (int j=i+1;j<selectedVertices.Count;j++){
						for (int k=j+1;k<selectedVertices.Count;k++){
							newtris.Add (selectedVertices[i]);
							newtris.Add (selectedVertices[j]);
							newtris.Add (selectedVertices[k]);
						}
					}
				}
				targetMesh.sharedMesh.triangles = newtris.ToArray();
			}
		}
		*/
		private void TrySingleSelect ()
		{
			//Clear vertices if shift not held down
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedVertices.Clear ();
			} else if (Event.current.type == EventType.MouseUp) {
				float closestdistance = 100f;
				float dist = 0f;
				Vector2 screenpt;
				int closestindex = -1;
				for (int i=0; i<meshvertices.Length; i++) {
					screenpt = Camera.current.WorldToScreenPoint (targettransform.TransformPoint(meshvertices [i]));
					dist = Vector2.Distance (screenpt, EditorTools.GUIToScreenPoint (Event.current.mousePosition));
					if (dist < closestdistance) {
						closestdistance = dist;
						closestindex = i;
					}
				}
				if (closestindex != -1) {
					if (!selectedVertices.Contains (closestindex)) {
						selectedVertices.Add (closestindex);
					} else {
						selectedVertices.Remove (closestindex);
					}
				}
				UpdateSelectionCenter();
			}
		}
		private void TryBoxSelect()
		{
			//<summary>
			//Trys to box select vertices in the scene view.
			//</summary>
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedVertices.Clear ();
			}
			Rect? temprect = EditorTools.TryBoxSelect ();
			if (temprect != null) {
				Rect selectedRect = EditorTools.GUIToScreenRect(temprect.GetValueOrDefault ());
				for (int i = 0; i < meshvertices.Length; i++) {
					if (selectedRect.Contains (Camera.current.WorldToScreenPoint (targettransform.TransformPoint (meshvertices [i])))) {
						if (selectedVertices.Contains (i)) {
							selectedVertices.Remove (i);
						} else {
							selectedVertices.Add (i);
						}
					}
				}
				UpdateSelectionCenter();
			}
		}
		
		private void TryPaintSelect ()
		{
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedVertices.Clear ();
			} else if (Event.current.type == EventType.MouseDrag) {
				float closestdistance = 100f;
				float dist = 0f;
				Vector2 screenpt;
				int closestindex = -1;
				for (int i=0; i<meshvertices.Length; i++) {
					screenpt = Camera.current.WorldToScreenPoint (targettransform.TransformPoint(meshvertices [i]));
					dist = Vector2.Distance (screenpt, EditorTools.GUIToScreenPoint (Event.current.mousePosition));
					if (dist < closestdistance) {
						closestdistance = dist;
						closestindex = i;
					}
				}
				if (closestindex != -1) {
					if (!selectedVertices.Contains (closestindex)) {
						selectedVertices.Add (closestindex);
					}
				}
			} else if (Event.current.type == EventType.MouseUp) {
				UpdateSelectionCenter();
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