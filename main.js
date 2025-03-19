import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 9;

// Renderer setup
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const loader = new RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

const radius = 1.3;
const segments = 64;
const spheres = new THREE.Group();
const orbitradius = 4.5;

const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png"
];

// Create a large sphere for the starfield background
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const starMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide // Render the inside of the sphere
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

const sphereMesh = [];

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });

  const sphere = new THREE.Mesh(geometry, material);
  sphereMesh.push(sphere);

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitradius * Math.cos(angle);
  sphere.position.z = orbitradius * Math.sin(angle);

  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle wheel (mouse scroll) on desktop
let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function throttleWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    scrollCount = (scrollCount + 1) % 4;
    console.log(scrollCount);
    const headings = document.querySelectorAll('.heading');
    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: 'power2.inOut'
    });
    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}%`,
      ease: `power2.inOut `
    });
    if (scrollCount == 0) {
      gsap.to(headings, {
        duration: 1,
        y: `0`,
        ease: 'power2.inOut'
      });
    }
  }
}

// Wheel scroll event listener for desktop
window.addEventListener('wheel', throttleWheelHandler);

// Touch event variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let pinchDistance = null;

const isTouchDevice = 'ontouchstart' in window;

function preventDefault(event) {
  event.preventDefault(); // Prevent scrolling and other default behaviors during touch interaction
}

// Handle touch events for mobile
canvas.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  if (event.touches.length === 2) {
    pinchDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
  }
  preventDefault(event); // Prevent default scroll behavior
});

canvas.addEventListener('touchmove', (event) => {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > 10) {
    spheres.rotation.y += deltaX * 0.005; // Adjust multiplier for smoother rotation
    touchStartX = touchEndX;
  }

  if (Math.abs(deltaY) > 10) {
    spheres.rotation.x += deltaY * 0.005; // Adjust multiplier for smoother rotation
    touchStartY = touchEndY;
  }

  // Handle pinch-to-zoom
  if (event.touches.length === 2 && pinchDistance !== null) {
    let newPinchDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
    const zoomFactor = newPinchDistance / pinchDistance;
    camera.position.z *= zoomFactor;
    pinchDistance = newPinchDistance;
  }

  preventDefault(event); // Prevent default scroll behavior
});

canvas.addEventListener('touchend', (event) => {
  pinchDistance = null; // Reset pinch distance
  preventDefault(event); // Prevent default scroll behavior
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // Rotate spheres continuously
  for (let i = 0; i < sphereMesh.length; i++) {
    const sphere = sphereMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.02;
  }

  // Render scene
  renderer.render(scene, camera);
}

animate();
