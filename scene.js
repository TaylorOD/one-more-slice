import * as THREE from './vendor/three.module.js';
export function createScene(host) {
  const $ = (id) => document.getElementById(id);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    $('loading').textContent =
      'This kitchen needs WebGL. Try a browser with hardware acceleration enabled.';
    document.querySelectorAll('button').forEach((button) => (button.disabled = true));
    throw new Error('WebGL is unavailable');
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor('#070c12');
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  $('loading').remove();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#070c12', 23, 45);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(6.8, 9.7, 11.7);
  camera.lookAt(0, 0.1, -0.5);
  scene.add(new THREE.HemisphereLight('#c2defd', '#152330', 2.2));
  const sun = new THREE.DirectionalLight('#e5f0ff', 3.1);
  sun.position.set(-5, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -10;
  sun.shadow.camera.right = sun.shadow.camera.top = 10;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fireLight = new THREE.PointLight('#ff8c31', 13, 7, 2);
  fireLight.position.set(0, 0.3, -3);
  scene.add(fireLight);

  let deliveringNow = false;
  function frameCamera(delivering) {
    deliveringNow = delivering;
    fireLight.visible = !delivering;
    const mobile = host.clientWidth < 500;
    if (delivering) {
      camera.position.set(...(mobile ? [1, 7, 17] : [3, 9, 21]));
      camera.lookAt(...(mobile ? [-3, 1.5, 3] : [-3, 2, 1]));
    } else {
      camera.position.set(6.8, 9.7, 11.7);
      camera.lookAt(0, 0.1, -0.5);
    }
  }
  const observer = new ResizeObserver(() => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = width < 500 ? 43 : 34;
    frameCamera(deliveringNow);
    camera.updateProjectionMatrix();
  });
  observer.observe(host);
  return { scene, camera, renderer, fireLight, frameCamera };
}
