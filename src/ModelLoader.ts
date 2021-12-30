import * as THREE from "three";
import {McModel} from "./ModelInterface";
import Model = McModel.Model;
import Element = McModel.Element;
import {MathUtils, MeshBasicMaterial, Texture, Vector3} from "three";
import {axisToVector, convertPosition, cropImage, rotateAboutPoint} from "./VectorUtils";
import {Backend} from "./backend/Backend";
import {ServerBackend} from "./backend/ServerBackend";
import merge from 'deepmerge-json';
import Face = McModel.Face;

const backend: Backend = new ServerBackend();
const sortArray = (array: Array<[string, string]>) => array.sort((a, b) => a[1] > b[1] ? -1 : 1)

export function load(modelName: string, scene: THREE.Scene) {
    const sort = (model: Model) => sortArray(Object.entries(model.textures))
    const load = (model: Model) => loadTextures(sort(model), new Map<string, HTMLImageElement>())
    loadModel(modelName)
        .then<[Model, Map<string, HTMLImageElement>]>(model => load(model).then(map => [model, map]))
        .then(model => model[0].elements.forEach(element => createElement(element, model[1], scene)))


}

function loadModel(modelName: string): Promise<Model> {
    return backend.getModel(modelName)
        .then(model => model.parent ? loadModel(getName(model.parent)).then(model2 => merge(model, model2)) : model)
}

function getName(parent: string): string {
    return parent.split("/").at(-1)
}

function loadTextures(list: Array<[string, string]>, map: Map<string, HTMLImageElement>): Promise<Map<string, HTMLImageElement>> {
    if (list.length != 0) {
        const key = list[0][0]
        const value = list[0][1]
        if (value.startsWith("#")) {
            map.set(`#${key}`, map.get(value))
            return loadTextures(list.slice(1), map)
        } else {
            const image = new Image()
            return backend.getTexture(getName(value))
                .then(base64 => image.src = "data:image/png;base64," + base64)
                .then(_ => map.set(`#${key}`, image))
                .then(_ => loadTextures(list.slice(1), map))
        }
    }
    return Promise.resolve(map)
}

function createTexture(image: HTMLImageElement, face: Face): Texture {

    const foo = (param: string) => console.log(param)
    cropImage(image, face.uv, foo)
    const texture = new THREE.Texture()
    texture.image = image
    image.onload = () => texture.needsUpdate = true
    //console.log(map)
    console.log(texture.image)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.LinearFilter
    return texture
}


function createElement(element: Element, map: Map<string, HTMLImageElement>, scene: THREE.Scene): {error?: string} {
    if(element.from.length != 3)
        return {error: "Size of 'from' must be equal to 3."}
    if(element.to.length != 3)
        return {error: "Size of 'to' must be equal to 3."}

    const size = element.to.map((k, i) => k - element.from[i])
    const base = new THREE.BoxGeometry(size[0], size[1], size[2])

    const loader = new THREE.TextureLoader();
    loader.setPath( 'resources/' );

    const materials = new Array<MeshBasicMaterial>(6)

    for(const [key, value] of Object.entries(element.faces)) {
        const image = map.get(getName(value.texture))
        const newImage = new Image()
        newImage.src = image.src
        materials[faceToIndex(key)] = new THREE.MeshBasicMaterial({
            map: createTexture(newImage, value),
            transparent: true
        })
    }

    const mesh = new THREE.Mesh(base, materials)
    scene.add(mesh)

    const wantedPosition = new Vector3(element.from[0], element.from[1], element.from[2])
    const position = convertPosition(mesh.geometry.parameters.width, mesh.geometry.parameters.height, mesh.geometry.parameters.depth, wantedPosition)
    mesh.position.set(position.x, position.y, position.z)

    if(element.rotation) {
        const axis = axisToVector(element.rotation.axis)
        const origin = new Vector3(element.rotation.origin[0], element.rotation.origin[1], element.rotation.origin[2])
        rotateAboutPoint(mesh, convertPosition(0, 0, 0, origin), axis.normalize(), MathUtils.degToRad(element.rotation.angle), false)
    }
}

function faceToIndex(face: string): number {
    switch (face) {
        case McModel.FaceEnum.EAST : return 0
        case McModel.FaceEnum.WEST : return 1
        case McModel.FaceEnum.UP   : return 2
        case McModel.FaceEnum.DOWN : return 3
        case McModel.FaceEnum.SOUTH: return 4
        case McModel.FaceEnum.NORTH: return 5
    }
}
