const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const GOALS = {
  job: {label:'Find a job'},
  clients: {label:'Find clients'},
  hire: {label:'Hire people'},
  network: {label:'Build a network'}
};
const CATS = {
  'Data & AI':'data scientist OR machine learning OR AI engineer',
  'Software Engineering':'software engineer OR backend OR frontend developer',
  'Sales':'sales OR account executive OR business development',
  'Marketing':'marketing OR growth OR brand manager',
  'Product':'product manager OR product owner',
  'Design':'product designer OR UX designer',
  'Recruiting & HR':'recruiter OR talent acquisition OR HR',
  'Finance':'finance OR CFO OR financial analyst',
  'Legal':'lawyer OR general counsel OR legal counsel',
  'Healthcare':'healthcare OR clinic OR hospital administrator',
  'Real Estate':'real estate OR property manager OR realtor',
  'Consulting':'consultant OR strategy consultant',
  'E-commerce':'e-commerce OR online retail OR DTC',
  'Manufacturing':'manufacturing OR operations OR supply chain',
  'Education':'education OR school OR university admin',
  'Founders & Startups':'founder OR co-founder OR startup CEO'
};

// Free templates: 1. Pro templates: 4 more, unlocked by license.
const TEMPLATES_FREE = [
  {id:'standard', name:'Standard intro', pro:false,
   body: (cat, goal) => `Hi [First name], I noticed your work in ${cat.toLowerCase()} and wanted to connect. I'm currently looking to ${goal} and thought your perspective would be valuable — open to a short chat?`}
];
const TEMPLATES_PRO = [
  {id:'direct', name:'Direct pitch', pro:true,
   body: (cat, goal) => `Hi [First name] — I work with ${cat.toLowerCase()} teams on [specific result, e.g. "cutting onboarding time in half"]. Saw your role at [Company] and think there could be a fit. Worth 15 minutes this week?`},
  {id:'warm', name:'Warm intro (mutual interest)', pro:true,
   body: (cat, goal) => `Hi [First name], came across your profile while looking into ${cat.toLowerCase()} — really liked [something specific about their work/post/company]. Would love to connect and swap notes.`},
  {id:'followup', name:'Follow-up (no reply yet)', pro:true,
   body: () => `Hi [First name], following up in case my last note got buried. No worries if now isn't the right time — happy to reconnect down the line. [One new specific reason to talk now.]`},
  {id:'referral', name:'Referral ask', pro:true,
   body: (cat) => `Hi [First name], I'm exploring opportunities in ${cat.toLowerCase()} and admire the work at [Company]. If you know anyone worth talking to there, I'd really appreciate an intro — happy to share more context.`}
];
function allTemplates(){ return TEMPLATES_FREE.concat(TEMPLATES_PRO); }

let S = JSON.parse(localStorage.getItem('bearing.state')||'{}');
S.goal = S.goal || 'clients'; S.cat = S.cat || 'Data & AI'; S.cfg = S.cfg || {accent:'', theme:'auto'};
S.tpl = S.tpl || 'standard'; S.pro = !!S.pro; S.licenseKey = S.licenseKey || '';
let L = JSON.parse(localStorage.getItem('bearing.leads')||'[]');
function save(){ localStorage.setItem('bearing.state', JSON.stringify(S)); localStorage.setItem('bearing.leads', JSON.stringify(L)); }

function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),1800); }
async function copyText(t){ try{ await navigator.clipboard.writeText(t); return true; }catch(e){ try{ const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return true; }catch(e2){ return false; } } }

