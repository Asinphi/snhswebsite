import "./info_page.scss";
import {Color, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import ParticleImage from "./particleImage";

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

initParticles()
