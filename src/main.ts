import { ACESFilmicToneMapping, EquirectangularReflectionMapping, PerspectiveCamera, Scene, WebGLRenderer, sRGBEncoding } from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

let camera: THREE.Camera, scene: THREE.Object3D<THREE.Event>, renderer: WebGLRenderer, clock: THREE.Clock, mixer: THREE.AnimationMixer;
var boxes = [];
var bb = [];
var collisions = [[]];
var lambda = 0.01;

var audio = document.getElementById("audio");
var playlist = "/asset/leva-eternity-149473.mp3";
var analyser;
var dataArray;
play(playlist);

init();
//animate();
function init() {
    const container = document.querySelector("#app");
    document.body.appendChild(container);

    camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 10, 100);
    camera.position.set(50, 20, 70);

    scene = new Scene();
    clock = new THREE.Clock();

    new THREE.TextureLoader()
        .setPath('asset/')
        .load('anime_art_style_pokemon.jpeg', (texture) => {

            texture.mapping = EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;
            /*
            for(let i = 0; i < 100; i++) {
              boxes.push(addCube(randomIntFromInterval(-0.1, 0.1, 1), randomIntFromInterval(-0.1, 0.1, 1), randomIntFromInterval(-0.1, 0.1, 1)))}
              */
            for(let i = 0; i < 1; i++) {
              boxes.push(addCube(randomIntFromInterval(-0.5, 0.5, 1), randomIntFromInterval(-0.5, 0.5, 1), randomIntFromInterval(-0.5, 0.5, 1)))}
              
            
            boxes.forEach(b => {
              bb.push(new THREE.Box3().setFromObject(b));
            });
            console.log(boxes);
        });

    // renderer
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.target.set(0, 0, - 0.2);
    controls.update();

    window.addEventListener('resize', onWindowResize);

    animate();

}

function addCube(px, py, pz) {
  var colorandom = new THREE.Color(0xffffff);
  colorandom.setHex(Math.random() * 0xffffff);
  var geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); //x,y,z
  var boxMaterial = new THREE.MeshBasicMaterial({ color: colorandom });
  var cube = new THREE.Mesh(geometry, boxMaterial);

  cube.position.set(px, py, pz);
  cube.geometry.computeBoundingBox(); // null sinon
  scene.add(cube);
  return cube;
  //console.log(cube);
}

function randomIntFromInterval(min, max, decimalPlaces) { // min and max included 
  return (Math.random() * (max - min) + min).toFixed(decimalPlaces) * 1;
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    /*
    for (let i = 0; i < bb.length; i++) {
      for (let j = 0; j < bb.length; j++) {
        if(bb[i] != bb[j] && bb[i].intersectsBox(bb[j])) {
          boxes[i].position.x = boxes[i].position.x + randomIntFromInterval(-0.01, 0.01, 3);
          boxes[i].position.y = boxes[i].position.y + randomIntFromInterval(-0.01, 0.01, 3);
          boxes[i].position.z = boxes[i].position.z + randomIntFromInterval(-0.01, 0.01, 3);
          bb[i].setFromObject(boxes[i]);
        }
      }
    }*/

    analyser.getByteFrequencyData(dataArray);

    var lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
    var upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);
    var sumLowerHalfArray = 0;
    var sumUpperHalfArray = 0;

    for(var i = 0; i < lowerHalfArray.length; i++) {
      sumLowerHalfArray += lowerHalfArray[i];
    }
    for(var i = 0; i < upperHalfArray.length; i++) {
      sumUpperHalfArray += upperHalfArray[i];
    }
    var averageLowerHalfArray = sumLowerHalfArray / (lowerHalfArray.length);
    var averageUpperHalfArray = sumUpperHalfArray / (upperHalfArray.length);

    averageLowerHalfArray = parseInt(averageLowerHalfArray, 10);
    averageUpperHalfArray = parseInt(averageUpperHalfArray, 10);

    if(analyser.getByteFrequencyData(dataArray) in lowerHalfArray) {
      for(var i = 0; i < boxes.length; i++) {
        for(var j = 0; j < boxes.length; j++) {
          boxes[i].scale.set(averageLowerHalfArray/10, averageLowerHalfArray/10, averageLowerHalfArray/10);
          boxes[i].material.color.set( Math.random() * 0xffffff )
      }
    }
   } else {
      for(var i = 0; i < boxes.length; i++) {
        for(var j = 0; j < boxes.length; j++) {
          boxes[i].scale.set(averageUpperHalfArray*2, averageUpperHalfArray*2, averageUpperHalfArray*2);
          boxes[i].material.color.set( Math.random() * 0xffffff )
      }
    }
  }
    renderer.render(scene, camera);

}

function play(e) {
  //console.log(e);
  audio.src = e; // URL.createObjectURL(e);
  audio.load();
  audio.play();

  
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  analyser = context.createAnalyser();
  src.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 512;
  var bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}
