import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);
object1.position.x = - 2;

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);
object3.position.x = 2;

scene.add(object1, object2, object3);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
* Model
*/
const gltfLoader = new GLTFLoader()

let model = null
gltfLoader.load(
    './models/Duck/glTF-Binary/Duck.glb',
    (gltf) =>
    {
      model = gltf.scene;
      console.log(model);
      model.position.y = -1.2;
      scene.add(model);
    }
    )


/**
* Lights
*/
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
scene.add(ambientLight)
// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Mouse
 */
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;
    console.log(mouse);
});

let currentIntersect = null;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    
    
    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);

    if(model)
        {
            const modelIntersects = raycaster.intersectObject(model)
            if(modelIntersects.length)
            {
            model.scale.set(1.2, 1.2, 1.2)
            }
            else
            {
            model.scale.set(1, 1, 1)
            }
        }

    // Handle mouse enter and leave
    if (intersects.length)
    {
        if (!currentIntersect)
        {
            console.log('mouse enter');
            currentIntersect = intersects[0]; // Store the first intersected object
        }

        // Change color to blue for intersected objects
        for (const intersect of intersects)
        {
            intersect.object.material.color.set('#0000ff');
        }
    }
    else
    {
        if (currentIntersect)
        {
            console.log('mouse leave');
            // Reset the color of the previous intersected object
            currentIntersect.object.material.color.set('#ff0000');
            currentIntersect = null; // Clear currentIntersect
        }
    }

    // Reset color for non-intersected objects
    for (const object of objectsToTest)
    {
        if (!intersects.find(intersect => intersect.object === object))
        {
            object.material.color.set('#ff0000'); // Default color when not intersected
        }
    }

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

    // Update controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);

    // Request the next frame
    window.requestAnimationFrame(tick);
};

tick();
