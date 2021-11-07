import {Vector3} from "three";
import * as THREE from "three";
import {McModel} from "./ModelInterface";
import Axis = McModel.Axis;

export function convertPosition(width: number, height: number, depth: number, position: Vector3): Vector3 {
    return new Vector3(-8 + width / 2 + position.x, -8 + height / 2 + position.y, -8 + depth / 2 + position.z)
}

export function axisToVector(axis: Axis): Vector3 {
    if(axis == Axis.X)
        return new Vector3(1, 0, 0)
    else if(axis == Axis.Y)
        return new Vector3(0, 1, 0)
    else
        return new Vector3(0, 0, 1)
}

// https://stackoverflow.com/questions/42812861/three-js-pivot-point
// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
export function rotateAboutPoint(mesh: THREE.Mesh, point: Vector3, axis: Vector3, theta: number, pointIsWorld: boolean){
    pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

    if(pointIsWorld){
        mesh.parent.localToWorld(mesh.position); // compensate for world coordinate
    }

    mesh.position.sub(point); // remove the offset
    mesh.position.applyAxisAngle(axis, theta); // rotate the POSITION
    mesh.position.add(point); // re-add the offset

    if(pointIsWorld){
        mesh.parent.worldToLocal(mesh.position); // undo world coordinates compensation
    }

    mesh.rotateOnAxis(axis, theta); // rotate the OBJECT
}
