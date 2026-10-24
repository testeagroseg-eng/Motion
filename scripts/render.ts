import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {defaults,ProjectConfig,validateConfig} from '../src/config/project';
import {renderProject} from '../server/render';
const args=process.argv.slice(2);const value=(k:string)=>args[args.indexOf(k)+1];
const base=args.includes('--config')?validateConfig(JSON.parse(await readFile(resolve(value('--config')),'utf8'))):structuredClone(defaults);
const format=args.includes('--format')?value('--format') as ProjectConfig['format']:base.format;
const config=validateConfig({...base,format});const output=resolve(args.includes('--output')?value('--output'):`renders/AgroSegPlay-${format}-final.mp4`);
let last=-1;const info=await renderProject(config,output,(progress,stage)=>{const percent=Math.floor(progress*100);if(percent>=last+5||percent===100){console.log(`${percent}% — ${stage}`);last=percent;}});await writeFile(output.replace('.mp4','.report.json'),JSON.stringify({output,config,probe:info},null,2));console.log('Arquivo verificado:',output);
