import { VoxelDetails } from './voxel-details';

/** Rear tea-house courtyard and planted hillside, all resting on a continuous base. */
export function populateRearGarden(source: VoxelDetails) {
 let offsetZ=0;
 const v={add:(x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>source.add(x,y,z+offsetZ,w,h,d,c),tree:(x:number,y:number,z:number,scale=1,pink=false)=>source.tree(x,y,z+offsetZ,scale,pink)};
 const wood='#71533c', dark='#354d50';
 v.add(0,-.075,-13,20,3.15,10,'#3b5059');
 // Shared paving grid matches the original district; smaller warm stones mark pedestrian routes.
 for(let ix=0;ix<30;ix++)for(let iz=0;iz<16;iz++){
  const x=-9.4+ix*.65,z=-7.6-iz*.65;
  if(z> -8)continue;
  v.add(x,1.52,z,.61,.08,.61,['#455463','#526371','#60707a','#3c4b5b'][Math.abs(Math.round(x*7+z*3))%4]);
 }
 // Retaining blocks and coping continue the island perimeter.
 for(let i=0;i<43;i++)for(let level=0;level<5;level++){
  const x=-10+i*.47,y=-1.3+level*.62;
  v.add(x,y,-18,.45,.59,.35,['#455463','#60707a','#526371'][i%3]);
 }
 for(const x of [-10,10])for(let z=-17.6;z< -7.9;z+=.47)for(let level=0;level<5;level++)v.add(x,-1.3+level*.62,z,.35,.59,.45,'#526371');
 for(let x=-10;x<=10;x+=.47)v.add(x,1.57,-17.95,.45,.16,.38,'#89958c');
 for(const x of [-9.95,9.95])for(let z=-17.5;z< -8;z+=.47)v.add(x,1.57,z,.38,.16,.45,'#89958c');
 // Slim lantern posts and hydrants stand alongside the walkways.
 for(const [x,z] of [[-7.9,-10],[8,-10],[8,-16],[-7.9,-16]]){
  v.add(x,2.45,z,.09,1.78,.09,'#344e54');v.add(x,3.36,z,.38,.12,.38,'#667f77');v.add(x,3.15,z,.22,.3,.22,'#e1c697');
 }
 for(const [x,z] of [[-7.8,-8.9],[8,-15]]){v.add(x,1.83,z,.22,.54,.22,'#a76d51');v.add(x,2.12,z,.28,.08,.28,'#bf9269');v.add(x,1.93,z,.46,.12,.12,'#a76d51');}
 // Rock relief, moss and trailing growth wrap the rear retaining walls.
 for(let i=0;i<43;i++){
  const x=-10+i*.47,depth=.28+(Math.sin(i*7)+1)*.22;
  for(let j=0;j<4;j++)v.add(x,-1.25+j*.65,-18-depth/2,.43,.59,depth,['#455463','#60707a','#394e57'][(i+j)%3]);
  if(i%3===0)for(let j=0;j<3+i%5;j++)v.add(x,1.55-j*.24,-18.2,.19,.25,.19,['#416b50','#628959','#83a16b'][j%3]);
 }
 for(const side of [-1,1])for(let i=0;i<21;i++){
  const z=-17.6+i*.47,depth=.3+(Math.sin(i*13)+1)*.2;
  for(let j=0;j<4;j++)v.add(side*(10+depth/2),-1.25+j*.65,z,depth,.59,.43,['#455463','#60707a','#394e57'][(i+j)%3]);
  if(i%3===0)for(let j=0;j<5;j++)v.add(side*10.2,1.6-j*.25,z,.2,.25,.19,'#628959');
 }
 // Bring the rear buildings and their outdoor furniture closer to the original district.
 offsetZ=.65;
 // Timber machiya, facing out toward the rear courtyard.
 v.add(-4,1.72,-11,6,.38,4.1,'#65716b');
 v.add(-4,3.3,-11,5.7,2.8,3.8,'#c1b79a');
 for(const x of [-6.8,-4.5,-1.2])v.add(x,3.35,-12.94,.15,2.9,.15,wood);
 for(const y of [2,4.45,4.75])v.add(-4,y,-12.98,5.85,.16,.18,wood);
 // Sliding entrance and illuminated lattice window.
 v.add(-5.55,3.1,-13.04,1.8,2.1,.08,'#233f43');
 v.add(-2.8,3.35,-13.04,2.2,1.55,.08,'#cda673');
 for(let i=0;i<12;i++)v.add(-6.38+i*.145,3.1,-13.11,.045,2.05,.07,wood);
 for(let i=0;i<13;i++)v.add(-3.85+i*.175,3.35,-13.11,.045,1.55,.07,wood);
 v.add(-5.55,2.02,-13.3,2,.2,.5,'#8b8980');
 for(let i=0;i<4;i++)v.add(-6.24+i*.46,4.12,-13.26,.43,.6,.055,'#9ea993');
 // Stepped ceramic gable roof with tiled ridges and generous eaves.
 for(let row=0;row<9;row++)for(const side of [-1,1]){
  const z=-11+side*(.13+row*.28),y=5.6-row*.105;
  v.add(-4,y,z,6.6,.16,.3,dark);
  for(let t=0;t<23;t++)v.add(-7.2+t*.29,y+.095,z,.075,.08,.29,'#506966');
 }
 v.add(-4,5.76,-11,6.8,.14,.24,'#58746c');
 // Exterior table: coffee and matcha on opposite sides, croissant on a central plate.
 const tx=-4,tz=-15.25;
 v.add(tx,2.47,tz,1.55,.14,1.15,'#9f7c53');
 for(const dx of [-.58,.58])for(const dz of [-.4,.4])v.add(tx+dx,1.98,tz+dz,.1,.84,.1,wood);
 for(const side of [-1,1]){
  const x=tx+side*1.28;
  v.add(x,2.04,tz,.64,.12,.7,'#9a7854');
  for(const dx of [-.24,.24])for(const dz of [-.25,.25])v.add(x+dx,1.77,tz+dz,.08,.42,.08,wood);
  for(const dz of [-.25,.25])v.add(x+side*.28,2.4,tz+dz,.07,.78,.07,wood);
  for(let j=0;j<3;j++)v.add(x+side*.28,2.42+j*.14,tz,.065,.09,.66,'#a38964');
  const cx=tx+side*.47;
  v.add(cx,2.56,tz,.34,.035,.34,'#d4d1b7');
  v.add(cx,2.6,tz,.22,.055,.22,'#ece0bf');
  for(const d of [-.105,.105]){v.add(cx+d,2.7,tz,.035,.2,.24,'#ece0bf');v.add(cx,2.7,tz+d,.18,.2,.035,'#ece0bf');}
  v.add(cx,2.765,tz,.175,.015,.175,side<0?'#513421':'#789845');
  v.add(cx+side*.17,2.7,tz,.055,.14,.07,'#ece0bf');
  for(const y of [2.64,2.76])v.add(cx+side*.13,y,tz,.09,.035,.07,'#ece0bf');
 }
 v.add(tx,2.565,tz,.42,.035,.44,'#d8d0b4');
 for(let i=0;i<7;i++){const a=-1.2+i*.4;v.add(tx+Math.sin(a)*.17,2.62,tz+Math.cos(a)*.1,.085,.095,.13,i%2?'#c28a43':'#dfac61');}
 // Garden lanterns and small planters kept clear of the seating.
 for(const x of [-7.4,-1.25]){
  v.add(x,1.77,-14.5,.75,.42,.75,'#58685d');
  v.tree(x,1.98,-14.5,.52);
 }
 for(const x of [-6.7,-1.1]){v.add(x,2,-16.5,.3,.9,.3,'#596e68');v.add(x,2.5,-16.5,.55,.16,.55,'#78918a');}
 // Side-wall cafe lattice, timber base, gutter and rain barrel.
 for(const x of [-6.91,-1.09]){
  v.add(x,3.25,-11,.08,1.25,1.8,'#758e82');
  for(let j=0;j<10;j++)v.add(x,3.25,-11.8+j*.18,.12,1.3,.045,wood);
  v.add(x,2.18,-11,.13,.36,3.65,wood);
 }
 v.add(-6.99,3.25,-9.3,.09,2.7,.09,'#657674');
 v.add(-7.15,1.96,-9.45,.48,.8,.48,'#6f7960');
}
