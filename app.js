import * as THREE from './vendor/three.module.js';
import {createCourier} from './courier.js';
import {types, maxToppings, toppingRadius, encodeRecipe, decodeRecipe, randomSpot} from './recipe.js';

const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const host = $('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
} catch {
  $('loading').textContent = 'This kitchen needs WebGL. Try a browser with hardware acceleration enabled.';
  document.querySelectorAll('button').forEach(button => button.disabled = true);
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
const camera = new THREE.PerspectiveCamera(34, 1, .1, 80);
camera.position.set(6.8, 9.7, 11.7);
camera.lookAt(0, .1, -.5);
scene.add(new THREE.HemisphereLight('#c2defd', '#152330', 2.2));
const sun = new THREE.DirectionalLight('#e5f0ff', 3.1);
sun.position.set(-5, 10, 6); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -10;
sun.shadow.camera.right = sun.shadow.camera.top = 10;
sun.shadow.normalBias = .025;
scene.add(sun);
const fireLight = new THREE.PointLight('#ff8c31', 13, 7, 2);
fireLight.position.set(0, 1, -3.2); scene.add(fireLight);

const material = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness: .8, ...extra});
const mats = {
  wood: material('#364753', {metalness:.65,roughness:.4}), edge: material('#192833'), crust: material('#e9b96b'),
  dough: material('#edc986'), cheese: material('#f4d575', {roughness: .52}), sauce: material('#b84125'),
  pepperoni: material('#b33c26'), fleck: material('#edb16d'), mushroom: material('#d8c5a5'),
  gill: material('#806246'), basil: material('#447344'), olive: material('#35392d'), pepper: material('#648b34'),
  pineapple: material('#f0c94b'), brick: material('#273747', {metalness:.35}), grout: material('#485d70', {metalness:.5}),
  oven: material('#17222d'), black: material('#201f19'), coal: material('#382a21'), char: material('#96603a'),
  cream: material('#8999a5'), metal: material('#79796b', {metalness:.3}), towel: material('#243d51')
};
const sphereGeo = new THREE.SphereGeometry(1, 16, 10);
function mesh(geometry, mat, parent = scene) {const m = new THREE.Mesh(geometry, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;}
function box(w,h,d,mat,parent,x=0,y=0,z=0){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
function ball(x,y,z,sx,sy,sz,mat,parent){const m=mesh(sphereGeo,mat,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;}

// A subtle tiled countertop, drawn here so the kitchen doesn't need image downloads.
const tile = document.createElement('canvas'); tile.width = tile.height = 256;
const ctx = tile.getContext('2d'); ctx.fillStyle='#101a23';ctx.fillRect(0,0,256,256);
ctx.fillStyle='#111d27';ctx.fillRect(0,0,128,128);ctx.fillRect(128,128,128,128);
ctx.strokeStyle='#274154';ctx.lineWidth=2;ctx.strokeRect(0,0,128,128);ctx.strokeRect(128,0,128,128);ctx.strokeRect(0,128,128,128);ctx.strokeRect(128,128,128,128);
const texture = new THREE.CanvasTexture(tile);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(8,8);texture.colorSpace=THREE.SRGBColorSpace;
const floor=mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({map:texture,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.32;

// Full sized city blocks behind the kitchen and delivery street.
const city = new THREE.Group();scene.add(city);
const buildingMat = material('#101b28');
const windowMat = material('#569cd6', {emissive:'#569cd6',emissiveIntensity:1.2});
for(let i=0;i<12;i++){
  const x=-38+i*7.5, height=12+(i*7%5)*4;
  const z=-17-(i%2)*6;
  box(6,height,6,buildingMat,city,x,height/2-.3,z);
  for(let y=3.8;y<height-.8;y+=3.2)for(const dx of [-2,0,2]){
    if((i+Math.round(y*10)+Math.round(dx*10))%3===0)continue;
    box(.8,1.4,.02,windowMat,city,x+dx,y,z+3.01);
  }
  box(1.2,2.4,.025,mats.black,city,x,.9,z+3.02);
}
const neon = material('#569cd6',{emissive:'#569cd6',emissiveIntensity:2});
box(4.4,.045,.045,neon,scene,0,2.37,-4.0);
box(.045,.035,8,neon,scene,-5,-.28,-1.8);
box(.045,.035,8,neon,scene,5,-.28,-1.8);
const rimLight=new THREE.PointLight('#569cd6',35,16,2);
rimLight.position.set(-3,3,-5);scene.add(rimLight);

// The brick oven is made from individual blocks around an arched opening.
const oven = new THREE.Group(); oven.position.set(0,0,-4.5); scene.add(oven);
box(5,.3,2.65,mats.grout,oven,0,-.1,0);
box(4.1,2,1.7,mats.brick,oven,0,.85,-.45);
const arch = new THREE.Shape();arch.moveTo(-1.2,0);arch.lineTo(1.2,0);arch.lineTo(1.2,.65);arch.absarc(0,.65,1.2,0,Math.PI,false);arch.lineTo(-1.2,0);
const dark=mesh(new THREE.ShapeGeometry(arch),mats.black,oven);dark.position.set(0,.03,.46);
for(let i=0;i<11;i++){const a=i/10*Math.PI;const b=box(.45,.45,.35,i%2?mats.brick:mats.grout,oven,Math.cos(a)*1.47,.68+Math.sin(a)*1.47,.62);b.rotation.z=a;}
for(const x of [-1.47,1.47])for(let j=0;j<2;j++)box(.43,.32,.36,mats.brick,oven,x,.17+j*.34,.62);
box(4.55,.24,2.3,mats.grout,oven,0,2.2,-.35);
box(.85,.85,.8,mats.brick,oven,1.05,2.7,-.65);box(1,.15,1,mats.oven,oven,1.05,3.16,-.65);
const signCanvas=document.createElement('canvas');signCanvas.width=768;signCanvas.height=128;
const signContext=signCanvas.getContext('2d');signContext.fillStyle='#080d13';signContext.fillRect(0,0,768,128);
signContext.fillStyle='#e8b96c';signContext.font='bold 66px monospace';signContext.textAlign='center';signContext.fillText('C0saNostra Pizza',384,85);
const signTexture=new THREE.CanvasTexture(signCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;
const shopSign=mesh(new THREE.PlaneGeometry(4.7,.78),new THREE.MeshBasicMaterial({map:signTexture}),oven);
shopSign.position.set(0,2.85,.85);
for(let i=0;i<8;i++)ball(-.85+i*.24,.12,.51,.13,.08,.12,mats.coal,oven);
const flames=[];
for(let i=0;i<7;i++){const m=mesh(new THREE.ConeGeometry(.12,.62,7),material('#ffb84a',{emissive:'#ff7221',emissiveIntensity:2}),oven);m.position.set(-.8+i*.27,.38,.52);flames.push(m);}
// Flour bowl, basil pot and a folded tea towel.
const bowl=mesh(new THREE.CylinderGeometry(.55,.38,.36,32),mats.cream);bowl.position.set(-3.6,-.03,-1.65);
const flour=mesh(new THREE.CylinderGeometry(.49,.49,.03,32),material('#f9efd9'));flour.position.set(-3.6,.16,-1.65);
const pot=mesh(new THREE.CylinderGeometry(.32,.24,.5,24),mats.brick);pot.position.set(3.4,-.05,-2.5);
for(let i=0;i<8;i++){const a=i*2.4;const leaf=ball(3.4+Math.cos(a)*.23,.35+(i%3)*.12,-2.5+Math.sin(a)*.23,.12,.26,.055,mats.basil,scene);leaf.rotation.z=a;}
const cloth=box(1.1,.035,1.65,mats.towel,scene,3.4,-.27,.1);cloth.rotation.y=-.3;
for(let i=0;i<5;i++){const stripe=box(.025,.04,1.65,mats.cream,cloth,-.4+i*.2,.03,0);stripe.castShadow=false;}

const carriage=new THREE.Group();scene.add(carriage);
const peel=mesh(new THREE.CylinderGeometry(2.65,2.65,.16,80),mats.wood,carriage);peel.position.y=-.1;
box(.48,.16,2.1,mats.edge,carriage,0,-.1,3.1);
for(let i=0;i<9;i++){const x=-2+i*.5;const length=2*Math.sqrt(2.6**2-x*x);box(.012,.004,length,mats.edge,carriage,x,-.016,0);}
const pizza = new THREE.Group();carriage.add(pizza);
const slices=[];
for(let i=0;i<8;i++){
  const group=new THREE.Group();pizza.add(group);slices.push(group);
  const start=i*Math.PI/4;
  // Wedges allow a real slice to pull away after baking.
  const wedge=new THREE.Shape();wedge.moveTo(0,0);wedge.lineTo(Math.cos(start)*2.12,Math.sin(start)*2.12);wedge.absarc(0,0,2.12,start,start+Math.PI/4,false);wedge.lineTo(0,0);
  const base=mesh(new THREE.ExtrudeGeometry(wedge,{depth:.17,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:16}),mats.dough,group);base.rotation.x=-Math.PI/2;base.position.y=.025;
  function layer(radius,y,mat){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(Math.cos(start)*radius,Math.sin(start)*radius);sh.absarc(0,0,radius,start,start+Math.PI/4,false);sh.lineTo(0,0);const m=mesh(new THREE.ShapeGeometry(sh,24),mat,group);m.rotation.x=-Math.PI/2;m.position.y=y;return m;}
  layer(1.99,.241,mats.sauce);layer(1.91,.247,mats.cheese);
  const rim=mesh(new THREE.TorusGeometry(2.03,.17,10,20,Math.PI/4+.008),mats.crust,group);rim.rotation.x=-Math.PI/2;rim.rotation.z=start;rim.position.y=.21;
}
function sliceIndex(x,z){return Math.floor(((Math.atan2(-z,x)+Math.PI*2)%(Math.PI*2))/(Math.PI/4));}
// Small toasted spots are geometry, so they stay on their own slice.
const cheeseSpots=[];
for(let i=0;i<85;i++){const a=i*2.39996;const r=Math.sqrt((i+.5)/85)*1.82;const x=Math.cos(a)*r,z=Math.sin(a)*r;const spot=ball(x,.25,z,.035+(i%4)*.014,.004,.025+(i%3)*.012,mats.char,slices[sliceIndex(x,z)]);spot.visible=false;cheeseSpots.push(spot);}
for(let i=0;i<64;i++){const a=i*Math.PI*2/64;const x=Math.cos(a)*2.05,z=Math.sin(a)*2.05;ball(x,.35,z,.028+(i%3)*.01,.012,.028,mats.char,slices[sliceIndex(x,z)]);}

const toppingGeometry={disc:new THREE.CylinderGeometry(.205,.205,.048,18),ring:new THREE.TorusGeometry(.115,.041,7,14),chunk:new THREE.BoxGeometry(.23,.12,.18),stem:new THREE.CylinderGeometry(.045,.06,.18,9),cap:new THREE.SphereGeometry(.18,12,8,0,Math.PI*2,0,Math.PI/2)};
function makeTopping(type){
  const group=new THREE.Group();
  if(type==='pepperoni'){
    mesh(toppingGeometry.disc,mats.pepperoni,group);
    for(let i=0;i<5;i++){const a=i*2.4;ball(Math.cos(a)*.12,.026,Math.sin(a)*.12,.022,.005,.017,mats.fleck,group);}
  } else if(type==='olive'||type==='pepper'){
    const ring=mesh(toppingGeometry.ring,type==='olive'?mats.olive:mats.pepper,group);ring.rotation.x=Math.PI/2;if(type==='pepper')ring.scale.set(1.5,.8,1);
  } else if(type==='pineapple'){
    const chunk=mesh(toppingGeometry.chunk,mats.pineapple,group);chunk.rotation.z=.12;
  } else if(type==='basil'){
    const leaf=ball(0,0,0,.105,.027,.24,mats.basil,group);leaf.rotation.z=.2;
    box(.009,.03,.34,material('#9aa45d'),group,0,.013,0);
  } else {
    const mushroom=new THREE.Group();group.add(mushroom);mushroom.rotation.x=Math.PI/2;
    mesh(toppingGeometry.stem,mats.mushroom,mushroom);
    const cap=mesh(toppingGeometry.cap,mats.mushroom,mushroom);cap.position.y=.09;
    const gills=mesh(new THREE.CircleGeometry(.17,12),mats.gill,mushroom);gills.rotation.x=Math.PI/2;gills.position.y=.09;
  }
  return group;
}

const kitchenObjects=scene.children.filter(object=>!object.isLight&&object!==city&&object!==floor);
const courier=createCourier(scene);
let courierStarted=0;
let courierPhase='';
function restoreKitchen(){
  courier.reset();courierPhase='';delete document.body.dataset.courierPhase;
  kitchenObjects.forEach(object=>object.visible=true);
  camera.position.set(6.8,9.7,11.7);camera.lookAt(0,.1,-.5);
}
let toppings=[], selected='pepperoni', mode='prep', bakingStarted=0, lastTime=0, sliceTarget=0;
let rotationTarget=0, pointerStart=null;
const bakeSeconds = 8;
let pickupStarted=null, pickupFinished=null;
function updateClock(now){
  const elapsed=pickupStarted===null?0:((pickupFinished??now)-pickupStarted)/1000;
  const remaining=Math.max(0,90-Math.floor(elapsed));
  $('pickup-clock').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
  $('dispatch-clock').classList.toggle('expired',remaining===0);
  $('clock-label').textContent=pickupFinished!==null?'ready for pickup':remaining===0?'courier waiting':pickupStarted===null?'pickup window':'pickup in';
  if(mode==='pickup'||mode==='dispatched')$('clock-label').textContent=mode==='pickup'?'courier collecting':'order dispatched';
}
const say=text=>$('status').textContent=text;
function update(){
  document.body.dataset.mode=mode; document.body.dataset.toppings=toppings.length;
  $('topping-count').textContent=`${toppings.length} / ${maxToppings}`;
  $('undo').disabled=!toppings.length||mode!=='prep';
  const delivering=mode==='pickup'||mode==='dispatched';
  $('step-eat').innerHTML=delivering?'<b>03</b> dispatch':'<b>03</b> inspect';
  $('primary').disabled=mode==='baking'||mode==='pickup';
  $('dispatch').hidden=!['baked','sliced'].includes(mode);
  $('replay').hidden=mode!=='dispatched';
  document.querySelector('.turn-controls').hidden=delivering;
  $('delivery-status').hidden=!delivering;
  $('prep-controls').hidden=mode!=='prep';$('bake-progress').hidden=mode!=='baking';$('finished').hidden=!['baked','sliced'].includes(mode);
  $('primary').innerHTML=mode==='prep'?'<span>fire oven()</span><span>↗</span>':mode==='baking'?'<span>oven.running</span><span>◌</span>':mode==='baked'?'<span>inspect slice()</span><span>↗</span>':'<span>return slice()</span><span>↙</span>';
  $('panel-title').innerHTML=mode==='prep'?'Incoming order.<br>Make it yours.':mode==='baking'?'Thermal cycle<br>in progress.':'Order complete.<br>Ready for pickup.';
  $('panel-copy').innerHTML=mode==='prep'?'Base loaded: sauce + mozzarella.<br>Add toppings to start the pickup clock.':mode==='baking'?'Eight seconds. Watch the crust.':'Inspect a slice. Quality control is your job.';
  $('scene-label').textContent=mode==='baking'?'THERMAL BAY / 01':mode==='prep'?'PREP BAY / 01':'DISPATCH BAY / 01';
  $('oven-label').textContent=mode==='baking'?'BAKING AT 450°':'OVEN READY';
  $('scene-instruction').textContent=mode==='prep'?'pick a topping, then tap the pizza':mode==='baking'?'a little heat goes a long way':mode==='sliced'?'that one’s yours. you earned it.':'golden, bubbly, ready for a slice';
  ['prep','bake','eat'].forEach((s,i)=>$('step-'+s).classList.toggle('active',i===(mode==='prep'?0:mode==='baking'?1:2)));
  if(delivering){
    $('panel-title').innerHTML=mode==='pickup'?'Courier incoming.<br>Keep it hot.':'Order dispatched.<br>Catch you next shift.';
    $('panel-copy').textContent=mode==='pickup'?'One board. One box. A borrowed ride.':'Your pizza is on its way through sector 07.';
    $('primary').innerHTML=mode==='pickup'?'<span>pickup in progress</span>':'<span>new order()</span><span>↗</span>';
    $('scene-label').textContent='STREET CAM / 07';
    $('oven-label').textContent=mode==='pickup'?'COURIER ACTIVE':'DISPATCH COMPLETE';
    $('scene-instruction').textContent=mode==='pickup'?'collect the box. hook the car. go.':'another order out into the night';
    $('delivery-phase').textContent=mode==='pickup'?'01 / collect':'// collected. hooked. dispatched.';
    document.querySelectorAll('[data-phase]').forEach(item=>{
      item.classList.remove('active');
      item.classList.toggle('complete',mode==='dispatched');
    });
  }
}
function dispatch(){
  if(!['baked','sliced','dispatched'].includes(mode))return;
  mode='pickup';courierStarted=performance.now();sliceTarget=0;
  courierPhase='';
  camera.position.set(3,9,21);camera.lookAt(-3,2,1);
  kitchenObjects.forEach(object=>object.visible=false);courier.start();update();
  say('Courier at the pickup bay.');
}
$('dispatch').addEventListener('click',dispatch);
$('replay').addEventListener('click',dispatch);
function addTopping(type, x, z, angle=Math.random()*Math.PI*2, animate=true){
  if(mode!=='prep'||toppings.length>=maxToppings)return;
  if(pickupStarted===null)pickupStarted=performance.now();
  const group=makeTopping(type);const parent=slices[sliceIndex(x,z)];parent.add(group);
  let stack=0;for(const t of toppings)if(Math.hypot(t.x-x,t.z-z)<.2)stack=Math.min(stack+.045,.4);
  const y=.30+stack;group.position.set(x,animate&&!reduceMotion?y+2:y,z);group.rotation.y=angle;
  const topping={type,x,z,angle,group,y,velocity:0};toppings.push(topping);update();
}
function removeAll(){for(const t of toppings){t.group.removeFromParent();}toppings=[];}
function reset(){restoreKitchen();removeAll();pickupStarted=null;pickupFinished=null;mode='prep';carriage.position.set(0,0,0);sliceTarget=0;slices[6].position.set(0,0,0);pizza.rotation.y=0;rotationTarget=0;setCooked(0);history.replaceState(null,'',location.pathname+location.search);update();say('Order cleared. Dispatch is standing by.');}
function setCooked(t){mats.crust.color.set('#e9b96b').lerp(new THREE.Color('#b96d2e'),t);mats.cheese.color.set('#f4d575').lerp(new THREE.Color('#e8b94f'),t);mats.dough.color.set('#edc986').lerp(new THREE.Color('#dca057'),t);cheeseSpots.forEach((spot,i)=>{spot.visible=t>.18+i%8*.065;});}
function bake(){if(mode!=='prep')return;mode='baking';bakingStarted=performance.now();if(pickupStarted===null)pickupStarted=bakingStarted;$('progress').value=0;update();say('Into the oven. Give it eight seconds.');}
document.querySelectorAll('[data-topping]').forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.topping;document.querySelectorAll('[data-topping]').forEach(b=>b.setAttribute('aria-pressed',b===button));say(selected==='pineapple'?'A controversial choice. We support you.':`${button.textContent.trim()} it is. Tap the pizza or add a handful.`);}));
$('sprinkle').addEventListener('click',()=>{if(mode!=='prep')return;const before=toppings.length;for(let i=0;i<5;i++){const p=randomSpot();addTopping(selected,p.x,p.z,p.angle);}say(toppings.length===before?'That’s 80 toppings. The dough has limits.':'A handful of good decisions. Probably.');});
$('undo').addEventListener('click',()=>{if(mode!=='prep')return;const t=toppings.pop();t?.group.removeFromParent();update();say('Nobody saw that.');});
$('special').addEventListener('click',()=>{if(mode!=='prep')return;removeAll();for(let i=0;i<23;i++){const p=randomSpot();addTopping(i<12?'pepperoni':i<18?'mushroom':'basil',p.x,p.z,p.angle);}say('Pepperoni, mushrooms and basil. A solid life choice.');});
$('reset').addEventListener('click',()=>{if(toppings.length||mode!=='prep'){if(!confirm('Start over with fresh dough? Your current pizza will be cleared.'))return;}reset();});
$('primary').addEventListener('click',()=>{if(mode==='dispatched'){reset();return;}if(mode==='prep')bake();else if(mode==='baked'){mode='sliced';sliceTarget=1;update();say('One slice. For quality control.');}else if(mode==='sliced'){mode='baked';sliceTarget=0;update();say('Back with the others. For now.');}});
$('turn-left').addEventListener('click',()=>rotationTarget-=Math.PI/6);$('turn-right').addEventListener('click',()=>rotationTarget+=Math.PI/6);

const raycaster=new THREE.Raycaster();const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.28);
host.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY,angle:rotationTarget,id:event.pointerId,moved:false};});
host.addEventListener('pointermove',event=>{if(!pointerStart||pointerStart.id!==event.pointerId)return;const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;if(Math.abs(dx)>7){pointerStart.moved=true;host.setPointerCapture(event.pointerId);rotationTarget=pointerStart.angle+dx*.012;}if(Math.abs(dy)>10)pointerStart.moved=true;});
host.addEventListener('pointercancel',()=>pointerStart=null);
host.addEventListener('pointerup',event=>{
  if(!pointerStart||pointerStart.id!==event.pointerId)return;
  const moved=pointerStart.moved;pointerStart=null;if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);
  if(moved||mode!=='prep')return;
  const r=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);
  const point=new THREE.Vector3();if(!raycaster.ray.intersectPlane(groundPlane,point))return;
  pizza.worldToLocal(point);
  if(Math.hypot(point.x,point.z)>toppingRadius){say('Aim for the cheese. The counter has enough crumbs.');return;}
  addTopping(selected,point.x,point.z);say(toppings.length>=maxToppings?'That’s 80 toppings. Time for the oven.':'Nicely placed. Keep going.');
});
$('share').addEventListener('click',()=>{const url=new URL(location.href);url.hash='recipe='+encodeRecipe(toppings);$('share-url').value=url.href;$('copy-status').textContent='';$('share-dialog').showModal();$('share-url').select();});
$('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('share-url').value);$('copy-status').textContent='Copied. Send it to someone hungry.';}catch{$('share-url').focus();$('share-url').select();$('copy-status').textContent='Select the link above and copy it.';}});
function openRecipe(){if(!location.hash)return;const recipe=decodeRecipe(location.hash);if(!recipe){say('That recipe link looks broken. Fresh dough is ready instead.');return;}restoreKitchen();removeAll();pickupStarted=null;pickupFinished=null;mode='prep';carriage.position.set(0,0,0);sliceTarget=0;slices[6].position.set(0,0,0);setCooked(0);for(const [type,x,z,angle]of recipe.t)addTopping(type,x,z,angle,false);update();say('Order received. Fresh pickup window. Ready to bake.');}
window.addEventListener('hashchange',openRecipe);
const observer=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.fov=width<500?43:34;camera.updateProjectionMatrix();});observer.observe(host);

