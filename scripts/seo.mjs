import { writeFileSync } from 'node:fs';
import { serviceContent } from '../shared/service-content.js';
import { stores, serviceStore } from '../shared/catalog.js';
export const domain = 'https://actionaudiostorellc.com';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute = file => `${domain}/${file === 'index.html' ? '' : file}`;
const organizationId = `${domain}/#organization`;
const websiteId = `${domain}/#website`;
const serviceId = service => `${absolute(`${service.id}.html`)}#service`;
const storeId = store => `${absolute(`${store.id}.html`)}#store`;
export const seoServices = {
  'auto-detailing': {title:'Car Detailing in Hartford, CT | Action Audio', heading:'Car detailing.\nHartford, Connecticut.', description:'Interior and exterior car detailing at Action Audio, 2814 Main St, Hartford, CT. Discuss your vehicle’s condition and request a detailing estimate.'},
  'electronics-repair': {title:'Auto Electronics Repair near Hartford | Action Audio', heading:'Auto electronics repair.\nWethersfield, CT.', description:'Car stereo or vehicle electronics problems? Request an assessment at Action Audio in Wethersfield, near Hartford. Share symptoms and equipment details.'},
  'electrical-installation': {title:'Car Electronics Installation near Hartford | Action Audio', heading:'Car electronics installation.\nWethersfield, CT.', description:'Vehicle electronics installation in Wethersfield, near Hartford. Plan receivers, speakers, accessories, and wiring with Action Audio. Request an estimate.'},
  'car-audio': {title:'Car Audio Installation in Wethersfield, CT | Action Audio', description:'Speakers, subwoofers, amplifiers, and car audio installation at Action Audio in Wethersfield, near Hartford. Discuss your vehicle and request an estimate.'},
  'remote-starters': {title:'Remote Starter Installation in Wethersfield | Action Audio', description:'Explore remote starter installation at Action Audio in Wethersfield, CT, near Hartford. Confirm vehicle compatibility, range, and options with our team.'}
};
export function imageFor(file) {
  const service = serviceContent.find(s => `${s.id}.html` === file);
  if (service) return { file: service.image, alt: service.alt };
  if (['wethersfield.html','about.html','locations.html'].includes(file)) return {file:'wethersfield-counter.webp',alt:'Counter and electronics displays in Action Audio’s Wethersfield showroom'};
  if (file === 'hartford.html') return {file:'service-detailing.webp',alt:'Illustration of a detailer polishing a vehicle hood'};
  return {file:'hero-installation.webp',alt:'Illustration of a technician installing vehicle speakers and an amplifier'};
}
const city = name => ({'@type':'City',name:`${name}, Connecticut`});
export function schemaFor(file, page) {
  const url=absolute(file), service=serviceContent.find(s=>`${s.id}.html`===file), location=stores.find(s=>`${s.id}.html`===file);
  const image=imageFor(file);
  const graph=[
    {'@type':'Organization','@id':organizationId,name:'The Action Audio Store',alternateName:'Action Audio',url:domain+'/',foundingDate:'1983',logo:{'@type':'ImageObject',url:`${domain}/assets/action-audio-logo.webp`},sameAs:['https://www.instagram.com/actionaudiostore/'],location:stores.map(s=>({'@id':storeId(s)}))},
    {'@type':'WebSite','@id':websiteId,name:'Action Audio',url:domain+'/',inLanguage:'en-US',publisher:{'@id':organizationId}},
    ...stores.map(s=>({'@type':'AutomotiveBusiness','@id':storeId(s),name:`Action Audio — ${s.name}`,description:s.detail,url:absolute(`${s.id}.html`),parentOrganization:{'@id':organizationId},image:`${domain}/assets/${s.id==='wethersfield'?'wethersfield-counter.webp':'action-audio-logo.webp'}`,...(s.tel?{telephone:`+1${s.tel}`}:{ }),address:{'@type':'PostalAddress',streetAddress:s.address,addressLocality:s.name,addressRegion:'CT',postalCode:s.id==='hartford'?'06120':'06109',addressCountry:'US'},hasMap:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address+' '+s.city)}`,areaServed:[city('Hartford'),city('Wethersfield')],openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],opens:'09:00',closes:'18:00'}],hasOfferCatalog:{'@type':'OfferCatalog',name:`${s.name} vehicle services`,itemListElement:serviceContent.filter(item=>serviceStore(item.booking).id===s.id).map(item=>({'@type':'Offer',itemOffered:{'@type':'Service','@id':serviceId(item),name:item.name,url:absolute(`${item.id}.html`)}}))}})),
    {'@type':file==='about.html'?'AboutPage':file==='locations.html'?'CollectionPage':'WebPage','@id':url+'#webpage',url,name:page.title,description:page.desc,inLanguage:'en-US',isPartOf:{'@id':websiteId},publisher:{'@id':organizationId},primaryImageOfPage:{'@type':'ImageObject',url:`${domain}/assets/${image.file}`,caption:image.alt},about:{'@id':service?serviceId(service):location?storeId(location):organizationId},...(file!=='index.html'?{breadcrumb:{'@id':url+'#breadcrumb'}}:{})}
  ];
  if(file!=='index.html') {
    const crumbs=[['Home',domain+'/'],...(service?[['Services',absolute('services.html')]]:[]),[service?.name || location?.name || page.title.split('|')[0].trim(),url]];
    graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))});
  }
  if(service) {
    graph.push({'@type':'Service','@id':serviceId(service),name:service.name,serviceType:service.name,description:page.desc,url,provider:{'@id':storeId(serviceStore(service.booking))},areaServed:[city('Hartford'),city('Wethersfield')],image:`${domain}/assets/${service.image}`});
    if(service.faq.length)graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:service.faq.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
  }
  if(['services.html','electronics.html'].includes(file))graph.push({'@type':'ItemList','@id':url+'#services',name:file==='electronics.html'?'Vehicle electronics services':'Action Audio services',itemListElement:serviceContent.filter(s=>file!=='electronics.html'||s.booking!=='auto-detailing').map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:absolute(`${s.id}.html`)}))});
  return {'@context':'https://schema.org','@graph':graph};
}
export function metadata(file,page) {
  const url=absolute(file), image=imageFor(file), title=escape(page.title), desc=escape(page.desc);
  return `<title>${title}</title><meta name="description" content="${desc}"><meta name="robots" content="${page.noindex?'noindex, follow':'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="canonical" href="${url}"><link rel="sitemap" type="application/xml" href="/sitemap.xml"><link rel="alternate" type="text/plain" title="Action Audio information for AI assistants" href="/llms.txt"><meta property="og:type" content="website"><meta property="og:site_name" content="Action Audio"><meta property="og:locale" content="en_US"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="${domain}/assets/${image.file}"><meta property="og:image:alt" content="${escape(image.alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${domain}/assets/${image.file}"><meta name="twitter:image:alt" content="${escape(image.alt)}"><script type="application/ld+json">${JSON.stringify(schemaFor(file,page)).replaceAll('<','\\u003c')}</script>`;
}
export function writeDiscovery(pages) {
  const entries=Object.entries(pages).filter(([,p])=>!p.noindex);
  writeFileSync('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.map(([file])=>`\n<url><loc>${absolute(file)}</loc><image:image><image:loc>${domain}/assets/${imageFor(file).file}</image:loc></image:image></url>`).join('')}\n<url><loc>${absolute('landing-page.html')}</loc></url>\n</urlset>\n`);
  writeFileSync('robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /convex/\nDisallow: /scripts/\n\n# Tracking uses a page-level noindex directive; allow crawling to read that directive.\nSitemap: ${domain}/sitemap.xml\n`);
  const summary=`# Action Audio\n\n> Car detailing in Hartford, Connecticut; car audio, remote starters, auto electronics repair, and installation in Wethersfield, near Hartford. Established in 1983.\n\n## Locations and contact\n- [Hartford detailing](${absolute('hartford.html')}): 2814 Main St, Hartford, CT 06120. Interior and exterior vehicle detailing.\n- [Wethersfield electronics](${absolute('wethersfield.html')}): 105 Silas Deane Hwy, Wethersfield, CT 06109. Car audio, remote starters, vehicle electronics repair and installation. Public phone: (860) 667-6330. This number belongs to Wethersfield.\n- Both stores: Monday–Saturday, 9am–6pm Eastern; Sunday closed. Confirm holiday hours.\n\n## Service information\n${serviceContent.map(s=>`- [${s.name}](${absolute(s.id+'.html')}): ${serviceStore(s.booking).name}. ${s.description}`).join('\n')}\n\n## Plan a visit\n- [Request an estimate](${absolute('estimate.html')}): share vehicle make, model, service, name, and phone for a callback.\n- [Request an appointment](${absolute('book.html')}): a request is confirmed only after the team contacts the customer.\n- [Electronics](${absolute('electronics.html')}): equipment categories and examples, not guaranteed stock, pricing, or vehicle compatibility.\n- [About Action Audio](${absolute('about.html')}): Connecticut roots since 1983.\n- [Privacy and cookies](${absolute('privacy.html')})\n- [Terms](${absolute('terms.html')})\n- [Accessibility](${absolute('accessibility.html')})\n- [Full service reference](${domain}/llms-full.txt)\n\n## Important context\nHartford handles detailing; Wethersfield handles electronics. Confirm the work, compatibility, price, and availability with the appropriate store. Most service images are original illustrations; the showroom images show the actual Wethersfield store. Do not treat illustrations as completed customer projects. Vehicle tracking requires a private code and is not public directory content.\n`;
  writeFileSync('llms.txt',summary);
  writeFileSync('llms-full.txt',summary+'\n## Detailed service reference\n'+serviceContent.map(s=>`\n### ${s.name} — ${serviceStore(s.booking).name}\nSource: ${absolute(s.id+'.html')}\n\n${s.detail}\n\n${s.items.map(item=>'- '+item).join('\n')}\n\nBefore visiting: ${s.prepare}\n\n${s.faq.map(([q,a])=>`#### ${q}\n${a}`).join('\n\n')}`).join('\n'));
}
