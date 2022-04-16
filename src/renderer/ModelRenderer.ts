import * as THREE from "three";
import {McModel} from "../models/ModelInterface";
import Model = McModel.Model;
import Element = McModel.Element;
import {Material, MathUtils, MeshBasicMaterial, Texture, Vector3} from "three";
import {axisToVector, convertPosition, rotateAboutPoint} from "../VectorUtils";
import {Backend} from "../backend/Backend";
import {ServerBackend} from "../backend/ServerBackend";
import merge from 'deepmerge-json';
import {properties} from "../resources/Properties";
import {McTexture} from "./MinecraftTexture";
import {SpriteSheetTexture} from "../utils/SpriteSheetTexture";

const backend: Backend = new ServerBackend();
const sortArray = (array: Array<[string, string]>) => array.sort((a, b) => a[1] > b[1] ? -1 : 1)
const block_size = properties.model.block_size

/**
 * Load <i>modelName</i> model in the scene
 * @param modelName the name of the model to load
 * @param scene the scene where place the model
 */
export function load(modelName: string, scene: THREE.Scene): Promise<THREE.Object3D> {
    const sort = (model: Model) => sortArray(Object.entries(model.textures || []))
    const load = (model: Model) => loadTextureImages(sort(model), new Map<string, McTexture>())
    const group = new THREE.Group()
    return renderModel(modelName)
        .then<[Model, Map<string, McTexture>]>(model => load(model).then(map => [model, map]))
        .then(model => model[0].elements?.map(element => createElement(element, model[1], scene).object)
            .forEach(o => group.add(o))
        ).then(() => group)


}

/**
 * Load <i>modelName</i> model from the backend and his parents. Merge all the resulting model in a unique model
 * @param modelName the name of the model to load
 * @return a promise to the loaded model resulting of the mege of the requested model and all his parents
 */
async function renderModel(modelName: string): Promise<Model> {
    const model = await backend.getModel(modelName);
    // Load recursively parent and merge with the current model (if the parent exists)
    return model.parent ? renderModel(getName(model.parent)).then(model2 => merge(model, model2)) : model;
}

/**
 * @param parent the parent path
 * @return the name of the parent model
 */
function getName(parent: string): string {
    return parent.split("/").at(-1)
}

/**
 * Load all textures from <i>list</i>.
 * @param list a list of tuple where the first element is a texture variable and the second element is the texture to load for this variable.
 * If the second element map to a texture variable, maps the current texture variable to the same value that pointed texture variable
 * @param map a map texture variable to image loaded
 * @return a promise to a map where the key is a texture variable and the value is the loaded texture
 */
function loadTextureImages(list: Array<[string, string]>, map: Map<string, McTexture>): Promise<Map<string, McTexture>> {
    if (list.length != 0) {
        const key = list[0][0] // The texture variable
        const value = list[0][1] // The texture to load
        // Manage case where the value is a texture variable
        if (value.startsWith("#")) {
            map.set(`#${key}`, map.get(value))
            return loadTextureImages(list.slice(1), map)
        } else {
            const image = new Image()
            image.crossOrigin = "anonymous"
            try {
                image.src = backend.getTexture(getName(value))
            } catch(error) {
                image.src = undefined
            }

            return backend.getMcMetaFromTexture(getName(value))
                .then(mcmeta => {
                    map.set(`#${key}`, { texture: image, mcmeta: mcmeta})
                    return loadTextureImages(list.slice(1), map)
                })
        }
    }
    return Promise.resolve(map)
}

/**
 * Transform image to THREE Texture
 * @param image the image to transform
 */
function createTexture(image: HTMLImageElement): Texture {
    let texture = new THREE.Texture(image)
    image.onload = () => texture.needsUpdate = true
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.LinearFilter
    return texture
}

/**
 * Create and add a Mesh for the giving Element
 * @param element the Element to transform to Mesh
 * @param map the texture Map
 * @param scene the Scene where add the Mesh
 * @return an possible error
 */
function createElement(element: Element, map: Map<string, McTexture>, scene: THREE.Scene): {error?: string, object: THREE.Mesh} {
    // Manager bounds of arrays
    if (element.from.length != 3)
        return {error: "Size of 'from' must be equal to 3.", object: undefined}
    if (element.to.length != 3)
        return {error: "Size of 'to' must be equal to 3.", object: undefined}

    // Compute the size of the Geometry
    const size = element.to.map((k, i) => k - element.from[i])
    const base = new THREE.BoxGeometry(size[0], size[1], size[2])

    let materials: THREE.Material | Array<Material>

    if(map.size === 0 || Array.from(map.values()).filter(t => t?.texture?.src !== undefined).length === 0)
        materials = new THREE.MeshBasicMaterial({
            color: properties.wireframe_color,
            wireframe: true
        });
    else {
        materials = new Array<MeshBasicMaterial>(6)
        // Apply textures to all face of the Geometry
        for (const [key, value] of Object.entries(element.faces)) {
            const image = map.get(getName(value.texture))
            if(image?.texture?.src === undefined)
                materials[faceToIndex(key)] = new THREE.MeshBasicMaterial({
                    color: properties.wireframe_color,
                    wireframe: true
                })
            else {
                const newImage = image.texture.cloneNode(true) as HTMLImageElement
                const texture = image.mcmeta === undefined
                    ? createTexture(newImage)
                    : new SpriteSheetTexture({texture: newImage, mcmeta: image.mcmeta});
                materials[faceToIndex(key)] = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    alphaTest: 0.5
                })
                // Apply UV mapping to the texture
                if (value.uv === undefined) {
                    const {
                        x1,
                        y1,
                        x2,
                        y2
                    } = shapeToFaceCoords(element.from[0], element.from[1], element.from[2], element.to[0], element.to[1], element.to[2], key)
                    value.uv = [x1, y1, x2, y2]
                    updateTextureCoords(value.uv[0], value.uv[1], value.uv[2], value.uv[3], base, key, value.rotation)
                } else
                    // Reverse Y coordinates because Minecraft have (0, 0) in the top left corner whereas ThreeJS have in the bottom right corner
                    updateTextureCoords(value.uv[0], block_size - value.uv[3], value.uv[2], block_size - value.uv[1], base, key, value.rotation)
            }
        }
    }

    const mesh = new THREE.Mesh(base, materials)

    // Place Mesh in the Scene
    const wantedPosition = new Vector3(element.from[0], element.from[1], element.from[2])
    const position = convertPosition(mesh.geometry.parameters.width, mesh.geometry.parameters.height, mesh.geometry.parameters.depth, wantedPosition)
    mesh.position.set(position.x, position.y, position.z)

    // Rotate Mesh in the Scene
    if (element.rotation) {
        const axis = axisToVector(element.rotation.axis)
        const origin = new Vector3(element.rotation.origin[0], element.rotation.origin[1], element.rotation.origin[2])
        rotateAboutPoint(mesh, convertPosition(0, 0, 0, origin), axis.normalize(), MathUtils.degToRad(element.rotation.angle), false)
    }
    return { object: mesh }
}

