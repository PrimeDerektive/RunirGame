using UnityEngine;
using System;
using System.Linq;
using System.Collections.Generic;

namespace MeshTK
{
	/// <summary>
	/// Class for manipulating the triangles of any Mesh.
	/// </summary>
	public class TriangleTools
	{
		/// <summary>
		/// Extrude the triangles of a specified Mesh
		/// </summary>
		/// <param name='mesh'>
		/// Specified Mesh
		/// </param>
		/// <param name='indices'>
		/// Indices of triangles to extrude (ie. Index 2 represents the triangle with the vertex indices 6,7,8)
		/// </param>
		/// <param name='dist'>
		/// Distance to extrude each triangle
		/// </param>
		public static void Extrude(Mesh mesh, int[] indices, float dist){
			//Determine what data will need to be copied
			bool usetangents = (mesh.tangents.Length>0);
			bool usebindposes = (mesh.bindposes.Length>0);
			bool useboneweights = (mesh.boneWeights.Length>0);
			//Generate new verts and triangles
			int[] tris = mesh.triangles;
			int[] tris2 = new int[tris.Length + 18 * indices.Length];
			Vector3[] verts = mesh.vertices;
			Vector2[] uvs = mesh.uv;
			Vector3[] normals = mesh.normals;
			Vector4[] newtangents = mesh.tangents;
			Matrix4x4[] newbindposes = mesh.bindposes;
			BoneWeight[] newboneweights = mesh.boneWeights;
			int j = 0;
			for (int i=0; i<tris.Length; i+=3) {
				if (Array.IndexOf (indices, i / 3) == -1) {
					tris2 [j++] = tris [i];
					tris2 [j++] = tris [i + 1];
					tris2 [j++] = tris [i + 2];
				} else {
					Vector3 direction = Vector3.Cross(verts[tris[i+1]]-verts[tris[i]], verts[tris[i+2]]-verts[tris[i]]).normalized;
					System.Array.Resize (ref verts, verts.Length + 3);
					System.Array.Resize (ref uvs, uvs.Length + 3);
					System.Array.Resize (ref normals, normals.Length + 3);
					System.Array.Resize (ref newtangents, newtangents.Length + 3);
					int p1index = verts.Length - 3;
					int p2index = verts.Length - 2;
					int p3index = verts.Length - 1;
					verts [p1index] = verts [tris [i]] + dist * direction;
					verts [p2index] = verts [tris [i + 1]] + dist * direction;
					verts [p3index] = verts [tris [i + 2]] + dist * direction;
					//Simple uv calculation
					uvs [p1index] = uvs [tris [i]];
					uvs [p2index] = uvs [tris [i + 1]];
					uvs [p3index] = uvs [tris [i + 2]];
					normals [p1index] = normals [tris [i]];
					normals [p2index] = normals [tris [i + 1]];
					normals [p3index] = normals [tris [i + 2]];
					newtangents [p1index] = newtangents [tris [i]];
					newtangents [p2index] = newtangents [tris [i + 1]];
					newtangents [p3index] = newtangents [tris [i + 2]];
					if (useboneweights){
						System.Array.Resize (ref newboneweights, newboneweights.Length + 3);
						newboneweights [p1index] = newboneweights [tris [i]];
						newboneweights [p2index] = newboneweights [tris [i + 1]];
						newboneweights [p3index] = newboneweights [tris [i + 2]];
					}
					//New UV calculation
					/*
					Vector2 centerUV = (uvs[p1index] + uvs[p2index] + uvs[p3index])/3;
					Vector3 centerVert = (verts [p1index] + verts [p2index] + verts [p3index])/3;
					float centerDist = Vector3.Distance(verts [p1index], centerVert);
					Debug.Log (centerDist);
					uvs [p1index] = Vector2.Lerp (uvs [tris [i]], centerUV, dist/(dist+centerDist));
					centerDist = Vector3.Distance(verts [p2index], centerVert);
					uvs [p2index] = Vector2.Lerp (uvs [tris [i+1]], centerUV, dist/(dist+centerDist));
					centerDist = Vector3.Distance(verts [p3index], centerVert);
					uvs [p3index] = Vector2.Lerp (uvs [tris [i+2]], centerUV, dist/(dist+centerDist));
					*/

					tris2 [j++] = tris [i];
					tris2 [j++] = p2index;
					tris2 [j++] = p1index;

					tris2 [j++] = tris [i];
					tris2 [j++] = tris [i + 1];
					tris2 [j++] = p2index;

					tris2 [j++] = tris [i + 1];
					tris2 [j++] = p3index;
					tris2 [j++] = p2index;

					tris2 [j++] = tris [i + 1];
					tris2 [j++] = tris [i + 2];
					tris2 [j++] = p3index;

					tris2 [j++] = tris [i + 2];
					tris2 [j++] = p1index;
					tris2 [j++] = p3index;

					tris2 [j++] = tris [i + 2];
					tris2 [j++] = tris [i];
					tris2 [j++] = p1index;

					tris2 [j++] = p1index;
					tris2 [j++] = p2index;
					tris2 [j++] = p3index;
				}
			}
			mesh.Clear ();
			mesh.vertices = verts;
			mesh.normals = normals;
			mesh.uv = uvs;
			if (usebindposes){mesh.bindposes = newbindposes;}
			if (usetangents){mesh.tangents = newtangents;}
			if (useboneweights){mesh.boneWeights = newboneweights;}
			mesh.triangles = tris2;
		}
		/// <summary>
		/// Flips triangles of given mesh at indices. If indices is null it flips all triangles
		/// </summary>
		public static void Flip(Mesh mesh, int[] indices = null){
			int[] tris = mesh.triangles;
			if (indices == null) {
				for (int i = 0; i < tris.Length; i += 3) {
					int intermediate = tris [i];
					tris [i] = tris [i + 2];
					tris [i + 2] = intermediate;
				}
			} else {
				foreach (int i in indices) {
					if(tris.Length >= i*3+3){
						int intermediate = tris [i * 3];
						tris [i * 3] = tris [i * 3 + 2];
						tris [i * 3 + 2] = intermediate;
					}
				}
			}
			mesh.triangles = tris;
		}
		/// <summary>
		/// Remove the triangles at specific indices
		/// </summary>
		/// <param name='mesh'>
		/// Mesh
		/// </param>
		/// <param name='indices'>
		/// Indices of triangles that should be removed
		/// </param>
		public static void Remove(Mesh mesh, int[] indices){
			/*
			int[] tris = mesh.triangles;
			int[] tris2 = new int[tris.Length];
			int j = 0;
			int removedtris = 0;
			for (int i=0; i<tris.Length; i+=3) {
				if (Array.IndexOf (indices, i / 3) == -1) {
					tris2 [j++] = tris [i];
					tris2 [j++] = tris [i + 1];
					tris2 [j++] = tris [i + 2];
				} else {
					removedtris++;
				}
			}
			System.Array.Resize (ref tris2, tris2.Length - removedtris * 3);
			mesh.triangles = tris2;
			*/
			List<int> tris = mesh.triangles.ToList ();
			Array.Sort(indices, (a, b) => b.CompareTo(a));
			foreach (int i in indices){
				tris.RemoveRange (i*3,3);
			}
			mesh.triangles = tris.ToArray ();
		}
		/// <summary>
		/// Subdivides the triangles of a mesh by their centers
		/// </summary>
		/// <param name='mesh'>
		/// Mesh
		/// </param>
		/// <param name='indices'>
		/// Indices of triangles to be subdivided
		/// </param>
		public static void SubdivideByCenter(Mesh mesh, int[] indices){
			//Determine what data will need to be copied
			bool usetangents = (mesh.tangents.Length>0);
			bool usebindposes = (mesh.bindposes.Length>0);
			bool useboneweights = (mesh.boneWeights.Length>0);
			//Create arrays for new data
			int[] tris = mesh.triangles;
			int[] newtris = new int[tris.Length + 6 * indices.Length];
			Vector3[] verts = mesh.vertices;
			Vector2[] uvs = mesh.uv;
			Vector3[] normals = mesh.normals;
			Vector4[] newtangents = mesh.tangents;
			Matrix4x4[] newbindposes = mesh.bindposes;
			BoneWeight[] newboneweights = mesh.boneWeights;
			//Generate new verts and triangles
			int j = 0;
			for (int i=0; i<tris.Length; i+=3) {
				if (Array.IndexOf (indices, i / 3) == -1 && indices!=null) {
					newtris [j++] = tris [i];
					newtris [j++] = tris [i + 1];
					newtris [j++] = tris [i + 2];
				} else {
					System.Array.Resize (ref verts, verts.Length + 1);
					System.Array.Resize (ref uvs, uvs.Length + 1);
					System.Array.Resize (ref normals, normals.Length + 1);
					System.Array.Resize (ref newtangents, newtangents.Length + 1);
					if(useboneweights){System.Array.Resize (ref newboneweights, newboneweights.Length + 1);}
					int newindex = verts.Length - 1;
					verts [newindex] = (verts [tris [i]] + verts [tris [i + 1]] + verts [tris [i + 2]]) / 3;
					uvs [newindex] = (uvs [tris [i]] + uvs [tris [i + 1]] + uvs [tris [i + 2]]) / 3;
					normals [newindex] = (normals [tris [i]] + normals [tris [i + 1]] + normals [tris [i + 2]]) / 3;
					newtangents[newindex] = (newtangents [tris [i]] + newtangents [tris [i + 1]] + newtangents [tris [i + 2]]) / 3;
					if(useboneweights){newboneweights[newindex] = newboneweights[tris[i]];}
				
					newtris [j++] = tris [i];
					newtris [j++] = tris [i+1];
					newtris [j++] = newindex;

					newtris [j++] = tris [i+1];
					newtris [j++] = tris [i+2];
					newtris [j++] = newindex;

					newtris [j++] = tris [i+2];
					newtris [j++] = tris [i];
					newtris [j++] = newindex;
				}
			}
			//Apply new data to the mesh
			mesh.Clear ();
			mesh.vertices = verts;
			mesh.normals = normals;
			mesh.uv = uvs;
			if (usebindposes){mesh.bindposes = newbindposes;}
			if (usetangents){mesh.tangents = newtangents;}
			if (useboneweights){mesh.boneWeights = newboneweights;}
			mesh.triangles = newtris;
		}
		/// <summary>
		/// Subdivides the triangles of a mesh by their edges
		/// </summary>
		/// <param name='mesh'>
		/// Mesh.
		/// </param>
		/// <param name='indices'>
		/// Indices of triangles to be subdivided
		/// </param>
		/// <param name='weld'>
		/// Should the subdivided triangles use existing vertices when available or create new ones on their edges?
		/// </param>
		public static void SubdivideByEdge(Mesh mesh, int[] indices, bool weld = true, float threshold=0.001f){
			//Determine what data will need to be copied
			bool usetangents = (mesh.tangents.Length>0);
			bool usebindposes = (mesh.bindposes.Length>0);
			bool useboneweights = (mesh.boneWeights.Length>0);
			//Create arrays for new data
			int[] tris = mesh.triangles;
			int[] tris2 = new int[tris.Length + 9 * indices.Length];
			Vector3[] verts = mesh.vertices;
			Vector2[] uvs = mesh.uv;
			Vector3[] normals = mesh.normals;
			Vector4[] tangents = mesh.tangents;
			Matrix4x4[] bindposes = mesh.bindposes;
			BoneWeight[] boneweights = mesh.boneWeights;
			//Generate new verts and triangles
			int j = 0;
			for (int i=0; i<tris.Length; i+=3) {
				if (Array.IndexOf (indices, i / 3) == -1) {
					tris2 [j++] = tris [i];
					tris2 [j++] = tris [i + 1];
					tris2 [j++] = tris [i + 2];
				} else {
					Vector3 vert1 = (verts [tris [i]] + verts [tris [i + 1]]) / 2;
					Vector3 vert2 = (verts [tris [i + 1]] + verts [tris [i + 2]]) / 2;
					Vector3 vert3 = (verts [tris [i + 2]] + verts [tris [i]]) / 2;
					Vector2 uv1 = (uvs [tris [i]] + uvs [tris [i + 1]]) / 2;
					Vector2 uv2 = (uvs [tris [i + 1]] + uvs [tris [i + 2]]) / 2;
					Vector2 uv3 = (uvs [tris [i + 2]] + uvs [tris [i]]) / 2;
					Vector3 normal1 = (normals [tris [i]] + normals [tris [i + 1]]) / 2;
					Vector3 normal2 = (normals [tris [i + 1]] + normals [tris [i + 2]]) / 2;
					Vector3 normal3 = (normals [tris [i + 2]] + normals [tris [i]]) / 2;
					Vector4 tangent1 = (tangents [tris [i]] + tangents [tris [i + 1]]) / 2;
					Vector4 tangent2 = (tangents [tris [i + 1]] + tangents [tris [i + 2]]) / 2;
					Vector4 tangent3 = (tangents [tris [i + 2]] + tangents [tris [i]]) / 2;
					int p1index = System.Array.FindIndex(verts, p => Vector3.Distance(p, vert1)<=threshold);
					int p2index = System.Array.FindIndex(verts, p => Vector3.Distance(p, vert2)<=threshold);
					int p3index = System.Array.FindIndex(verts, p => Vector3.Distance(p, vert3)<=threshold);
					if (!weld || p1index==-1){
						p1index = verts.Length;
						System.Array.Resize (ref verts, verts.Length + 1);
						System.Array.Resize (ref uvs, uvs.Length + 1);
						System.Array.Resize (ref normals, normals.Length + 1);
						System.Array.Resize (ref tangents, tangents.Length + 1);
						System.Array.Resize (ref boneweights, boneweights.Length + 1);
						verts[p1index] = vert1;
						uvs[p1index] = uv1;
						normals[p1index] = normal1;
						tangents[p1index] = tangent1;
						if(useboneweights){boneweights[p1index] = boneweights[tris[i]];}
					}
					if (!weld || p2index==-1){
						p2index = verts.Length;
						System.Array.Resize (ref verts, verts.Length + 1);
						System.Array.Resize (ref uvs, uvs.Length + 1);
						System.Array.Resize (ref normals, normals.Length + 1);
						System.Array.Resize (ref tangents, tangents.Length + 1);
						System.Array.Resize (ref boneweights, boneweights.Length + 1);
						verts[p2index] = vert2;
						uvs[p2index] = uv2;
						normals[p2index] = normal2;
						tangents[p2index] = tangent2;
						if(useboneweights){boneweights[p2index] = boneweights[tris[i+1]];}
					}
					if (!weld || p3index==-1){
						p3index = verts.Length;
						System.Array.Resize (ref verts, verts.Length + 1);
						System.Array.Resize (ref uvs, uvs.Length + 1);
						System.Array.Resize (ref normals, normals.Length + 1);
						System.Array.Resize (ref tangents, tangents.Length + 1);
						System.Array.Resize (ref boneweights, boneweights.Length + 1);
						verts[p3index] = vert3;
						uvs[p3index] = uv3;
						normals[p3index] = normal3;
						tangents[p3index] = tangent3;
						if(useboneweights){boneweights[p3index] = boneweights[tris[i+2]];}
					}

					tris2 [j++] = tris [i];
					tris2 [j++] = p1index;
					tris2 [j++] = p3index;

					tris2 [j++] = tris [i + 1];
					tris2 [j++] = p2index;
					tris2 [j++] = p1index;

					tris2 [j++] = tris [i + 2];
					tris2 [j++] = p3index;
					tris2 [j++] = p2index;

					tris2 [j++] = p1index;
					tris2 [j++] = p2index;
					tris2 [j++] = p3index;
				}
			}
			//Apply new data to the mesh
			mesh.Clear ();
			mesh.vertices = verts;
			mesh.normals = normals;
			mesh.uv = uvs;
			if (usebindposes){mesh.bindposes = bindposes;}
			if (usetangents){mesh.tangents = tangents;}
			if (useboneweights){mesh.boneWeights = boneweights;}
			mesh.triangles = tris2;
		}
	}
}