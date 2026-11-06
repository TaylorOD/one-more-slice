import * as THREE from './vendor/three.module.js';

export function createCourier(scene) {
  const root = new THREE.Group();
  root.visible = false;
  scene.add(root);
  const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color, roughness:.65, ...extra});
  const steel=mat('#283848'), rubber=mat('#101319'), jacket=mat('#9670d7'), pants=mat('#233245');
  const skin=mat('#c68d69'), hair=mat('#382b27'), amber=mat('#e2b96b');
  const glow=mat('#569cd6',{emissive:'#569cd6',emissiveIntensity:1.5});
  function box(parent,x,y,z,w,h,d,material) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function ball(parent,x,y,z,r,material) {
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material);
    mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  function limb(parent,from,to,width,material) {
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(width,width,delta.length(),8),material);
    mesh.position.copy(a.add(b).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  box(root,0,-.2,0,30,.12,5,mat('#101820'));
  for(let x=-14;x<16;x+=3)box(root,x,-.13,-1.8,1.5,.015,.09,amber);
  box(root,-4,.35,2.7,1.7,1.2,1.2,steel);
  box(root,-4,1,2.7,1.9,.12,1.4,glow);

  const car=new THREE.Group();root.add(car);car.position.set(1,0,-.4);
  box(car,0,.6,0,4,.65,1.8,mat('#394b5b',{metalness:.65}));
  box(car,-.25,1.16,0,2.1,.7,1.55,mat('#152d40',{metalness:.5}));
  box(car,-.25,1.54,0,2.3,.1,1.7,steel);
  for(const z of [-.8,.8])box(car,-.25,1.2,z,1.75,.42,.025,glow);
  for(const x of [-1.25,1.25])for(const z of [-.94,.94]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.2,16),rubber);
    wheel.rotation.x=Math.PI/2;wheel.position.set(x,.25,z);car.add(wheel);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.22,12),steel);
    hub.rotation.x=Math.PI/2;hub.position.copy(wheel.position);car.add(hub);
  }
  for(const z of [-.63,.63]){
    box(car,2.02,.65,z,.04,.19,.35,mat('#fff0c7',{emissive:'#fff0c7',emissiveIntensity:2}));
    box(car,-2.02,.65,z,.04,.18,.3,mat('#c44e4d',{emissive:'#c44e4d',emissiveIntensity:1}));
  }
  box(car,0,.55,.92,2,.16,.025,amber);

  const rider=new THREE.Group();root.add(rider);
  box(rider,0,.03,0,1.25,.09,.42,mat('#9264c2'));
  for(const x of [-.4,.4])for(const z of [-.25,.25])ball(rider,x,-.02,z,.105,amber);
  // Bent knees, one hand for the box and one for the tow cable.
  limb(rider,[-.35,.18,0],[-.52,.62,0],.12,pants);
  limb(rider,[-.52,.62,0],[-.12,.95,0],.14,pants);
  limb(rider,[.35,.18,0],[.5,.58,0],.12,pants);
  limb(rider,[.5,.58,0],[-.12,.95,0],.14,pants);
  box(rider,-.35,.15,.02,.38,.16,.28,rubber);
  box(rider,.35,.15,.02,.38,.16,.28,rubber);
  box(rider,-.05,1.24,0,.49,.7,.5,jacket).rotation.z=-.18;
  ball(rider,.08,1.87,0,.25,skin);
  const helmet=ball(rider,.04,2,0,.28,amber);helmet.scale.y=.75;
  for(let i=0;i<4;i++)ball(rider,-.18-i*.09,1.89-i*.08,.1,.11-i*.013,hair);
  box(rider,.27,1.91,0,.05,.12,.35,rubber);
  limb(rider,[.15,1.5,-.24],[.48,1.2,-.24],.085,jacket);
  limb(rider,[.48,1.2,-.24],[.75,1.05,-.24],.07,skin);
  limb(rider,[-.1,1.5,.27],[.12,1.15,.55],.085,jacket);
  limb(rider,[.12,1.15,.55],[.42,1.17,.55],.07,skin);
  const parcel=new THREE.Group();root.add(parcel);
  box(parcel,0,0,0,1.05,.16,1.05,mat('#dcc695'));
  box(parcel,0,.085,0,.78,.012,.78,mat('#9a4e39'));
  const seal=box(parcel,0,.1,0,.12,.012,.85,amber);
  const cableGeometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  const cable=new THREE.Line(cableGeometry,new THREE.LineBasicMaterial({color:'#89b6dc'}));root.add(cable);
  const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
  function frame(seconds,reduced=false) {
    // Reduced motion shows the handoff as a still, then confirms dispatch.
    const t=reduced?4.8:seconds;
    const collect=smooth(t/2),hook=smooth((t-2.5)/2),leave=Math.max(0,t-5)**2*.65;
    rider.position.set(THREE.MathUtils.lerp(-7,-4,collect)+hook*1.1+leave,0,THREE.MathUtils.lerp(2.2,-.4,hook));
    car.position.x=1+leave;
    if(t<2)parcel.position.set(-4,1.18,2.7);
    else parcel.position.set(rider.position.x+.35,1.25,rider.position.z+.58);
    cable.visible=t>=4.5;
    const points=cableGeometry.attributes.position;
    points.setXYZ(0,car.position.x-2.05,.65,-.4);
    points.setXYZ(1,rider.position.x+.75,1.05,rider.position.z-.24);
    points.needsUpdate=true;cableGeometry.computeBoundingSphere();
    return seconds>=9;
  }
  return {
    start(){root.visible=true;frame(0);},
    reset(){root.visible=false;},
    frame
  };
}
