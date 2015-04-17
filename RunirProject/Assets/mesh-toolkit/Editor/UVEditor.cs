using UnityEngine;
using UnityEditor;
using System;
using System.Collections.Generic;

namespace MeshTK
{
	public class UVEditor : MeshEditor
	{
		#region Variables
		private Color DefaultColor = new Color(0f, 0.2f, 1.0f, 0.95f);
		private Color SelectionColor = new Color(1f, 0.25f, 0.25f, 0.9f);
		private Vector2[] meshuvs;
		private List<int> selectedUVs = new List<int> ();
		//private int selectiontype = 0;
		private Rect windowrect = new Rect (10, 100, 200, 300);

		int tileCount = 1;
		Texture2D selectionTexture;
		float zoomfactor = 1;
		Vector2 scrollpos;
		Rect areaVisible;
		Rect areaRect;
		float uvtopixelratio;
		float offsetpix = 0f;
		Vector2 handleposition = Vector2.zero;
		bool dragged = false;
		#endregion
		
		#region PUBLIC METHODS
		//Calls the base constructor
		public UVEditor(MeshFilter filter): base(filter) {}
		public UVEditor(SkinnedMeshRenderer filter): base(filter) {}

		//Override the scene GUI
		public override void DrawSceneGUI()
		{
			if (Event.current.type == EventType.Layout) {
				HandleUtility.AddDefaultControl (GUIUtility.GetControlID (FocusType.Passive));
			}
			Handles.BeginGUI ();
			windowrect = GUI.Window (0, windowrect, this.GUIWindow, "UV Tools");
			Handles.EndGUI ();
		}
		
		//Override the refresh method
		public override void ReloadData()
		{
			if (meshuvs != targetsharedmesh.uv) {
				selectedUVs.Clear ();
				meshuvs = targetsharedmesh.uv;
				if (targettransform.GetComponent<Renderer>() && targettransform.GetComponent<Renderer>().sharedMaterial){
					selectionTexture = targettransform.GetComponent<Renderer>().sharedMaterial.mainTexture as Texture2D;
				}
			}
		}
		
		public void UpdateMesh()
		{
			targetsharedmesh.uv = meshuvs;
		}
		#endregion
		
		#region PRIVATE METHODS
		private void GUIWindow (int windowID)
		{
			GUI.DragWindow (new Rect (0, 0, 10000, 20));
			GUI.color = Color.white;
			GUILayout.BeginHorizontal ();
			if (GUILayout.Button ("Unwrap", EditorStyles.miniButtonLeft)) {
				Vector2[] triuvs = Unwrapping.GeneratePerTriangleUV(targetsharedmesh);
				int[] tris = targetsharedmesh.triangles;
				for (int i=0;i<meshuvs.Length;i++){
					meshuvs[i] = triuvs[Array.FindIndex(tris, p => p==i)];
				}
				UpdateMesh ();
			}
			if (GUILayout.Button ("Export", EditorStyles.miniButtonRight)) {
				int w = 1024;
				int h = 1024;
				Texture2D tex = new Texture2D(w, h);
				int[] tris = targetsharedmesh.triangles;
				for (int i=0;i<tris.Length;i+=3){
					Vector2 pt1 = meshuvs[tris[i]];
					Vector2 pt2 = meshuvs[tris[i+1]];
					Vector2 pt3 = meshuvs[tris[i+2]];
					TextureTools.DrawLine(tex, (int)(pt1.x*w), (int)(pt1.y*h), (int)(pt2.x*w), (int)(pt2.y*h), Color.red);
					TextureTools.DrawLine(tex, (int)(pt2.x*w), (int)(pt2.y*h), (int)(pt3.x*w), (int)(pt3.y*h), Color.red);
					TextureTools.DrawLine(tex, (int)(pt3.x*w), (int)(pt3.y*h), (int)(pt1.x*w), (int)(pt1.y*h), Color.red);
				}
				tex.Apply();
				string path = EditorUtility.SaveFilePanelInProject ("Save as", "uv_map", "png", "");
				TextureTools.SaveTexture(tex, path);
			}
			GUILayout.EndHorizontal ();
			GUILayout.BeginHorizontal ();
			if (GUILayout.Button ("Flip X", EditorStyles.miniButtonLeft)) {
				for (int i=0;i<meshuvs.Length;i++){
					meshuvs[i].x = 1f-meshuvs[i].x;
				}
				UpdateMesh();
			}
			if (GUILayout.Button ("Flip Y", EditorStyles.miniButtonRight)) {
				for (int i=0;i<meshuvs.Length;i++){
					meshuvs[i].y = 1f-meshuvs[i].y;
				}
				UpdateMesh();
			}
			GUILayout.EndHorizontal ();
			//selectiontype = EditorGUILayout.Popup (selectiontype, new string[2]{"Single Select", "Box Select"});
			GUILayout.BeginHorizontal();
			if(GUILayout.Button("Rotate 45 deg", EditorStyles.miniButtonLeft)){
				UVTools.Rotate (targetsharedmesh, 45f);
				ReloadData();
				/*
				Quaternion eulerRot = Quaternion.Euler(0,0,45);
				for (var i = 0 ; i < meshuvs.Length; i++){
					meshuvs[i] = eulerRot * (meshuvs[i] - new Vector2(0.5f,0.5f)) + new Vector3(0.5f, 0.5f);
				}
				UpdateMesh();
				*/
			}
			if(GUILayout.Button("Rotate 90 deg", EditorStyles.miniButtonRight)){
				UVTools.Rotate (targetsharedmesh, 90f);
				ReloadData();
				/*
				Quaternion eulerRot = Quaternion.Euler(0,0,90);
				for (var i = 0 ; i < meshuvs.Length; i++){
					meshuvs[i] = eulerRot * (meshuvs[i] - new Vector2(0.5f,0.5f)) + new Vector3(0.5f, 0.5f);
				}
				UpdateMesh();
				*/
			}
			GUILayout.EndHorizontal();
			GUILayout.BeginHorizontal();
			GUILayout.Label("Zoom : ", GUILayout.Width(50));
			zoomfactor = GUILayout.HorizontalSlider(zoomfactor,0.5f,3);
			GUILayout.EndHorizontal();
			GUILayout.BeginHorizontal ();
			GUILayout.Label ("Tiles:");
			tileCount = EditorGUILayout.IntSlider (tileCount, 1, 10);
			GUILayout.EndHorizontal ();

			RenderUVEditor();

			if (selectedUVs.Count == 0 || !TryTranslate ()) {
				TrySingleSelect ();
			}
		}