function buildGrids(){
  $('#goalGrid').innerHTML = Object.keys(GOALS).map(k=>`<button class="chip" data-goal="${k}" aria-pressed="${k===S.goal}">${GOALS[k].label}</button>`).join('');
  $('#catGrid').innerHTML = Object.keys(CATS).map(k=>`<button class="chip" data-cat="${esc(k)}" aria-pressed="${k===S.cat}">${esc(k)}</button>`).join('');
}
function query(){
  let base = CATS[S.cat] || S.cat;
  const role = $('#role').value.trim(), kw = $('#kw').value.trim();
  let q = role ? `(${base}) AND (${role})` : base;
  if(kw) q += ` AND ${kw}`;
  if(S.goal==='job') q += ' AND hiring';
  if(S.goal==='hire') q += ' AND "open to work"';
  return q;
}
function buildTplSelect(){
  const sel = $('#tplSelect');
  sel.innerHTML = allTemplates().map(t => `<option value="${t.id}"${t.pro && !S.pro ? ' disabled' : ''}${t.id===S.tpl?' selected':''}>${esc(t.name)}${t.pro ? (S.pro ? '' : ' (Pro)') : ''}</option>`).join('');
  if(!S.pro && (allTemplates().find(t=>t.id===S.tpl)||{}).pro){ S.tpl = 'standard'; sel.value = 'standard'; }
}
function render(){
  const q = query(), loc = $('#loc').value.trim();
  const enc = encodeURIComponent(q);
  const locParam = loc ? `&geoUrn=&location=${encodeURIComponent(loc)}` : '';
  const links = [
    ['People', `https://www.linkedin.com/search/results/people/?keywords=${enc}${locParam}&origin=GLOBAL_SEARCH_HEADER`],
    ['Jobs', `https://www.linkedin.com/jobs/search/?keywords=${enc}${loc?`&location=${encodeURIComponent(loc)}`:''}`],
    ['Companies', `https://www.linkedin.com/search/results/companies/?keywords=${enc}&origin=GLOBAL_SEARCH_HEADER`],
    ['Posts', `https://www.linkedin.com/search/results/content/?keywords=${enc}&origin=GLOBAL_SEARCH_HEADER`],
    ['Groups', `https://www.linkedin.com/search/results/groups/?keywords=${enc}&origin=GLOBAL_SEARCH_HEADER`]
  ];
  $('#linkOut').innerHTML = links.map(([label,url])=>`<div class="linkrow"><span>${label}</span><a href="${url}" target="_blank" rel="noopener noreferrer">Open →</a></div>`).join('');
  $('#queryOut').textContent = q + (loc?` — location: ${loc}`:'');
  buildTplSelect();
  const t = allTemplates().find(x=>x.id===S.tpl) || TEMPLATES_FREE[0];
  $('#msgOut').textContent = t.body(S.cat, GOALS[S.goal].label.toLowerCase());
  $('#tplBadge').innerHTML = S.pro ? '<span class="badge">Pro unlocked</span>' : '';
}
function switchTab(name){
  ['find','leads','settings'].forEach(n=>{ $('#tab-'+n).hidden = n!==name; $('#t-'+n).setAttribute('aria-selected', String(n===name)); });
  if(name==='leads') renderLeads();
  if(name==='settings') renderProCard();
}

