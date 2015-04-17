Mesh Toolkit - Unity Editor Extension
Developed By: EJM Software
=====================================
Learn about Mesh Toolkit at http://ejm.cloudvent.net/meshtk
Check out our other software at http://ejm.cloudvent.net
Some documentation can be found at http://ejm.cloudvent.net/meshtk
=====================================
About
 - Mesh Toolkit is an essential set of tools for working with meshes. It helps you to visualize, troubleshoot and correct meshes.
=====================================
Mesh Toolkit Basics
 - To use MeshTK, simply select any object with a mesh filter component in the scene view.
 - Once you have selected an object you should see a wrench icon in the corner of the scene view.
 - Click the wrench icon to enter edit mode.
 - There are five sets of tools you can use to edit the mesh (object, vertex, triangle, normal, uv)
======================================
Notes
 - You must use a shader that supports Vertex colors (there is one provided) in order to use vertex colored meshes.
 - When you enter edit mode the object's mesh data is saved. You can revert to this save until you
   exit edit mode, at which point all changes you made are irreversible.
 - If the mesh tk GUI is not visible for the selected object, make sure its
   MeshFilter or SkinnedMeshRenderer is expanded in the Inspector.
======================================
Features

MeshTK Object Tools: 
- Change mesh name
- Make Mesh Unique - creates a new instance of the shared mesh 
- Save mesh as asset - saves mesh to asset folder
- Save mesh as OBJ
- Combine children into mesh
- Apply/Bake Transform - resets the transform without changing the mesh geometry in the same world space. (correct scale, rotation, origin on imported models) 
- Mirror (X,Y,Z) - flips the entire mesh data of the chosen axis. 
- Center pivot - centers the pivot point of the mesh 
- Double shared vertices - makes all vertices unique 
- Share duplicate vertices - makes all vertices shared (note that this can negatively affect normals or uv mapping) 
- Optimize Mesh - optimizes the triangles for vertex cache locally

MeshTK Vertex Tools:
- Single select, Box select, Paint Select, and Select All
- Move selected vertices 
- Rotate selected vertices 
- Scale selected vertices 
- Weld selected vertices 
- Delete selected vertices 

MeshTK Triangle Tools:
- Single select, Box select, Paint Select, and Select All
- Move selected triangles 
- Rotate selected triangles 
- Scale selected triangles 
- Flip selected triangles 
- Extrude selected triangles 
- Subdivide selected triangles by edge or center 
- Delete selected triangles 

MeshTK Normal Tools:
- Single select, Box select, and Select All
- Rotate selected Normals 
- Calculate All Normals

MeshTK UV Tools:
- Basic Unwrap mesh
- Flip UVs
- Rotate UVs
- View and move individual UVs