import * as THREE from 'three';
import { VoxelDetails } from './voxel-details';

/** Steel office frame, visible workspaces, stepped gardens and a clear landing deck. */
export function populateOfficeGarden(source:VoxelDetails,root:THREE.Scene){
 const scene=new THREE.Group();scene.position.z=-1.6;root.add(scene);
 const v={add:(x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>source.add(x,y,z-1.6,w,h,d,c),tree:(x:number,y:number,z:number,s=1,p=false)=>source.tree(x,y,z-1.6,s,p)};
 const steel='#304550',edge='#64797b',wood='#aa875d';
 const cube=new THREE.BoxGeometry(1,1,1);
 const glass=new THREE.MeshStandardMaterial({color:'#72b4ba',transparent:true,opacity:.38,roughness:.2,metalness:.15,depthWrite:false});
 const glow=new THREE.MeshStandardMaterial({color:'#ffd3a0',emissive:'#ffc27a',emissiveIntensity:1.4});
 const cyan=new THREE.MeshStandardMaterial({color:'#67cdd1',emissive:'#43bec8',emissiveIntensity:2});
 const pane=(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material)=>{const m=new THREE.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(w,h,d);scene.add(m);return m;};
 const beam=(a:THREE.Vector3,b:THREE.Vector3)=>{const m=pane((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,.13,a.distanceTo(b),.13,new THREE.MeshStandardMaterial({color:steel}));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());};
 const rail=(x1:number,z1:number,x2:number,z2:number,y:number)=>{
  const n=Math.ceil(Math.hypot(x2-x1,z2-z1)/.45);
  for(let i=0;i<=n;i++)v.add(x1+(x2-x1)*i/n,y+.38,z1+(z2-z1)*i/n,.045,.76,.045,steel);
  v.add((x1+x2)/2,y+.75,(z1+z2)/2,Math.max(.045,Math.abs(x2-x1)),.05,Math.max(.045,Math.abs(z2-z1)),edge);
 };
 const garden=(x:number,y:number,z:number,w:number,d:number,seed:number)=>{
  v.add(x,y+.12,z,w,.24,d,'#65756b');v.add(x,y+.255,z,w-.09,.03,d-.09,'#354d3d');
  for(let i=0;i<Math.ceil(w*d*17);i++){
   const a=Math.sin(i*17+seed)*.5+.5,b=Math.sin(i*29+seed*3)*.5+.5;
   const px=x+(a-.5)*(w-.16),pz=z+(b-.5)*(d-.16),h=.16+(i%4)*.055;
   v.add(px,y+.27+h/2,pz,.13,h,.13,['#477951','#6f9655','#3e8270','#94aa63'][i%4]);
   if(i%9===0)v.add(px,y+.3+h,pz,.1,.08,.1,seed%2?'#c694b4':'#d8c38c');
  }
  for(let i=0;i<Math.floor(w*3);i++)for(let j=0;j<4+i%5;j++)v.add(x-w/2+.18+i*.32,y+.15-j*.18,z-d/2-.07,.12,.19,.13,['#557d4b','#78995b'][j%2]);
 };
 // Unified podium and central entrance, linked to the cafe courtyard.
 v.add(2.9,1.72,-11.35,7.3,.32,5.6,'#697b78');
 for(let i=0;i<3;i++)v.add(1.9,1.57+(3-i)*.055,-14.35-i*.24,2.4,(3-i)*.11,.24,'#88968e');
 const bottom=1.88,step=2.35;
 for(let f=0;f<6;f++){
  const y=bottom+f*step;
  v.add(2.9,y,-11.35,7.25,.2,5.55,steel);
  v.add(2.9,y+.13,-11.35,6.9,.06,5.2,'#9d947e');
  // Back core stays solid; both primary facades are real glazed openings.
  v.add(2.9,y+1.2,-8.65,7,2.2,.16,'#4d6670');
  for(const x of [-.62,1.12,2.86,4.6,6.4])v.add(x,y+1.17,-14.06,.14,2.34,.2,steel);
  for(let j=0;j<4;j++){
   const x=.25+j*1.74;
   if(f===0&&j===1){
    for(const dx of [-.38,.38]){pane(x+dx,y+1,-14.09,.7,1.85,.035,glass);v.add(x+dx,y+.95,-14.14,.035,.38,.035,edge);}
    v.add(x,y+1,-14.13,.055,1.96,.06,steel);v.add(x,y+2.02,-14.13,1.55,.12,.12,edge);
    pane(x,y+2.02,-14.21,.65,.055,.02,glow);
    continue;
   }
   pane(x,y+1.13,-14.08,1.53,1.95,.035,glass);
   v.add(x,y+1.96,-13.65,1.4,.18,.055,'#39717b');
   if((f+j)%3===0){
    v.add(x,y+.75,-12.8,1.1,1.2,.45,'#64756c');
    for(let shelf=0;shelf<3;shelf++){
     v.add(x,y+.25+shelf*.38,-13.05,1.14,.06,.08,wood);
     for(let book=0;book<7;book++)v.add(x-.45+book*.14,y+.42+shelf*.38,-13.04,.09,.25,.15,['#bd956a','#64888b','#9a707d'][book%3]);
    }
    continue;
   }
   // Workstations and chairs visible through the glazing.
   v.add(x,y+.75,-12.95,1.15,.08,.62,wood);
   for(const dx of [-.46,.46])v.add(x+dx,y+.4,-12.95,.05,.7,.5,steel);
   v.add(x,y+1.06,-12.96,.4,.26,.045,'#243b48');pane(x,y+1.06,-12.994,.34,.2,.013,cyan);
   v.add(x,y+.47,-12.28,.38,.08,.4,'#516d69');v.add(x,y+.75,-12.08,.38,.5,.06,'#516d69');
   v.add(x,y+.24,-12.28,.055,.45,.055,steel);
   pane(x,y+2.1,-12.9,.85,.045,.13,glow);
  }
  // Different rear storage arrangements and a meeting table on alternating floors.
  const storageX=f%2===0?.5:4.9;
  v.add(storageX,y+.88,-9.15,1.25,1.5,.45,'#778078');
  for(const dx of [-.3,.3])v.add(storageX+dx,y+.88,-9.39,.025,1.35,.025,wood);
  if(f%2===1){v.add(3,y+.8,-10.4,1.7,.1,.8,wood);for(const dx of [-.6,.6])v.add(3+dx,y+.42,-10.4,.08,.76,.5,steel);}
  // Occupied workspaces: storage, meeting corners and small everyday objects.
  const sideX=f%2===0?5.1:.6;
  v.add(sideX,y+.5,-10.75,.8,.65,.65,'#637b77');
  for(let drawer=0;drawer<3;drawer++){
   v.add(sideX,y+.28+drawer*.19,-11.085,.71,.025,.025,'#aab2a0');
   v.add(sideX,y+.35+drawer*.19,-11.1,.16,.03,.025,steel);
  }
  v.add(sideX,y+.88,-10.75,.5,.12,.38,'#b4b4a1');
  v.add(sideX,y+.96,-10.75,.38,.04,.29,'#ddd9bd');
  const plantX=f%2===0?5.85:.05;
  v.add(plantX,y+.34,-9.85,.32,.32,.32,'#a18161');
  for(let i=0;i<5;i++)v.add(plantX+Math.sin(i*2)*.12,y+.62+i*.035,-9.85+Math.cos(i*2)*.12,.17,.25,.16,['#44755a','#749561'][i%2]);
  // Noticeboard on the solid core, with staggered notes.
  v.add(3,y+1.25,-8.76,1.4,.78,.07,'#ad9874');
  for(let i=0;i<6;i++)v.add(2.52+(i%3)*.4,y+1.07+Math.floor(i/3)*.3,-8.805,.26,.2,.015,['#d6ca91','#a6bbb1','#d4ae93'][i%3]);
  if(f%2===0){
   v.add(2.8,y+.52,-10.5,1.65,.5,.6,'#546e7c');
   v.add(2.8,y+.91,-10.22,1.65,.54,.12,'#546e7c');
   v.add(2.8,y+.43,-11.4,1.15,.08,.48,wood);
   for(const x of [2.4,3.2])v.add(x,y+.28,-11.4,.055,.25,.3,steel);
  }else{
   for(const x of [2.35,3.65])for(const z of [-9.8,-11]){
    v.add(x,y+.49,z,.34,.08,.34,'#6e7b6e');v.add(x,y+.28,z,.06,.35,.06,steel);
   }
  }
  // Books and coffee mugs on occupied front desks, keeping the lobby door clear.
  for(let j=0;j<4;j++){
   if((f+j)%3===0||(f===0&&j===1))continue;
   const x=.25+j*1.74;
   v.add(x+.39,y+.87,-12.82,.11,.14,.11,'#d7ceb4');
   for(let k=0;k<3;k++)v.add(x-.36,y+.81+k*.025,-12.85,.23,.02,.3,['#b6c1aa','#997a62','#d0c5a4'][k]);
   v.add(x,y+.807,-13.12,.3,.016,.11,'#566974');
  }
  // Enclose the west elevation as well; terrace doors occupy its rear bays.
  for(let j=0;j<3;j++){
   const z=-14.05+j*1.8;
   pane(-.64,y+1.15,z+.9,.035,2.08,1.73,glass);
   v.add(-.68,y+1.15,z,.11,2.3,.1,steel);
  }
  v.add(-.69,y+2.22,-11.35,.2,.18,5.5,edge);
  for(let j=0;j<3;j++){
   const z=-14.05+j*1.8;
   v.add(6.45,y+1.15,z,.15,2.3,.1,steel);pane(6.43,y+1.15,z+.9,.035,2.08,1.73,glass);
  }
  v.add(6.45,y+2.22,-11.35,.22,.18,5.55,edge);
  v.add(2.9,y+2.22,-14.1,7.25,.2,.23,edge);
  for(let j=0;j<4;j++){if(f>=1&&f<=4&&j===2)continue;v.add(.15+j*1.7,y+1.18,-8.54,.94,1.2,.06,'#527c84');}
 }
 // Terraces now project from the rear, leaving the cafe roof completely clear.
 for(let f=0;f<4;f++){
  const y=4.23+f*2.35,depth=2.1,z=-8.55+depth/2;
  v.add(3,y,z,5.6,.2,depth,steel);
  rail(.25,-8.55+depth,5.75,-8.55+depth,y+.1);
  rail(.25,-8.55,.25,-8.55+depth,y+.1);rail(5.75,-8.55,5.75,-8.55+depth,y+.1);
  garden(3,y+.1,-8.75+depth,4.9,.38,f);
  if(f===0){
   for(const x of [.8,1.45]){v.add(x,y+.35,z,.55,.5,.6,wood);for(let j=0;j<3;j++)v.add(x,y+.12+j*.18,z+.31,.5,.035,.03,steel);}
  }else if(f===1){
   v.add(1,y+.5,z,.85,.75,.5,'#6d8177');for(let j=0;j<6;j++)v.add(1,y+.91+j*.025,z,.7,.018,.4,j%2?'#cecab6':'#8c9892');
  }else if(f===2){
   v.add(1,y+.85,z,.85,1.5,.65,'#5f777d');v.add(1,y+1,z+.34,.6,.88,.03,'#273e48');
   for(let i=0;i<3;i++)for(let j=0;j<3;j++)v.add(.8+i*.2,y+.7+j*.23,z+.37,.1,.15,.045,['#aabb84','#b88764','#7faca7'][i]);
  }else{garden(.85,y+.1,z,.9,.65,2);v.tree(.85,y+.48,z,.38);}

  v.add(3.55,y+1,-8.53,.8,1.8,.04,'#7eaaa3');
 }
 for(const x of [.35,5.65])v.add(x,6.25,-6.6,.16,9.35,.16,steel);
 // External bracing and dedicated equipment bay keep windows unobstructed.
 for(let f=0;f<6;f++){
  const y=bottom+f*step;
  beam(new THREE.Vector3(-.76,y+.16,-13.95),new THREE.Vector3(-.76,y+2.15,-12.1));
  v.add(6.9,y+1.15,-10.5,.55,2.3,1.5,'#3e5560');
  for(const z of [-10.95,-10.65]){v.add(7.22,y+1.1,z,.14,2.2,.14,'#9b8c70');v.add(7.3,y+.6,z,.06,.12,.22,steel);}
  v.add(7.24,y+1.05,-10,.35,.7,.72,'#8b9c97');
  for(let j=0;j<6;j++)v.add(7.43,y+.79+j*.095,-10,.025,.035,.58,steel);
  if(f%2===0)pane(6.56,y+1.1,-13.45,.045,1.1,.05,cyan);
 }
 // Helipad, safety railing, service hut, and beacon lights.
 const roof=16.0;
 v.add(2.9,roof,-11.35,7.5,.24,5.8,steel);
 for(const z of [-14.05,-8.65])rail(-.7,z,6.5,z,roof+.12);
 for(const x of [-.7,6.5])rail(x,-14.05,x,-8.65,roof+.12);
 for(let i=0;i<64;i++){const a=i*Math.PI*2/64;v.add(2.8+Math.cos(a)*1.65,roof+.14,-11.6+Math.sin(a)*1.65,.16,.025,.16,'#ceae66');}
 for(const x of [2.2,3.4])v.add(x,roof+.145,-11.6,.18,.025,1.8,'#dadac1');v.add(2.8,roof+.145,-11.6,1.2,.025,.18,'#dadac1');
 v.add(5.6,roof+.7,-9.4,1.1,1.16,1.1,'#647777');v.add(5.6,roof+.6,-10,.48,.94,.04,'#acb5a0');
 for(const x of [-.65,6.45])for(const z of [-14,-8.7]){v.add(x,roof+.37,z,.055,.5,.055,edge);pane(x,roof+.66,z,.12,.12,.12,glow);}
 // Rooftop mechanical details and light bands sit outside the landing circle.
 for(let i=0;i<2;i++){
  v.add(.1+i*.8,16.48,-9.3,.62,.68,.6,'#84918c');
  for(let j=0;j<5;j++)v.add(.1+i*.8,16.25+j*.1,-9.62,.48,.035,.035,steel);
 }
 for(let f=0;f<5;f++){
  const y=4.23+f*2.35;
  garden(5.9,y+.1,-14.3,.65,.55,f+1);
  pane(5.9,y-.2,-14.21,.45,.045,.055,glow);
 }
 // Ground gardens flank a clear lobby opening and a continuous passage to the cafe.
 for(const x of [-.6,5.7]){garden(x,1.56,-15,.95,1.25,7);}

 for(const [x,z] of [[7.9,-12],[-8,-12]])garden(x,1.56,z,.7,2.2,2);
 const light=new THREE.PointLight('#ffd29b',12,12,2);light.position.set(2.7,7,-14.9);scene.add(light);
}