function animate(now){
  const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;
  updateClock(now);
  if(mode==='pickup'){
    const delivery=courier.frame((now-courierStarted)/1000,reduceMotion);
    if(delivery.phase!==courierPhase){
      courierPhase=delivery.phase;document.body.dataset.courierPhase=courierPhase;
      const messages={
        collect:['01 / collect','Box on the counter. She’s already rolling.'],
        approach:['02 / find a ride','Traffic moving. Courier approaching the street.'],
        hook:['03 / magnetic lock','Tow line fired. Catching the next car.'],
        ride:['04 / outbound','Cable tight. Pizza secure. Sector 07 outbound.']
      };
      $('delivery-phase').textContent=messages[courierPhase][0];
      const phases=['collect','approach','hook','ride'];
      document.querySelectorAll('[data-phase]').forEach(item=>{
        item.classList.toggle('active',item.dataset.phase===courierPhase);
        item.classList.toggle('complete',phases.indexOf(item.dataset.phase)<phases.indexOf(courierPhase));
      });
      say(messages[courierPhase][1]);
    }
    if(delivery.done){mode='dispatched';update();say('Pizza collected. Courier outbound.');}
  }
  pizza.rotation.y+=(rotationTarget-pizza.rotation.y)*(reduceMotion?1:Math.min(dt*12,1));
  for(const t of toppings)if(t.group.position.y>t.y){t.velocity+=dt*14;t.group.position.y-=t.velocity*dt;if(t.group.position.y<t.y)t.group.position.y=t.y;}
  flames.forEach((f,i)=>{f.scale.y=reduceMotion?1:.8+Math.sin(now*.008+i*2)*.2;});
  if(mode==='baking'){
    const t=Math.min((now-bakingStarted)/1000/bakeSeconds,1);$('progress').value=t;
    const travel=t<.16?t/.16:t>.82?(1-t)/.18:1;
    const ease=travel*travel*(3-2*travel);carriage.position.z=-2.8*ease;carriage.position.y=.02*ease;
    carriage.scale.setScalar(1-.28*ease);setCooked(Math.min(t*1.3,1));fireLight.intensity=18;
    if(t===1){mode='baked';pickupFinished=now;carriage.position.set(0,0,0);carriage.scale.setScalar(1);update();say('Thermal cycle complete. Order ready for pickup.');}
  }else fireLight.intensity=13;
  if(mode==='prep')carriage.scale.setScalar(1);
  const s=slices[6],a=6.5*Math.PI/4;
  s.position.x+=(Math.cos(a)*sliceTarget*.8-s.position.x)*Math.min(dt*7,1);
  s.position.z+=(-Math.sin(a)*sliceTarget*.8-s.position.z)*Math.min(dt*7,1);
  s.position.y+=(sliceTarget*.28-s.position.y)*Math.min(dt*7,1);
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
update();openRecipe();requestAnimationFrame(animate);
