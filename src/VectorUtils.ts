import {Vector3} from "three";
import * as THREE from "three";
import {McModel} from "./models/ModelInterface";
import Axis = McModel.Axis;

/**
 * Convert a position from a wanted position to a real position in the scene
 * @param width the width of the mesh
 * @param height the height of the mesh
 * @param depth the depth of the mesh
 * @param position the current position of the mesh
 * @return the real position in the scene
 */
export function convertPosition(width: number, height: number, depth: number, position: Vector3): Vector3 {
    return new Vector3(-8 + width / 2 + position.x, -8 + height / 2 + position.y, -8 + depth / 2 + position.z)
}

/**
 * Convert axis to vector
 * @param axis the axis to convert
 * @return a vector resulting of the conversion of the axis
 */
export function axisToVector(axis: Axis): Vector3 {
    if(axis == Axis.X)
        return new Vector3(1, 0, 0)
    else if(axis == Axis.Y)
        return new Vector3(0, 1, 0)
    else
        return new Vector3(0, 0, 1)
}


/**
 * Rotate the parameter <i>mesh</i> about a point
 * @param mesh the mesh
 * @param point the point of rotation
 * @param axis the axis of rotation
 * @param theta radian value of rotation
 * @param pointIsWorld boolean indicating the point is in world coordinates (default = false)
 * @see https://stackoverflow.com/questions/42812861/three-js-pivot-point
 */
export function rotateAboutPoint(mesh: THREE.Mesh, point: Vector3, axis: Vector3, theta: number, pointIsWorld: boolean) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld

    if(pointIsWorld)
        mesh.parent.localToWorld(mesh.position) // compensate for world coordinate

    mesh.position.sub(point); // remove the offset
    mesh.position.applyAxisAngle(axis, theta) // rotate the POSITION
    mesh.position.add(point); // re-add the offset

    if(pointIsWorld)
        mesh.parent.worldToLocal(mesh.position) // undo world coordinates compensation

    mesh.rotateOnAxis(axis, theta) // rotate the OBJECT
}
