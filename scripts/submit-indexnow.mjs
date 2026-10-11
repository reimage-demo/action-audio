import {readFile} from 'node:fs/promises';
const sitemap=await readFile('dist/sitemap.xml','utf8');
const urlList=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const home=urlList.find(url=>url.endsWith('/'));
if(!home||urlList.some(url=>!url.startsWith(home)))throw new Error('Sitemap URLs must belong to one site.');
const key=(await readFile('dist/action-audio-indexnow.txt','utf8')).trim();
const keyLocation=home+'action-audio-indexnow.txt';
if(process.env.INDEXNOW_DRY_RUN==='1')console.log(`Validated ${urlList.length} canonical URLs for IndexNow.`);
else {
 const verification=await fetch(keyLocation);
 if(!verification.ok||(await verification.text()).trim()!==key)throw new Error('Publish and verify the IndexNow file before submitting.');
 const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({host:new URL(home).hostname,key,keyLocation,urlList})});
 if(!response.ok)throw new Error(`IndexNow returned ${response.status}: ${await response.text()}`);
 console.log(`IndexNow received ${urlList.length} URLs (HTTP ${response.status}). This confirms submission, not indexing or ranking.`);
}
