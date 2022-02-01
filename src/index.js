import "./index.scss";
import { Scene, WebGLRenderer, PerspectiveCamera, PMREMGenerator, UnsignedByteType, Raycaster, Vector2, LoadingManager,
Color } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import ParticleImage from "./particleImage.js";


gsap.registerPlugin(ScrollTrigger);

const isLargeDevice = () => window.innerWidth >= 992;

{ // ScrollTrigger
	gsap.to("div.boxes-subsection > div", {
		scrollTrigger: {
			trigger: "div.boxes-subsection",
			start: "top 90%"
		},
		opacity: "100%",
		transform: "translateY(0px)",
		stagger: function(index, target, list) {
			return (index == 0 ? 0 : 0.2)
		},
		duration: 1,
		ease: "power2.in",
	})
}

const canvas = document.getElementById("3d-viewport");
canvas.height = canvas.parentElement.innerHeight;
canvas.width = canvas.parentElement.clientWidth;

const scene = new Scene();
const renderer = new WebGLRenderer({canvas, alpha: true, premultipliedAlpha: false});
renderer.setClearColor(0x000000, 0);
const fov = 75;
const aspect = canvas.width / canvas.height;
const near = 0.1; // 10000
const far = 50000; // 14000
const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 12000, 0);
camera.lookAt(0, 0, 0);
camera.rotateZ(-Math.PI/2);

const loadManager = new LoadingManager();

const loader = new GLTFLoader(loadManager);
let root, rootChild;
loader.load("/assets/3d/CBHS_logo.glb", (glb) => {
	root = glb.scene;
	rootChild = root.children[0];
	root.rotation.set(0, -Math.PI/2, 0);
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
		onComplete: () => {
			initParticles();
			playLogoAnimation();
			setTimeout(() => {
				const checkbox = document.querySelector('.panel-check')
				if (!checkbox.checked && !checkbox.initialCheck) {
					checkbox.checked = true;
					checkbox.dispatchEvent(new Event('change'));
				}
			}, 3200)
		},
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
	}, "<").to(document.querySelector(".viewport-inner-container img"), {
		opacity: 0.7,
	}, "<");
}

{
	const panel = document.querySelector('.panel');
	const checkbox = document.getElementById('news-panel-toggle')
	const expandPanelBtn = document.querySelector('.btn-panel');
	checkbox.addEventListener('change', function() {
		this.initialCheck = true;
		if (!this.checked) {
			panel.style.transform = isLargeDevice() ? "translateX(-100%)" : "translateY(100%)";
			panel.style.transition = "transform 1s ease-out";
			setTimeout(() => panel.style.transition = "", 1000);
			setTimeout(() => panel.style.transform = "", 2000);
		} else
			panel.style.transform = "";
	});

	document.querySelector('.panel .btn-close').addEventListener('click', () => {
		checkbox.checked = false;
		checkbox.dispatchEvent(new Event('change'));
	});

	document.querySelector(".panel-hover").addEventListener('click', function(e) {
		if (checkbox.checked)
			return;
		this.style.pointerEvents = "none";
		expandPanelBtn.style.pointerEvents = "all"; // Allow it to be hit by elementFromPoint
		if (expandPanelBtn === document.elementFromPoint(e.clientX, e.clientY)) {
			checkbox.checked = true;
			checkbox.dispatchEvent(new Event('change'));
		}
		this.style.pointerEvents = "";
		expandPanelBtn.style.pointerEvents = "";
	});
}

{
	const closeBtn = document.querySelector("#news-panel .btn-close");
	const carouselEl = document.getElementById("news-panel");
	document.querySelectorAll("#news-panel button").forEach(el => {
		if (el === closeBtn)
			return;
		el.addEventListener('click', () => {
			bootstrap.Carousel.getInstance(carouselEl).pause();
		});
	});
}

function resizeCanvas() {
	const height = canvas.parentElement.clientHeight;
	const width = canvas.parentElement.clientWidth;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height, false);
}
resizeCanvas();
//window.addEventListener('resize', resizeCanvas);
//new ResizeObserver(resizeCanvas).observe(document.querySelector(".viewport-inner-container"));

