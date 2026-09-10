import * as THREE from 'three';
export function populateCafeHobbies(scene:THREE.Scene){
 const group=new THREE.Group();group.position.set(-6.3,1.56,-13.7);group.rotation.y=Math.PI;scene.add(group);
 const cube=new THREE.BoxGeometry(1,1,1);const materials=new Map<string,THREE.MeshStandardMaterial>();
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:string)=>{let mat=materials.get(color);if(!mat){mat=new THREE.MeshStandardMaterial({color,roughness:.65});materials.set(color,mat);}const m=new THREE.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;group.add(m);return m;};
 // Small display plinth and a voxel Gundam-style model.
 box(0,.22,0,.72,.44,.65,'#53635b');box(0,.46,0,.82,.07,.72,'#ac9874');
 for(const side of [-1,1]){const x=side*.16;box(x,.56,.07,.25,.15,.38,'#9e3c30');box(x,.8,0,.18,.36,.19,'#e4e5d9');box(x,.98,.105,.19,.13,.06,'#6593a6');box(x,1.17,0,.2,.32,.2,'#e4e5d9');box(side*.39,1.58,0,.29,.22,.28,'#e4e5d9');box(side*.4,1.34,0,.17,.28,.18,'#6195ad');box(side*.42,1.12,.02,.19,.22,.22,'#e4e5d9');box(side*.42,.96,.04,.15,.12,.15,'#293c44');const antenna=box(side*.12,2.01,.13,.045,.3,.045,'#e5b34d');antenna.rotation.z=-side*.8;}
 box(0,1.28,0,.4,.16,.29,'#9e3c30');box(0,1.5,0,.47,.36,.3,'#3e718d');box(0,1.57,.17,.18,.12,.05,'#e1b14b');box(0,1.83,0,.27,.28,.27,'#e4e5d9');box(0,1.83,.15,.2,.045,.025,'#63d9b5');box(0,1.74,.17,.07,.09,.07,'#b84b39');box(0,1.47,-.22,.27,.35,.18,'#374e5d');
 // Shrink the figure around its feet, preserving the display pedestal.
 for(const part of group.children.slice(2)){part.position.x*=.6;part.position.z*=.6;part.position.y=.495+(part.position.y-.495)*.6;part.scale.multiplyScalar(.6);}
 const steam:THREE.Mesh[]=[];const geometry=new THREE.SphereGeometry(1,7,5);
 for(let cup=0;cup<2;cup++)for(let i=0;i<12;i++){const material=new THREE.MeshBasicMaterial({color:'#f4eddb',transparent:true,opacity:0,depthWrite:false});const puff=new THREE.Mesh(geometry,material);puff.userData={cup,i};scene.add(puff);steam.push(puff);}
 return (time:number)=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const puff of steam){const {cup,i}=puff.userData;const phase=((reduced?1.2:time)*.35+i/12)%1;const x=-4+(cup===0?-.47:.47);puff.position.set(x+Math.sin(phase*7+i)*.045+phase*.14,2.81+phase*.75,-14.6+Math.cos(phase*6+i)*.035);puff.scale.setScalar(.025+phase*.065);(puff.material as THREE.MeshBasicMaterial).opacity=Math.sin(phase*Math.PI)*.19;}};
}
