import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {load} from './ModelLoader';
import "./sidebar"

import "./styles/index.css"
import {properties} from "./resources/Properties";
import {BoxGeometry, BoxHelper, Material} from "three";

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, object: THREE.Object3D, axesHelper: THREE.AxesHelper, gridHelper: THREE.GridHelper, blockFrameHelper: THREE.Mesh;

initialize();
loadModel(properties.default_model)


/**
 * Load the model <i>model</i> in the scene
 * @param model
 */
export function loadModel(model: string): void {
    let modelButton = document.getElementById("modelValidateButton")
    modelButton.innerText = modelButton.dataset.loadinglabel
    scene.remove(object)
    cleanupObject3D(object)
    load(model, scene)
        .then(o => object = o)
        .then(o => scene.add(o))
        .then(() => modelButton.innerText = modelButton.dataset.submitlabel)
        .catch(() => modelButton.innerText = modelButton.dataset.notfoundlabel)
}

/**
 * Initialize the scene
 */
function initialize() {

    /* Camera */
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = -25;
    camera.position.y = 25;
    camera.position.z = 25;

    scene = new THREE.Scene();

    /* Renderer */
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor(properties.background_color)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    /* Light */
    const light = new THREE.AmbientLight(0xFFFFFF)
    light.position.set(40, 40, 40)
    scene.add(light);

    /* Axes */
    dispAxes(true)
    dispGrid(true)

    /* Controls */
    new OrbitControls(camera, renderer.domElement);

    /* HTML */
    const container = document.getElementById('wrapper')
    const element = document.createElement('div')
    container.appendChild(element)
    element.appendChild(renderer.domElement)

    /* Events */
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

export function dispAxes(enabled: boolean) {
    if(enabled) {
        axesHelper = new THREE.AxesHelper(15);
        scene.add(axesHelper);
    } else {
        scene.remove(axesHelper);
        axesHelper.dispose();
    }
}

export function dispGrid(enabled: boolean) {
    if(enabled) {
        gridHelper = new THREE.GridHelper(properties.block_size, properties.block_size);
        scene.add(gridHelper);
        gridHelper.position.y = -properties.block_size / 2
    } else {
        scene.remove(gridHelper);
        axesHelper.dispose();
    }
}

export function dispBlockFrame(enabled: boolean) {
    if(enabled) {
        const geo = new THREE.BoxGeometry(properties.block_size, properties.block_size, properties.block_size);
        const material = new THREE.MeshBasicMaterial({
            color: 0x192327,
            wireframe: true
        });
        blockFrameHelper = new THREE.Mesh(geo, material)
        scene.add(blockFrameHelper);
    } else {
        scene.remove(blockFrameHelper);
        cleanupMesh(blockFrameHelper)
    }
}


function cleanupObject3D(object: THREE.Object3D) {
    if(object !== undefined)
        (object as THREE.Group).children.map(c => cleanupMesh(c as THREE.Mesh))
}

function cleanupMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    mesh.material instanceof THREE.Material ? cleanupMaterial(mesh.material) : mesh.material.forEach(cleanupMaterial)
}

function cleanupMaterial(material: THREE.Material) {
    if ( Array.isArray( material ) )
        material.forEach(t => t.dispose())
    material.dispose();
}


function animation(time: number) {
    renderer.render(scene, camera);

}
