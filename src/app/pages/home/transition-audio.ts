/** Original filtered-noise sweep; generated locally, without external audio assets. */
export class TransitionAudio {
 muted=false;
 private context?:AudioContext;
 private noise?:AudioBuffer;
 private source?:AudioBufferSourceNode;
 private generation=0;
 constructor(){try{this.muted=localStorage.getItem('bars-sound-muted')==='true';}catch{}}
 toggle(){this.muted=!this.muted;this.stop();try{localStorage.setItem('bars-sound-muted',String(this.muted));}catch{}}
 private stop(){this.generation++;try{this.source?.stop();}catch{}this.source=undefined;}
 async play(){
  this.stop();if(this.muted)return;const generation=this.generation;
  try{
   const context=this.context??=new AudioContext();
   if(context.state==='suspended')await context.resume();
   if(generation!==this.generation||this.muted||context.state!=='running')return;
   const duration=1.05;
   if(!this.noise){this.noise=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);const data=this.noise.getChannelData(0);let smooth=0;for(let i=0;i<data.length;i++){smooth=.72*smooth+.28*(Math.random()*2-1);data[i]=smooth;}}
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
   source.buffer=this.noise;filter.type='bandpass';filter.Q.value=.7;
   const now=context.currentTime;filter.frequency.setValueAtTime(350,now);filter.frequency.exponentialRampToValueAtTime(1900,now+.4);filter.frequency.exponentialRampToValueAtTime(250,now+duration);
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.17,now+.32);gain.gain.exponentialRampToValueAtTime(.001,now+duration-.03);gain.gain.linearRampToValueAtTime(0,now+duration);
   source.connect(filter);filter.connect(gain);gain.connect(context.destination);this.source=source;
   source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();if(this.source===source)this.source=undefined;};source.start(now);source.stop(now+duration);
  }catch{/* Audio availability must never interrupt navigation. */}
 }
 dispose(){this.stop();void this.context?.close().catch(()=>{});}
}
