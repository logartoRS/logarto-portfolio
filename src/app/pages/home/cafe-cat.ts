import * as THREE from 'three';

export function populateCafeCat(scene:THREE.Scene){
 const cat=new THREE.Group();cat.name='Cafe tabby cat';scene.add(cat);
 const cube=new THREE.BoxGeometry(1,1,1);
 const colors=['#77756c','#393e3a','#b08c64','#e1d9c5','#a5b883','#b48178'];
 const materials=colors.map(color=>new THREE.MeshStandardMaterial({color,roughness:.9}));
 const box=(parent:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,color:number)=>{const m=new THREE.Mesh(cube,materials[color]);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;parent.add(m);};
 const hips=new THREE.Group();cat.add(hips);
 const chest=new THREE.Group();cat.add(chest);
 box(hips,0,0,0,.3,.3,.32,0);box(chest,0,0,0,.28,.3,.34,0);
 box(chest,0,-.09,.05,.23,.1,.25,2);
 for(const section of [hips,chest])for(const side of [-1,1]){
  for(const z of [-.09,.06])box(section,side*(section===hips?.153:.143),.015,z,.018,.2,.035,1);
  box(section,side*.145,-.08,0,.023,.08,.12,2);
 }
 const head=new THREE.Group();head.position.set(0,.51,.3);cat.add(head);
 box(head,0,0,0,.33,.28,.29,0);box(head,0,-.08,.15,.24,.12,.085,3);
 for(const side of [-1,1]){
  box(head,side*.115,.17,-.025,.105,.12,.12,0);box(head,side*.13,.245,-.025,.065,.055,.075,1);
  box(head,side*.115,.17,.04,.06,.075,.012,5);
  box(head,side*.09,.035,.15,.065,.038,.014,4);box(head,side*.09,.035,.161,.018,.036,.008,1);
  for(let j=0;j<2;j++)box(head,side*.17,-.06+j*.04,.18,.1,.009,.009,3);
  box(head,side*.065,.108,.15,.028,.075,.012,1);
 }
 box(head,0,-.04,.202,.05,.035,.025,5);
 const legs:{upper:THREE.Group,knee:THREE.Group,paw:THREE.Group,back:boolean}[]=[];
 for(const x of [-.105,.105])for(const z of [-.22,.22]){
  const back=z<0;
  const upper=new THREE.Group();upper.position.set(x,.3,z);cat.add(upper);
  box(upper,0,-.075,0,back?.12:.075,.15,back?.13:.075,0);
  const knee=new THREE.Group();knee.position.y=-.15;upper.add(knee);
  box(knee,0,-.052,0,.075,.105,.075,0);
  box(knee,0,-.02,.04,.08,.03,.01,1);
  const paw=new THREE.Group();paw.position.y=-.105;knee.add(paw);
  box(paw,0,-.017,.025,.1,.035,.12,3);
  legs.push({upper,knee,paw,back});
 }
 const tail=new THREE.Group();tail.position.set(0,.43,-.3);cat.add(tail);
 for(let i=0;i<8;i++)box(tail,0,i*.07,-i*.035,.07,.085,.075,i%3===0?1:0);
 // Slimmer silhouette; the existing meshes retain their markings.
 cat.scale.set(.62,.76,.76);
 const eyes=head.children.filter(part=>part instanceof THREE.Mesh && part.material===materials[4]);
 const pupils=head.children.filter(part=>part instanceof THREE.Mesh && part.material===materials[1] && part.position.z>.16);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const smooth=(a:number)=>{a=THREE.MathUtils.clamp(a,0,1);return a*a*(3-2*a);};
 const floor=1.56;
 const start=new THREE.Vector3(-4,floor,-16.35);
 const approach=new THREE.Vector3(-6.12,floor,-16.25);
 // Top of the existing left courtyard post (rear garden includes a .65 Z offset).
 const perch=new THREE.Vector3(-6.7,2.58,-15.85);
 const bed=new THREE.Vector3(-4.8,floor,-16.4);
 return (time:number)=>{
  const t=reduced.matches?5:time,c=t%64;
  let sit=0,sleep=0,walk=0,jump=0;
  const travel=(from:THREE.Vector3,to:THREE.Vector3,u:number,arc=0)=>{
   const f=smooth(u);cat.position.copy(from).lerp(to,f);cat.position.y+=Math.sin(Math.PI*f)*arc;
   cat.rotation.y=Math.atan2(to.x-from.x,to.z-from.z);
  };
  if(c<14){const a=c/14*Math.PI*2;cat.position.set(-4+Math.sin(a)*1.5,floor,-16.6+Math.cos(a)*.25);cat.rotation.y=Math.atan2(Math.cos(a)*1.5,-Math.sin(a)*.25);walk=1;}
  else if(c<20){cat.position.copy(start);sit=smooth((c-14)/1.2)*(1-smooth((c-18.8)/1.2));}
  else if(c<27){travel(start,approach,(c-20)/7);walk=Math.sin(Math.PI*(c-20)/7);}
  else if(c<28.4){travel(approach,perch,(c-27)/1.4,.5);jump=Math.sin(Math.PI*(c-27)/1.4);}
  else if(c<37){cat.position.copy(perch);cat.rotation.y=-Math.PI/2;sit=smooth((c-28.4)/1)*(1-smooth((c-36)/1));}
  else if(c<38.4){travel(perch,approach,(c-37)/1.4,.35);jump=Math.sin(Math.PI*(c-37)/1.4);}
  else if(c<44){travel(approach,bed,(c-38.4)/5.6);walk=Math.sin(Math.PI*(c-38.4)/5.6);}
  else if(c<58){cat.position.copy(bed);sleep=smooth((c-44)/1.8)*(1-smooth((c-56)/2));}
  else{travel(bed,start,(c-58)/6);walk=Math.sin(Math.PI*(c-58)/6);}
  // Two overlapping body segments let the haunches lower independently of the chest.
  hips.position.set(0,.4-sit*.2-sleep*.19,-.15);
  hips.scale.set(1+sit*.15,1+sleep*Math.sin(t*2)*.018,1);
  chest.position.set(0,.4+sit*.025-sleep*.19,.12-sit*.08);
  chest.rotation.x=-sit*.23;
  head.position.set(0,.51+sit*.08-sleep*.245,.3-sit*.15+sleep*.025);
  head.rotation.set(sleep*.3,(1-sleep)*(1-walk)*Math.sin(t*.8)*.18,sleep*.14);
  for(const eye of eyes)eye.scale.y=.038*(1-sleep*.9);
  for(const pupil of pupils)pupil.scale.y=.036*(1-sleep*.9);
  legs.forEach(({upper,knee,paw,back},i)=>{
   const gait=Math.sin(t*8+(i===0||i===3?0:Math.PI))*.3*walk;
   upper.position.y=.3-(back?sit*.06:0)-sleep*.14;
   upper.position.z=back?-.22:.22-sit*.1;
   // Fold the thigh forward and the lower leg back; paws stay level.
   upper.rotation.x=gait+(back?-sit*1.15:0)+sleep*.9-jump*.55;
   knee.rotation.x=(back?sit*2.0:0)-sleep*1.3;
   paw.rotation.x=-upper.rotation.x-knee.rotation.x;
  });
  tail.position.y=.43-sit*.2-sleep*.2;
  tail.rotation.set(-sleep*1.2, sleep*.8,Math.sin(t*1.7)*.12*(1-sleep)+sit*1.15);
 };
}
