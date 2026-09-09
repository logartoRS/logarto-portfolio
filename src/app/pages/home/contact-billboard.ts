import { translate as t } from './translations';
import * as THREE from 'three';
export async function createContactBillboard(){
 const icons=await Promise.all(['mail','linkedin','github'].map(name=>new Promise<HTMLImageElement|null>(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src='assets/contact/'+name+'.svg';})));
 const names=[t("Correo"),'LinkedIn','GitHub'];const colors=['#b88739','#0a66c2','#30363d'];
 const captions=[t("Conversemos sobre tu proyecto"),t("Conectemos profesionalmente"),t("Explora mi código y proyectos")];
 const handles=['bretamozos24@gmail.com','/in/bretamozos','logartoRS'];
 const slides=names.map((name,index)=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=800;const c=canvas.getContext('2d')!;
 c.fillStyle='#151d24';c.fillRect(0,0,640,800);c.strokeStyle=index===2?'#89939d':colors[index];c.lineWidth=6;c.strokeRect(25,25,590,750);
 c.fillStyle='#e5a51d';c.font='600 26px Barlow';c.fillText(t("BARS / CONECTEMOS"),55,88);
 c.fillStyle='#fff2dc';c.font='700 58px Barlow';c.fillText(t("Hablemos."),55,178);
 c.fillStyle=colors[index];c.beginPath();c.roundRect(195,235,250,250,42);c.fill();if(icons[index])c.drawImage(icons[index]!,244,284,152,152);
 c.textAlign='center';c.fillStyle='#ffffff';c.font='700 54px Barlow';c.fillText(name,320,561);c.font='26px Barlow';c.fillText(captions[index],320,609);c.fillStyle='#dcc6a0';c.font='25px Barlow';c.fillText(handles[index],320,654);
 for(let i=0;i<3;i++){c.fillStyle=i===index?'#e5a51d':'#67717c';c.beginPath();c.arc(290+i*30,715,i===index?6:4,0,Math.PI*2);c.fill();}return canvas;});
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=800;const c=canvas.getContext('2d')!;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;let previous=-1;
 const update=(time:number)=>{const index=Math.floor(time/5)%3,blend=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(0,(time%5-4.3)/.7);if(previous===index&&!blend)return;c.globalAlpha=1;c.drawImage(slides[index],0,0);if(blend){c.globalAlpha=blend;c.drawImage(slides[(index+1)%3],0,0);c.globalAlpha=1;}texture.needsUpdate=true;previous=index;};update(0);return {texture,update};
}
