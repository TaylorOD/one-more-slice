import * as THREE from '../../vendor/three.module.js';
import { toppingRadius } from '../order/recipe.js';
import { say } from './order-view.js';
// Keep pointer capture and hit testing separate from order state.
export function bindPizzaInput({
  host,
  camera,
  pizza,
  getMode,
  getRotation,
  setRotation,
  placeTopping
}) {
  let pointerStart = null;
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane();
  const up = new THREE.Vector3(0, 1, 0);
  host.addEventListener('pointerdown', (event) => {
    pointerStart = {
      x: event.clientX,
      y: event.clientY,
      angle: getRotation(),
      id: event.pointerId,
      moved: false
    };
  });
  host.addEventListener('pointermove', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x,
      dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) > 7) {
      pointerStart.moved = true;
      host.setPointerCapture(event.pointerId);
      setRotation(pointerStart.angle + dx * 0.012);
    }
    if (Math.abs(dy) > 10) pointerStart.moved = true;
  });
  host.addEventListener('pointercancel', () => (pointerStart = null));
  host.addEventListener('pointerup', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const moved = pointerStart.moved;
    pointerStart = null;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    if (moved || getMode() !== 'prep') return;
    const r = host.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - r.left) / r.width) * 2 - 1,
        (-(event.clientY - r.top) / r.height) * 2 + 1
      ),
      camera
    );
    const point = new THREE.Vector3();
    // Placement follows the floating pizza instead of the counter below it.
    groundPlane.setFromNormalAndCoplanarPoint(
      up,
      pizza.localToWorld(new THREE.Vector3(0, 0.28, 0))
    );
    if (!raycaster.ray.intersectPlane(groundPlane, point)) return;
    pizza.worldToLocal(point);
    if (Math.hypot(point.x, point.z) > toppingRadius) {
      say('Tap inside the crust to add a topping.');
      return;
    }
    placeTopping(point.x, point.z);
  });
}
