import * as THREE from './vendor/three.module.js';

const clamp=THREE.MathUtils.clamp;
const mix=THREE.MathUtils.lerp;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};

export function createCourier(scene) {
  const root=new THREE.Group();root.visible=false;scene.add(root);
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const steel=material('#293945',{metalness:.6}), dark=material('#10161b'), rubber=material('#171b21');
  const alloy=material('#8e9ca4',{metalness:.75,roughness:.3}), jacket=material('#765783'), trim=material('#c59c5c');
  const pants=material('#273344'), skin=material('#bc8b70'), hair=material('#392922'), bagMat=material('#8c4542');
  const cyan=material('#61b8d8',{emissive:'#3393b5',emissiveIntensity:.8});
  const amber=material('#e4b76b',{emissive:'#c38b38',emissiveIntensity:.4});
  const red=material('#b83e42',{emissive:'#cf3a31',emissiveIntensity:.9});
  const white=material('#d7e5df',{emissive:'#c1d5d0',emissiveIntensity:.8});
  const unitBox=new THREE.BoxGeometry(1,1,1), sphere=new THREE.SphereGeometry(1,16,12);
  const unitLimb=new THREE.CylinderGeometry(1,1,1,10);
  const v1=new THREE.Vector3(),v2=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  function box(parent,x,y,z,w,h,d,mat=steel){
    const m=new THREE.Mesh(unitBox,mat);m.position.set(x,y,z);m.scale.set(w,h,d);
    m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function ball(parent,x,y,z,sx,sy,sz,mat){
    const m=new THREE.Mesh(sphere,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);
    m.castShadow=true;parent.add(m);return m;
  }
  function joint(parent,width,mat){
    const m=new THREE.Mesh(unitLimb,mat);m.castShadow=true;parent.add(m);
    return (a,b)=>{
      v1.set(...a);v2.set(...b).sub(v1);
      m.position.copy(v1).addScaledVector(v2,.5);m.scale.set(width,v2.length(),width);
      m.quaternion.setFromUnitVectors(up,v2.normalize());
    };
  }
  function label(parent,text,w,h,x,y,z,color='#d6bc8d',background='#14202a'){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,128);
    ctx.fillStyle=color;ctx.font='bold 48px monospace';ctx.textAlign='center';ctx.fillText(text,256,82);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
    m.position.set(x,y,z);parent.add(m);return m;
  }
  function wedge(parent,outline,depth,mat){
    const shape=new THREE.Shape();outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:2,steps:1}),mat);
    mesh.position.z=-depth/2;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function wheel(parent,x,y,z,r,width,board=false){
    const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
    const tire=new THREE.Mesh(new THREE.CylinderGeometry(r,r,width,20),rubber);tire.rotation.x=Math.PI/2;group.add(tire);
    const spokes=new THREE.InstancedMesh(unitBox,steel,10);
    const treads=new THREE.InstancedMesh(unitBox,dark,10);
    const part=new THREE.Object3D();let spokeIndex=0;
    group.add(spokes,treads);
    for(const side of [-1,1]){
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*.58,r*.58,.025,12),alloy);
      hub.rotation.x=Math.PI/2;hub.position.z=side*(width/2+.015);group.add(hub);
      for(let i=0;i<5;i++){
        part.position.set(0,0,side*(width/2+.035));part.scale.set(r*.9,.035,.025);
        part.rotation.z=i*Math.PI/5;part.updateMatrix();spokes.setMatrixAt(spokeIndex++,part.matrix);
      }
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r*.7,.016,5,20),board?cyan:dark);
      ring.position.z=side*(width/2+.025);group.add(ring);
    }
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5;
      part.position.set(Math.sin(a)*r,Math.cos(a)*r,0);part.scale.set(.055,.025,width*.9);
      part.rotation.z=-a;part.updateMatrix();treads.setMatrixAt(i,part.matrix);
    }
    return group;
  }

  // Two lanes of moving traffic, separated from the pickup sidewalk.
  const asphalt=material('#18212a',{roughness:.38});
  box(root,0,-.23,-1.3,42,.12,7.7,asphalt);
  box(root,0,-.19,3.4,28,.2,1.8,material('#34414b'));
  box(root,0,-.06,2.5,28,.3,.18,alloy);
  for(let x=-20;x<22;x+=3)box(root,x,-.16,-2.1,1.4,.014,.07,trim);
  for(let x=-13;x<14;x+=2)box(root,x,-.075,3.4,.015,.012,1.7,steel);
  for(let x=-12;x<14;x+=7){
    box(root,x,-.14,2,.8,.025,.5,dark);
    for(let i=0;i<6;i++)box(root,x-.32+i*.13,-.12,2,.035,.014,.4,alloy);
  }
  const puddleMat=material('#233e51',{metalness:.65,roughness:.16,transparent:true,opacity:.65});
  for(const [x,z,sx,sz] of [[-7,.7,2,.4],[4,-3.2,2.8,.35],[7,1.8,1.5,.3]]){
    const puddle=ball(root,x,-.15,z,sx,.008,sz,puddleMat);puddle.castShadow=false;
  }
  for(const x of [-7,6]){
    box(root,x,.15,3.1,.17,.55,.17,steel);box(root,x,.36,3.1,.19,.12,.19,amber);
  }
  // A two storey corner shop, with a human sized door beside the pickup bay.
  const masonry=material('#30404a'), glass=material('#203c4b',{metalness:.45,roughness:.22});
  box(root,-9,2.95,6,6,6.2,6,masonry);
  box(root,-9,6.1,6,6.25,.25,6.25,steel);
  box(root,-9,3.1,2.96,6.1,.18,.16,alloy);
  box(root,-5.96,3.1,6,.16,.18,6.1,alloy);
  // Shopfront facing the road.
  for(const x of [-10.6,-7.5]){
    box(root,x,1.3,2.96,2.5,2.15,.04,glass);
    box(root,x,1.3,2.91,.07,2.2,.08,alloy);
    box(root,x,.2,2.91,2.6,.09,.08,alloy);
    box(root,x,2.4,2.91,2.6,.09,.08,alloy);
  }
  for(const x of [-10.6,-8.8,-7])box(root,x,4.6,2.96,.9,1.35,.04,glass);
  // The visible side entrance is taller than the courier.
  box(root,-5.96,1.08,4.4,.04,2.3,1.1,dark);
  box(root,-5.92,1.35,4.4,.04,1.25,.85,glass);
  box(root,-5.88,1.05,4.83,.08,.09,.2,trim);
  for(const z of [6.2,8])box(root,-5.96,1.35,z,.04,1.9,1.2,glass);
  for(const z of [4.4,6.2,8])box(root,-5.96,4.6,z,.04,1.35,.9,glass);
  box(root,-5.5,2.65,4.5,1.1,.12,2,steel);
  const shopName=label(root,'C0saNostra Pizza',4.5,.7,-5.86,3.5,6,'#e4b76b');
  shopName.rotation.y=Math.PI/2;
  label(root,'C0saNostra Pizza',5,.7,-9,3.5,2.85,'#e4b76b');
  // Pickup locker and street furniture.
  box(root,-4,.48,2.9,2.1,1.25,1.2,steel);
  box(root,-4,1.15,2.9,2.25,.12,1.3,alloy);
  box(root,-4,.55,3.51,1.7,.73,.025,dark);
  label(root,'PICKUP / 07',1.6,.35,-4,.67,3.53);
  box(root,-3.3,.32,3.55,.12,.12,.03,cyan);
  box(root,-5.25,1.7,2.9,.09,3.8,.09,steel);
  label(root,'C0saNostra',2.7,.65,-4,3.1,3,'#e4b76b');
  label(root,'NO PARKING',1.2,.28,5.3,1.75,2.8,'#c77569');
  box(root,5.3,.7,2.75,.07,2,.07,steel);

  const carWheels=[];
  function makeCar(color,number){
    const car=new THREE.Group();root.add(car);
    const paint=material(color,{metalness:.65,roughness:.35});
    wedge(car,[[-2,.35],[-2.1,.74],[-1.3,.9],[.8,.9],[2.15,.57],[2.1,.34]],1.7,paint);
    wedge(car,[[-1.32,.83],[-.8,1.43],[.52,1.43],[1.2,.83]],1.4,dark);
    box(car,-.15,1.48,0,1.55,.08,1.55,paint);
    for(const z of [-.72,.72]){
      // Split windows and pillars, mirrors, inset door handles and a worn stripe.
      box(car,-.55,1.13,z,.55,.38,.024,material('#3c677a',{metalness:.5,roughness:.22}));
      box(car,.2,1.13,z,.55,.38,.024,material('#3c677a',{metalness:.5,roughness:.22}));
      box(car,-.13,1.14,z,.055,.56,.035,paint);
      box(car,.8,.95,z*1.4,.2,.12,.18,paint);
      box(car,-.62,.78,z*1.24,.25,.035,.025,alloy);
      box(car,-.1,.51,z*1.24,3.6,.08,.025,trim);
      for(let i=0;i<5;i++)box(car,-1.4+i*.13,.52,z*1.26,.07,.04,.025,paint);
    }
    for(const x of [-1.3,1.35])for(const z of [-.94,.94])carWheels.push(wheel(car,x,.24,z,.39,.23));
    box(car,2.12,.45,0,.08,.12,1.85,steel);
    box(car,-2.12,.49,0,.09,.15,1.85,steel);
    for(const z of [-.62,.62]){
      box(car,2.12,.65,z,.04,.13,.4,white);
      box(car,-2.13,.68,z,.04,.1,.45,red);
    }
    for(let i=0;i<7;i++)box(car,2.15,.48,-.35+i*.12,.025,.07,.035,alloy);
    const plate=label(car,number,.55,.16,-2.18,.48,0,'#a9b5b9');plate.rotation.y=-Math.PI/2;
    return car;
  }
  const targetCar=makeCar('#384e5a','07 204');
  const traffic=[
    {car:makeCar('#713d3d','11 082'),offset:-1,speed:5.5,lane:-.7},
    {car:makeCar('#4c5363','03 619'),offset:10,speed:-4.5,lane:-4},
    {car:makeCar('#74715b','18 036'),offset:24,speed:-4.5,lane:-4},
    {car:makeCar('#334c4b','05 192'),offset:-23,speed:3.2,lane:-.7}
  ];
  traffic.filter(t=>t.speed<0).forEach(t=>t.car.rotation.y=Math.PI);

  const rider=new THREE.Group();root.add(rider);
  const board=new THREE.Group();rider.add(board);
  box(board,0,.24,0,1.55,.1,.48,dark);
  for(const x of [-.73,.73])box(board,x,.28,0,.2,.07,.48,jacket).rotation.z=x>0?.3:-.3;
  box(board,0,.18,0,1.2,.07,.35,steel);
  for(const x of [-.5,.5]){
    box(board,x,.12,0,.18,.1,.78,alloy);
    box(board,x,.15,0,.2,.13,.19,trim);
  }
  const boardWheels=[];
  for(const x of [-.53,.53])for(const z of [-.37,.37])boardWheels.push(wheel(board,x,.1,z,.23,.18,true));
  for(const z of [-.25,.25])box(board,0,.26,z,1.15,.028,.02,cyan);
  for(const x of [-.45,.45])for(const z of [-.13,.13])ball(board,x,.3,z,.018,.009,.018,alloy);

  const body=new THREE.Group();rider.add(body);
  const torso=new THREE.Group();body.add(torso);
  box(torso,0,0,0,.42,.64,.48,jacket);
  box(torso,.215,0,0,.025,.56,.035,alloy);
  for(const z of [-.27,.27]){
    box(torso,.05,.15,z,.37,.07,.025,trim);
    box(torso,-.03,-.17,z,.28,.16,.045,steel);
    for(let i=0;i<3;i++)box(torso,.1-i*.08,.02,z,.035,.015,.015,trim).rotation.z=.3;
  }
  box(torso,-.25,.02,0,.16,.5,.4,bagMat);
  box(torso,-.34,.03,0,.025,.36,.28,dark);
  box(torso,0,.31,0,.5,.1,.58,steel);
  const strap=box(torso,.235,0,0,.025,.68,.07,dark);strap.rotation.x=-.55;
  box(torso,.25,-.1,-.08,.035,.1,.09,alloy);
  const head=new THREE.Group();body.add(head);
  ball(head,0,0,0,.2,.24,.19,skin);
  ball(head,.18,-.015,0,.07,.055,.055,skin);
  ball(head,-.035,.12,0,.235,.18,.23,trim);
  box(head,.1,.03,0,.26,.065,.43,dark);
  box(head,.235,.03,0,.025,.05,.34,cyan);
  box(head,-.04,.285,0,.32,.018,.055,steel);
  for(let i=0;i<3;i++)box(head,-.07+i*.075,.25,.14,.035,.018,.05,alloy).rotation.z=.25;
  const ponytail=new THREE.Group();head.add(ponytail);
  for(let i=0;i<5;i++)ball(ponytail,-.2-i*.075,-.01-i*.03,.04,.1-i*.012,.075,.075,hair);
  ball(head,-.22,.01,.04,.07,.07,.07,bagMat);
  const legs=[joint(body,.12,pants),joint(body,.105,pants),joint(body,.12,pants),joint(body,.105,pants)];
  const arms=[joint(body,.085,jacket),joint(body,.07,skin),joint(body,.085,jacket),joint(body,.07,skin)];
  const knees=[ball(body,0,0,0,.15,.12,.14,steel),ball(body,0,0,0,.15,.12,.14,steel)];
  const elbows=[ball(body,0,0,0,.095,.095,.095,dark),ball(body,0,0,0,.095,.095,.095,dark)];
  for(const x of [-.42,.45]){
    box(body,x,.37,0,.37,.16,.25,dark);
    box(body,x,.3,0,.39,.035,.27,alloy);
    box(body,x+.05,.43,0,.07,.025,.25,trim);
  }
  const launcher=new THREE.Group();body.add(launcher);
  box(launcher,0,0,0,.35,.14,.16,steel);
  box(launcher,.19,0,0,.07,.08,.1,alloy);
  const reel=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.12,16),trim);
  reel.rotation.x=Math.PI/2;reel.position.set(-.06,.06,0);launcher.add(reel);
  box(launcher,.04,.08,.09,.12,.03,.02,cyan);

  const parcel=new THREE.Group();root.add(parcel);
  box(parcel,0,0,0,.92,.13,.92,material('#bbae85'));
  box(parcel,0,-.06,0,.94,.04,.94,trim);
  const logo=label(parcel,'C0saNostra',.75,.19,0,.072,0,'#ac4439','#bbae85');logo.rotation.x=-Math.PI/2;
  box(parcel,0,.075,0,.045,.009,.95,bagMat);
  for(const x of [-.35,.35])for(let i=0;i<3;i++)box(parcel,x,0,-.18+i*.18,.035,.025,.04,dark);
  const cableGeometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:13},()=>new THREE.Vector3()));
  const cable=new THREE.Line(cableGeometry,new THREE.LineBasicMaterial({color:'#a4c4d5'}));root.add(cable);
  const magnet=new THREE.Group();root.add(magnet);
  box(magnet,0,0,0,.12,.16,.22,steel);box(magnet,.07,0,0,.04,.18,.24,cyan);
  const sparks=new THREE.Group();root.add(sparks);
  for(let i=0;i<7;i++)box(sparks,Math.cos(i*2.4)*.15,Math.sin(i*2.4)*.12,0,.02,.12,.02,amber).rotation.z=i;
  const hand=new THREE.Vector3(),rear=new THREE.Vector3(),towEnd=new THREE.Vector3();

  function frame(seconds,reduced=false){
    // One deterministic timeline keeps reset, background tabs and reduced motion reliable.
    const t=reduced?4.65:Math.min(seconds,9);
    const collect=clamp(t/1.65,0,1),street=smooth((t-1.65)/2.15),fire=clamp((t-3.75)/.38,0,1);
    const pull=smooth((t-4.13)/.5),departure=Math.max(0,t-4.65);
    const carX=-11.5+3.2*t+departure*departure*.9;
    targetCar.position.set(carX,0,-.7);
    for(const item of traffic){
      item.car.position.set(((item.offset+item.speed*t+72)%48)-24,0,item.lane);
    }
    const preX=mix(-8.3,-4.5,collect)+street*1.4;
    const towedX=carX-4.6;
    const pickupZ=mix(2.25,4,smooth((collect-.65)/.35));
    rider.position.set(mix(preX,towedX,pull),mix(.04,-.04,street),mix(pickupZ,.65,street));
    rider.rotation.y=Math.sin(street*Math.PI)*.5;
    board.rotation.x=Math.sin(street*Math.PI)*.12;
    board.rotation.z=(!reduced?Math.sin(t*17)*.012:0)-Math.sin(pull*Math.PI)*.035;
    const crouch=.16*street+.12*Math.sin(pull*Math.PI);
    torso.position.set(.06+pull*.17,1.15-crouch,0);torso.rotation.z=-.15-pull*.22;
    head.position.set(.17+pull*.3,1.7-crouch,0);head.rotation.y=-.35*street;
    ponytail.rotation.z=.2+pull*.35+(!reduced?Math.sin(t*9)*.12:0);
    const hip=[-.07, .9-crouch,0],backKnee=[-.52,.66-crouch*.4,.06],frontKnee=[.53,.62-crouch*.4,-.03];
    legs[0](hip,backKnee);legs[1](backKnee,[-.42,.42,0]);legs[2](hip,frontKnee);legs[3](frontKnee,[.45,.42,0]);
    knees[0].position.set(...backKnee);knees[1].position.set(...frontKnee);
    const reach=Math.sin(clamp((t-1.1)/1.1,0,1)*Math.PI);
    const handZ=t<1.65?mix(.4,-.95,smooth((t-1.1)/.55)):mix(-.95,.55,smooth((t-1.65)/.6));
    const boxHand=[.4+reach*.15,1.16-crouch*.3,handZ];
    const aimHand=[.62+fire*.12,1.05-crouch*.5,-.25];
    const boxElbow=[.02,1.02-crouch,.4],aimElbow=[.34,1.15-crouch,-.32];
    arms[0]([.08,1.4-crouch,.25],boxElbow);arms[1](boxElbow,boxHand);
    arms[2]([.08,1.4-crouch,-.25],aimElbow);arms[3](aimElbow,aimHand);
    elbows[0].position.set(...boxElbow);elbows[1].position.set(...aimElbow);
    launcher.position.set(...aimHand);
    root.updateMatrixWorld(true);
    if(t<1.65)parcel.position.set(-4,1.28,3.15);
    else{v1.set(boxHand[0]-.05,boxHand[1]+.08,boxHand[2]+.1);body.localToWorld(v1);parcel.position.copy(v1);}
    parcel.rotation.z=t<1.65?0:-.05-pull*.04;
    launcher.getWorldPosition(hand);hand.x+=.2;
    rear.set(carX-2.17,.54,-.7);towEnd.copy(hand).lerp(rear,fire);
    cable.visible=t>=3.75;magnet.visible=cable.visible;magnet.position.copy(towEnd);
    const points=cableGeometry.attributes.position;
    for(let i=0;i<13;i++){
      const f=i/12;v1.copy(hand).lerp(towEnd,f);
      v1.y-=Math.sin(f*Math.PI)*(.22*(1-pull)+.025);
      points.setXYZ(i,v1.x,v1.y,v1.z);
    }
    points.needsUpdate=true;cableGeometry.computeBoundingSphere();
    sparks.visible=!reduced&&t>=4.1&&t<4.3;sparks.position.copy(rear);
    for(const wheel of carWheels)wheel.rotation.z=-t*8;
    for(const wheel of boardWheels)wheel.rotation.z=-t*15;
    const phase=t<1.65?'collect':t<3.75?'approach':t<4.13?'hook':'ride';
    return {done:seconds>=9,phase};
  }
  return {
    start(){root.visible=true;frame(0);},
    reset(){root.visible=false;},
    frame
  };
}
