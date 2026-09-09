import { language, setLanguage, translate, Language } from './translations';
import { populateCafeHobbies } from './cafe-hobbies';
import { TransitionAudio } from './transition-audio';
import { createContactBillboard } from './contact-billboard';
import { createProjectBillboard } from './project-billboard';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { createProfileBillboard } from './profile-billboard';
import { populateAlleys } from './alley-details';
import { populateOfficeGarden } from './office-garden';
import { populateRearGarden } from './rear-garden';
import { populateDistrict } from './district-environment';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { VoxelDetails } from './voxel-details';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({selector:'app-home', standalone:true, templateUrl:'./home.component.html', styleUrl:'./home.component.scss'})
export class HomeComponent implements AfterViewInit, OnDestroy {
 readonly t=translate;
 get lang(){return language();}
 private languageVersion=0;
 private profileTexture?:THREE.CanvasTexture;
 async changeLanguage(value:Language){
  if(value===language())return;
  setLanguage(value);const version=++this.languageVersion;
  const [projects,contact]=await Promise.all([createProjectBillboard(),createContactBillboard()]);
  if(this.destroyed||version!==this.languageVersion){projects.texture.dispose();contact.texture.dispose();return;}
  const profile=createProfileBillboard();
  const replacements=new Map<THREE.Texture|undefined,THREE.CanvasTexture>([[this.projectBillboard?.texture,projects.texture],[this.contactBillboard?.texture,contact.texture],[this.profileTexture,profile.texture]]);
  this.scene.traverse(object=>{if(object instanceof THREE.Mesh){const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){const m=material as THREE.MeshBasicMaterial;const next=replacements.get(m.map??undefined);if(next&&m.map){m.map=next;m.needsUpdate=true;}}}});
  this.projectBillboard?.texture.dispose();this.contactBillboard?.texture.dispose();this.profileTexture?.dispose();
  this.projectBillboard=projects;this.contactBillboard=contact;this.profileTexture=profile.texture;this.updateBillboard=profile.update;
 }
 readonly transitionAudio=new TransitionAudio();
 private cameraMove?: {start:number;from:THREE.Vector3;to:THREE.Vector3;lookFrom:THREE.Vector3;lookTo:THREE.Vector3};
 private overview?: {position:THREE.Vector3;target:THREE.Vector3};
 private restoreOrbitLimits(){
  Object.assign(this.controls,{minAzimuthAngle:-Infinity,maxAzimuthAngle:Infinity,minPolarAngle:0,maxPolarAngle:Math.PI*.47,minDistance:20,maxDistance:58,rotateSpeed:1,zoomSpeed:1,enablePan:false});
 }
 private constrainFocus(position:THREE.Vector3,target:THREE.Vector3){
  const orbit=new THREE.Spherical().setFromVector3(position.clone().sub(target));
  Object.assign(this.controls,{
   minAzimuthAngle:orbit.theta-THREE.MathUtils.degToRad(12),maxAzimuthAngle:orbit.theta+THREE.MathUtils.degToRad(12),
   minPolarAngle:orbit.phi-THREE.MathUtils.degToRad(4),maxPolarAngle:orbit.phi+THREE.MathUtils.degToRad(4),
   minDistance:orbit.radius*.88,maxDistance:orbit.radius*1.12,rotateSpeed:.35,zoomSpeed:.45,enablePan:false
  });
 }
 private moveCamera(position:THREE.Vector3,target:THREE.Vector3){
  void this.transitionAudio.play();
  this.restoreOrbitLimits();
  this.controls.minDistance=.1;this.controls.maxDistance=150;this.controls.maxPolarAngle=Math.PI;
  // Drain residual drag momentum before starting the programmed transition.
  this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=true;
  this.controls.enabled=false;
  this.cameraMove={start:performance.now(),from:this.camera.position.clone(),to:position,lookFrom:this.controls.target.clone(),lookTo:target};
 }
 selectSection(section:string){
  if(!this.controls)return;
  if(this.active===section){this.closeSection();return;}
  if(section==='Sobre mí'||section==='Proyectos'||section==='Contacto'||section==='Café'){
   if(!this.overview)this.overview={position:this.camera.position.clone(),target:this.controls.target.clone()};
   this.controls.minDistance=7;
   const mobile=this.container.nativeElement.clientWidth<750;
   if(section==='Sobre mí')this.moveCamera(new THREE.Vector3(-3.2,7.8,mobile?17:13.5),new THREE.Vector3(-3,6.8,1));
   else if(section==='Proyectos')this.moveCamera(new THREE.Vector3(6.8,5.8,mobile?12.5:9.5),new THREE.Vector3(6.8,4.9,.8));
   else if(section==='Contacto')this.moveCamera(new THREE.Vector3(mobile?-18:-14,13.8,-12),new THREE.Vector3(-1.15,13,-12));
   else this.moveCamera(new THREE.Vector3(-5.4,mobile?8:6.8,mobile?-29:-24.5),new THREE.Vector3(-4.9,3.1,-13.5));
  }else if(this.overview){this.moveCamera(this.overview.position,this.overview.target);this.overview=undefined;}
  this.active=section;
 }
 closeSection(){this.active='';if(this.overview){this.moveCamera(this.overview.position,this.overview.target);this.overview=undefined;}}
 private animateCamera(){
  const m=this.cameraMove;if(!m)return;
  const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:1400;
  const t=Math.min(1,(performance.now()-m.start)/duration),e=t*t*(3-2*t);
  this.camera.position.lerpVectors(m.from,m.to,e);this.controls.target.lerpVectors(m.lookFrom,m.lookTo,e);
  if(t===1){this.cameraMove=undefined;if(this.active==='Sobre mí'||this.active==='Proyectos'||this.active==='Contacto'||this.active==='Café')this.constrainFocus(m.to,m.lookTo);else this.restoreOrbitLimits();this.controls.enabled=true;}
 }
 @ViewChild('rendererContainer',{static:true}) container!:ElementRef<HTMLDivElement>;
 private updateBillboard: (t:number)=>void = ()=>{};
 private updateCafe:(t:number)=>void=()=>{};
 private updatePetals: (t:number)=>void = ()=>{};
 private composer!:EffectComposer; private basin!:THREE.Mesh; private ripples:THREE.Mesh[]=[];
 private details = new VoxelDetails(); private cube = new THREE.BoxGeometry(1,1,1);
 active = ''; private renderer!:THREE.WebGLRenderer; private scene = new THREE.Scene(); private camera!:THREE.PerspectiveCamera; private controls!:OrbitControls; private frame=0; private resize!:ResizeObserver; private clock=new THREE.Clock(); private fans:THREE.Group[]=[]; private water!:THREE.Mesh; private materials=new Map<string,THREE.MeshStandardMaterial>();
 private contactBillboard?: Awaited<ReturnType<typeof createContactBillboard>>;
 private projectBillboard?: Awaited<ReturnType<typeof createProjectBillboard>>;
 containIslandScroll(event:Event){
  const target=event.target;
  if(target instanceof Element && target.closest('aside'))return;
  if(event.cancelable)event.preventDefault();
 }
 openProject(id:string){document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});document.getElementById(id)?.focus({preventScroll:true});}
 backToIsland(){document.getElementById('island')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 private destroyed=false;
 async ngAfterViewInit(){
 setLanguage(language());
 await Promise.allSettled([400,600,700,800].map(weight=>document.fonts.load(`${weight} 16px Barlow`)));
 [this.projectBillboard,this.contactBillboard]=await Promise.all([createProjectBillboard(),createContactBillboard()]);
 if(this.destroyed){this.projectBillboard.texture.dispose();this.contactBillboard.texture.dispose();return;}
 const el=this.container.nativeElement; this.scene.background=new THREE.Color('#190e07'); this.scene.fog=new THREE.Fog('#190e07',38,90);
 this.camera=new THREE.PerspectiveCamera(38,el.clientWidth/el.clientHeight,.1,150); this.camera.position.set(27,23,32);this.camera.fov=this.camera.aspect<.8?65:38;this.camera.updateProjectionMatrix();
 this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<900?1.25:1.75));this.renderer.setSize(el.clientWidth,el.clientHeight);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;el.appendChild(this.renderer.domElement);
 this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,4,0);this.controls.enableDamping=true;this.controls.enablePan=false;this.controls.minDistance=20;this.controls.maxDistance=58;this.controls.maxPolarAngle=Math.PI*.47;
 this.scene.add(new THREE.HemisphereLight('#b9d9ff','#28382e',1.35));const sun=new THREE.DirectionalLight('#c4d7ff',1.5);sun.position.set(-12,24,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.normalBias=.04;sun.shadow.radius=3;this.scene.add(sun);const warm=new THREE.DirectionalLight('#ffb278',1.2);warm.position.set(15,8,-8);this.scene.add(warm);
 this.build();this.details.terrain();this.details.architecture();populateDistrict(this.details);populateRearGarden(this.details);populateOfficeGarden(this.details,this.scene);this.updatePetals=populateAlleys(this.details,this.scene);this.details.flush(this.scene);this.atmosphere();this.completeFacades();this.cafeLights();this.contactPanel();this.updateCafe=populateCafeHobbies(this.scene);this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(el.clientWidth,el.clientHeight),.38,.45,1.05));this.composer.addPass(new OutputPass());this.resize=new ResizeObserver(()=>{this.camera.aspect=el.clientWidth/el.clientHeight;this.camera.fov=this.camera.aspect<.8?65:38;this.camera.updateProjectionMatrix();this.renderer.setSize(el.clientWidth,el.clientHeight);this.composer.setSize(el.clientWidth,el.clientHeight)});this.resize.observe(el);
 const animate=()=>{this.frame=requestAnimationFrame(animate);const t=this.clock.getElapsedTime();this.updatePetals(t);this.updateCafe(t);this.updateBillboard(t);this.projectBillboard?.update(t);this.contactBillboard?.update(t);this.fans.forEach(f=>f.rotation.z=t*.8);this.water.position.y=.53+Math.sin(t*.7)*.025;this.animateCamera();this.controls.update();this.ripples.forEach((r,i)=>{r.position.x=r.userData["x"]+Math.sin(t*.5+i)*.1;r.scale.x=.3+Math.sin(t+i)*.12});this.composer.render()};animate();
 }
 private mat(color:string,glow=false){const key=color+glow;let m=this.materials.get(key);if(!m){m=new THREE.MeshStandardMaterial({color,roughness:.8,metalness:glow?.2:.05,emissive:glow?color:'#000000',emissiveIntensity:glow?4:0});this.materials.set(key,m)}return m}
 private box(x:number,y:number,z:number,w:number,h:number,d:number,c:string,glow=false,parent:THREE.Object3D=this.scene){const m=new THREE.Mesh(this.cube,this.mat(c,glow));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=!glow;m.receiveShadow=true;parent.add(m);return m}
 private cable(points:THREE.Vector3[]){const curve=new THREE.CatmullRomCurve3(points);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.035,5,false),this.mat('#182333'));this.scene.add(m)}
 private tree(x:number,y:number,z:number,s=1){this.details.tree(x,y,z,s)}
 private rail(x:number,y:number,z:number,length:number){this.box(x,y+.65,z,length,.06,.06,'#8a9c9e');for(let i=0;i<=length;i+=1)this.box(x-length/2+i,y+.33,z,.07,.66,.07,'#53666d')}
 private screen(x:number,y:number,z:number,w:number,h:number,title:string,color:string){this.box(x,y,z,w+.22,h+.22,.16,'#142d3d');const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#09212d';ctx.fillRect(0,0,512,640);ctx.strokeStyle=color;ctx.lineWidth=7;ctx.strokeRect(24,24,464,592);ctx.fillStyle=color;ctx.font='24px Barlow, sans-serif';ctx.fillText('LOGARTO / SYSTEMS',46,75);ctx.font='bold 68px Barlow, sans-serif';ctx.fillText(title,44,185);ctx.font='20px Barlow, sans-serif';ctx.fillText('SOFTWARE & ENGINEERING',44,230);for(let i=0;i<12;i++){ctx.globalAlpha=.25+(i%3)*.2;ctx.fillRect(44,290+i*22,80+(i*47)%330,6)}ctx.globalAlpha=1;ctx.font='26px Barlow, sans-serif';ctx.fillText('BUILD. SOLVE. REPEAT.',44,574);let tex:THREE.CanvasTexture;if(title==='BRAYAN'){const billboard=createProfileBillboard();tex=billboard.texture;this.profileTexture=tex;this.updateBillboard=billboard.update;}else{tex=this.projectBillboard!.texture;}const material=new THREE.MeshBasicMaterial({map:tex});const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);plane.position.set(x,y,z+.1);this.scene.add(plane)}
 private contactPanel(){
 const group=new THREE.Group();group.position.set(-1.15,13.1,-13);group.rotation.y=-Math.PI/2;this.scene.add(group);
 this.box(0,0,0,3.65,4.35,.2,'#263b45',false,group);
 const texture=this.contactBillboard!.texture;const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.4,4.1),new THREE.MeshBasicMaterial({map:texture}));screen.position.z=.12;group.add(screen);
 for(const x of [-1.92,1.92])this.box(x,0,.06,.055,4.35,.06,'#efb653',true,group);
 }
 private building(x:number,z:number,w:number,d:number,h:number){this.box(x,1.65,z,w+.12,.3,d+.12,'#53616a');this.box(x,1.8+h/2,z,w,h,d,'#46566a');this.box(x,1.8+h,z,w+.35,.3,d+.35,'#7a8990');for(let f=0;f<h;f+=2){this.box(x,1.9+f,z+d/2+.08,w+.18,.18,.18,'#263748');for(let j=0;j<w-1;j+=1.05){if(x===6&&f>=2)continue;this.box(x-w/2+.65+j,2.7+f,z+d/2+.13,.48,.72,.08,(j+f)%3<1?'#ffc97b':'#4b8b9a',(j+f)%3<1)}}for(let i=0;i<3;i++)this.box(x-w/2+.2+i*(w-.4)/2,1.8+h/2,z+d/2+.15,.18,h,.23,'#71808a');this.box(x,2+h,z,w-1,.25,d-1,'#304e46');for(let i=0;i<Math.max(1,Math.floor((w-.6)/1.1));i++){const px=x-w/2+.65+i*1.1;this.box(px,2.02+h,z-d/2+.8,.82,.14,.74,'#445963');this.box(px,2.42+h,z-d/2+.8,.8,.66,.7,'#879397');this.box(px,2.77+h,z-d/2+.8,.62,.04,.5,'#263641')}}
 private build(){
 for(const x of [.3]){const a=new THREE.Vector3(x,1.56+2.98/15+.76,-3.5),b=new THREE.Vector3(x,5.3,.28);const rail=this.box(x,(a.y+b.y)/2,(a.z+b.z)/2,.07,a.distanceTo(b),.07,'#a0a89e');rail.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());}

 this.box(0,-.9,0,20,1.5,16,'#263746');this.box(-5,.6,0,9,1.8,16,'#43545f');this.box(6,.6,0,7,1.8,16,'#43545f');this.box(.5,.6,-5.5,3,1.8,5,'#43545f');
 for(let i=0;i<110;i++){const side=i%2===0?-1:1;const x=side*(3+(i%7));const z=-7.5+(Math.floor(i/2)%16);this.box(x,.1+(i%3)*.25,z,.85,.8,.85,['#536371','#3c505b','#617075'][i%3])}
 this.water=this.box(1,.53,2,3,.08,11,'#168b9a');for(let i=0;i<35;i++)this.box(.1+(i%5)*.5,.59,-2+(i*1.73)%9,.25,.02,.1,'#58b7bb');
 this.building(-4,-2,6,5,8);this.building(6,-2,5,5,5);this.building(1,-6,2.2,2.3,12);
 this.screen(-4,7,.98,3.4,4.1,'BRAYAN','#61e2eb');this.screen(6,5.25,.85,2.3,2.1,'LAB','#efb653');
 for(const wx of [4.15,7.85]){this.box(wx,5.25,.64,.66,1.3,.14,'#233743');this.box(wx,5.25,.74,.48,1.1,.06,'#719da5');this.box(wx,5.25,.79,.04,1.1,.03,'#293f4a');this.box(wx,4.55,.73,.76,.1,.25,'#8a9796');}
 this.box(2.95,4.75,-1,1.1,.18,1.6,'#536a76');this.rail(2.95,4.84,-.2,1.1);this.rail(2.95,4.84,-1.8,1.1);this.box(2.4,5.17,-1,.07,.66,1.6,'#53666d');this.box(3.36,5.6,-1,.15,1.55,.9,'#263b45');this.box(3.25,5.6,-1,.07,1.3,.64,'#9bafa9');for(const z of [-1.6,-.4])this.box(2.8,3.15,z,.14,3.2,.14,'#435969');
 // Cable endpoints share the coordinates of the roof-mounted utility posts.
 for(const [x,z,roof,top] of [[-1.7,-3,9.95,12],[7.7,-3.7,6.95,10],[1,-6,13.95,16]]){
  this.box(x,roof+.08,z,.55,.16,.55,'#506571');this.box(x,(roof+top)/2,z,.14,top-roof,.14,'#7f969d');this.box(x,top,z,.16,.16,.16,'#f3857f',true);
 }
 for(let i=0;i<3;i++){
  const y=11.7-i*.23,ry=9.7-i*.23,ty=15.7-i*.23;
  this.box(1.95,ty,-6,1.9,.075,.075,'#80969b');
  this.cable([new THREE.Vector3(-1.7,y,-3),new THREE.Vector3(3,9.1-i*.23,-3.35),new THREE.Vector3(7.7,ry,-3.7)]);
  this.cable([new THREE.Vector3(2.9,ty,-6),new THREE.Vector3(4.8,12-i*.23,-4.85),new THREE.Vector3(7.7,ry,-3.7)]);
  for(const [x,z,h] of [[-1.7,-3,y],[7.7,-3.7,ry],[2.9,-6,ty]])this.box(x,h,z,.3,.1,.3,'#b7ada0');
 }
 for(let i=0;i<2;i++){const f=new THREE.Group();f.position.set(8.56,4+i*1.4,-1.5);f.rotation.y=Math.PI/2;this.scene.add(f);this.box(0,0,0,1.1,1.1,.16,'#253948',false,f);const rot=new THREE.Group();rot.position.z=.15;f.add(rot);this.box(0,0,0,.8,.13,.07,'#9bb0b5',false,rot);this.box(0,0,0,.13,.8,.07,'#9bb0b5',false,rot);this.fans.push(rot)}
 
 // Abutments and two solid approach steps connect the deck to the paving.
 for(const side of [-1,1]){
  const edge=1+side*2.5;
  this.box(edge-side*.2,1.65,4.5,.4,.2,1.8,'#536973');
  for(let i=0;i<2;i++){const top=1.56+(2-i)*.163;this.box(edge+side*(.19+i*.38),(1.5+top)/2,4.5,.38,top-1.5,1.8,'#82918d');}
  this.box(edge+side*.02,1.89,4.5,.045,.02,1.6,'#b9ab87');
 }
 this.box(1,1.9,4.5,5,.3,1.8,'#8b7b66');this.rail(1,2.05,5.35,5);this.rail(1,2.05,3.65,5);
 for(let i=0;i<5;i++){const top=1.56+(i+1)*.048;this.box(-4,(1.5+top)/2,2.45-i*.3,2.4,top-1.5,.3,'#829091')}this.box(-4,1.65,1.05,2.4,.3,.8,'#62767d');
 this.tree(-7,1.5,5,1.3);this.tree(8,1.5,5,1.05);this.tree(-7,1.5,-6,1.1);this.tree(-4,10.2,-2,.8);
 for(const p of [[-7,6],[-2,5],[4,5],[8,2],[-7,-4]]){this.box(p[0],2.1,p[1],.1,1.2,.1,'#263644');this.box(p[0],2.7,p[1],.25,.3,.25,'#ffd294',true);const l=new THREE.PointLight('#ffc68a',3,4);l.position.set(p[0],2.8,p[1]);this.scene.add(l)}
 this.box(0,-1.8,0,200,.2,200,'#21160f');
 }
 private atmosphere(){
  this.box(1.15,-.45,9.15,8.2,.9,3.8,'#304b59');this.basin=this.box(1.15,.26,9.15,7.8,.6,3.4,'#126a77');this.box(1.15,.05,10.95,8.2,.5,.2,'#4d6772');this.box(-2.85,.05,9.15,.2,.5,3.8,'#4d6772');this.box(5.15,.05,9.15,.2,.5,3.8,'#4d6772');
  const waterMaterial=new THREE.MeshStandardMaterial({color:'#116373',metalness:.55,roughness:.23,emissive:'#063c46',emissiveIntensity:.35});this.basin.material=waterMaterial;this.water.material=waterMaterial;
  for(let i=0;i<65;i++){const x=-2.4+(i*1.37)%7.2,z=7.7+(i*.43)%2.9;const r=this.box(x,.58,z,.3,.018,.045,i%3===0?'#64bab1':'#277f8d');r.userData['x']=x;this.ripples.push(r)}
  for(const [x,y,z,w,h,c] of [[-6.7,7,1.05,.07,4.4,'#37dbea'],[-1.25,7,1.05,.07,4.4,'#37dbea'],[6,6.4,.98,4.3,.07,'#f3a637'],[8.4,5.3,.98,.07,2.2,'#f3a637'],[1,11,-4.75,.08,3,'#3be0ef']] as [number,number,number,number,number,string][]){this.box(x,y,z,w,h,.1,c,true)}
  for(const [x,y,z,c,p] of [[-4,5,2,'#30cbdc',16],[6,5,1.8,'#e8923e',13],[6,2.8,2,'#ffbf72',20],[1,1.6,8,'#3cc6c9',10]] as [number,number,number,string,number][]){const light=new THREE.PointLight(c,p,7,2);light.position.set(x,y,z);this.scene.add(light)}
  for(let i=0;i<6;i++){this.box(-6.5+i,4.58,1.85,.25,.055,.065,'#ffc782',true)}
 }

 private cafeLights(){
  for(const x of [-6.8,-1.2]){this.box(x,3.85,-12.6,.25,.45,.25,'#ffd29b',true);const light=new THREE.PointLight('#ffc28b',4,5);light.position.set(x,3.7,-12.85);this.scene.add(light);}
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#233e3b';ctx.fillRect(0,0,512,128);ctx.fillStyle='#e1cf9e';ctx.font='48px Barlow, sans-serif';ctx.textAlign='center';ctx.fillText('喫茶 · 珈琲と抹茶',256,62);ctx.font='23px Barlow, sans-serif';ctx.fillText('COFFEE  /  MATCHA',256,103);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.625),new THREE.MeshBasicMaterial({map:tex}));sign.position.set(-3.2,4.43,-12.5);sign.rotation.y=Math.PI;this.scene.add(sign);
 }
 private completeFacades(){
  // Each facade is built in a local coordinate frame with its normal facing outwards.
  const facade=(x:number,z:number,width:number,height:number,angle:number,style=0)=>{
   const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;this.scene.add(group);
   if(height===12){
    for(let floor=0;floor<12;floor+=2){
     this.box(0,1.9+floor,.08,width+.18,.18,.18,'#263748',false,group);
     for(let j=0;j<width-1;j+=1.05){const lit=(j+floor)%3<1;this.box(-width/2+.65+j,2.7+floor,.13,.48,.72,.08,lit?'#ffc97b':'#4b8b9a',lit,group);}
    }
    for(let j=0;j<3;j++)this.box(-width/2+.2+j*(width-.4)/2,7.8,.15,.18,12,.23,'#71808a',false,group);
    return group;
   }
   for(let y=3;y<height+1;y+=1.85)for(let u=-width/2+.65;u<width/2-.3;u+=1.2){
    if(style===1)continue;
    if(style===2 && y>3.1)continue;
    
    if(x===3.5 && y>4 && y<6.5 && u>-.3 && u<2)continue;
    this.box(u,y,.08,.85,1.18,.16,'#233743',false,group);
    this.box(u,y,.18,.61,.86,.06,'#719da5',false,group);
    this.box(u,y,.225,.045,.9,.035,'#293f4a',false,group);
    this.box(u,y-.64,.17,.96,.1,.4,'#8a9796',false,group);
   }
   // Split floor bands around reserved service areas instead of crossing machinery.
   for(let y=2;y<height+1;y+=1.85){
    const blocked:[number,number][]=[];
    if(style===1){blocked.push([-1.7,-.75]);if(y>7&&y<8.8)blocked.push([-1,1.8]);}
    if(style===2 && y>4.4&&y<5.9)blocked.push([-1.9,.5]);
    if(style===3)blocked.push([-.65,.65]);
    let segments:[number,number][]=[[-width/2,width/2]];
    for(const [lo,hi] of blocked)segments=segments.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b] as [number,number]]:([[a,Math.min(b,lo)],[Math.max(a,hi),b]] as [number,number][]).filter(([l,r])=>r-l>.02));
    for(const [a,b] of segments)this.box((a+b)/2,y,.07,b-a,.1,.15,'#5c6f7b',false,group);
   }
   return group;
  };
  facade(-4,-4.5,6,8,Math.PI,1);facade(-7,-2,5,8,-Math.PI/2);
  facade(6,-4.5,5,5,Math.PI,2);facade(3.5,-2,5,5,-Math.PI/2);
  facade(1,-7.15,2.2,12,Math.PI,3);facade(2.1,-6,2.3,12,Math.PI/2);facade(-.1,-6,2.3,12,-Math.PI/2);
  const sign=(x:number,y:number,z:number,angle:number,text:string,color:string)=>{
   const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;this.scene.add(group);
   this.box(0,0,0,.95,2.9,.22,'#213541',false,group);
   const canvas=document.createElement('canvas');canvas.width=160;canvas.height=480;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#122735';ctx.fillRect(0,0,160,480);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.strokeRect(6,6,148,468);ctx.fillStyle=color;ctx.font='bold 66px Barlow, sans-serif';ctx.textAlign='center';[...text].forEach((c,i)=>ctx.fillText(c,80,95+i*92));
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
   const panel=new THREE.Mesh(new THREE.PlaneGeometry(.85,2.75),new THREE.MeshBasicMaterial({map:texture}));panel.position.z=.125;group.add(panel);const back=panel.clone();back.position.z=-.125;back.rotation.y=Math.PI;group.add(back);this.box(.6,1.05,0,.45,.08,.08,'#91a3a5',false,group);this.box(.6,-1.05,0,.45,.08,.08,'#91a3a5',false,group);
   this.box(-.45,0,.13,.035,2.85,.04,color,true,group);
  };
  sign(-7.65,6,-1,0,'喫茶店','#54d9d9');sign(7.5,4.7,-5.15,-Math.PI/2,'工房','#d98649');
  // Distinct rear service facades: ductwork, louvers and an illuminated workshop sign.
  for(const x of [-3,-2.55]){this.box(x,5.4,-4.73,.23,7,.23,'#8a8275');for(let y=2.2;y<9;y+=1.2)this.box(x,y,-4.73,.34,.1,.34,'#455b65')}
  for(let i=0;i<7;i++)this.box(-4.75,8.05+i*.105,-4.74,1.5,.045,.25,'#8b9c9e');
  for(let i=0;i<7;i++)this.box(6.7,4.6+i*.18,-4.7,2,.07,.25,'#708a92');
  this.box(6,6,-4.72,3.5,.08,.1,'#e4a33d',true);

  // Extra windows occupy clear bays away from pipes and grille housings.
  for(const [x,y] of [[-1.6,3],[-1.6,4.85],[-1.6,6.7],[-1.6,8.55],[-6.3,3],[-6.3,4.85],[-6.3,6.7],[-6.3,8.55],[-4.75,3],[-4.75,4.85],[-4.75,6.7],[4.5,4.85]]){
   this.box(x,y,-4.61,.85,1.18,.18,'#233743');
   this.box(x,y,-4.73,.61,.86,.05,'#dfbf83',true);
   this.box(x,y,-4.765,.045,.9,.025,'#293f4a');
   this.box(x,y-.64,-4.72,.96,.1,.4,'#8a9796');
  }
  // Framed service cabinets, status lamps, and clear pedestrian drains.
  for(const x of [-1.65,3.9]){
   this.box(x,2.25,-4.72,.48,.9,.24,'#526975');
   this.box(x,2.25,-4.855,.37,.73,.04,'#304852');
   this.box(x+.1,2.46,-4.89,.05,.05,.025,'#70c6a3',true);
  }
  for(const x of [-6.4,4]){
   this.box(x,1.57,-7.1,.72,.025,.4,'#273c46');
   for(let i=0;i<6;i++)this.box(x-.3+i*.12,1.587,-7.1,.045,.012,.32,'#839294');
  }
  // Vending machines sit on the rear service plaza, with two plinth-mounted feet.
  for(let i=0;i<8;i++){
   const g=new THREE.Group();const spots=[[-5.8,1.56,-5.3],[-4.75,1.56,-5.3],[5.8,1.56,-5.3],[-3,10.15,-.8],[-1.95,10.15,-.8],[-5.8,10.15,-2.75],[-5.8,1.56,1.2],[7.7,1.56,1.55]];g.position.set(...spots[i] as [number,number,number]);g.rotation.y=i<3?Math.PI:0;this.scene.add(g);
   this.box(0,.1,0,.86,.2,.7,'#283b45',false,g);this.box(0,1,0,.85,1.65,.65,i?'#526f76':'#80586b',false,g);
   this.box(-.1,1.15,.35,.53,1.05,.04,'#193542',false,g);
   for(let row=0;row<3;row++)for(let col=0;col<3;col++)this.box(-.26+col*.16,.83+row*.25,.39,.095,.16,.08,['#91c4ba','#d3ac76','#c58eac'][col],false,g);
   this.box(.3,1,.36,.09,.3,.03,'#76dddf',true,g);this.box(0,.39,.36,.52,.15,.04,'#182a32',false,g);
  }
 }

 visitCafe(){this.restoreOrbitLimits();this.cameraMove=undefined;this.overview=undefined;this.active='';this.controls.enabled=true;this.controls.minDistance=20;this.camera.position.set(-25,23,-39);this.controls.target.set(0,7,-10)}
 reset(){this.restoreOrbitLimits();this.cameraMove=undefined;this.overview=undefined;this.active='';this.controls.enabled=true;this.controls.minDistance=20;this.camera.position.set(27,23,32);this.controls.target.set(0,4,0)}
 ngOnDestroy(){this.transitionAudio.dispose();this.destroyed=true;cancelAnimationFrame(this.frame);this.resize?.disconnect();this.controls?.dispose();this.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{(m as THREE.MeshBasicMaterial).map?.dispose();m.dispose()})}});this.composer?.passes.forEach(p=>p.dispose());this.composer?.dispose();this.renderer?.dispose();this.renderer?.domElement.remove()}
}