const raycaster = new Raycaster();
raycaster.far = 50000;
const mouse = new Vector2(-1, 0);
const lookAt = new Vector2(-1, 0);

window.addEventListener('mousemove', function(event) {
	const boundingBox = canvas.getBoundingClientRect();
	mouse.x = ((event.clientX - boundingBox.left) / canvas.width) * 2 - 1;
	mouse.y = - ((event.clientY - boundingBox.top) / canvas.height) * 2 + 1;
});

let isMouseOver = false;
let mouseOverDebounce = 0;
let mouseTween;
gsap.ticker.add((time, deltaTime) => {
	if (canvas.width !== canvas.parentElement.clientWidth || canvas.height !== canvas.parentElement.clientHeight)
		resizeCanvas();
	const dt = 1.0 - Math.pow(0.9, deltaTime * (60 / 1000));
	lookAt.x += (mouse.x - lookAt.x) * dt;
  	lookAt.y += (mouse.y - lookAt.y) * dt;
	if (rootChild !== undefined)
		rootChild.rotation.set(-lookAt.y * 0.1, 0, -lookAt.x * 0.1);
	raycaster.setFromCamera(mouse, camera);
	if (raycaster.intersectObjects(scene.children, true).length > 0 && time - mouseOverDebounce > 0.3) {
		if (!isMouseOver) {
			isMouseOver = true;
			mouseOverDebounce = time;
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
				x: Math.round(root.rotation.x / (2 * Math.PI)) * 2 * Math.PI,
			})
		}
	} else if (isMouseOver && time - mouseOverDebounce > 0.3) {
		isMouseOver = false;
		mouseOverDebounce = time;
		root.rotation.x = root.rotation.x % (2 * Math.PI);
		if (mouseTween)
			mouseTween.kill();
		mouseTween = gsap.to(root.position, {
			duration: 1,
			ease: "power2.out",
			y: 0,
			x: 600,
			onComplete: () => {
				if (!isMouseOver) {
					root.rotation.x = 0;
					logoAnim.seek("oscillation");
					logoAnim.resume();
				}
			}
		});
		gsap.to(root.rotation, { // In case the mouse over animation doesn't complete
			duration: 1,
			ease: "power2.out",
			x: Math.round(root.rotation.x / (2 * Math.PI)) * 2 * Math.PI,
		})
	}
	renderer.render(scene, camera);
});

function initParticles() { // ParticleImage
	const canvas = document.getElementById('background-canvas');
	canvas.height = canvas.parentElement.clientHeight;
	canvas.width = canvas.parentElement.clientWidth;
	const scene = new Scene();
	const camera = new PerspectiveCamera(50, canvas.parentElement.innerWidth / canvas.parentElement.innerHeight, 1, 10000);
	camera.position.z = 300;
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true});

	function fovHeight() {
		return 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
	}

	let gradientStops = [
		{ position: 0, color: new Color("rgb(68, 13, 78)") },
		{ position: .21, color: new Color("rgb(251, 218, 252)") },
		{ position: .46, color: new Color("rgb(233, 236, 36)") },
		{ position: .72, color: new Color("rgb(74, 16, 115)") },
		{ position: .93, color: new Color("rgb(121, 15, 214)") },
		{ position: 1.0, color: new Color("rgb(121, 15, 214)") }
	]

	const particleImg = new ParticleImage(fovHeight(), null, gradientStops, 145 * (Math.PI / 180));
	scene.add(particleImg.container);

	function resize() {
		camera.aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
		camera.updateProjectionMatrix();
		particleImg.fovHeight = fovHeight();
		renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
		particleImg.resize();
	}
	resize();
	//window.addEventListener('resize', resize);
	//new ResizeObserver(resize).observe(document.querySelector('.viewport-outer-container'));

	particleImg.init('/assets/FrankieSnippet-removebg.png');

	gsap.ticker.add((time, deltaTime) => {
		if (canvas.width !== canvas.parentElement.clientWidth || canvas.height !== canvas.parentElement.clientHeight)
			resize();
		particleImg.update(deltaTime / 1000);
		renderer.render(scene, camera);
	});
}