/**
 * Apply UV mapping to the texture
 * @param x1 the top left coordinate X of the texture, between 0 and block_size
 * @param y1 the top left coordinate Y of the texture, between 0 and block_size
 * @param x2 the bottom right coordinate X of the texture, between 0 and block_size
 * @param y2 the bottom right coordinate Y of the texture, between 0 and block_size
 * @param geometry the geometry where apply UV mapping
 * @param face the face number to consider for the mapping
 * @param angle the rotation angle to apply to the texture
 */
function updateTextureCoords(x1: number, y1: number, x2: number, y2: number, geometry: THREE.BoxGeometry, face: string, angle: number) {

    let faceNumber = faceToIndex(face)

    const faceUvArray = rotateUv(angle,
        [x1 / block_size, y2 / block_size],
        [x2 / block_size, y2 / block_size],
        [x1 / block_size, y1 / block_size],
        [x2 / block_size, y1 / block_size]
    )

    const array = Float32Array.from(geometry.getAttribute("uv").array)
    for (let i = 0; i < 8; i++)
        array[faceNumber * 8 + i] = faceUvArray[i]

    geometry.setAttribute("uv", new THREE.BufferAttribute(array, 2));
    geometry.attributes.uv.needsUpdate = true;
}

/**
 * Converts Minecraft Face to number
 * @param face the Face to convert
 * @return an integer resulting of the conversion
 */
function faceToIndex(face: string): number {
    switch (face) {
        case McModel.FaceEnum.EAST :
            return 0
        case McModel.FaceEnum.WEST :
            return 1
        case McModel.FaceEnum.UP   :
            return 2
        case McModel.FaceEnum.DOWN :
            return 3
        case McModel.FaceEnum.SOUTH:
            return 4
        case McModel.FaceEnum.NORTH:
            return 5
    }
}

/**
 * Get coordinates of a face from coordinates of the Geometry
 * @param x1 the x1 coordinate of the geometry
 * @param y1 the y1 coordinate of the geometry
 * @param z1 the z1 coordinate of the geometry
 * @param x2 the x2 coordinate of the geometry
 * @param y2 the y2 coordinate of the geometry
 * @param z2 the z2 coordinate of the geometry
 * @param face the face to get coordinates
 * @return an object containing coordinates of the face where (x1, y1) are the coordinates of the bottom left corner and (x2, y2) of the top right corner
 */
function shapeToFaceCoords(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, face: string): { x1: number, y1: number, x2: number, y2: number } {
    switch (face) {
        case McModel.FaceEnum.EAST :
            return {x1: z1, y1: y1, x2: z2, y2: y2}
        case McModel.FaceEnum.WEST :
            return {x1: z1, y1: y1, x2: z2, y2: y2}
        case McModel.FaceEnum.UP   :
            return {x1: x1, y1: z1, x2: x2, y2: z2}
        case McModel.FaceEnum.DOWN :
            return {x1: x1, y1: z1, x2: x2, y2: z2}
        case McModel.FaceEnum.SOUTH:
            return {x1: x1, y1: y1, x2: x2, y2: y2}
        case McModel.FaceEnum.NORTH:
            return {x1: x1, y1: y1, x2: x2, y2: y2}
    }
}

/**
 * Rotates an UV mapping
 * @param rotation the rotation angle in degree, in [0, 90, 180, 270]. If another value, considers it as 0
 * @param topLeft the top left coordinates of the texture
 * @param topRight the top right coordinates of the texture
 * @param bottomLeft the bottom left coordinates of the texture
 * @param bottomRight the bottom right coordinates of the texture
 * @return an UV mapping array resulting of the rotation of the texture according to inputs
 */
function rotateUv(rotation: number, topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number], bottomRight: [number, number]): Array<number> {
    if (rotation == 90) {
        return [
            ...bottomLeft,
            ...topLeft,
            ...bottomRight,
            ...topRight
        ]
    } else if (rotation == 180) {
        return [
            ...bottomRight,
            ...bottomLeft,
            ...topRight,
            ...topLeft
        ]
    } else if (rotation == 270) {
        return [
            ...topRight,
            ...bottomRight,
            ...topLeft,
            ...bottomLeft
        ]
    }
    return [
        ...topLeft,
        ...topRight,
        ...bottomLeft,
        ...bottomRight
    ]
}
