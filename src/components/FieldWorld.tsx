import {useMemo} from 'react';
import {PerspectiveCamera,Vector3} from 'three';
import {rand} from '../animations/motion';
/** Three.js camera math + SVG rasterization: deterministic 3D, no real-time physics. */
export function FieldWorld({frame,width,height,color,mode='field'}:{frame:number;width:number;height:number;color:string;mode?:'field'|'orbit'|'warp'}){
 const items=useMemo(()=>Array.from({length:420},(_,i)=>({x:(i%21-10)*2.5,y:rand(i)*.55,z:Math.floor(i/21)*3-27,r:rand(i+900)})),[]);
 const time=frame/30;
 const cam=new PerspectiveCamera(55,width/height,.1,220);
 const orbit=mode==='orbit';const warp=mode==='warp';
 cam.position.set(orbit?Math.sin(time*.14)*15:Math.sin(time*.11)*4,orbit?16:19-time*.22,orbit?Math.cos(time*.14)*25:32-time*(warp?2.6:.75));
 cam.lookAt(0,0,-9-time*.18);cam.updateMatrixWorld();
 const project=(x:number,y:number,z:number)=>{const p=new Vector3(x,y,z).project(cam);return{x:(p.x+1)*width/2,y:(1-p.y)*height/2,z:p.z};};
 const paths=Array.from({length:21},(_,i)=>{let d='';for(let j=0;j<45;j++){const z=j*1.6-35;const x=(i-10)*2.5+Math.sin(z*.06)*1.1;const p=project(x,0,z);if(p.z>0&&p.z<.997&&Math.abs(p.x)<width*4&&Math.abs(p.y)<height*4)d+=`${d?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)} `;}return d;});
 return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position:'absolute',inset:0,overflow:'hidden'}}>
  <defs><linearGradient id="crop-line" x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity="0"/><stop offset=".55" stopColor={color} stopOpacity=".55"/><stop offset="1" stopColor={color} stopOpacity=".1"/></linearGradient><filter id="softglow"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
  <g opacity=".65">{paths.map((d,i)=><path key={i} d={d} fill="none" stroke="url(#crop-line)" strokeWidth={i%4===0?2.1:1}/>)}</g>
  {items.map((p,i)=>{const q=project(p.x+Math.sin(p.z*.06),p.y,p.z);if(q.z>1||q.z<0)return null;const flash=.3+.7*Math.max(0,Math.sin(time*1.7+p.r*9));return <circle key={i} cx={q.x} cy={q.y} r={1.5+p.r*2.2} fill={color} opacity={flash*(1-q.z)*18}/>;})}
  {Array.from({length:8},(_,i)=>{const z=((time*8+i*9)%60)-30;const p=project((i-4)*4,0,z);const q=project((i-4)*4,0,z+1.5);return <path key={i} d={`M${p.x},${p.y}L${q.x},${q.y}`} stroke={color} strokeWidth="3" opacity=".8"/>;})}
 </svg>;
}
