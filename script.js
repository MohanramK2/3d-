
const sceneElement = document.getElementById("scene");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    sceneElement.clientWidth / sceneElement.clientHeight,
    0.1,
    100
);

camera.position.z = 8.5;

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(
    sceneElement.clientWidth,
    sceneElement.clientHeight
);

renderer.outputEncoding = THREE.sRGBEncoding;
sceneElement.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x00aaff, 3, 20);
blueLight.position.set(4, 3, 5);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x5533ff, 2, 20);
purpleLight.position.set(-4, -3, 4);
scene.add(purpleLight);

// Main 3D photo group
const photoGroup = new THREE.Group();
scene.add(photoGroup);

// 3D frame
const frameGeometry = new THREE.BoxGeometry(3.5, 5.9, 0.18);

const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x102b50,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x003366,
    emissiveIntensity: 0.4
});

const frame = new THREE.Mesh(frameGeometry, frameMaterial);
photoGroup.add(frame);

// Photo texture
const loader = new THREE.TextureLoader();

loader.load(
    "./portrait.jpg",

    function(texture) {

        texture.encoding = THREE.sRGBEncoding;

        const photoGeometry = new THREE.PlaneGeometry(
            3.3,
            5.7
        );

        const photoMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        const photo = new THREE.Mesh(
            photoGeometry,
            photoMaterial
        );

        photo.position.z = 0.105;
        photoGroup.add(photo);

        document.getElementById("loader").style.display = "none";
    },

    undefined,

    function() {
        document.getElementById("loader").innerText =
            "PHOTO NOT FOUND - CHECK portrait.jpg";
    }
);

// Glowing frame edges
const edges = new THREE.EdgesGeometry(frameGeometry);

const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x00cfff
});

const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
photoGroup.add(edgeLines);

// Floating stars
const starGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < 250; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 5
    );
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
    color: 0x39cfff,
    size: 0.035,
    transparent: true,
    opacity: 0.8
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Rotation controls
let autoRotate = true;
let glowEnabled = true;
let dragging = false;

let previousX = 0;
let previousY = 0;

let targetRotationX = 0;
let targetRotationY = 0;

const canvas = renderer.domElement;

canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {

    if (!dragging) return;

    const movementX = event.clientX - previousX;
    const movementY = event.clientY - previousY;

    targetRotationY += movementX * 0.008;
    targetRotationX += movementY * 0.008;

    targetRotationX = Math.max(
        -0.5,
        Math.min(0.5, targetRotationX)
    );

    previousX = event.clientX;
    previousY = event.clientY;
});

canvas.addEventListener("pointerup", () => {
    dragging = false;
});

canvas.addEventListener("pointercancel", () => {
    dragging = false;
});

// Auto rotation button
document.getElementById("rotateBtn").addEventListener("click", function() {

    autoRotate = !autoRotate;

    this.innerText = autoRotate
        ? "⟳ Auto Rotate ON"
        : "⏸ Auto Rotate OFF";
});

// Glow effect button
document.getElementById("glowBtn").addEventListener("click", function() {

    glowEnabled = !glowEnabled;

    frameMaterial.emissiveIntensity = glowEnabled ? 0.8 : 0;

    edgeMaterial.color.set(
        glowEnabled ? 0x00cfff : 0x445566
    );

    blueLight.intensity = glowEnabled ? 3 : 0.5;

    this.innerText = glowEnabled
        ? "✦ Glow Effect ON"
        : "✧ Glow Effect OFF";
});

// Mouse movement lighting
window.addEventListener("mousemove", (event) => {

    const x = (event.clientX / window.innerWidth - 0.5) * 5;
    const y = -(event.clientY / window.innerHeight - 0.5) * 5;

    blueLight.position.x = x;
    blueLight.position.y = y;
});

// Animation
function animate() {

    requestAnimationFrame(animate);

    if (autoRotate && !dragging) {
        targetRotationY += 0.003;
    }

    photoGroup.rotation.y +=
        (targetRotationY - photoGroup.rotation.y) * 0.08;

    photoGroup.rotation.x +=
        (targetRotationX - photoGroup.rotation.x) * 0.08;

    photoGroup.position.y = Math.sin(Date.now() * 0.001) * 0.08;

    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0002;

    renderer.render(scene, camera);
}

animate();

// Responsive resizing
window.addEventListener("resize", () => {

    const width = sceneElement.clientWidth;
    const height = sceneElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});
