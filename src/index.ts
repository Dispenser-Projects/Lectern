import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {load} from './ModelLoader';
import "./sidebar"

import "./styles/index.css"

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;

initialize();
load("slime_block", scene)

/**
 * Load the model <i>model</i> in the scene
 * @param model
 */
export function loadModel(model: string) {
    scene.clear()
    load(model, scene)
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
    renderer.setClearColor("#e5e5e5")
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    /* Light */
    const light = new THREE.AmbientLight(0xFFFFFF)
    light.position.set(40, 40, 40)
    scene.add(light);

    /* Axes */
    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

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


function animation(time: number) {
    renderer.render(scene, camera);

}
