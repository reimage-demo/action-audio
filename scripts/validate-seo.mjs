import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'dist';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const sitemap=read('sitemap.xml');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const home=urls.find(url=>url.endsWith('/'));
assert(home,'Homepage in sitemap');
const base=new URL(home).pathname;
const titles=new Set(),descriptions=new Set();
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
for(const url of urls){
 const file=new URL(url).pathname.slice(base.length)||'index.html';
 const html=read(file), title=html.match(/<title>([^<]+)<\/title>/)?.[1],desc=html.match(/name="description" content="([^"]+)"/)?.[1];
 assert(title&&!titles.has(title),`Unique title: ${file}`);titles.add(title);
 assert(desc&&!descriptions.has(desc),`Unique description: ${file}`);descriptions.add(desc);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`One H1: ${file}`);
 assert(html.includes(`rel="canonical" href="${url}"`),`Canonical matches sitemap: ${file}`);
 for(const name of ['og:title','og:description','og:image','og:image:alt','twitter:title','twitter:description','twitter:image','twitter:image:alt'])assert(html.includes(`="${name}"`),`Social metadata ${name}: ${file}`);
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]*"/.test(img[0]),`Image alt: ${file}`);
 for(const link of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const value=decode(link[1]);if(!value.startsWith(base)||value.startsWith('//'))continue;
  const target=value.slice(base.length).split(/[?#]/)[0]||'index.html';assert(fs.existsSync(path.join(root,target)),`Local link ${value}: ${file}`);
 }
 for(const set of html.matchAll(/srcset="([^"]+)"/g))for(const candidate of set[1].split(',')){
  const src=candidate.trim().split(/\s+/)[0];assert(src.startsWith(base),`Responsive image uses deployment base: ${src}`);assert(fs.existsSync(path.join(root,src.slice(base.length))),`Responsive image exists: ${src}`);
 }
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];assert(scripts.length,`Schema: ${file}`);
 for(const script of scripts){
  const graph=JSON.parse(script[1])['@graph'];
  assert(graph.some(n=>n['@type']==='WebSite'));
  const stores=graph.filter(n=>n['@type']==='AutomotiveBusiness');assert.equal(stores.length,2);
  assert.equal(stores.find(s=>s.name.includes('Hartford')).address.postalCode,'06120');
  assert(!stores.find(s=>s.name.includes('Hartford')).telephone,'Do not assign Wethersfield phone to Hartford');
  const service=graph.find(n=>n['@type']==='Service');if(service)assert(service.provider['@id'].includes(['auto-detailing.html','window-tinting.html'].includes(file)?'hartford.html':'wethersfield.html'));
  const visible=decode(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' '));
  for(const faq of graph.filter(n=>n['@type']==='FAQPage').flatMap(n=>n.mainEntity)){assert(visible.includes(faq.name));assert(visible.includes(faq.acceptedAnswer.text));}
 }
}
assert(!urls.some(url=>url.includes('track.html')));
assert(read('track.html').includes('noindex, follow'));
assert(!read('robots.txt').includes('Disallow: /track.html'));
for(const file of ['llms.txt','llms-full.txt']){const content=read(file);assert(content.includes(home));assert(content.includes('2814 Main St'));assert(content.includes('105 Silas Deane Hwy'));assert(content.includes('electronics-replacement.html'));}
console.log(`SEO checks passed for ${urls.length} indexable pages: titles, descriptions, canonicals, social metadata, schema, visible FAQs, image alternatives, local links, sitemap, and AI reference files.`);
