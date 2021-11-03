// @author brunoimbrizi / http://brunoimbrizi.com

precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uColorRamp;
//uniform float uRampWidth;
uniform float uCosRampAngle;
uniform float uSinRampAngle;

varying vec2 vPUv;
varying vec2 vUv;

void main() {
	vec4 color = vec4(0.0);
	vec2 uv = vUv;
	vec2 puv = vPUv;

	// pixel color
	//vec4 colA = texture2D(uTexture, puv);

	// greyscale
	//float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
	//vec4 colB = vec4(grey, grey, grey, 1.0);
	// vec4 colB = gl_FragCoord; // or gl_PointCoord? use colorramp texture

	// circle
	float border = 0.3;
	float radius = 0.5;
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);

	/*
	// final color
	vec2 st = gl_PointCoord;
 	float mixValue = distance(st, vec2(0, 1));
	color = vec4(texture2D(
    	uColorRamp,
    	vec2((mixValue * (uRampWidth - 1.) + .5) / uRampWidth, 0.5)  // rampWidth is how many color stops there are
	).rgb, t);
	/*
	I found what's wrong. The formula expects image data like {
	  "0": 255,
	  "1": 140,
	  "2": 0,
	  "3": 57,
	  "4": 0,
	  "5": 156
	} (this is color(255, 140, 0) to color(57, 0, 156)
	with evenly spaced gradients, but I provided a full 256x1 image with different gradients. I need another formula.
	*/
	//float rootTwo = 1.41421356238;
	//vec2 rampVector = vec2(rootTwo * cos(uRampAngle), rootTwo * sin(uRampAngle));
	color = vec4(texture2D(
		uColorRamp,
		vec2(abs(puv.x * uCosRampAngle + puv.y * uSinRampAngle), 0.5)
	).rgb, t);

	gl_FragColor = color;
}