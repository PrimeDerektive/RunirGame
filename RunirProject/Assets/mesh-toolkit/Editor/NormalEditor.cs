using UnityEngine;
using UnityEditor;
using System.Linq;
using System.Collections.Generic;

namespace MeshTK
{
	public class NormalEditor : MeshEditor
	{
		#region VARIABLES
		private Color DefaultColor = new Color(0f, 0.2f, 1.0f, 0.95f);
		private Color SelectionColor = new Color(1f, 0.25f, 0.25f, 0.9f);
		private Vector3[] meshvertices;
		private Vector3[] meshnormals;
		private HashSet<int> selectedNormals = new HashSet<int> ();
		//private int selectiontype = 0;
		private int selectiontype = PlayerPrefs.GetInt ("meshtk-selection", 0);
		private Rect windowrect = new Rect (10, 100, 150, 120);
		private Vector3 worldselectioncenter;
		private Vector3 localselectioncenter;
		private Quaternion selectionrotation;
		#endregion

		#region PUBLIC METHODS
		//Calls the base constructor
		public NormalEditor(MeshFilter filter): base(filter) {}
		public NormalEditor(SkinnedMeshRenderer filter): base(filter) {}

		//Override the scene GUI
		public override void DrawSceneGUI()
		{
			if (!(Tools.current == Tool.View || (Event.current.isMouse && Event.current.button > 0) || Event.current.type == EventType.ScrollWheel)) {
				if (Event.current.type == EventType.Layout) {
					HandleUtility.AddDefaultControl (GUIUtility.GetControlID (FocusType.Passive));
				}
				DrawNormals ();
				if (!TryTranslation ()) {
					if (selectiontype==1) {
						TryBoxSelect ();
					} else {
						TrySingleSelect ();
					}
				}
				Handles.BeginGUI ();
				windowrect = GUI.Window (0, windowrect, this.GUIWindow, "Normal Tools");
				Handles.EndGUI ();
			}
		}
		
		//Override the reload method
		public override void ReloadData()
		{
			if (targetsharedmesh.normals != meshnormals) {
				meshvertices = targetsharedmesh.vertices;
				meshnormals = targetsharedmesh.normals;
				selectedNormals.Clear ();
			}
		}
		
		public void UpdateMesh()
		{
			targetsharedmesh.normals = meshnormals;
		}
		#endregion
		
		#region PRIVATE METHODS
		private void GUIWindow (int windowID)
		{
			GUI.DragWindow (new Rect (0, 0, 10000, 20));
			GUI.color = Color.white;
			EditorGUI.BeginChangeCheck ();
			selectiontype = EditorGUILayout.Popup (selectiontype, new string[3]{"Single Select", "Box Select", "Paint Select"});
			if (EditorGUI.EndChangeCheck ()) {
				PlayerPrefs.SetInt ("meshtk-selection", selectiontype);
			}
			if (GUILayout.Button ("Select All", EditorStyles.miniButton)){
				for (int i=0;i<meshnormals.Length;++i){
					selectedNormals.Add (i);
				}
				UpdateSelectionCenter();
				UpdateSelectionRotation();
			}
			EditorGUILayout.HelpBox("Note that selected normals can only be rotated.", MessageType.None);
			if (GUILayout.Button ("Calculate All Normals", EditorStyles.miniButton)) {
				targetsharedmesh.RecalculateNormals ();
				ReloadData ();
			}
		}

		private void DrawNormals()
		{
			Handles.matrix = targettransform.localToWorldMatrix;
			for (int i = 0; i < meshvertices.Length; i++) {
				if (selectedNormals.Contains (i))
					Handles.color = SelectionColor;
				else
					Handles.color = DefaultColor;
				Handles.DrawLine(meshvertices [i], meshvertices[i] + meshnormals[i]);
			}
			Handles.matrix = Matrix4x4.identity;
		}

		private bool TryTranslation()
		{
			//Normals can only be rotated
			if (selectedNormals.Count > 0){
				Quaternion newrotation = Handles.RotationHandle (selectionrotation, worldselectioncenter);
				if (newrotation != selectionrotation){
					Quaternion rotationOffset = Quaternion.Inverse(selectionrotation) * newrotation;
					foreach (int index in selectedNormals) {
						meshnormals [index] = rotationOffset * meshnormals[index];
					}
					selectionrotation = newrotation;
					UpdateMesh();
					return true;
				}
			}
			return false;
		}

		private void TrySingleSelect()
		{
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedNormals.Clear ();
			} else if (Event.current.type == EventType.MouseUp) {
				float closestdistance = 100f;
				float dist = 0f;
				Vector2 screenpt;
				int closestindex = -1;
				for (int i=0; i<meshvertices.Length; i++) {
					screenpt = Camera.current.WorldToScreenPoint (targettransform.TransformPoint(meshvertices [i]));
					dist = Vector2.Distance(screenpt, EditorTools.GUIToScreenPoint(Event.current.mousePosition));
					if (dist < closestdistance) {
						closestdistance = dist;
						closestindex = i;
					}
				}
				if (closestindex != -1) {
					if (!selectedNormals.Contains (closestindex)){
						selectedNormals.Add (closestindex);
					} else {
						selectedNormals.Remove (closestindex);
					}
				}
				UpdateSelectionCenter();
				UpdateSelectionRotation();
			}
		}
		private void TryBoxSelect()
		{
			if (Event.current.type == EventType.MouseDown && !Event.current.shift) {
				selectedNormals.Clear ();
			}
			Rect? temprect = EditorTools.TryBoxSelect ();
			if (temprect != null) {
				Rect selectedRect = EditorTools.GUIToScreenRect(temprect.GetValueOrDefault ());
				for (int i = 0; i < meshvertices.Length; i++) {
					if (selectedRect.Contains (Camera.current.WorldToScreenPoint (targettransform.TransformPoint (meshvertices [i])))) {
						if (selectedNormals.Contains (i)) {
							selectedNormals.Remove (i);
						} else {
							selectedNormals.Add (i);
						}
					}
				}
				UpdateSelectionCenter();
				UpdateSelectionRotation();
			}
		}
		public void UpdateSelectionCenter()
		{
			Vector3 average = Vector3.zero;
			foreach (int index in selectedNormals) {
				average += meshvertices [index];
			}
			localselectioncenter = average / selectedNormals.Count;
			worldselectioncenter = targettransform.TransformPoint(localselectioncenter);
		}
		public void UpdateSelectionRotation()
		{
			/*
			Vector3 average = Vector3.zero;
			foreach (int index in selectedNormals) {
				average += meshnormals [index];
			}
			selectionrotation = Quaternion.LookRotation(average/selectedNormals.Count, -targettransform.forward);
			*/
			selectionrotation = Quaternion.LookRotation (targettransform.forward);
		}
		#endregion
	}
}