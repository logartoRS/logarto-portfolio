import { translate as t } from './translations';
import * as THREE from 'three';
export async function createProjectBillboard(){
 const icons=await Promise.all(['icon-cuadra-512.png','domminder.svg'].map(src=>new Promise<HTMLImageElement|null>(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src='assets/projects/'+src;})));
 const slides=['Cuadra','Domminder'].map((title,index)=>{
  const c=document.createElement('canvas');c.width=768;c.height=700;const x=c.getContext('2d')!;
  const accent=index?'#ffa500':'#12a34a';x.fillStyle=index?'#21190d':'#08261d';x.fillRect(0,0,768,700);
  x.strokeStyle=accent;x.lineWidth=8;x.strokeRect(22,22,724,656);
  x.fillStyle=accent;x.font='600 25px Barlow';x.fillText('0'+(index+1)+t(" / PROYECTO DESTACADO"),54,76);
  x.fillStyle=accent;x.beginPath();x.roundRect(264,116,240,240,36);x.fill();
  if(icons[index]){x.save();x.beginPath();x.roundRect(264,116,240,240,36);x.clip();x.drawImage(icons[index]!,index?300:264,index?152:116,index?168:240,index?168:240);x.restore();}
  x.textAlign='center';x.fillStyle='#fff5e6';x.font='700 72px Barlow';x.fillText(title,384,454);
  x.font='30px Barlow';x.fillText(index?t("Control, datos y mecatrónica"):t("Tus finanzas, en orden."),384,516);
  x.fillStyle=accent;x.font='600 23px Barlow';x.fillText(index?'ANGULAR · JAVA · ARDUINO':'.NET MAUI · SQLITE · ANDROID',384,574);
  for(let j=0;j<2;j++){x.fillStyle=j===index?accent:'#67736b';x.beginPath();x.arc(368+j*32,632,6,0,Math.PI*2);x.fill();}return c;
 });
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=700;const ctx=canvas.getContext('2d')!;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;let last=-1;
 const update=(time:number)=>{const index=Math.floor(time/6)%2,phase=time%6,blend=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(0,(phase-5.2)/.8);if(last===index&&!blend)return;ctx.globalAlpha=1;ctx.drawImage(slides[index],0,0);if(blend){ctx.globalAlpha=blend;ctx.drawImage(slides[1-index],0,0);ctx.globalAlpha=1;}texture.needsUpdate=true;last=index;};update(0);return {texture,update};
}
