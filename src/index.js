import "./style.scss"
import { Scene, WebGLRenderer, PerspectiveCamera, HemisphereLight, AmbientLight, Clock, Box3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'


gsap.registerPlugin(ScrollTrigger);


const canvas = document.getElementById("3d-viewport");
canvas.height = window.innerHeight;
canvas.width = document.body.clientWidth;

const scene = new Scene();
const renderer = new WebGLRenderer({canvas, alpha: false});
renderer.setClearColor(0x808080);
const fov = 75;
const aspect = canvas.width / canvas.height;
const near = 0.1;
const far = 1000000;
const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 16000);

const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 10000000;
const light = new HemisphereLight(skyColor, groundColor, intensity);
const ambientLight = new AmbientLight(0xffffff);
scene.add(light);
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.load("/assets/3d/CBHS_logo.glb", (glb) => {
    scene.add(glb.scene);
    glb.scene.rotation.x = Math.PI/2;
    const box = new Box3().setFromObject(glb.scene);
    console.log(box.min, box.max, box.getSize());
});

const controls = new FlyControls(camera, canvas);
controls.movementSpeed = 2000;
controls.rollSpeed = 0.1;
controls.dragToLook = true;
const clock = new Clock();

function resizeCanvas() {
    canvas.height = window.innerHeight;
    canvas.width = document.body.clientWidth;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    console.log(camera.aspect);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function render() {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();
