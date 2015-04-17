using UnityEngine;
using System;
using System.Linq;
using System.Collections.Generic;

namespace MeshTK
{
	/// <summary>
	/// Class for editing the vertices of Meshes
	/// </summary>
	public class VertexTools
	{
		/// <summary>
		/// Merges all double vertices in mesh
		/// </summary>
		/// <param name='mesh'>
		/// Mesh to merge vertices
		/// </param>
		/// <param name='threshold'>
		/// Threshold for merging vertices
		/// </param>
		public static void MergeDoubles(Mesh mesh, float threshold = 0.001f){
			//Determine what data will need to be copied
			bool useUV1 = (mesh.uv2.Length>0);
			bool useUV2 = (mesh.uv2.Length>0);
			bool usetangents = (mesh.tangents.Length>0);
			bool usebindposes = (mesh.bindposes.Length>0);
			bool useboneweights = (mesh.boneWeights.Length>0);
			//Merge duplicate vertices
			Vector3[] oldverts = mesh.vertices;
			Matrix4x4[] oldbindposes = mesh.bindposes;
			List<Vector3> verts = new List<Vector3> ();
			List<Vector2> uvs = new List<Vector2> ();
			List<Vector2> uv1s = new List<Vector2> ();
			List<Vector2> uv2s = new List<Vector2> ();
			List<Vector3> norms = new List<Vector3> ();
			List<Vector4> tangs = new List<Vector4> ();
			List<BoneWeight> boneweights = new List<BoneWeight> ();
			for (int i=0;i<oldverts.Length;i++) {
				Vector3 vert = oldverts[i];
				if(!verts.Exists(p => Vector3.Distance (vert, p)<=threshold)){
					verts.Add (vert);
					uvs.Add (mesh.uv [i]);
					if (useUV1){uv1s.Add (mesh.uv2[i]);}
					if (useUV2){uv2s.Add (mesh.uv2[i]);}
					norms.Add (mesh.normals[i]);
					if (usetangents){tangs.Add (mesh.tangents[i]);}
					if (useboneweights){boneweights.Add (mesh.boneWeights[i]);}
				}
			}
			// Rebuild triangles using new vertices
			int[] tris = mesh.triangles;
			for (int i = 0; i < tris.Length; ++i) {
				for (int j = 0; j < verts.Count; ++j) {
					if (Vector3.Distance (verts [j], oldverts [tris [i]]) <= threshold) {
						tris [i] = j;
						break;
					}
				}
			}
			// Apply new data to mesh
			mesh.Clear ();
			mesh.vertices = verts.ToArray ();
			mesh.uv = uvs.ToArray ();
			if (useUV1){mesh.uv2 = uv1s.ToArray();}
			if (useUV2){mesh.uv2 = uv2s.ToArray();}
			mesh.normals = norms.ToArray ();
			if (usetangents){mesh.tangents = tangs.ToArray();}
			if (usebindposes){mesh.bindposes = oldbindposes;}
			if (useboneweights){mesh.boneWeights = boneweights.ToArray();}
			mesh.triangles = tris;
			mesh.RecalculateBounds ();
		}
		/// <summary>
		/// Flips the vertices of the Mesh over the given axis
		/// </summary>
		public static void MirrorAxis (Mesh mesh, string axis)
		{
			Vector3[] vertices = mesh.vertices;
			for (int i = 0; i < vertices.Length; i++) {
				if (axis == "x") {
					vertices [i].x = -vertices [i].x;
				} else if (axis == "y") {
					vertices [i].y = -vertices [i].y;
				} else if (axis == "z") {
					vertices [i].z = -vertices [i].z;
				}
			}
			mesh.vertices = vertices;
			TriangleTools.Flip (mesh);
			mesh.RecalculateBounds ();
		}
		/// <summary>
		/// Remove the vertices at given indices of a given mesh
		/// </summary>
		public static void Remove(Mesh mesh, int[] indices){
			if (indices != null && indices.Length > 0) {
				//Determine what data will need to be copied
				bool useUV1 = (mesh.uv2.Length>0);
				bool useUV2 = (mesh.uv2.Length>0);
				bool usetangents = (mesh.tangents.Length>0);
				bool usebindposes = (mesh.bindposes.Length>0);
				bool useboneweights = (mesh.boneWeights.Length>0);
				//remove dependant triangles
				int[] tris = mesh.triangles;
				List<int> triindices = new List<int> ();
				for (int i=0; i<tris.Length; i+=3) {
					if(System.Array.Exists(indices, p => p==tris[i] || p==tris[i+1] || p==tris[i+2])){
						triindices.Add (i / 3);
					}
				}
				TriangleTools.Remove (mesh, triindices.ToArray ());
				//remove selected vertices
				int newCount = mesh.vertexCount - indices.Length;
				Vector3[] newverts = new Vector3[newCount];
				Vector2[] newuvs = new Vector2[newCount];
				Vector2[] newuv1s = new Vector2[newCount];
				Vector2[] newuv2s = new Vector2[newCount];
				Vector3[] newnormals = new Vector3[newCount];
				Vector4[] newtangents = new Vector4[newCount];
				Matrix4x4[] newbindposes = mesh.bindposes;
				BoneWeight[] newboneweights = new BoneWeight[newCount];
				tris = mesh.triangles;
				int j = 0;
				int previousdeletions = 0;
				for (int i=0; i<mesh.vertexCount; i+=1) {
					if (!System.Array.Exists (indices, p => p==i)) {
						newverts [j] = mesh.vertices [i];
						newuvs [j] = mesh.uv [i];
						if (useUV1){newuv1s [j] = mesh.uv2 [i];}
						if (useUV2){newuv2s [j] = mesh.uv2 [i];}
						if (usetangents){newtangents[j] = mesh.tangents[i];}
						if (useboneweights){newboneweights[j] = mesh.boneWeights[i];}
						newnormals [j] = mesh.normals [i];
						j += 1;
						if (previousdeletions > 0) {
							while (System.Array.Exists(tris, p => p==i)) {
								tris [System.Array.FindIndex (tris, p => p == i)] -= previousdeletions;
							}
						}
					} else {
						previousdeletions += 1;
					}
				}
				mesh.Clear ();
				mesh.vertices = newverts;
				mesh.normals = newnormals;
				mesh.uv = newuvs;
				if (useUV1){mesh.uv2 = newuv1s;}
				if (useUV2){mesh.uv2 = newuv2s;}
				if (usebindposes){mesh.bindposes = newbindposes;}
				if (usetangents){mesh.tangents = newtangents;}
				if (useboneweights){mesh.boneWeights = newboneweights;}
				mesh.triangles = tris;
				/*
				Matrix4x4[] bindposes = mesh.bindposes;
				Array.Sort(indices, (a, b) => b.CompareTo(a));
				List<Vector3> verts = mesh.vertices.ToList();
				List<int> newtris = mesh.triangles.ToList();
				List<Vector2> uvs = mesh.uv.ToList ();
				List<Vector2> uv1s = mesh.uv1.ToList ();
				List<Vector2> uv2s = mesh.uv2.ToList ();
				List<Vector3> normals = mesh.normals.ToList ();
				List<Vector4> tangents = mesh.tangents.ToList ();
				List<BoneWeight> boneweights = mesh.boneWeights.ToList();
				//fix tris
				tris = mesh.triangles;
				int previousdeletions = 0;
				for (int i=0; i<mesh.vertexCount; i+=1) {
					if (!System.Array.Exists (indices, p => p==i)) {
						if (previousdeletions > 0) {
							while (System.Array.Exists(tris, p => p==i)) {
								tris [System.Array.FindIndex (tris, p => p == i)] -= previousdeletions;
							}
						}
					} else {
						verts.RemoveAt (i-previousdeletions);
						uvs.RemoveAt (i-previousdeletions);
						if (useUV1){uv1s.RemoveAt (i-previousdeletions);}
						if (useUV2){uv2s.RemoveAt (i-previousdeletions);}
						normals.RemoveAt (i-previousdeletions);
						tangents.RemoveAt (i-previousdeletions);
						if (useboneweights){boneweights.RemoveAt (i-previousdeletions);}
						previousdeletions += 1;
					}
				}
				//apply data to mesh
				mesh.Clear ();
				mesh.vertices = verts.ToArray();
				mesh.normals = normals.ToArray();
				mesh.uv = uvs.ToArray();
				if (useUV1){mesh.uv1 = uv1s.ToArray();}
				if (useUV2){mesh.uv2 = uv2s.ToArray ();}
				if (usebindposes){mesh.bindposes = bindposes;}
				if (usetangents){mesh.tangents = tangents.ToArray();}
				if (useboneweights){mesh.boneWeights = boneweights.ToArray();}
				mesh.triangles = tris;
				*/
			}
		}
		/// <summary>
		/// Removes the vertices that are not in any triangles.
		/// </summary>
		/// <param name='mesh'>
		/// Mesh to remove unused vertices from
		/// </param>
		public static void RemoveUnused (Mesh mesh){
			List<int> indices = new List<int>();
			for (int i=0;i<mesh.vertexCount;i++){
				if (!Array.Exists(mesh.triangles, p => p==i)){
					indices.Add (i);
				}
			}
			VertexTools.Remove(mesh, indices.ToArray());
		}
		/// <summary>
		/// Creates a unique vertex for every index in the original Mesh
		/// </summary>
		public static void SplitShared(Mesh mesh){
			//Determine what data will need to be copied
			bool useUV1 = (mesh.uv2.Length>0);
			bool useUV2 = (mesh.uv2.Length>0);
			bool usetangents = (mesh.tangents.Length>0);
			bool usebindposes = (mesh.bindposes.Length>0);
			bool useboneweights = (mesh.boneWeights.Length>0);
			//Split the shared verts
			int[] sourceIndices = mesh.triangles;
			int newCount = mesh.triangles.Length;
			int[] newtris = new int[newCount];
			Vector3[] newverts = new Vector3[newCount];
			Vector2[] newuvs = new Vector2[newCount];
			Vector2[] newuv1s = new Vector2[newCount];
			Vector2[] newuv2s = new Vector2[newCount];
			Vector3[] newnormals = new Vector3[newCount];
			Vector4[] newtangents = new Vector4[newCount];
			Matrix4x4[] newbindposes = mesh.bindposes;
			BoneWeight[] newboneweights = new BoneWeight[newCount];
			
			for(int i = 0; i < sourceIndices.Length; i++)
			{
				newtris[i] = i;
				newverts[i] = mesh.vertices[sourceIndices[i]];
				newuvs[i] = mesh.uv[sourceIndices[i]];
				if (useUV1){newuv1s[i] = mesh.uv2[sourceIndices[i]];}
				if (useUV2){newuv2s[i] = mesh.uv2[sourceIndices[i]];}
				newnormals[i] = mesh.normals[sourceIndices[i]];
				if (usetangents){newtangents[i] = mesh.tangents[sourceIndices[i]];}
				if (useboneweights){newboneweights[i] = mesh.boneWeights[sourceIndices[i]];}
			}
			//Apply data to mesh
			mesh.vertices = newverts;
			mesh.uv = newuvs;
			mesh.triangles = newtris;
			if (useUV1){mesh.uv2 = newuv1s;}
			if (useUV2){mesh.uv2 = newuv2s;}
			mesh.normals = newnormals;
			if (usetangents){mesh.tangents = newtangents;}
			if (usebindposes){mesh.bindposes = newbindposes;}
			if (useboneweights){mesh.boneWeights = newboneweights;}
		}
		/// <summary>
		/// Weld the vertices at specified indices of a given mesh
		/// </summary>
		public static void Weld(Mesh mesh, int[] indices){
			if(indices.Length>1){
				Vector3[] verts = mesh.vertices;
				Vector2[] uvs = mesh.uv;
				Vector3 averagePos = Vector3.zero;
				Vector2 averageUV = Vector2.zero;
				foreach (int index in indices){
					averagePos += verts[index];
					averageUV += uvs[index];
				}
				averagePos = averagePos/indices.Length;
				averageUV = averageUV/indices.Length;
				foreach (int index in indices){
					verts[index] = averagePos;
					uvs[index] = averageUV;
				}
				mesh.vertices = verts;
				mesh.uv = uvs;
				mesh.RecalculateBounds();
			}
		}
	}
}