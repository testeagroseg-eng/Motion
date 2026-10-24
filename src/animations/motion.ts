import {Easing,interpolate,spring} from 'remotion';
export const smooth=(frame:number,start=0,length=25)=>interpolate(frame,[start,start+length],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)});
export const pop=(frame:number,delay=0)=>spring({fps:30,frame:frame-delay,config:{damping:19,stiffness:105,mass:.8}});
export function rand(seed:number){let x=Math.sin(seed*127.1+311.7)*43758.5453123;return x-Math.floor(x);}