		void RenderUVEditor() {
			uvtopixelratio = zoomfactor * 180f;
			areaRect = GUILayoutUtility.GetRect (180f, 180f);
			areaVisible = new Rect(0, 0, uvtopixelratio*tileCount, uvtopixelratio*tileCount);
			GUI.Box (areaRect, "");
			scrollpos = GUI.BeginScrollView(areaRect, scrollpos, areaVisible);
			//Draw the Background
			if (selectionTexture != null){
				for (int x = 0; x < tileCount; x++) {
					for (int y = 0; y < tileCount; y++) {
						GUI.DrawTexture(new Rect(uvtopixelratio*x,uvtopixelratio*y,uvtopixelratio,uvtopixelratio), selectionTexture);
					}
				}
			}
			//Draw the uvs
			offsetpix = ((tileCount-1) / 2) * uvtopixelratio;
			for (int i = 0; i < meshuvs.Length; i++) {
				if (selectedUVs.Contains(i)) GUI.color = SelectionColor; else GUI.color = DefaultColor;
				GUI.DrawTexture(new Rect(offsetpix + uvtopixelratio*meshuvs[i].x-4, offsetpix + uvtopixelratio*(1-meshuvs[i].y)-4, 8, 8), EditorGUIUtility.whiteTexture);
			}
			GUI.EndScrollView();
		}

		bool TrySingleSelect()
		{
			if (Event.current.type == EventType.MouseDown && !Event.current.shift && HandleUtility.DistanceToRectangle (handleposition-scrollpos, Quaternion.identity, 10f) > 0) {
				selectedUVs.Clear();
			}
			else if (Event.current.type == EventType.MouseUp) {
				if (dragged){
					dragged = false;
				} else {
					Vector2 uvhandlesoffset = new Vector2 (offsetpix, offsetpix);
					float closestdistance = 50f;
					float dist = 0f;
					int closestindex = -1;
					for (int i=0; i<meshuvs.Length; i++) {
						dist = Vector2.Distance (uvtopixelratio*new Vector2(meshuvs[i].x, 1-meshuvs[i].y)+uvhandlesoffset, Event.current.mousePosition-new Vector2(areaRect.x, areaRect.y)+scrollpos);
						if (dist < closestdistance) {
							closestdistance = dist;
							closestindex = i;
						}
					}
					if (closestindex != -1) {
						if (!selectedUVs.Contains (closestindex)) {
							selectedUVs.Add (closestindex);
						} else {
							selectedUVs.Remove (closestindex);
						}
						calculateselectioncenter();
						return true;
					}
				}
			}
			return false;
		}
		

		bool TryTranslate() {
			Handles.color = Color.red;
			Handles.RectangleCap (0, handleposition-scrollpos, Quaternion.identity, 10f);

			if (Event.current.type == EventType.MouseDrag) {
				dragged = true;
				if (HandleUtility.DistanceToRectangle (handleposition-scrollpos, Quaternion.identity, 10f) == 0) {
				//if ((areaRect.Contains(Event.current.mousePosition))) {
					handleposition += Event.current.delta;
					Vector2 d = Event.current.delta * (1/uvtopixelratio);
					d.y=-d.y;
					for (int i = 0; i < selectedUVs.Count; i++) {
						meshuvs[selectedUVs[i]] += d;
					}
					UpdateMesh ();
					return true;
				}
			}
			return false;
		}
		
		private void calculateselectioncenter()
		{
			Vector2 max = Vector2.zero;
			Vector2 min = new Vector2(10000f, 10000f);
			foreach (int i in selectedUVs){
				if (meshuvs[i].y<min.y){
					min.y = meshuvs[i].y;
				}
				if (meshuvs[i].y>max.y){
					max.y = meshuvs[i].y;
				}
				if (meshuvs[i].x<min.x){
					min.x = meshuvs[i].x;
				}
				if (meshuvs[i].x>max.x){
					max.x = meshuvs[i].x;
				}
			}
			handleposition = new Vector2(uvtopixelratio*(min.x+max.x)/2+areaRect.x+offsetpix, uvtopixelratio*(1-(min.y+max.y)/2)+areaRect.y+offsetpix);
		}
		#endregion
	}
}