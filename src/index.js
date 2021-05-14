import "./style.scss";
import { Scene, WebGLRenderer, PerspectiveCamera, Clock, PMREMGenerator, UnsignedByteType, Raycaster, Vector2,
        LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';


gsap.registerPlugin(ScrollTrigger);

const isLargeDevice = window.innerWidth >= 992;

const canvas = document.getElementById("3d-viewport");
canvas.height = window.innerHeight;
canvas.width = document.body.clientWidth;
console.log("document.body.clientWidth:", document.body.clientWidth);

const scene = new Scene();
const renderer = new WebGLRenderer({canvas, alpha: true, premultipliedAlpha: false});
renderer.setClearColor(0x000000, 0);
const fov = 75;
const aspect = canvas.width / canvas.height;
const near = 0.1; // 8000
const far = 50000; // 12000
const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10000, 0);
camera.lookAt(0, 0, 0);
camera.rotateZ(-Math.PI/2);

const loadManager = new LoadingManager();

const loader = new GLTFLoader(loadManager);
let root;
loader.load("/assets/3d/CBHS_logo.glb", (glb) => {
    root = glb.scene;
    root.children[0].rotation.set(0, -Math.PI/2, 0);
    root.traverse((child) => {
        if (child.isMesh)
            child.material.envMapIntensity = 1.5;
    });
    scene.add(root);
}, (xhr) => {
    document.querySelector(".progress-bar").style.width = `${xhr.loaded * 100 / xhr.total}%`;
});

new RGBELoader(loadManager).setDataType(UnsignedByteType).load("/assets/3d/envMap/Autumn Forest_1k.hdr", (texture) => {
    const pmremGenerator = new PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromEquirectangular(texture).texture;
});

const filters = {
    brightness: "brightness(0.4)",
    blur: "blur(5px)",
};
// Chrome had weird rendering bug when blur filter is combined with parallax's transform

const logoAnim = gsap.timeline({
    repeat: -1,
    paused: true,
})
function playLogoAnimation() {
    logoAnim.to(root.rotation, {
        duration: 3.5,
        ease: "power2.inOut",
        x: 3 * 2 * Math.PI,
        onComplete: () => {
            root.rotation.x = 0;
        }
    }).to(root.position, {
        duration: 1.5,
        ease: "power2.inOut",
        x: 1800,
    }, 0).to(root.position, {
        duration: 1.7,
        ease: "power2.inOut",
        x: -1800
    }, ">").to(root.position, {
        x: 600,
        duration: 3.5,
        ease: "sine.inOut",
    }, ">").add("oscillation").to(root.position, {
        x: -600,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 2,
    }).to(root.position, {
        x: 0,
        duration: 1.75,
        ease: "sine.in",
    });
    logoAnim.resume();
}
loadManager.onLoad = () => {
    gsap.timeline({
        autoRemoveChildren: true,
        onComplete: playLogoAnimation,
        defaults: {
            duration: 1.5,
            ease: "power2.in",
        }
    }).to(".progress", {
        opacity: 0,
    }).to(canvas, {
        opacity: 1,
    }, "-=0.8").to(filters, {
        brightness: "brightness(1.0)",
        blur: "blur(0px)",
        onUpdate: () => {
            canvas.parentElement.parentElement.style.filter = `${filters.brightness}`;
            canvas.style.filter = `${filters.blur}`;
        }
    }, "<");
}

const newsPanel = document.querySelector('.important-news');
const newsTl = gsap.timeline({
    smoothChildTiming: true,
    autoRemoveChildren: false,
    defaults: {
        duration: 0.5,
        ease: "power2.out",
    }
});
function toggleNewsPanel(open = true) {
    if (open) {
        newsTl.to(canvas.parentElement, {
            width: canvas.parentElement.clientWidth - newsPanel.clientWidth,
            onUpdate: () => {
                resizeCanvas();
            }
        }).to(newsPanel, {
            transform: `translate${isLargeDevice ? 'X' : 'Y'}(0px)`,
        }, '<');
    } else {
        newsTl.reverse();
    }
}

/*
const controls = new FlyControls(camera, canvas);
controls.movementSpeed = 2000;
controls.rollSpeed = 0.1;
controls.dragToLook = true;
*/

const clock = new Clock();

function resizeCanvas() {
    const height = canvas.parentElement.clientHeight;
    const width = canvas.parentElement.clientWidth;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const raycaster = new Raycaster();
raycaster.far = 50000;
const mouse = new Vector2(-1, -1);

window.addEventListener('mousemove', function(event) {
    const boundingBox = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - boundingBox.left) / canvas.width) * 2 - 1;
    mouse.y = - ((event.clientY - boundingBox.top) / canvas.height) * 2 + 1;
});

let isMouseOver = false;
let mouseOverDebounce = 0;
let mouseTween;
gsap.ticker.add(() => {
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.intersectObjects(scene.children, true).length > 0 && clock.elapsedTime - mouseOverDebounce > 0.3) {
        if (!isMouseOver) {
            isMouseOver = true;
            mouseOverDebounce = clock.elapsedTime;
            logoAnim.pause();
            root.rotation.x = root.rotation.x % (2 * Math.PI);
            if (mouseTween)
                mouseTween.kill();
            mouseTween = gsap.to(root.position, {
                duration: 0.4,
                ease: "sine.out",
                y: 1000,
                x: 0,
            });
            gsap.to(root.rotation, {
                duration: 0.4,
                ease: "sine.out",
                x: 0,
            })
        }
    } else if (isMouseOver && clock.elapsedTime - mouseOverDebounce > 0.3) {
        isMouseOver = false;
        mouseOverDebounce = clock.elapsedTime;
        if (mouseTween)
            mouseTween.kill();
        mouseTween = gsap.to(root.position, {
            duration: 1,
            ease: "power2.out",
            y: 0,
            x: 600,
            onComplete: () => {
                if (!isMouseOver) {
                    logoAnim.seek("oscillation");
                    logoAnim.resume();
                }
            }
        });
        gsap.to(root.rotation, { // In case the mouse over animation doesn't complete
            duration: 1,
            ease: "power2.out",
            x: 0,
        })
    }
    //controls.update(clock.getDelta());
    clock.getDelta();
    renderer.render(scene, camera);
});
