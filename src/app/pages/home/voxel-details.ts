import * as THREE from 'three';

/** Static detail batches share one cube and one draw call per palette color. */
export class VoxelDetails {
 private batches = new Map<string, THREE.Matrix4[]>();
 private occupied = new Set<string>();
 private cube = new THREE.BoxGeometry(1, 1, 1);
 add(x:number,y:number,z:number,w:number,h:number,d:number,color:string) {
  const key=[x,y,z,w,h,d].map(n=>n.toFixed(4)).join(':');if(this.occupied.has(key))return;this.occupied.add(key);
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(w,h,d));
  if(!this.batches.has(color)) this.batches.set(color,[]);
  this.batches.get(color)!.push(matrix);
 }
 tree(x:number,y:number,z:number,s=1,pink=false){
  this.add(x,y+.015,z,1.02*s,.03,.92*s,'#695a42');
  this.add(x,y+1.2*s,z,.55*s,2.4*s,.5*s,'#635744');
  this.add(x,y+.3*s,z,.73*s,.6*s,.67*s,'#635744');
  this.add(x+.28*s,y+.75*s,z+.08*s,.25*s,1.1*s,.32*s,'#79664e');
  const cells=new Set<string>();
  for(let branch=0;branch<4;branch++){
   const angle=branch*2.4;const cx=x+Math.cos(angle)*.7*s,cz=z+Math.sin(angle)*.7*s;
   this.add((x+cx)/2,y+1.8*s,(z+cz)/2,.8*s,.35*s,.35*s,'#635744');
   for(let a=-3;a<=3;a++)for(let b=-2;b<=2;b++)for(let c=-3;c<=3;c++){
    const noise=Math.sin(a*13+b*27+c*7+branch*31);
    if(a*a/10+b*b/5+c*c/10 > .9+noise*.2)continue;
    const gx=Math.round((cx-x)/(.29*s))+a,gy=Math.round((2.4+branch*.18)/.29)+b,gz=Math.round((cz-z)/(.29*s))+c;const key=[gx,gy,gz].join(':');if(cells.has(key))continue;cells.add(key);
    this.add(x+gx*.24*s,y+gy*.29*s,z+gz*.24*s,.238*s,.288*s,.238*s,(pink&&Math.abs(a*3+b+c)%11!==0?['#99462f','#bb603c','#d6804e','#e8a16b']:['#315b4e','#44765a','#588b65','#76a476'])[Math.abs(a+b+c+branch)%4]);
   }
  }
 }
 terrain(){
  const stone=['#455463','#526371','#60707a','#3c4b5b'];
  for(let i=0;i<42;i++)for(let level=0;level<4;level++){
   const x=-10+i*.48;const y=-1.3+level*.65;const depth=.48+(Math.sin(i*9+level)*.5+.5)*.55;
   this.add(x,y,8+depth*.2,.46,.61,depth,stone[(i+level)%4]);
   this.add(-10.1-depth*.1,y,-8+i*.39,depth,.61,.4,stone[(i+level*2)%4]);
   this.add(9.6+depth*.1,y,-8+i*.39,depth,.61,.4,stone[(i+level*3)%4]);
  }
  for(let x=-9.4;x<9.4;x+=.65)for(let z=-7.6;z<-4.8;z+=.65){if(x>-.25&&x<2.3)continue;this.add(x,1.52,z,.61,.08,.61,'#586873');}
  // Fill the two side passages between the front and rear paving grids.
  for(const start of [-9.4,8.8])for(let x=start;x<(start<0?-7.1:9.5);x+=.65)for(let z=-4.35;z<.85;z+=.65)this.add(x,1.52,z,.61,.08,.61,stone[Math.abs(Math.round(x*7+z*3))%4]);
  // Continuous coping along the original right edge joins the rear extension.
  for(let z=-7.9;z<8;z+=.47)this.add(9.95,1.57,z,.38,.16,.45,'#89958c');
  // Foreground paving, planting terraces and a layered canal edge.
  for(let x=-9.4;x<9.4;x+=.65)for(let z=1.1;z<7.8;z+=.65){
   if(x>-.5&&x<2.5)continue;
   this.add(x,1.52,z,.61,.08,.61,stone[Math.abs(Math.round(x*7+z*3))%4]);
  }
  for(let i=0;i<20;i++){
   const z=-2.6+i*.52;
   this.add(-.65,1.55,z,.35,.24,.49,'#879393');this.add(2.6,1.55,z,.35,.24,.49,'#879393');
   for(let j=0;j<3;j++){this.add(-.52,.3+j*.37,z,.3,.33,.48,stone[(i+j)%4]);this.add(2.5,.3+j*.37,z,.3,.33,.48,stone[(i+j+1)%4]);}
  }
  for(const [x,z] of [[-8,4],[-7,-5],[7,6],[8,-5]]){
   this.add(x,1.7,z,2.4,.4,2.1,'#697772');this.add(x,1.94,z,2.15,.12,1.85,'#344f43');
   for(let i=0;i<35;i++){const px=x+Math.sin(i*23)*.95,pz=z+Math.cos(i*17)*.8;this.add(px,2.105,pz,.18,.22,.18,['#47785a','#679566','#819c67'][i%3]);if(i%9===0)this.add(px,2.275,pz,.13,.12,.13,'#d8b991');}
  }
 }
 architecture(){
  // Cladding on the previously empty side wall of the main building.
  for(let y=2.2;y<9.7;y+=.58)for(let z=-4.3;z<.4;z+=.7){
   this.add(-.94,y,z,.14,.54,.65,['#506273','#62717b','#465866'][Math.abs(Math.round(y*10+z*7))%3]);
  }
  for(const z of [-3.7,-2.1,-.5])for(const y of [3.2,5.3,7.4]){
   this.add(-.82,y,z,.2,1.35,.96,'#263542');this.add(-.7,y,z,.07,.96,.65,'#91aaac');
   this.add(-.56,y-.65,z,.55,.13,1.1,'#74858a');this.add(-.64,y,z,.12,1.1,.06,'#344955');
  }
  // External pipe runs with bracket collars.
  for(const z of [-3.1,-2.8]){this.add(-.52,6,z,.2,7.1,.2,'#9a8c76');for(let y=2.8;y<9.7;y+=1.3)this.add(-.52,y,z,.3,.12,.3,'#435564');this.add(-1.1,9.5,z,1.3,.2,.2,'#9a8c76');}
  // Open flight reaches balcony level 4.54 from pavement level 1.56.
  for(let i=0;i<15;i++){
   const top=1.56+(i+1)*(2.98/15),z=-3.5+i*.27;
   this.add(-.2,top-.06,z,1.05,.12,.27,'#647680');
   this.add(.3,top+.38,z,.06,.76,.06,'#a0a89e');



   for(const sx of [-.63,.23])this.add(sx,top-.18,z,.1,.18,.32,'#435969');
  }
  // One continuous landing edge joins the front balcony; the wall side stays open.
  this.add(-.2,4.45,1.12,1.05,.18,1.41,'#526877');
  this.add(-.78,4.45,1.25,.18,.18,.8,'#526877');
  this.add(.3,5.28,1.0525,.07,.07,1.545,'#a0a89e');
  this.add(-.2,5.28,1.825,1.05,.07,.07,'#a0a89e');
  for(const z of [.45,.9,1.35,1.825])this.add(.3,4.91,z,.06,.74,.06,'#536b76');
  this.add(-.7,4.91,1.825,.06,.74,.06,'#536b76');
  // Columns reach the bottom of the diorama, below the canal bed.
  for(const z of [.6,1.65])this.add(.15,1.355,z,.18,6.01,.18,'#435969');
  // Front door, canopy, roof perimeter, rooftop greenhouse.
  this.add(-4,2.6,.7,1.4,1.65,.2,'#1e3541');this.add(-4,2.65,.83,1.13,1.35,.05,'#b39d77');this.add(-4,2.65,.89,.05,1.4,.05,'#253a44');
  this.add(-4,3.65,1.05,2.4,.18,1.4,'#56717a');
  for(let i=0;i<24;i++){const x=-7+i*.26;this.add(x,10.3,.6,.055,.75,.055,'#99a9a1');this.add(x,10.65,.6,.28,.06,.06,'#99a9a1');}
  for(let i=0;i<17;i++){const z=-4.4+i*.3;this.add(-.8,10.3,z,.06,.75,.06,'#99a9a1');this.add(-.8,10.65,z,.06,.06,.32,'#99a9a1');}
  // Complete the rear and left roof perimeter.
  for(let i=0;i<=24;i++){const x=-7.1+i*6.3/24;this.add(x,10.3,-4.6,.055,.75,.055,'#99a9a1');}
  this.add(-3.95,10.65,-4.6,6.3,.06,.06,'#99a9a1');
  for(let i=0;i<=20;i++){const z=-4.6+i*5.2/20;this.add(-7.1,10.3,z,.055,.75,.055,'#99a9a1');}
  this.add(-7.1,10.65,-2,.06,.06,5.2,'#99a9a1');
  this.add(-5.9,10.85,-1.2,1.3,1.6,1.6,'#365c60');
  for(const x of [-6.6,-5.2])this.add(x,10.85,-.32,.08,1.7,.08,'#b1a789');
  this.add(-5.9,11.7,-1.2,1.65,.12,1.95,'#738a89');
  // Irregular vines descend beside the screen rather than hiding its text.
  for(let strand=0;strand<9;strand++)for(let j=0;j<7+strand%4;j++){
   const x=(strand<5?-6.9:-1.45)+(strand%5)*.12+Math.sin(j+strand)*.1;
   this.add(x,10-j*.26,.76,.18,.3,.17,['#416b50','#628959','#83a16b'][(j+strand)%3]);
  }
 }
 flush(scene:THREE.Scene){
  for(const [color,matrices] of this.batches){const material=new THREE.MeshStandardMaterial({color,roughness:.95});const mesh=new THREE.InstancedMesh(this.cube,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh)}
  this.batches.clear();
 }
}

