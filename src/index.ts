import * as THREE from 'three';
import {load} from './renderer/ModelRenderer';
import {MapControls, OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import "./sidebar"

import "./styles/index.css"
import {properties} from "./resources/Properties";
import {BoxGeometry, BoxHelper, Material} from "three";
import { rotatingAnim } from './sidebar';

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, object: THREE.Object3D, axesHelper: THREE.AxesHelper, gridHelper: THREE.GridHelper, blockFrameHelper: THREE.Mesh, control: OrbitControls;
const container = document.getElementById('wrapper')

/**
 * Load the model <i>model</i> in the scene
 * @param model
 */
export async function loadModel(model: string): Promise<any> {
    return load(model, scene)
        .then(o => {
            cleanupObject3D(object)
            object = o
            scene.add(object)
            control.autoRotateSpeed = properties.max_orbit_speed
        })
}

/**
 * Initialize the scene
 */
function initialize() {
    let containerSize = container.getBoundingClientRect()

    /* Camera */
    camera = new THREE.PerspectiveCamera(60, containerSize.width / containerSize.height, 1, 1000);
    camera.position.x = -25;
    camera.position.y = 25;
    camera.position.z = 50;

    scene = new THREE.Scene();

    /* Renderer */
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor(properties.background_color)

    /* Light */
    const light = new THREE.AmbientLight(0xFFFFFF)
    light.position.set(40, 40, 40)
    scene.add(light);

    /* Display Utilities */
    dispAxes(properties.default_settings.display_axes)
    dispGrid(properties.default_settings.display_grid)
    dispBlockFrame(properties.default_settings.display_block_frame)

    /* Controls */
    control = new OrbitControls(camera, renderer.domElement);
    control.autoRotate = true
    control.enableDamping = true
    control.dampingFactor = 0.27
    control.addEventListener('end', function(){
        control.autoRotateSpeed = 0.01
    })

    /* Events */
    const resizeObserver = new ResizeObserver(entries => {
        let entry = entries[0]
        renderer.setSize(entry.contentRect.width, entry.contentRect.height);
        camera.aspect = entry.contentRect.width / entry.contentRect.height;
        camera.updateProjectionMatrix();
      });

    /* HTML */
    container.appendChild(renderer.domElement)
    resizeObserver.observe(container);
    renderer.setSize(containerSize.width, containerSize.height);
    renderer.setAnimationLoop(animation);
}

export function dispAxes(enabled: boolean) {
    if(enabled) {
        axesHelper = new THREE.AxesHelper(15);
        scene.add(axesHelper);
    } else if (axesHelper) {
        scene.remove(axesHelper);
        axesHelper.dispose();
    }
}

export function dispGrid(enabled: boolean) {
    if(enabled) {
        gridHelper = new THREE.GridHelper(properties.model.block_size, properties.model.block_size);
        scene.add(gridHelper);
        gridHelper.position.y = -properties.model.block_size / 2
    } else if (gridHelper) {
        scene.remove(gridHelper);
        axesHelper.dispose();
    }
}

export function dispBlockFrame(enabled: boolean) {
    if(enabled) {
        const geo = new THREE.BoxGeometry(properties.model.block_size, properties.model.block_size, properties.model.block_size);
        const material = new THREE.MeshBasicMaterial({
            color: 0x192327,
            wireframe: true
        });
        blockFrameHelper = new THREE.Mesh(geo, material)
        scene.add(blockFrameHelper);
    } else if (blockFrameHelper) {
        scene.remove(blockFrameHelper);
        cleanupMesh(blockFrameHelper)
    }
}


function cleanupObject3D(object: THREE.Object3D) {
    scene.remove(object)
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

function orbitSpeedEffect(){
    if (control.autoRotateSpeed < properties.orbit_speed){
        control.autoRotateSpeed *= 1.05
        if (control.autoRotateSpeed > properties.orbit_speed){
            control.autoRotateSpeed = properties.orbit_speed
        }
        return
    }
    if (control.autoRotateSpeed > properties.orbit_speed){
        control.autoRotateSpeed /= 1.05
        if (control.autoRotateSpeed < properties.orbit_speed){
            control.autoRotateSpeed = properties.orbit_speed
        }
        return
    }
}


function animation(time: number) {
    if (rotatingAnim){
        orbitSpeedEffect()
        control.update()
    }
    renderer.render(scene, camera);

}

window.addEventListener("load", function(){
    initialize();
    loadModel(properties.default_settings.model)
})
