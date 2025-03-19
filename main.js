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

const planetNames = ["Csilla", "Earth", "Venus", "Volcanic"];

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

// Create planets
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

// Handle touch events for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const isTouchDevice = 'ontouchstart' in window;

function preventDefault(event) {
  event.preventDefault(); // Prevent scrolling and other default behaviors during touch interaction
}

// Handle touchstart and touchmove events
canvas.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  preventDefault(event); // Prevent default scroll behavior
});

canvas.addEventListener('touchmove', (event) => {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Rotate planets based on touch movement
  if (Math.abs(deltaX) > 10) {
    spheres.rotation.y += deltaX * 0.005; // Adjust multiplier for smoother rotation
    touchStartX = touchEndX; // Update start position for next move
  }

  if (Math.abs(deltaY) > 10) {
    spheres.rotation.x += deltaY * 0.005; // Adjust multiplier for smoother rotation
    touchStartY = touchEndY; // Update start position for next move
  }

  // Check if a planet is touched based on position
  checkPlanetTouch(event);

  preventDefault(event); // Prevent default scroll behavior
});

canvas.addEventListener('touchend', () => {
  // You could reset any variables or do something when touch ends
});

// Check if a planet is touched and update the heading
function checkPlanetTouch(event) {
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;
  
  // Determine the planet touched by its position on the screen
  const rect = canvas.getBoundingClientRect();
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;

  const mouseX = (touchX / canvasWidth) * 2 - 1; // Normalized device coordinates
  const mouseY = -(touchY / canvasHeight) * 2 + 1; // Normalized device coordinates

  // Create a raycaster to detect the intersection with the planets
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(mouseX, mouseY);
  raycaster.updateMatrixWorld(); // Update world matrix
  raycaster.setFromCamera(mouse, camera); // Set raycaster from camera

  // Check for intersections with the planets
  const intersects = raycaster.intersectObject(spheres, true);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const planetIndex = sphereMesh.indexOf(intersectedObject);

    // Update the planet name in the heading
    if (planetIndex >= 0) {
      document.querySelector('h1').textContent = planetNames[planetIndex];
    }
  }
}

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
