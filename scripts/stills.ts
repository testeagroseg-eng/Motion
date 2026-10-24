import {renderStill,selectComposition,openBrowser} from '@remotion/renderer';
import {mkdir} from 'node:fs/promises';
import {getBundle} from '../server/render';
import {defaults,timeline} from '../src/config/project';
await mkdir('docs/frames',{recursive:true});const serveUrl=await getBundle();const browser=await openBrowser('chrome',{browserExecutable:'/usr/bin/chromium'});
try{for(const format of ['vertical','horizontal'] as const){const config={...defaults,format};const composition=await selectComposition({serveUrl,id:'AgroSegPlay',inputProps:{config},puppeteerInstance:browser});for(const scene of timeline(config)){const frame=scene.from+Math.min(60,scene.length-1);await renderStill({serveUrl,composition,inputProps:{config},frame,output:`docs/frames/${format}-${scene.id}.jpg`,imageFormat:'jpeg',puppeteerInstance:browser});console.log(format,scene.id);}}}finally{await browser.close({silent:true});}
