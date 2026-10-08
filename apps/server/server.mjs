import http from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../web/dist/',import.meta.url))); 
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
export function createPilotServer({apiKey=process.env.SAM_GOV_API_KEY,accessToken=process.env.OPENSAM_ACCESS_TOKEN,fetchImpl=fetch,maxRequests=30,now=Date.now}={}){
 let windowStart=now(),used=0,busy=false;
 return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{return send(400,{error:'Invalid URL'});}
  if(pathname==='/api/search'){
   if(req.method!=='POST')return send(405,{error:'Use POST'});
   if(!apiKey||!accessToken||accessToken.length<32)return send(503,{error:'Pilot search is not configured. Contact your operator.'});
   const actual=Buffer.from(req.headers.authorization||''),expected=Buffer.from(`Bearer ${accessToken}`);
   if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return send(401,{error:'A valid pilot access code is required.'});
   if(!(req.headers['content-type']||'').startsWith('application/json'))return send(415,{error:'Use application/json'});
   let bytes=0,chunks=[];try{for await(const chunk of req){bytes+=chunk.length;if(bytes>8192){send(413,{error:'Request too large'});return;}chunks.push(chunk);} }catch{return;}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return send(400,{error:'Invalid JSON'});}
   if(!input||typeof input.query!=='string'||input.query.trim().length<2||input.query.length>150||typeof input.naics!=='string'||!/^$|^\d{6}$/.test(input.naics)||!Array.isArray(input.capabilities)||input.capabilities.length>20||input.capabilities.some(c=>typeof c!=='string'||!c.trim()||c.length>80))return send(400,{error:'Enter a title (2–150 characters), optional six-digit NAICS and up to 20 capabilities.'});
   if(now()-windowStart>=86400000){windowStart=now();used=0;}
   if(busy||used>=maxRequests){res.setHeader('Retry-After',busy?'15':String(Math.ceil((86400000-(now()-windowStart))/1000)));return send(429,{error:'Pilot query limit reached. Try later or contact your operator.'});}
   used++;busy=true;
   try{
    const date=d=>`${String(d.getUTCMonth()+1).padStart(2,'0')}/${String(d.getUTCDate()).padStart(2,'0')}/${d.getUTCFullYear()}`;
    const params=new URLSearchParams({api_key:apiKey,title:input.query.trim(),postedFrom:date(new Date(now()-30*86400000)),postedTo:date(new Date(now())),limit:'25',offset:'0'});if(input.naics)params.set('ncode',input.naics);
    const upstream=await fetchImpl(`https://api.sam.gov/opportunities/v2/search?${params}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000),redirect:'error'});
    if(!upstream.ok)throw Error('Upstream failed');
    const data=await upstream.json();if(!Array.isArray(data.opportunitiesData))throw Error('Invalid upstream response');
    const clean=(v,max=500)=>typeof v==='string'?v.split(apiKey).join('[redacted]').slice(0,max):'';
    const results=data.opportunitiesData.slice(0,25).filter(o=>o&&o.active==='Yes'&&typeof o.noticeId==='string'&&!o.noticeId.includes(apiKey)&&/^[a-zA-Z0-9-]{1,80}$/.test(o.noticeId)).map(o=>{
     const title=clean(o.title),naicsCode=clean(o.naicsCode,6),caps=[...new Set(input.capabilities.map(c=>c.trim().toLowerCase()))];
     const matchedCapabilities=caps.filter(c=>title.toLowerCase().includes(c));
     const score=Math.min(100,(input.naics&&naicsCode===input.naics?50:0)+Math.min(50,matchedCapabilities.length*10));
     return {opportunity:{noticeId:o.noticeId,title,naicsCode,responseDeadLine:clean(o.responseDeadLine,50)||null,organizationHierarchy:{l1Name:clean(o.fullParentPathName)||'Agency not supplied'},uiLink:`https://sam.gov/opp/${o.noticeId}/view`},score,label:score>=70?'high':score>=40?'medium':'low',matchedCapabilities};
    }).sort((a,b)=>b.score-a.score);
    return send(200,{results,scope:'First 25 notices posted in the last 30 days; only active records shown. Score: NAICS match (50) plus title keyword matches (10 each, up to 50). Not eligibility or award probability.'});
   }catch{return send(502,{error:'SAM.gov search is temporarily unavailable. No results were confirmed.'});}finally{busy=false;}
  }
  if(pathname.startsWith('/api/'))return send(404,{error:'Not found'});
  if(!['GET','HEAD'].includes(req.method))return send(405,{error:'Method not allowed'});
  let file;try{const decoded=decodeURIComponent(pathname);if(decoded.split('/').some(p=>p.startsWith('.'))||decoded.includes('\\'))return send(404,{error:'Not found'});file=path.resolve(root,'.'+decoded);if(file!==root&&!file.startsWith(root+path.sep))return send(404,{error:'Not found'});if(pathname==='/')file=path.join(root,'index.html');const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?'':content);}catch{return send(404,{error:'Not found'});}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const server=createPilotServer();server.requestTimeout=20000;server.headersTimeout=10000;server.listen(Number(process.env.PORT||3001),process.env.HOST||'127.0.0.1',()=>console.log('OpenSAM pilot server listening.'));}
