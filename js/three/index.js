// let THREE = require('three');
import * as THREE from 'three/build/three.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector3 } from 'three/build/three.module';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';


import { CustomShader } from './CustomShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

let scene, camera, renderer, composer,  theta, controls;
let bwComposer;
let faceLayer, edgeLayer;
const FACE_LAYER = 0;
const EDGE_LAYER = 1;



class Polihedron {
    constructor(position, geometry, meshMat, lineMat) {
        let meshMaterial, lineMaterial;


        if (meshMat == null) {
            meshMaterial = new THREE.MeshPhongMaterial({
                color: 0x156289,
                emissive: 0x072534,
                flatShading: true
            });
        } else {
            meshMaterial = meshMat;
        }

        if(lineMat == null) {
            lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                linewidth: 2,
                opacity: 0.75
            });
        } else {
            lineMaterial = lineMat;
        }

        this.group = new THREE.Group();
        let wireframe = new THREE.EdgesGeometry(geometry);
        this.group.add( new THREE.LineSegments(wireframe, lineMaterial));
        this.group.add( new THREE.Mesh(geometry, meshMaterial));
        this.group.position.copy(position);
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
    camera.position.z = 5;
    theta = 0;

    faceLayer = new THREE.Layers();
    faceLayer.set(FACE_LAYER);

    edgeLayer = new THREE.Layers();
    edgeLayer.set(EDGE_LAYER);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#000000");
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest( true );


    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        if ( ! sliderMoved ) sliderPos = window.innerWidth / 2;
    });

    let light = new THREE.PointLight(0xFFFFFF, 2, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    let poly_lookup = function(n) {
        switch (n) {
            case 0: 
                return new THREE.TetrahedronBufferGeometry(1, 0);
            case 1:
                return new THREE.BoxBufferGeometry(1, 0);
            case 2:
                return new THREE.OctahedronBufferGeometry(1, 0);
            case 3:
                return new THREE.DodecahedronBufferGeometry(1, 0);
            case 4:
            default:
                return new THREE.IcosahedronBufferGeometry(1, 0);
        }
    }
    for(let i=0; i < 5; i++) {
        let poly = new Polihedron(new Vector3(2*(i - 2.0), 0, 0), poly_lookup(i));
        poly.group.traverse((child) => {
            if(child instanceof THREE.Mesh)
                child.layers.set(FACE_LAYER);
            else if(child instanceof THREE.LineSegments)
                child.layers.set(EDGE_LAYER);
        })
        scene.add(poly.group);
    }


    controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 0.1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI;
    
    //Post-processing
    let renderPass = new RenderPass(scene, camera);
    let bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0;
    bloomPass.strength = 3;
    bloomPass.radius = 0;
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    let customPass = new ShaderPass(CustomShader);
    composer.addPass(customPass);
    composer.addPass(new GlitchPass(0.5));
    //composer.addPass(bloomPass);
    //White and black
    bwComposer = new EffectComposer(renderer);
    let bwPass = new ShaderPass({

        uniforms: {

            "tDiffuse": { value: null },
            "opacity": { value: 1.0 }

        },
        vertexShader: `varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }`,
        fragmentShader: `uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

            vec4 texel = texture2D( tDiffuse, vUv );
            vec4 invTexel = vec4(vec3(1.0) - texel.rgb, texel.a);
			gl_FragColor = opacity * invTexel;

		}`
    });
    bwComposer.addPass(renderPass);
    bwComposer.addPass(bwPass);

}


let animate = function(prevTime, currTime) {
    const dt = (currTime-prevTime)/1000.0;
    render();

    theta += dt;
    requestAnimationFrame((timestamp) => animate(currTime, timestamp));
}

function render() {
    camera.layers.enable(FACE_LAYER);
    camera.layers.enable(EDGE_LAYER);
    renderer.setScissor( 0, 0, sliderPos, window.innerHeight );
    composer.render(scene, camera);

    camera.layers.set(EDGE_LAYER);
    renderer.setScissor( sliderPos, 0, window.innerWidth, window.innerHeight );
    bwComposer.render(scene, camera);
}

init();
animate(0, 0);

