// adapted from https://github.com/brunoimbrizi/interactive-particles/blob/master/src/scripts/webgl/particles/Particles.js

import { Object3D, TextureLoader, LinearFilter, RGBFormat, Vector2, InstancedBufferGeometry, RawShaderMaterial,
BufferAttribute, InstancedBufferAttribute, Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';

import vShader from './shaders/particle.vert';
import fShader from './shaders/particle.frag';

//import TouchTexture from './TouchTexture';

export default class ParticleImage {

	constructor(fovHeight, webgl) {
		this.fovHeight = fovHeight;
		this.webgl = webgl;
		this.container = new Object3D();
	}

	init(src) {
		const loader = new TextureLoader();

		loader.load(src, (texture) => {
			this.texture = texture;
			this.texture.minFilter = LinearFilter;
			this.texture.magFilter = LinearFilter;
			this.texture.format = RGBFormat;

			this.width = texture.image.width;
			this.height = texture.image.height;

			this.initPoints(true);
			//this.initHitArea();
			//this.initTouch();
			//this.resize();
			this.show();
		});
	}

	initPoints(discard) {
		this.numPoints = this.width * this.height;

		let numVisible = this.numPoints;
		let threshold = 0;
		let originalColors;

		if (discard) {
			// discard pixels darker than threshold #22
			numVisible = 0;
			threshold = 34;

			const img = this.texture.image;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			canvas.width = this.width;
			canvas.height = this.height;
			ctx.scale(1, -1);
			ctx.drawImage(img, 0, 0, this.width, this.height * -1);

			const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			originalColors = Float32Array.from(imgData.data);

			for (let i = 0; i < this.numPoints; i++) {
				if (originalColors[i * 4 + 0] > threshold) numVisible++;
			}

			console.log('numVisible', numVisible, this.numPoints);
		}

		const uniforms = {
			uTime: { value: 0 },
			uRandom: { value: 1.0 },
			uDepth: { value: 2.0 },
			uSize: { value: 0.0 },
			uTextureSize: { value: new Vector2(this.width, this.height) },
			uTexture: { value: this.texture },
			uTouch: { value: null },
		};

		const material = new RawShaderMaterial({
			uniforms,
			vertexShader: vShader,
			fragmentShader: fShader,
			depthTest: false,
			transparent: true,
			// blending: THREE.AdditiveBlending
		});

		const geometry = new InstancedBufferGeometry();

		// positions
		const positions = new BufferAttribute(new Float32Array(4 * 3), 3);
		positions.setXYZ(0, -0.5,  0.5,  0.0);
		positions.setXYZ(1,  0.5,  0.5,  0.0);
		positions.setXYZ(2, -0.5, -0.5,  0.0);
		positions.setXYZ(3,  0.5, -0.5,  0.0);
		geometry.setAttribute('position', positions);

		// uvs
		const uvs = new BufferAttribute(new Float32Array(4 * 2), 2);
		uvs.setXYZ(0,  0.0,  0.0);
		uvs.setXYZ(1,  1.0,  0.0);
		uvs.setXYZ(2,  0.0,  1.0);
		uvs.setXYZ(3,  1.0,  1.0);
		geometry.setAttribute('uv', uvs);

		// index
		geometry.setIndex(new BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

		const indices = new Uint16Array(numVisible);
		const offsets = new Float32Array(numVisible * 3);
		const angles = new Float32Array(numVisible);

		for (let i = 0, j = 0; i < this.numPoints; i++) {
			if (discard && originalColors[i * 4 + 0] <= threshold) continue;

			offsets[j * 3 + 0] = i % this.width;
			offsets[j * 3 + 1] = Math.floor(i / this.width);

			indices[j] = i;

			angles[j] = Math.random() * Math.PI;

			j++;
		}

		geometry.setAttribute('pindex', new InstancedBufferAttribute(indices, 1, false));
		geometry.setAttribute('offset', new InstancedBufferAttribute(offsets, 3, false));
		geometry.setAttribute('angle', new InstancedBufferAttribute(angles, 1, false));

		this.object3D = new Mesh(geometry, material);
		this.container.add(this.object3D);
	}

	initTouch() {
		// create only once
		if (!this.touch) this.touch = new TouchTexture(this);
		this.object3D.material.uniforms.uTouch.value = this.touch.texture;
	}

	initHitArea() {
		const geometry = new PlaneGeometry(this.width, this.height, 1, 1);
		const material = new MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
		material.visible = false;
		this.hitArea = new Mesh(geometry, material);
		this.container.add(this.hitArea);
	}

	addListeners() {
		this.handlerInteractiveMove = this.onInteractiveMove.bind(this);

		this.webgl.interactive.addListener('interactive-move', this.handlerInteractiveMove);
		this.webgl.interactive.objects.push(this.hitArea);
		this.webgl.interactive.enable();
	}

	removeListeners() {
		this.webgl.interactive.removeListener('interactive-move', this.handlerInteractiveMove);

		const index = this.webgl.interactive.objects.findIndex(obj => obj === this.hitArea);
		this.webgl.interactive.objects.splice(index, 1);
		this.webgl.interactive.disable();
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update(delta) {
		if (!this.object3D) return;
		if (this.touch) this.touch.update();

		this.object3D.material.uniforms.uTime.value += delta;
	}

	show(time = 1.0) {
		// reset
		gsap.fromTo(this.object3D.material.uniforms.uSize, { duration: time, value: 0.5 }, { value: 1.5 });
		gsap.to(this.object3D.material.uniforms.uRandom, { duration: time, value: 2.0 });
		gsap.fromTo(this.object3D.material.uniforms.uDepth, { duration: time * 1.5, value: 40.0 }, { value: 4.0 });

		//this.addListeners();
		console.log("Shown", this.width, this.height);
	}

	hide(_destroy, time = 0.8) {
		return new Promise((resolve, reject) => {
			gsap.to(this.object3D.material.uniforms.uRandom, time, { value: 5.0, onComplete: () => {
				if (_destroy) this.destroy();
				resolve();
			} });
			gsap.to(this.object3D.material.uniforms.uDepth, time, { value: -20.0, ease: Quad.easeIn });
			gsap.to(this.object3D.material.uniforms.uSize, time * 0.8, { value: 0.0 });

			this.removeListeners();
		});
	}

	destroy() {
		if (!this.object3D) return;

		this.object3D.parent.remove(this.object3D);
		this.object3D.geometry.dispose();
		this.object3D.material.dispose();
		this.object3D = null;

		if (!this.hitArea) return;

		this.hitArea.parent.remove(this.hitArea);
		this.hitArea.geometry.dispose();
		this.hitArea.material.dispose();
		this.hitArea = null;
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		if (!this.object3D) return;

		const scale = this.fovHeight / this.height;
		this.object3D.scale.set(scale, scale, 1);
		this.hitArea.scale.set(scale, scale, 1);
	}

	onInteractiveMove(e) {
		const uv = e.intersectionData.uv;
		if (this.touch) this.touch.addTouch(uv);
	}
}