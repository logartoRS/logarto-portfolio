import * as THREE from 'three';
import { VoxelDetails } from './voxel-details';

export function populateAlleys(v:VoxelDetails,scene:THREE.Scene): (t:number)=>void {
 const material=new THREE.MeshStandardMaterial({color:'#202f38'});
 // Poles on the sidewalk edge; all three wires terminate on insulators.
 const poles=[[-7.7,-8.1],[-7.7,-13.3],[-7.7,-17]];
 for(const [x,z] of poles){
  v.add(x,3.8,z,.15,4.5,.15,'#85938a');v.add(x,5.85,z,1.1,.1,.1,'#536974');
  v.add(x,4.4,z+.16,.32,.55,.22,'#526b70');
  for(const dx of [-.42,0,.42])v.add(x+dx,5.98,z,.12,.18,.12,'#bdbaa4');
  for(let y=2;y<5.7;y+=.55)v.add(x,y,z,.19,.045,.19,'#4a5d64');
 }
 for(let i=0;i<poles.length-1;i++)for(const dx of [-.42,0,.42]){
  const [x,z]=poles[i],[x2,z2]=poles[i+1];
  const c=new THREE.CatmullRomCurve3([new THREE.Vector3(x+dx,6.07,z),new THREE.Vector3(x+dx,5.45,(z+z2)/2),new THREE.Vector3(x2+dx,6.07,z2)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(c,20,.018,4,false),material));
 }
 // Bottles, stacked delivery crates, and paper bundles in the cafe service recess.
 for(let i=0;i<3;i++){
  const x=-5.9+i*.8,z=-8.05;
  v.add(x,1.8,z,.62,.48,.6,'#778454');
  for(let j=0;j<3;j++)v.add(x,1.64+j*.16,z-.31,.64,.055,.04,'#475c47');
  for(let a=0;a<3;a++)for(let b=0;b<2;b++){v.add(x-.2+a*.2,2.13,z-.15+b*.3,.09,.23,.09,'#4a7a62');v.add(x-.2+a*.2,2.27,z-.15+b*.3,.045,.06,.045,'#b2b592');}
 }
 v.add(-2,1.84,-8.05,.7,.56,.65,'#846f54');
 for(let i=0;i<8;i++)v.add(-2,2.15+i*.022,-8.05,.6,.018,.47,i%2?'#bfc1aa':'#728580');
 // The full forest rim is generated on one shared grid in populateDistrict.
 for(const z of [-10.25,-13.85,-17]){
  const surface=1.4+Math.floor((Math.sin(z*.5)+1)*2)*.3-.3;
  v.tree(-11.2,surface,z,.7);
 }
 for(let i=0;i<180;i++){
  const z=-17.65+(i%36)*.26,x=-11.9+Math.sin(i*17)*.55;
  if(x< -12.2+Math.sin(z)*.6)continue;
  const surface=1.4+Math.floor((Math.sin(z*.5)+1)*2)*.3-.3;
  v.add(x,surface+.12,z,.16,.24,.16,['#477b4e','#638b52','#83a567'][i%3]);
 }
 // Compact wall-mounted extractors, with recessed blades.
 for(const [x,y,z] of [[-6.98,4.25,-9.15],[7.56,4.7,-11.6],[7.56,9.4,-11.6]]){
  v.add(x,y,z,.2,.8,.8,'#627b7b');
  for(let j=0;j<6;j++)v.add(x-.12,y-.3+j*.12,z,.035,.035,.64,'#263f49');
 }
 const label=(text:string,x:number,y:number,z:number,floor=false)=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d')!;
  if(!floor){ctx.fillStyle='#d3c5a3';ctx.fillRect(0,0,256,256);}ctx.fillStyle=floor?'#d5d4b7':'#344b4c';ctx.font='bold 52px Barlow, sans-serif';ctx.textAlign='center';text.split('|').forEach((line,i)=>ctx.fillText(line,128,75+i*65));
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(floor?.8:.42,floor?1.25:.55),new THREE.MeshBasicMaterial({map:tex,transparent:floor,depthWrite:!floor,polygonOffset:floor,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.position.set(x,y,z);if(floor)m.rotation.x=-Math.PI/2;else m.rotation.y=Math.PI;scene.add(m);
 };
 label('歩行者|優先',-8.65,1.578,-11,true);label('ゆっくり',.1,1.578,-14.7,true);
 label('喫茶|本日',-3,3,-8.39);label('珈琲|抹茶',-2.45,3,-8.39);
 // Wind-driven petals from the sole rooftop cherry tree; one batched draw call.
 const petals=new THREE.InstancedMesh(new THREE.PlaneGeometry(.07,.11),new THREE.MeshStandardMaterial({color:'#cc7648',side:THREE.DoubleSide,roughness:.9}),72);
 petals.frustumCulled=false;scene.add(petals);const dummy=new THREE.Object3D();
 return (t:number)=>{
  for(let i=0;i<72;i++){
   const age=(t*.12+i/72)%1;
   dummy.position.set(6.4+age*4.2+Math.sin(i*7)*.65,11.1-age*3.4+Math.sin(i*3)*.7,-2+age*1.9+Math.sin(t*.7+i)*.35);
   dummy.rotation.set(t+i,t*.4+i,t*.8);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);
  }
  petals.instanceMatrix.needsUpdate=true;
 };
}
