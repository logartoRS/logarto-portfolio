import * as THREE from 'three';

/** Shallow-swimming voxel koi. Paths remain within the central canal. */
export function populateKoi(scene:THREE.Scene){
 const cube=new THREE.BoxGeometry(1,1,1);
 const palette=['#eee3cc','#d66932','#b64029','#293c40'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.8}));
 const fish:{body:THREE.Group,tail:THREE.Group,fins:THREE.Group[],phase:number}[]=[];
 for(let i=0;i<5;i++){
  const body=new THREE.Group();body.name='Voxel koi '+(i+1);scene.add(body);
  const box=(parent:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,color:number)=>{const mesh=new THREE.Mesh(cube,palette[color]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);};
  // Nose faces +Z; colored dorsal patches sit on the cream body.
  box(body,0,0,0,.19,.065,.43,0);box(body,0,0,.25,.14,.055,.13,0);box(body,0,0,-.26,.11,.05,.12,0);
  box(body,-.035,.035,.12,.11,.012,.12,1+i%2);box(body,.035,.035,-.1,.1,.012,.13,i%2?3:1);
  box(body,0,.035,.26,.085,.012,.07,2);for(const x of [-.074,.074])box(body,x,.01,.27,.022,.025,.025,3);
  const tail=new THREE.Group();tail.position.z=-.32;body.add(tail);box(tail,0,0,-.05,.08,.025,.15,1);box(tail,-.065,0,-.13,.09,.025,.12,0);box(tail,.065,0,-.13,.09,.025,.12,0);
  const fins:THREE.Group[]=[];for(const side of [-1,1]){const fin=new THREE.Group();fin.position.set(side*.09,0,.07);body.add(fin);box(fin,side*.04,0,-.035,.1,.015,.13,0);fins.push(fin);}
  body.scale.setScalar(.9+i*.08);fish.push({body,tail,fins,phase:i*Math.PI*2/5});
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 return (time:number)=>{const t=reduced.matches?0:time;for(const [i,f] of fish.entries()){
  const a=t*.13+f.phase;
  f.body.position.set(1+Math.sin(a)*(.55+i*.035),.625+Math.sin(t*1.2+i)*.005,2+Math.cos(a)*4);
  f.body.rotation.y=Math.atan2(Math.cos(a)*(.55+i*.035),-Math.sin(a)*4);
  f.tail.rotation.y=Math.sin(t*5+i)*.3;f.fins.forEach((fin,j)=>fin.rotation.y=Math.sin(t*3+i+j)*.15);
 }};
}