// ---- leads ----
const SENIORITY_RULES = [
  [/\b(ceo|chief executive|founder|co-founder|owner)\b/i,'C-level'],
  [/\b(cto|cfo|coo|cmo|chief)\b/i,'C-level'],
  [/\b(vp|vice president)\b/i,'VP'],
  [/\bdirector|head of\b/i,'Director'],
  [/\bmanager|lead\b/i,'Manager'],
  [/\bsenior|sr\.?\b/i,'Senior'],
  [/\bjunior|jr\.?|intern|associate\b/i,'Junior']
];
function parseLine(line){
  line = line.trim(); if(!line) return null;
  let name='',title='',company='',loc='';
  const atMatch = line.match(/^(.*?)\bat\b(.*)$/i);
  if(atMatch && atMatch[1].trim() && atMatch[2].trim()){
    const pre = atMatch[1].trim().replace(/[-|,]\s*$/,'');
    const preParts = pre.split(/\s*[-|,]\s*/).filter(Boolean);
    name = (preParts[0]||'').trim(); title = (preParts[1]||preParts.slice(1).join(' - ')||'').trim();
    const postParts = atMatch[2].trim().split(/\s*,\s*/).filter(Boolean);
    company = (postParts[0]||'').trim(); loc = (postParts.slice(1).join(', ')||'').trim();
  } else {
    const p = line.split(/\s*[-|,]\s*/).filter(Boolean);
    name = (p[0]||'').trim(); title=(p[1]||'').trim(); company=(p[2]||'').trim(); loc=(p[3]||'').trim();
  }
  if(!name) return null;
  let seniority='Mid'; for(const [re,lab] of SENIORITY_RULES){ if(re.test(title)){ seniority=lab; break; } }
  return {id: Date.now()+'-'+Math.random().toString(36).slice(2,7), name, title, company, loc, seniority, status:'New', addedAt: new Date().toISOString()};
}
function doImport(text){
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  let added=0, dup=0;
  for(const line of lines){
    if(/^name\s*,/i.test(line)) continue;
    const l = parseLine(line); if(!l) continue;
    if(L.some(x=>x.name.toLowerCase()===l.name.toLowerCase() && x.company.toLowerCase()===l.company.toLowerCase())){ dup++; continue; }
    L.push(l); added++;
  }
  save();
  $('#importMsg').textContent = `${added} added${dup?`, ${dup} duplicates skipped`:''}.`;
  renderLeads();
}
function score(l){
  let s = 30;
  if(l.seniority==='C-level') s+=40; else if(l.seniority==='VP') s+=30; else if(l.seniority==='Director') s+=22; else if(l.seniority==='Manager') s+=12; else if(l.seniority==='Senior') s+=8;
  if(l.company) s+=10;
  if(l.loc) s+=5;
  return Math.min(100, s);
}
function renderLeads(){
  $('#leadCount').textContent = L.length;
  const q = ($('#searchLeads').value||'').toLowerCase();
  const rows = L.filter(l => !q || (l.name+l.title+l.company).toLowerCase().includes(q))
    .map(l=>({l,s:score(l)})).sort((a,b)=>b.s-a.s);
  if(!rows.length){ $('#leadTableWrap').innerHTML = '<div class="empty">No leads yet. Paste some above or load sample data.</div>'; return; }
  $('#leadTableWrap').innerHTML = `<table><thead><tr><th>Score</th><th>Name</th><th>Title</th><th>Company</th><th>Level</th><th>Status</th><th></th></tr></thead><tbody>` +
    rows.map(({l,s})=>`<tr><td><span class="score ${s>=70?'hot':s>=45?'warm':''}">${s}</span></td><td>${esc(l.name)}</td><td>${esc(l.title)}</td><td>${esc(l.company)}</td><td>${esc(l.seniority)}</td>` +
      `<td><select data-id="${l.id}" class="statusSel">${['New','Contacted','Replied','Meeting','Won','Lost'].map(o=>`<option${o===l.status?' selected':''}>${o}</option>`).join('')}</select></td>` +
      `<td><button class="btn small danger" data-del="${l.id}">✕</button></td></tr>`).join('') + '</tbody></table>';
  $$('.statusSel').forEach(sel=>sel.addEventListener('change', e=>{ const l=L.find(x=>x.id===e.target.dataset.id); if(l){ l.status=e.target.value; l.statusChangedAt=new Date().toISOString(); save(); } }));
  $$('[data-del]').forEach(b=>b.addEventListener('click', e=>{ L = L.filter(x=>x.id!==e.target.dataset.del); save(); renderLeads(); }));
}
function toCsv(detailed){
  const head = detailed
    ? ['Name','Title','Company','Location','Seniority','Score','Status','Added at','Status changed at']
    : ['Name','Title','Company','Location','Seniority','Score','Status'];
  const rows = L.map(l => detailed
    ? [l.name,l.title,l.company,l.loc,l.seniority,score(l),l.status,l.addedAt||'',l.statusChangedAt||'']
    : [l.name,l.title,l.company,l.loc,l.seniority,score(l),l.status]);
  const esc2 = v => `"${String(v??'').replace(/"/g,'""')}"`;
  return [head.map(esc2).join(','), ...rows.map(r=>r.map(esc2).join(','))].join('\r\n');
}
function download(name, text, mime){
  const url = URL.createObjectURL(new Blob([text],{type:mime+';charset=utf-8'}));
  const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}

// ---- settings / appearance ----
function applyCfg(){
  const root = document.documentElement;
  if(S.cfg.theme==='light'||S.cfg.theme==='dark') root.setAttribute('data-theme',S.cfg.theme); else root.removeAttribute('data-theme');
  if(/^#[0-9a-f]{6}$/i.test(S.cfg.accent||'')) root.style.setProperty('--accent', S.cfg.accent); else root.style.removeProperty('--accent');
}

// ---- Pro / license gating ----
function renderProCard(){
  $('#proStatusText').textContent = S.pro
    ? 'Pro is active on this browser. Thanks for buying — extra templates and detailed CSV export are unlocked.'
    : 'Unlocks 4 extra message templates and a detailed CSV export (adds seniority, score, and status timestamps).';
  $('#proBuyRow').hidden = S.pro;
  $('#licenseKey').value = S.licenseKey || '';
  $('#proHint').textContent = S.pro ? '' : 'License verification calls a Netlify Function (/.netlify/functions/verify-license) so no API key is ever exposed in the browser. This only works once deployed on Netlify with the function file in place — see docs/MONETIZATION.md.';
  $('#btnActivate').textContent = S.pro ? 'Deactivate' : 'Activate';
}
async function activateLicense(){
  if(S.pro){ S.pro=false; S.licenseKey=''; save(); renderProCard(); render(); renderLeads(); toast('Pro deactivated on this browser'); return; }
  const key = $('#licenseKey').value.trim();
  if(!key){ toast('Enter a license key first'); return; }
  const btn = $('#btnActivate'); btn.disabled = true; btn.textContent = 'Checking…';
  try{
    const resp = await fetch('/.netlify/functions/verify-license', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({licenseKey:key})
    });
    const data = await resp.json();
    if(data.valid){
      S.pro = true; S.licenseKey = key; save();
      toast('Pro activated');
    } else {
      toast(data.error ? `Could not verify: ${data.error}` : 'That license key is not valid');
    }
  } catch(e){
    toast('Could not reach the license service. This feature needs a Netlify deploy with the function enabled.');
  }
  btn.disabled = false;
  renderProCard(); render(); renderLeads();
}

