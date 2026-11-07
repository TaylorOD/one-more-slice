import { createScene } from './scene/scene.js';
import { createCity } from './scene/city.js';
import { createKitchen } from './kitchen/kitchen.js';
import { startOrder } from './order/order.js';

const host = document.getElementById('scene');
const stage = createScene(host);
const city = createCity(stage.scene);
const kitchen = createKitchen(stage.scene);
startOrder({ host, ...stage, kitchen, city });
