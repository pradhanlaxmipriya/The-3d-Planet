import './style.css'

import * as THREE from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 9;

// Renderer setup
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(window.devicePixelRatio);//** */
renderer.setSize(window.innerWidth, window.innerHeight);

const loader= new RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",function(texture){
texture.mapping= THREE.EquirectangularReflectionMapping;
// scene.background=texture;
scene.environment=texture;
})

const radius=1.3;
const segments=64;
const color=[0xff0000,0x00ff00,0x0000ff,0xffff00
];
const spheres= new THREE.Group();
const orbitradius=4.5;

const textures=[
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png"
]


// Create a large sphere for the starfield background
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace= THREE.SRGBColorSpace;
// starTexture.wrapS = THREE.RepeatWrapping;
// starTexture.wrapT = THREE.RepeatWrapping;
const starMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  
  side: THREE.BackSide // Render the inside of the sphere
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);


const sphereMesh=[];

for(let i=0; i<4;i++){
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace= THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map:texture});

  const sphere = new THREE.Mesh(geometry, material);

  
  sphereMesh.push(sphere)
 
 
  const angle= (i/4)*(Math.PI*2);
  sphere.position.x=orbitradius*Math.cos(angle)
  sphere.position.z=orbitradius*Math.sin(angle)

  spheres.add(sphere);
}
spheres.rotation.x=0.1;
spheres.position.y=-0.8;
scene.add(spheres)
// Orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// Create a cube
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

let lastWheelTime=0;
const throttleDelay=2000;
let scrollCount=0;

function throttleWheelHandler(event){
    const currentTime= Date.now();
    if(currentTime-lastWheelTime >= throttleDelay){
      lastWheelTime=currentTime;
    if(event.deltaY < 0) {
    //  console.log("Up");
    } else {
     // console.log("Down");
    }
    scrollCount=(scrollCount+1)%4;
    console.log(scrollCount)
     const headings= document.querySelectorAll('.heading')
     gsap.to(headings,{
       duration:1,
       y:`-=${100}%`,
       ease:'power2.inOut'
     })
     gsap.to(spheres.rotation,{
      duration:1,
      y:`-=${Math.PI/2}%`,
      ease:`power2.inOut `
     })
     if(scrollCount==0){
      gsap.to(headings,{
        duration:1,
        y:`0`,
        ease:'power2.inOut'
      })
     }
    }
}

window.addEventListener('wheel',throttleWheelHandler)

const clock= new THREE.Clock()
// Animation loop
function animate() {
  requestAnimationFrame(animate);
for(let i=0 ;i<sphereMesh.length;i++){
  const sphere= sphereMesh[i];
  sphere.rotation.y = clock.getElapsedTime()*0.02;
}
  // Render
  renderer.render(scene, camera);
}

animate();