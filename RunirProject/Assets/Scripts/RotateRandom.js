#pragma strict

function Update () {
 transform.Rotate(Vector3.up * 180.0 * Time.deltaTime);
}