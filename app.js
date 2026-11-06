import { createScene } from './scene.js';
import { createCity } from './city.js';
import { createKitchen } from './kitchen.js';
import { startOrder } from './order.js';

const host = document.getElementById('scene');
const stage = createScene(host);
const city = createCity(stage.scene);
const kitchen = createKitchen(stage.scene);
startOrder({ host, ...stage, kitchen, city });
