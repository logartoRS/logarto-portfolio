import { VoxelDetails } from './voxel-details';

/** Deterministic environmental detail: no random layout changes on reload. */
export function populateDistrict(v: VoxelDetails) {
 const stone=['#394956','#52616a','#647277','#455b62'];
 const leaf=['#345b42','#477b4e','#638b52','#83a567'];
 const noise=(i:number)=>{const n=Math.sin(i*127.1)*43758.5453;return n-Math.floor(n)};
 // Wider irregular garden terraces behind and beside the built core.
 for(let x=-13;x<=-10;x+=.45)for(let z=-17.9;z<9;z+=.45){
  if(x<-12.4+Math.sin(z)*.6)continue;
  const h=1.4+Math.floor((Math.sin(z*.5)+1)*2)*.3;
  v.add(x,h/2-.4,z,.445,h,.445,stone[Math.floor(noise(x*99+z)*4)]);
  v.add(x,h-.36,z,.46,.12,.46,leaf[Math.floor(noise(x+z*8)*4)]);
 }
 // Front basin framing; foreground water is supplied by the renderer.
 for(let x=-10;x<=10;x+=.43)for(let z=8;z<11.2;z+=.43){
  if(x>-2.8&&x<5.1)continue;
  const h=.65+noise(x*32+z)*.65;
  v.add(x,-.8+h/2,z,.42,h,.42,stone[Math.floor(noise(z+x)*4)]);
  if(noise(x+z*70)>.5)v.add(x,h-.74,z,.35,.13,.35,leaf[Math.floor(noise(z*8+x)*4)]);
 }
 for(let i=0;i<75;i++){
  const x=-2.8+noise(i*9)*7.7,z=8+noise(i*11)*3;
  v.add(x,-.03,z,.35,.12,.4,['#245962','#347f7e','#548c81'][i%3]);
  if(i%6===0)v.add(x,.58,z,.22,.035,.2,'#779454');
 }
 // Small dense shrubs, moss and flowers along the edges and roofs.
 for(let i=0;i<720;i++){
  const rooftop=i<280;const right=i%2===0;
  const x=rooftop?(right?4+noise(i)*4:-6.8+noise(i)*5.4):(-11.7+noise(i)*2.1);
  const z=rooftop?(-4.1+noise(i*2)*4.5):(-7+noise(i*2)*15);
  if(rooftop && !right && (z< -2.3 || (x>-3.55 && z> -1.4) || (x< -4.95 && z> -2.3 && z< .05)))continue;
  const ground=1.4+Math.floor((Math.sin(z*.5)+1)*2)*.3-.3;
  const y=rooftop?(right?7.125:10.125):ground;
  v.add(x,y+(.18+noise(i*7)*.25)/2,z,.13+noise(i*3)*.15,.18+noise(i*7)*.25,.18,leaf[i%4]);
  if(i%19===0)v.add(x,y+.48,z,.12,.12,.12,'#e0ba86');
 }
 v.tree(-11,1.7,4,1.2);v.tree(-11,1.5,-4,1);v.tree(-7.3,1.5,-6.4,1.1);
 v.tree(7,7.3,-2,1.35,true);
 // Long irregular vines across industrial side walls and the tower.
 for(let i=0;i<17;i++){
  const tower=i>=11;const x=tower?.03+(i-11)*.25:8.66;
  const z=tower?-4.77:-4.1+(i%11)*.41;
  const top=tower?13.7:7.2;
  for(let j=0;j<4+Math.floor(noise(i)*17);j++){
   v.add(x+Math.sin(j+i)*.09,top-j*.19,z,.14,.22,.17,leaf[(i+j)%4]);
  }
 }
 // Workshop side: panel seams, recessed vents, protective frames.
 for(let y=2;y<6.7;y+=.48)for(let z=-4.2;z<.4;z+=.48){
  v.add(8.53,y,z,.08,.44,.44,stone[Math.floor(noise(y*31+z)*4)]);
 }
 for(let k=0;k<3;k++){
  const z=-3.7+k*1.35;
  v.add(8.68,2.85,z,.22,1.5,1,'#26333f');
  for(let j=0;j<8;j++)v.add(8.84,2.24+j*.17,z,.12,.06,.85,'#85918d');
 }
 // Rooftop pergola surrounding the pink tree.
 for(const x of [4.1,8.1])for(const z of [-3.8,-.3])v.add(x,8.1,z,.1,1.7,.1,'#aa9680');
 for(let i=0;i<8;i++)v.add(4.1+i*.57,8.95,-2.05,.12,.12,3.8,'#697c80');
 // Balcony and perforated walkway at main facade, beneath the display.
 v.add(-3.9,4.45,1.2,6.5,.18,1.25,'#455663');
 for(let i=0;i<24;i++){
  v.add(-7+i*.26,4.9,1.82,.045,.8,.045,'#89978e');
  v.add(-7+i*.26,5.28,1.82,.27,.055,.055,'#b1a58c');
 }
 // Close the exposed end of the front balcony.
 v.add(-7.14,5.28,1.2,.06,.06,1.25,'#b1a58c');
 for(const z of [.6,1,1.4,1.82])v.add(-7.14,4.9,z,.055,.8,.055,'#89978e');
 // Lower workshop: machinery visible as layered shapes under a canopy.
 v.add(6,2.8,.81,3.5,2,.2,'#172a36');v.add(6,3.9,1.2,4,.16,1.3,'#506573');
 for(let i=0;i<3;i++){
  v.add(4.8+i*1.15,2.25,1.05,.7,.7,.48,'#807263');
  v.add(4.8+i*1.15,2.75,1.07,.55,.3,.3,'#a6906d');
 }
 // Organized seating plaza: four legs, two supports, spaced slats and bins.
 for(const [x,z] of [[-7.5,6.5],[7,-7]]){
  for(const dx of [-.65,.65])for(const dz of [-.22,.22])v.add(x+dx,1.82,z+dz,.1,.52,.1,'#263e48');
  for(let i=0;i<7;i++)v.add(x-.72+i*.24,2.12,z,.21,.12,.65,'#aa9271');
  for(const dx of [-.65,.65])v.add(x+dx,2.3,z+.3,.08,1,.08,'#314b55');
  for(let row=0;row<3;row++)v.add(x,2.36+row*.18,z+.34,1.65,.14,.08,'#aa9271');
  v.add(x+1.45,1.96,z,.45,.8,.45,'#466069');v.add(x+1.45,2.39,z,.51,.08,.51,'#253c45');
 }
 // Crates are stored together in the rear service area.
 for(const x of [4.5,5.25]){v.add(x,1.91,-6.2,.65,.7,.65,'#8b785f');for(const d of [-.24,.24])v.add(x+d,1.91,-5.865,.055,.68,.025,'#394950');}
 for(let i=0;i<18;i++)v.add(-1,1.61,2+i*.25,.5,.04,.08,'#243b43');
 // Extra mechanical crown instead of a bare tower roof.
 for(let i=0;i<5;i++){
  const x=.3+i*.35;v.add(x,14.6+noise(i)*.5,-6,.09,1.7+noise(i),.09,'#71828b');
  for(let j=0;j<4;j++)v.add(x,14.5+j*.25,-6,.34,.055,.055,'#9ba8a6');
 }
}