// ---- events ----
document.addEventListener('click', e=>{
  const g = e.target.closest('[data-goal]'); if(g){ S.goal=g.dataset.goal; save(); buildGrids(); render(); return; }
  const c = e.target.closest('[data-cat]'); if(c){ S.cat=c.dataset.cat; save(); buildGrids(); render(); return; }
  const t = e.target.closest('.tab'); if(t){ switchTab(t.dataset.tab); return; }
});
['role','loc','kw'].forEach(id=> $('#'+id).addEventListener('input', render));
$('#tplSelect').addEventListener('change', e=>{ S.tpl = e.target.value; save(); render(); });
$('#copyQuery').addEventListener('click', async()=> toast(await copyText($('#queryOut').textContent) ? 'Copied' : 'Could not copy'));
$('#copyMsg').addEventListener('click', async()=> toast(await copyText($('#msgOut').textContent) ? 'Copied' : 'Could not copy'));
$('#btnImport').addEventListener('click', ()=> doImport($('#importText').value));
$('#btnSample').addEventListener('click', ()=> doImport(['Ayesha Khan - CEO at BrightLoop, Karachi','Daniel Ortiz | VP of Sales | Northwind Freight | Austin','Priya Nair - Head of Data at Lumen Health, Bengaluru','Tom Becker - Senior Software Engineer at Stackly, Berlin','Sara Lindqvist - Talent Acquisition Manager at Fjord Retail, Stockholm'].join('\n')));
$('#searchLeads').addEventListener('input', renderLeads);
$('#btnExport').addEventListener('click', ()=>{ if(!L.length){ toast('No leads to export'); return; } download('bearing-leads.csv', toCsv(false), 'text/csv'); toast('CSV downloaded'); });
$('#btnExportPro').addEventListener('click', ()=>{
  if(!S.pro){ toast('Detailed export is a Pro feature — see Settings'); return; }
  if(!L.length){ toast('No leads to export'); return; }
  download('bearing-leads-detailed.csv', toCsv(true), 'text/csv'); toast('Detailed CSV downloaded');
});
$('#btnClear').addEventListener('click', ()=>{ if(confirm('Delete all leads?')){ L=[]; save(); renderLeads(); } });
$('#cfgAccent').addEventListener('input', e=>{ S.cfg.accent=e.target.value; save(); applyCfg(); });
$('#cfgTheme').addEventListener('change', e=>{ S.cfg.theme=e.target.value; save(); applyCfg(); });
$('#btnBackup').addEventListener('click', ()=>{ download('bearing-backup.json', JSON.stringify({S,L}), 'application/json'); toast('Backup downloaded'); });
$('#restoreFile').addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return;
  const rd = new FileReader();
  rd.onload = ()=>{ try{ const d = JSON.parse(rd.result); if(!confirm('Replace current data with this backup?')) return; S=d.S||S; L=d.L||L; save(); buildGrids(); render(); renderLeads(); applyCfg(); renderProCard(); toast('Restored'); }catch(err){ toast('Invalid backup file'); } };
  rd.readAsText(f);
});
$('#btnReset').addEventListener('click', ()=>{ if(confirm('Erase everything stored in this browser?')){ localStorage.removeItem('bearing.state'); localStorage.removeItem('bearing.leads'); location.reload(); } });
$('#btnActivate').addEventListener('click', activateLicense);

// init
$('#cfgAccent').value = /^#[0-9a-f]{6}$/i.test(S.cfg.accent||'') ? S.cfg.accent : '#0d6b70';
$('#cfgTheme').value = S.cfg.theme;
applyCfg(); buildGrids(); render(); renderLeads(); renderProCard();
