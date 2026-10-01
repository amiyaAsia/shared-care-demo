import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const expected=['index.html','styles.css','app.js','memory.js','story.js','scene.js','assets/amiya-logo.png'].sort();
const lines=readFileSync('SHA256SUMS','utf8').trim().split('\n');
const names=lines.map(line=>{if(!/^[a-f0-9]{64}  [a-zA-Z0-9./-]+$/.test(line))throw Error('Invalid checksum line');return line.slice(66);}).sort();
if(JSON.stringify(names)!==JSON.stringify(expected))throw Error('Must verify exactly seven public files');
for(const line of lines){const name=line.slice(66);const hash=createHash('sha256').update(readFileSync(name)).digest('hex');if(hash!==line.slice(0,64))throw Error(`Checksum mismatch ${name}`);}
if(process.argv.includes('--staged')){
 const actual=readdirSync('dist',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>`${e.parentPath}/${e.name}`.replace(/^dist\//,'')).sort();
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Unexpected staged browser file');
}
console.log('Verified seven reviewed browser assets');
