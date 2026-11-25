import { writeFileSync } from 'node:fs';
import { serviceContent } from '../shared/service-content.js';
import { serviceGuides, pageFaqs } from '../shared/search-content.js';
import { imageManifest } from '../shared/image-manifest.js';
import { stores } from '../shared/catalog.js';
export const domain = 'https://www.actionaudiostorellc.com';
// Date of this substantive metadata/schema review, not the build time.
// Override with page.updated when only one page receives a later content update.
export const seoUpdated = '2026-10-30';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute = file => `${domain}/${file === 'index.html' ? '' : file}`;
const organizationId = `${domain}/#organization`;
const websiteId = `${domain}/#website`;
const serviceId = service => `${absolute(`${service.id}.html`)}#service`;
const storeId = store => `${absolute(`${store.id}.html`)}#store`;
export const seoServices = {
  "auto-detailing": {
    "title": "Car Detailing CT | Interior & Exterior | Action Audio",
    "heading": "Interior & exterior car detailing.",
    "description": "Interior and exterior auto detailing in Hartford and Wethersfield. Tell Action Audio about your vehicle and request a detailing estimate."
  },
  "electronics-replacement": {
    "title": "Car Stereo & Electronics Replacement CT | Action Audio",
    "heading": "Car stereo & electronics replacement.",
    "description": "Replace your car stereo or vehicle electronics in Hartford and Wethersfield. Review compatible equipment and installation with Action Audio."
  },
  "electrical-installation": {
    "title": "Car Electronics Installation CT | Action Audio",
    "heading": "CarPlay, Android Auto & radio installation.",
    "description": "Upgrade to Apple CarPlay and Android Auto with compatible radio installation in Hartford and Wethersfield. Ask Action Audio about receiver and vehicle fit."
  },
  "car-audio": {
    "title": "Car Audio & Stereo Installation CT | Action Audio",
    "heading": "Car audio & stereo installation.",
    "description": "Car stereo, speaker, subwoofer, and amplifier installation in Hartford and Wethersfield. Plan your audio upgrade with Action Audio."
  },
  "remote-starters": {
    "title": "Remote Starter Installation CT | Action Audio",
    "heading": "Remote starter installation.",
    "description": "Remote car starter installation in Hartford and Wethersfield. Discuss vehicle compatibility, control options, and installation pricing with Action Audio."
  },
  "window-tinting": {
    "title": "Car Window Tinting CT | Action Audio",
    "heading": "Car window tinting.",
    "description": "Vehicle window tinting in Hartford and Wethersfield. Discuss film options, window coverage, existing tint, and an installation estimate."
  },
  "dash-cams": {
    "title": "Dash Cam Installation CT | Action Audio",
    "heading": "Dash cam installation.",
    "description": "Front, rear, and cabin dash cam installation in Hartford and Wethersfield. Ask Action Audio about wiring, camera placement, parking mode, and vehicle compatibility."
  },
  "gps-trackers": {
    "title": "GPS Tracker Installation CT | Action Audio",
    "heading": "GPS tracker installation.",
    "description": "Vehicle GPS tracker installation in Hartford and Wethersfield. Discuss compatible trackers, mounting, power requirements, and connected-service options."
  },
  "car-alarms": {
    "title": "Car Alarm Installation CT | Action Audio",
    "heading": "Car alarms & security installation.",
    "description": "Explore car alarm and keyless-entry installation in Hartford and Wethersfield. Review security features and vehicle compatibility with Action Audio."
  },
  "motorcycle-audio": {
    "title": "Motorcycle Audio CT | Action Audio",
    "heading": "Motorcycle audio.",
    "description": "Explore motorcycle speaker and amplifier options at Action Audio in Hartford and Wethersfield. Confirm equipment fit and installation availability for your bike."
  },
  "video-systems": {
    "title": "Car Video & Entertainment CT | Action Audio",
    "heading": "Car video & entertainment systems.",
    "description": "Explore rear-seat video, overhead screens, and vehicle entertainment at Action Audio in Hartford and Wethersfield. Discuss equipment and installation compatibility."
  },
  "motorsport-upgrades": {
    "title": "Slingshot Audio & Motorsport Upgrades CT | Action Audio",
    "heading": "Slingshot audio & motorsport upgrades.",
    "description": "Explore Slingshot speakers, amplifiers, and connected audio upgrades at Action Audio in Hartford and Wethersfield. Discuss fit and installation for your model."
  }
};
export function imageFor(file) {
  const service = serviceContent.find(s => `${s.id}.html` === file);
  if (service) return { file: service.image, alt: service.alt };
  if (['wethersfield.html','about.html','locations.html'].includes(file)) return {file:'wethersfield-counter.webp',alt:'Counter and electronics displays in Action Audio’s Wethersfield showroom'};
  if (file === 'hartford.html') return {file:'service-soap-wash.webp',alt:'A white SUV covered in soap during an exterior wash'};
  return {file:'service-audio-led.webp',alt:'Custom trunk subwoofers with green LED lighting'};
}
const city = name => ({'@type':'City',name:`${name}, Connecticut`});
export function schemaFor(file, page) {
  const url=absolute(file), service=serviceContent.find(s=>`${s.id}.html`===file), location=stores.find(s=>`${s.id}.html`===file);
  const image=imageFor(file);
  const graph=[
    {'@type':'Organization','@id':organizationId,name:'The Action Audio Store',alternateName:'Action Audio',url:domain+'/',foundingDate:'1983',logo:{'@type':'ImageObject',url:`${domain}/assets/action-audio-logo.webp`},sameAs:['https://www.instagram.com/actionaudiostore/'],location:stores.map(s=>({'@id':storeId(s)}))},
    {'@type':'WebSite','@id':websiteId,name:'Action Audio',url:domain+'/',inLanguage:'en-US',publisher:{'@id':organizationId}},
    ...stores.map(s=>({'@type':'AutomotiveBusiness','@id':storeId(s),name:`Action Audio — ${s.name}`,description:s.detail,url:absolute(`${s.id}.html`),parentOrganization:{'@id':organizationId},image:`${domain}/assets/${s.id==='wethersfield'?'wethersfield-counter.webp':'action-audio-logo.webp'}`,...(s.tel?{telephone:`+1${s.tel}`}:{ }),address:{'@type':'PostalAddress',streetAddress:s.address,addressLocality:s.name,addressRegion:'CT',postalCode:s.id==='hartford'?'06120':'06109',addressCountry:'US'},hasMap:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address+' '+s.city)}`,areaServed:[city('Hartford'),city('Wethersfield')],openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],opens:'09:00',closes:'18:00'}],hasOfferCatalog:{'@type':'OfferCatalog',name:`${s.name} vehicle services`,itemListElement:serviceContent.map(item=>({'@type':'Offer',itemOffered:{'@type':'Service','@id':serviceId(item),name:item.name,url:absolute(`${item.id}.html`)}}))}})),
    {'@type':file==='about.html'?'AboutPage':file==='locations.html'?'CollectionPage':'WebPage','@id':url+'#webpage',url,dateModified:page.updated || seoUpdated,name:page.title,description:page.desc,inLanguage:'en-US',isPartOf:{'@id':websiteId},publisher:{'@id':organizationId},primaryImageOfPage:{'@type':'ImageObject',url:`${domain}/assets/${image.file}`,caption:image.alt},about:{'@id':service?serviceId(service):location?storeId(location):organizationId},...(service||location?{mainEntity:{'@id':service?serviceId(service):storeId(location)}}:{}),...(file!=='index.html'?{breadcrumb:{'@id':url+'#breadcrumb'}}:{})}
  ];
  if(file!=='index.html') {
    const crumbs=[['Home',domain+'/'],...(service?[['Services',absolute('services.html')]]:[]),[service?.name || location?.name || page.title.split('|')[0].trim(),url]];
    graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))});
  }
  if(service) {
    graph.push({'@type':'Service','@id':serviceId(service),name:service.name,serviceType:service.name,description:page.desc,url,mainEntityOfPage:{'@id':url+'#webpage'},availableChannel:{'@type':'ServiceChannel',serviceUrl:absolute('estimate.html')+'?service='+service.id,serviceLocation:stores.map(s=>({'@id':storeId(s)}))},provider:stores.map(s=>({'@id':storeId(s)})),areaServed:[city('Hartford'),city('Wethersfield')],image:`${domain}/assets/${service.image}`});
    if(service.faq.length)graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:service.faq.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
  }
  if(pageFaqs[file])graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:pageFaqs[file].map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
  if(['services.html','electronics.html'].includes(file))graph.push({'@type':'ItemList','@id':url+'#services',name:file==='electronics.html'?'Vehicle electronics services':'Action Audio services',itemListElement:serviceContent.filter(s=>file!=='electronics.html'||s.booking!=='auto-detailing').map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:absolute(`${s.id}.html`)}))});
  return {'@context':'https://schema.org','@graph':graph};
}
export function metadata(file,page) {
  const url=absolute(file), image=imageFor(file), title=escape(page.title), desc=escape(page.desc);
  return `<title>${title}</title><meta name="description" content="${desc}"><meta name="robots" content="${page.noindex?'noindex, follow':'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="canonical" href="${url}"><link rel="sitemap" type="application/xml" href="/sitemap.xml"><link rel="alternate" type="text/plain" title="Action Audio information for AI assistants" href="/llms.txt"><meta property="og:type" content="website"><meta property="og:site_name" content="Action Audio"><meta property="og:locale" content="en_US"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="${domain}/assets/${image.file}"><meta property="og:image:width" content="${imageManifest[image.file].width}"><meta property="og:image:height" content="${imageManifest[image.file].height}"><meta property="og:image:type" content="image/webp"><meta property="og:image:alt" content="${escape(image.alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${domain}/assets/${image.file}"><meta name="twitter:image:alt" content="${escape(image.alt)}"><script type="application/ld+json">${JSON.stringify(schemaFor(file,page)).replaceAll('<','\\u003c')}</script>`;
}
export function writeDiscovery(pages) {
  const entries=Object.entries(pages).filter(([,p])=>!p.noindex);
  writeFileSync('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.map(([file,p])=>`\n<url><loc>${absolute(file)}</loc><lastmod>${p.updated || seoUpdated}</lastmod><image:image><image:loc>${domain}/assets/${imageFor(file).file}</image:loc></image:image></url>`).join('')}\n<url><loc>${absolute('landing-page.html')}</loc><lastmod>${seoUpdated}</lastmod></url>\n</urlset>\n`);
  writeFileSync('robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /convex/\nDisallow: /scripts/\n\n# Tracking uses a page-level noindex directive; allow crawling to read that directive.\nSitemap: ${domain}/sitemap.xml\n`);
  const summary=`# Action Audio\n\n> All services are available at both Hartford and Wethersfield. Established in 1983.\n\n## Locations and contact\n- [Hartford](${absolute('hartford.html')}): 2814 Main St, Hartford, CT 06120.\n- [Wethersfield](${absolute('wethersfield.html')}): 105 Silas Deane Hwy, Wethersfield, CT 06109. Public phone: (860) 667-6330. This number belongs to Wethersfield.\n- Both stores: Monday–Saturday, 9am–6pm Eastern; Sunday closed. Confirm holiday hours.\n\n## Primary service guides\n- [Interior and exterior car detailing](${absolute('auto-detailing.html')}): vehicle condition, interior and exterior priorities, estimate factors, and preparation.\n- [Car audio and stereo installation](${absolute('car-audio.html')}): speakers, subwoofers, amplifiers, receiver fit, and factory features.\n- [Car electronics installation](${absolute('electrical-installation.html')}): equipment compatibility, wiring, mounting, and installation planning.\n- [Remote starter installation](${absolute('remote-starters.html')}): vehicle compatibility, control options, and estimate factors.\n\n## Service information\n${serviceContent.map(s=>`- [${s.name}](${absolute(s.id+'.html')}): ${s.description}`).join('\n')}\n\n## Plan a visit\n- [Request an estimate](${absolute('estimate.html')}): share vehicle year, make, model, service details, name, phone, and email to receive an estimate by email.\n- [Request an appointment](${absolute('book.html')}): a request is confirmed only after the team contacts the customer.\n- [Electronics](${absolute('electronics.html')}): equipment categories and examples, not guaranteed stock, pricing, or vehicle compatibility.\n- [About Action Audio](${absolute('about.html')}): Connecticut roots since 1983.\n- [Privacy and cookies](${absolute('privacy.html')})\n- [Terms](${absolute('terms.html')})\n- [Accessibility](${absolute('accessibility.html')})\n- [Full service reference](${domain}/llms-full.txt)\n\n## Official website and crawlable sources\n- [Homepage](${domain}/)\n- [XML sitemap](${domain}/sitemap.xml)\n- This is the official public site. Older reimage-demo.github.io/action-audio URLs have moved here.\n\n## Important context\nAll services are available at both Hartford and Wethersfield. Confirm the work, compatibility, price, and availability with the appropriate store. Most service images are original illustrations; the showroom images show the actual Wethersfield store. Do not treat illustrations as completed customer projects. Electronics repair is not offered; the electronics service is replacement and installation. Pricing, completion time, equipment availability, and compatibility require confirmation. Vehicle tracking requires a private code and is not public directory content.\n`;
  writeFileSync('llms.txt',summary);
  writeFileSync('llms-full.txt',summary+'\n## Detailed service reference\n'+serviceContent.map(s=>`\n### ${s.name}\nSource: ${absolute(s.id+'.html')}\n\n${s.detail}\n\n${(serviceGuides[s.id] || []).map(([heading,text])=>`#### ${heading}\n${text}`).join('\n\n')}\n\n${s.items.map(item=>'- '+item).join('\n')}\n\nBefore visiting: ${s.prepare}\n\n${s.faq.map(([q,a])=>`#### ${q}\n${a}`).join('\n\n')}`).join('\n')+'\n## Location and appointment questions\n'+Object.entries(pageFaqs).map(([file,faqs])=>`\nSource: ${absolute(file)}\n${faqs.map(([q,a])=>`\n### ${q}\n${a}\n`).join('')}`).join('\n'));
}
