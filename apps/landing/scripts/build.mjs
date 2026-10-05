import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),out=path.join(root,'dist');
const files=['index.html','site.css','favicon.svg','llms.txt','ai.txt','site.webmanifest','robots.txt','sitemap.xml','CNAME','icon-192.png','icon-512.png','apple-touch-icon.png','opensamb78c48c0f4ca0e75.txt'];
const pages=['pricing','privacy','terms','refund','acceptable-use','dpa','security'];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const file of [...files,...pages.map(p=>p+'/index.html')]){const dest=path.join(out,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);}
for(const file of ['index.html',...pages.map(p=>p+'/index.html')]){
 const html=fs.readFileSync(path.join(out,file),'utf8');
 if((html.match(/<h1\b/g)||[]).length!==1||/<script\b/i.test(html))throw Error('Invalid page structure: '+file);
 for(const [,href]of html.matchAll(/href="([^"]+)"/g)){
  if(/^(https?:|mailto:)/.test(href))continue;
  const target=path.resolve(path.dirname(path.join(out,file)),href);
  if(!(target===out||target.startsWith(out+path.sep))||!fs.existsSync(target))throw Error('Broken local link: '+href);
 }
}
console.log('PASS: landing and seven information pages built; local links resolve; no scripts or legacy artifacts.');

const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
for(const [,url]of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)){const target=new URL(url);if(target.origin!=='https://opensam.us'||!fs.existsSync(path.join(out,target.pathname,'index.html')))throw Error('Invalid sitemap entry: '+url);}
