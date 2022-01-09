import * as THREE from 'three';
import {Texture, TextureLoader} from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {load} from './ModelLoader';

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;

init();

document.getElementById("validateButton").onclick = loadModel


export function loadModel() {
    scene.clear()
    load((<HTMLInputElement>document.getElementById("modelInput")).value, scene)
}

function init() {

    const container = document.getElementById('wrapper')
    console.log(container)

    //window.addEventListener('resize', viewer.resize)

    const element = document.createElement('div')
    element.setAttribute('style', 'width:100%;')

    container.appendChild(element)


    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = -25;
    camera.position.y = 25;
    camera.position.z = 25;
    //camera.position.applyEuler(new Euler(MathUtils.degToRad(30), MathUtils.degToRad(225)))

    scene = new THREE.Scene();

    load("beacon", scene)

    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor("#e5e5e5")

    const light = new THREE.AmbientLight(0xFFFFFF)
    light.position.set(40, 40, 40)
    scene.add(light);

    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    new OrbitControls(camera, renderer.domElement);
    //controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    /*controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;*/

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    element.appendChild(renderer.domElement)

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    //document.body.appendChild( renderer.domElement );



}


function animation(time: number) {

    /*mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;*/

    renderer.render(scene, camera);

}
