#pragma strict
import System.Collections.Generic;
// JavaScript Document

class RagdollController extends MonoBehaviour {

	var _ragdolled : boolean;

	public function get ragdolled() : boolean{
		return _ragdolled;
	}

	function set ragdolled(value : boolean){
		
		if (value == true){
			if (state == RagdollState.animated) {
				//Transition from animated to ragdolled
				SetKinematic(false); //allow the ragdoll rigidbodies to react to the environment
				anim.enabled = false; //disable animation
				state = RagdollState.ragdolled;
			} 
		}
		else {
			
			if (state == RagdollState.ragdolled) {
				//Transition from ragdolled to animated through the blendToAnim state
				SetKinematic(true); //disable gravity etc.
				ragdollingEndTime = Time.time; //store the state change time
				anim.enabled = true; //enable animation
				state = RagdollState.blendToAnim;  
				
				//Store the ragdolled position for blending
				for(var b : BodyPart in bodyParts){
					b.storedRotation = b.transform.rotation;
					b.storedPosition = b.transform.position;
				}
				
				//Remember some key positions
				ragdolledFeetPosition = 0.5 * (anim.GetBoneTransform(HumanBodyBones.LeftToes).position + anim.GetBoneTransform(HumanBodyBones.RightToes).position);
				ragdolledHeadPosition = anim.GetBoneTransform(HumanBodyBones.Head).position;
				ragdolledHipPosition = anim.GetBoneTransform(HumanBodyBones.Hips).position;
					
				//Initiate the get up animation
				if (anim.GetBoneTransform(HumanBodyBones.Hips).forward.y > 0){ //hip hips forward vector pointing upwards, initiate the get up from back animation
					anim.Play(backGetUpState);
				}
				else{
					anim.Play(bellyGetUpState);
				}
			} //if (state==RagdollState.ragdolled)
			
		} //if value==false	
		
		_ragdolled = value;
		
	} //set

	//The names of the mecanim get up states
	var bellyGetUpState : String = "GetUpFromBelly";
	var backGetUpState : String = "GetUpFromBack";

	//Possible states of the ragdoll
	enum RagdollState{
		animated,	 //Mecanim is fully in control
		ragdolled,   //Mecanim turned off, physics controls the ragdoll
		blendToAnim  //Mecanim in control, but LateUpdate() is used to partially blend in the last ragdolled pose
	}

	//The current state
	private var state : RagdollState = RagdollState.animated;

	//How long do we blend when transitioning from ragdolled to animated
	var ragdollToMecanimBlendTime : float = 0.5;
	private var mecanimToGetUpTransitionTime : float = 0.05;
	//A helper variable to store the time when we transitioned from ragdolled to blendToAnim state
	private var ragdollingEndTime : float = -100;

	//Declare a class that will hold useful information for each body part
	class BodyPart{
		var transform : Transform;
		var storedPosition : Vector3;
		var storedRotation : Quaternion;
	}
	//Declare a list of body parts, initialized in Start()
	private var bodyParts = new List.<BodyPart>();
	
	//Additional vectors for storing the pose the ragdoll ended up in.
	private var ragdolledHipPosition : Vector3;
	private var ragdolledHeadPosition : Vector3;
	private var ragdolledFeetPosition  : Vector3;
	
	//an array to store all the ragdoll rigidbodies in
	private var rigidbodies : Rigidbody[];
	//A helper function to set the isKinematc property of all RigidBodies in the children of the 
	//game object that this script is attached to
	function  SetKinematic(newValue : boolean){
		//For each of the components in the array, treat the component as a Rigidbody and set its isKinematic property
		for(var rb : Rigidbody in rigidbodies){
			rb.isKinematic = newValue;
		}
	}
	
	//the animator component
	private var anim : Animator;
	
