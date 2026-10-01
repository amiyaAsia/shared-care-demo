import {readFileSync,readdirSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const expected=JSON.parse(readFileSync('release-assets.json','utf8')).assets.sort();
if(expected.length!==41||new Set(expected).size!==41||expected.some(name=>!(/^(index\.html|styles\.css|(app|memory|story|scene|playback|narration-script|value-story)\.js|assets\/amiya-logo\.png|assets\/narration\/(centre|home)-[a-z-]+\.m4a)$/).test(name)))throw Error('Unexpected release allowlist');
const lines=readFileSync('SHA256SUMS','utf8').trim().split('\n');
const names=lines.map(line=>{if(!/^[a-f0-9]{64}  [a-zA-Z0-9./-]+$/.test(line))throw Error('Invalid checksum line');return line.slice(66);}).sort();
if(JSON.stringify(names)!==JSON.stringify(expected))throw Error('Must verify exact reviewed public files');
for(const line of lines){const name=line.slice(66);const hash=createHash('sha256').update(readFileSync(name)).digest('hex');if(hash!==line.slice(0,64))throw Error(`Checksum mismatch ${name}`);}
if(process.argv.includes('--stage'))for(const name of expected){const path=`dist/${name}`;mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});copyFileSync(name,path);}
if(process.argv.includes('--staged')||process.argv.includes('--stage')){
 const actual=readdirSync('dist',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>`${e.parentPath}/${e.name}`.replace(/^dist\//,'')).sort();
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Unexpected staged browser file');
}
console.log('Verified',expected.length,'reviewed browser/audio assets');
