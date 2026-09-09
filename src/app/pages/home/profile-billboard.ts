import { translate as t } from './translations';
import * as THREE from 'three';

/** Three original canvas illustrations, cross-faded on the building's existing display. */
export function createProfileBillboard(){
 const titles=[t("DESARROLLO DE SOFTWARE"),t("INGENIERÍA MECATRÓNICA"),t("IMPRESIÓN 3D")];
 const subtitles=[t("Ideas que se convierten en aplicaciones"),t("Código, electrónica y movimiento"),t("Del diseño digital al objeto físico")];
 const accents=['#e5a51d','#d8894c','#e9bd68'];
 const slides=titles.map((title,index)=>{
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=960;
  const c=canvas.getContext('2d')!,a=accents[index];
  c.fillStyle='#20150d';c.fillRect(0,0,768,960);
  c.strokeStyle=a;c.lineWidth=4;c.strokeRect(30,30,708,900);
  c.fillStyle='#c7ab79';c.font='28px Barlow, sans-serif';c.fillText(t("BARS / IDENTIDAD"),66,90);
  c.fillStyle='#f4e6ca';c.font='bold 70px Barlow, sans-serif';c.fillText('BRAYAN',66,170);
  c.fillStyle=a;c.font='25px Barlow, sans-serif';c.fillText(t("SOFTWARE × INGENIERÍA × CREACIÓN"),66,216);
  c.fillStyle='#2a1f13';c.fillRect(62,264,644,445);
  c.strokeStyle='#4b3823';c.lineWidth=1;
  for(let x=80;x<700;x+=30){c.beginPath();c.moveTo(x,278);c.lineTo(x,696);c.stroke();}
  for(let y=278;y<700;y+=30){c.beginPath();c.moveTo(75,y);c.lineTo(694,y);c.stroke();}
  const box=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const line=(points:number[][],width:number,color:string)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();};
  const joint=(x:number,y:number,r:number)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='#173746';c.fill();c.strokeStyle=a;c.lineWidth=6;c.stroke();};
  if(index===0){
   // Workstation, editor and mobile preview.
   box(154,345,415,250,'#668893');box(166,358,391,222,'#081d2b');box(166,358,391,26,'#294b5a');
   for(let i=0;i<3;i++)box(180+i*15,367,7,7,a);
   for(let i=0;i<8;i++){box(190,408+i*18,15,5,'#476a76');box(222+(i%3)*15,408+i*18,95+(i*23)%125,6,i%2?a:'#a9c4bd');}
   box(332,595,55,37,'#668893');box(283,630,151,11,a);
   box(505,430,100,192,'#81a4a6');box(513,442,84,164,'#153c48');box(525,467,60,38,a);box(525,521,43,7,'#b4ccca');box(525,541,60,6,'#6d919c');
   line([[165,651],[523,651],[554,677],[132,677],[165,651]],6,'#88aaad');
  }else if(index===1){
   // Articulated robot arm, gripper, controller and circuit traces.
   box(143,623,284,28,'#67828a');box(220,580,124,44,a);
   line([[282,581],[224,465],[360,366],[472,430]],31,a);
   joint(282,581,24);joint(224,465,26);joint(360,366,23);joint(472,430,16);
   line([[476,446],[459,487],[479,510]],9,'#ceded8');line([[491,440],[520,471],[510,496]],9,'#ceded8');
   box(483,543,58,53,'#7cb5ab');box(465,600,95,11,'#74919a');
   box(117,333,80,69,'#39636d');box(132,347,50,40,'#96cbbd');
   line([[156,402],[156,492],[199,492]],3,'#639b9f');
   box(562,355,74,155,'#3e6672');for(let i=0;i<5;i++)box(576,377+i*24,44,7,i===2?a:'#7cacaf');
  }else{
   // FDM printer with gantry, filament spool and layered printed vase.
   box(202,346,18,300,'#a4b6b0');box(553,346,18,300,'#a4b6b0');box(202,337,369,22,a);
   box(185,640,406,30,'#719089');box(249,595,282,15,'#c0ccc0');
   line([[214,439],[562,439]],12,'#7a949b');box(361,420,57,54,a);box(380,474,17,23,'#d9bc89');
   for(let i=0;i<15;i++){const w=64+Math.sin(i*.36)*24;box(391-w/2,588-i*5,w,4,i%2?'#e9bd68':'#618e77');}
   joint(626,345,36);joint(626,345,12);line([[596,320],[538,294],[391,294],[391,416]],3,a);
   box(490,623,76,30,'#172f3a');box(501,629,43,17,a);
  }
  c.fillStyle=a;c.font='bold 36px Barlow, sans-serif';c.textAlign='center';c.fillText(title,384,772);
  c.fillStyle='#d7c4a2';c.font='27px Barlow, sans-serif';c.fillText(subtitles[index],384,819);
  for(let i=0;i<3;i++){c.beginPath();c.arc(354+i*30,873,i===index?6:4,0,Math.PI*2);c.fillStyle=i===index?a:'#46616d';c.fill();}
  c.textAlign='left';return canvas;
 });
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=960;
 const c=canvas.getContext('2d')!;c.drawImage(slides[0],0,0);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 let previous=-1;
 const update=(time:number)=>{
  const phase=time%15,index=Math.floor(phase/5),local=phase%5;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blend=reduced?0:Math.max(0,(local-4.3)/.7);
  if(index===previous&&blend===0)return;
  c.globalAlpha=1;c.drawImage(slides[index],0,0);
  if(blend>0){c.globalAlpha=blend;c.drawImage(slides[(index+1)%3],0,0);c.globalAlpha=1;}
  texture.needsUpdate=true;previous=index;
 };
 return {texture,update};
}