	// Initialization, first frame of game
	function Start(){
		
		//store the array of ragdoll rigidbodies
		rigidbodies = GetComponentsInChildren.<Rigidbody>();
		//Set all Rigidbodies to kinematic so that they can be controlled with Mecanim
		//and there will be no glitches when transitioning to a ragdoll
		SetKinematic(true);
		
		//Find all the transforms in the character, assuming that this script is attached to the root
		var transforms : Transform[] = GetComponentsInChildren.<Transform>();
		//collect a list of transforms to exclude from body part list (mount points and their child objects)
		var excludedTransforms = new List.<Transform>(); //we made this a list so we can use .Contains()
		for(var tr : Transform in transforms){
			if(tr.CompareTag("MountPoint")){ 
				var children = tr.GetComponentsInChildren.<Transform>();
				for( var child : Transform in children){
					excludedTransforms.Add(child);
				}
			}
		}

		//For each of the transforms that isn't supposed to be excluded, create a BodyPart instance and store it in bodyParts 
		for(tr in transforms){
			if(!excludedTransforms.Contains(tr)){ //if it isn't in the excluded list
				var bodyPart = new BodyPart();
				bodyPart.transform = tr;
				bodyParts.Add(bodyPart);
			}
		}
		
		//cache reference to the Animator component
		anim = GetComponent.<Animator>();

	}
	
	function LateUpdate(){
		//Clear the get up animation controls so that we don't end up repeating the animations indefinitely
		//anim.SetBool(bellyGetUpState, false);
		//anim.SetBool(backGetUpState, false);

		//Blending from ragdoll back to animated
		if(state == RagdollState.blendToAnim){
			
			if (Time.time <= ragdollingEndTime+mecanimToGetUpTransitionTime){
				
				//If we are waiting for Mecanim to start playing the get up animations, update the root of the mecanim
				//character to the best match with the ragdoll
				var animatedToRagdolled : Vector3 = ragdolledHipPosition - anim.GetBoneTransform(HumanBodyBones.Hips).position;
				var newRootPosition : Vector3 = transform.position + animatedToRagdolled;
					
				//Now cast a ray from the computed position downwards and find the highest hit that does not belong to the character 
				var hits : RaycastHit[] = Physics.RaycastAll(new Ray(newRootPosition, Vector3.down)); 
				newRootPosition.y = 0;
				for(var hit : RaycastHit in hits){
					if(!hit.transform.IsChildOf(transform)){
						newRootPosition.y = Mathf.Max(newRootPosition.y, hit.point.y);
					}
				}
				transform.position = newRootPosition;
				
				//Get body orientation in ground plane for both the ragdolled pose and the animated get up pose
				var ragdolledDirection : Vector3 = ragdolledHeadPosition - ragdolledFeetPosition;
				ragdolledDirection.y = 0;

				var meanFeetPosition : Vector3 = 0.5 * (anim.GetBoneTransform(HumanBodyBones.LeftFoot).position + anim.GetBoneTransform(HumanBodyBones.RightFoot).position);
				var animatedDirection : Vector3 = anim.GetBoneTransform(HumanBodyBones.Head).position - meanFeetPosition;
				animatedDirection.y = 0;
										
				//Try to match the rotations. Note that we can only rotate around Y axis, as the animated characted must stay upright,
				//hence setting the y components of the vectors to zero. 
				transform.rotation *= Quaternion.FromToRotation(animatedDirection.normalized,ragdolledDirection.normalized);
				
			}
			
			//compute the ragdoll blend amount in the range 0...1
			var ragdollBlendAmount : float = 1.0 - (Time.time - ragdollingEndTime - mecanimToGetUpTransitionTime)/ragdollToMecanimBlendTime;
			ragdollBlendAmount = Mathf.Clamp01(ragdollBlendAmount);
			
			//In LateUpdate(), Mecanim has already updated the body pose according to the animations. 
			//To enable smooth transitioning from a ragdoll to animation, we lerp the position of the hips 
			//and slerp all the rotations towards the ones stored when ending the ragdolling
			for(var b : BodyPart in bodyParts){
				if(b.transform != transform){ //this if is to prevent us from modifying the root of the character, only the actual body parts
					//position is only interpolated for the hips
					if(b.transform == anim.GetBoneTransform(HumanBodyBones.Hips))
						b.transform.position=Vector3.Lerp(b.transform.position, b.storedPosition, ragdollBlendAmount);
					//rotation is interpolated for all body parts
					b.transform.rotation = Quaternion.Slerp(b.transform.rotation, b.storedRotation, ragdollBlendAmount);
				}
			}
			
			//if the ragdoll blend amount has decreased to zero, move to animated state
			if(ragdollBlendAmount <= 0){
				state = RagdollState.animated;
				return;
			}
			
		}
		
	} //LateUpdate
	
} //MonoBehaviour


