import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPilotServer} from '../server.mjs';
const token='a'.repeat(40),key='server-only-secret';
async function run(options,fn){const server=createPilotServer({apiKey:key,accessToken:token,...options});await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await fn(`http://127.0.0.1:${server.address().port}`);}finally{await new Promise(r=>server.close(r));}}
const payload={query:'cloud',naics:'541512',capabilities:['cloud']};
const request=(url,data=payload,auth=token)=>fetch(url+'/api/search',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify(data)});
test('fails closed, validates requests and never calls upstream without authorization',async()=>{
 let calls=0;await run({fetchImpl:async()=>{calls++;throw Error(key)}},async url=>{assert.equal((await request(url,payload,'wrong')).status,401);assert.equal((await request(url,{...payload,naics:'oops'})).status,400);assert.equal((await request(url,{...payload,capabilities:['']})).status,400);assert.equal(calls,0);const r=await request(url);assert.equal(r.status,502);assert.ok(!(await r.text()).includes(key));});
 await run({apiKey:''},async url=>assert.equal((await request(url)).status,503));
});
test('uses documented query parameters and only returns normalized safe fields',async()=>{
 let upstream;await run({fetchImpl:async url=>{upstream=new URL(url);return new Response(JSON.stringify({opportunitiesData:[{noticeId:'id1',title:'cloud',naicsCode:'541512',active:'Yes',uiLink:'javascript:alert(1)',description:key,links:[key]}],totalRecords:1}));}},async url=>{const r=await request(url);assert.equal(r.status,200);const text=await r.text();assert.ok(!text.includes(key));const data=JSON.parse(text);assert.equal(data.results[0].opportunity.uiLink,'https://sam.gov/opp/id1/view');assert.equal(upstream.searchParams.get('title'),'cloud');assert.equal(upstream.searchParams.get('ncode'),'541512');assert.ok(upstream.searchParams.get('postedFrom'));assert.equal(upstream.searchParams.get('api_key'),key);});
});
test('global quota limits upstream work and oversized bodies are rejected',async()=>{
 let calls=0;await run({maxRequests:1,fetchImpl:async()=>{calls++;return new Response('{"opportunitiesData":[]}');}},async url=>{assert.equal((await request(url,{query:'x'.repeat(20000)})).status,413);assert.equal((await request(url)).status,200);assert.equal((await request(url)).status,429);assert.equal(calls,1);});
});
test('blocks concurrent upstream work and serves no source files',async()=>{
 let release,started;const ready=new Promise(r=>started=r);await run({fetchImpl:async()=>{started();await new Promise(r=>release=r);return new Response('{"opportunitiesData":[]}');}},async url=>{
 const first=request(url);await ready;assert.equal((await request(url)).status,429);release();assert.equal((await first).status,200);
 for(const p of ['/apps/server/.env.example','/package.json','/%2e%2e%2fpackage.json','/.env'])assert.equal((await fetch(url+p)).status,404);
 });
});

test('serves the built homepage and its compiled JavaScript',async()=>{await run({},async url=>{const r=await fetch(url);assert.equal(r.status,200);const html=await r.text();const src=html.match(/src="([^" ]+\.js)"/)[1];const asset=await fetch(url+src);assert.equal(asset.status,200);assert.match(asset.headers.get('content-type'),/javascript/);});});
