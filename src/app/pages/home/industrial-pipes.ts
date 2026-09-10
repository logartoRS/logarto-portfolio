import * as THREE from 'three';

export function populateIndustrialPipes(scene:THREE.Scene){
 const group=new THREE.Group();group.name='Right-edge industrial pipework';scene.add(group);
 const steel=new THREE.MeshStandardMaterial({color:'#437985',metalness:.25,roughness:.75});
 const copper=new THREE.MeshStandardMaterial({color:'#ad7746',metalness:.25,roughness:.755});
 const flange=new THREE.MeshStandardMaterial({color:'#8e9d99',metalness:.7,roughness:.4});
 const red=new THREE.MeshStandardMaterial({color:'#be5936',metalness:.35,roughness:.5});
 const dark=new THREE.MeshStandardMaterial({color:'#253c45',roughness:.65});
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;};
 // Extruded pixel cross-sections: every face stays aligned with the voxel grid.
 const pipe=(a:THREE.Vector3,b:THREE.Vector3,r:number,material:THREE.Material)=>{
  const delta=b.clone().sub(a),center=a.clone().add(b).multiplyScalar(.5);
  const axis=Math.abs(delta.y)>.001?'y':Math.abs(delta.x)>.001?'x':'z';
  const length=Math.abs(delta[axis]);
  for(let row=-2;row<=2;row++){
   const width=(Math.abs(row)===2?3:5)*r*.4;
   const size=axis==='z'?[width,r*.4,length]:axis==='y'?[width,length,r*.4]:[length,width,r*.4];
   const position=center.clone();position[axis==='z'?'y':'z']+=row*r*.4;
   add(new THREE.BoxGeometry(...size as [number,number,number]),material,position.x,position.y,position.z);
  }
 };
 // Parallel mains of different diameters, mounted outside the pedestrian coping.
 const lines=[{x:10.55,y:1.05,r:.3},{x:11.2,y:.4,r:.2},{x:10.65,y:-.3,r:.12}];
 for(const [i,line] of lines.entries()){
  const {x,y,r}=line,mat=i===2?copper:steel;
  pipe(new THREE.Vector3(x,y,-16),new THREE.Vector3(x,y,7),r,mat);
  for(let z=-15;z<7;z+=2.6){
   pipe(new THREE.Vector3(x,y,z-.07),new THREE.Vector3(x,y,z+.07),r*1.32,flange);
   for(let bolt=0;bolt<6;bolt++){const angle=bolt*Math.PI/3;pipe(new THREE.Vector3(x+Math.cos(angle)*r*1.13,y+Math.sin(angle)*r*1.13,z-.09),new THREE.Vector3(x+Math.cos(angle)*r*1.13,y+Math.sin(angle)*r*1.13,z+.09),.035,copper);}
   add(new THREE.BoxGeometry(1.5,.12,.24),dark,10.5,y-r-.12,z);
  }
  // Both ends turn inward and terminate inside the island wall.
  for(const z of [-16,7]){
   pipe(new THREE.Vector3(x,y,z),new THREE.Vector3(9.65,y,z),r,mat);
   pipe(new THREE.Vector3(9.94,y,z),new THREE.Vector3(10.06,y,z),r*1.35,flange);
  }
 }
 const vents:THREE.Vector3[]=[];
 for(const [index,z] of [-12,-5,2,5].entries()){
  const x=10.55,y=1.05;
  pipe(new THREE.Vector3(x,y,z),new THREE.Vector3(x,1.8,z),.09,copper);
  for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++){
   const radius=dx*dx+dz*dz;
   if(radius>=6&&radius<=11)add(new THREE.BoxGeometry(.075,.07,.075),index%2?red:copper,x+dx*.075,1.86,z+dz*.075);
  }
  pipe(new THREE.Vector3(x-.25,1.86,z),new THREE.Vector3(x+.25,1.86,z),.025,copper);
  pipe(new THREE.Vector3(x,1.86,z-.25),new THREE.Vector3(x,1.86,z+.25),.025,copper);
  if(index<3){
   const outlet=new THREE.Vector3(11.2,1.6,z+.85);
   pipe(new THREE.Vector3(11.2,.4,z+.85),outlet,.1,steel);
   pipe(outlet.clone().add(new THREE.Vector3(0,-.06,0)),outlet,.15,flange);
   add(new THREE.PlaneGeometry(.13,.13),dark,outlet.x,outlet.y+.003,outlet.z).rotation.x=-Math.PI/2;
   vents.push(outlet);
  }
 }
 const smoke:THREE.Mesh[]=[];const puffGeometry=new THREE.BoxGeometry(1.5,1.5,1.5);
 for(const [vent,origin] of vents.entries())for(let i=0;i<10;i++){
  const puff=add(puffGeometry,new THREE.MeshBasicMaterial({color:'#d6e5dd',transparent:true,opacity:0,depthWrite:false}),0,0,0);puff.castShadow=false;puff.userData={origin,i,vent};smoke.push(puff);
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 return (time:number)=>{for(const puff of smoke){const {origin,i,vent}=puff.userData;const phase=((reduced.matches?2:time)*.22+i/10+vent*.13)%1;puff.position.copy(origin).add(new THREE.Vector3(phase*.55+Math.sin(phase*7+i)*.08,.12+phase*1.65,Math.sin(phase*5+vent)*phase*.18));puff.scale.setScalar(.08+phase*.24);(puff.material as THREE.MeshBasicMaterial).opacity=Math.sin(phase*Math.PI)*.24;}};
}
