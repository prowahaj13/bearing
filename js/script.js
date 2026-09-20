const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));

const GOALS = {
  job: {label:'Find a job', people:'&keywords=', extra:'hiring'},
  clients: {label:'Find clients', people:'&keywords=', extra:''},
  hire: {label:'Hire people', people:'&keywords=', extra:'open to work'},
  network: {label:'Build a network', people:'&keywords=', extra:''}
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

let S = JSON.parse(localStorage.getItem('bearing.state')||'{}');
S.goal = S.goal || 'clients'; S.cat = S.cat || 'Data & AI'; S.cfg = S.cfg || {accent:'', theme:'auto'};
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
  const goalLabel = GOALS[S.goal].label.toLowerCase();
  $('#msgOut').textContent = `Hi [First name], I noticed your work in ${S.cat.toLowerCase()} and wanted to connect. I'm currently looking to ${goalLabel==='find a job'?'move into a role like yours':goalLabel} and thought your perspective would be valuable — open to a short chat?`;
}
function switchTab(name){
  ['find','leads','settings'].forEach(n=>{ $('#tab-'+n).hidden = n!==name; $('#t-'+n).setAttribute('aria-selected', String(n===name)); });
  if(name==='leads') renderLeads();
}

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
  let parts = line.split(/\s*[-|,]\s*at\s+/i);
  if(parts.length>=2){
    let head = parts[0], rest = parts.slice(1).join(' at ');
    let hp = head.split(/\s*[-|]\s*/);
    name = hp[0].trim(); title = hp.slice(1).join(' - ').trim();
    let rp = rest.split(',');
    company = rp[0].trim(); loc = rp.slice(1).join(',').trim();
  } else {
    let p = line.split(/\s*[-|]\s*/);
    name = (p[0]||'').trim(); title=(p[1]||'').trim(); company=(p[2]||'').trim(); loc=(p[3]||'').trim();
  }
  if(!name) return null;
  let seniority='Mid'; for(const [re,lab] of SENIORITY_RULES){ if(re.test(title)){ seniority=lab; break; } }
  return {id: Date.now()+'-'+Math.random().toString(36).slice(2,7), name, title, company, loc, seniority, status:'New'};
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
  $$('.statusSel').forEach(sel=>sel.addEventListener('change', e=>{ const l=L.find(x=>x.id===e.target.dataset.id); if(l){ l.status=e.target.value; save(); } }));
  $$('[data-del]').forEach(b=>b.addEventListener('click', e=>{ L = L.filter(x=>x.id!==e.target.dataset.del); save(); renderLeads(); }));
}
function toCsv(){
  const head = ['Name','Title','Company','Location','Seniority','Score','Status'];
  const rows = L.map(l=>[l.name,l.title,l.company,l.loc,l.seniority,score(l),l.status]);
  const esc2 = v => `"${String(v??'').replace(/"/g,'""')}"`;
  return [head.map(esc2).join(','), ...rows.map(r=>r.map(esc2).join(','))].join('\r\n');
}
function download(name, text, mime){
  const url = URL.createObjectURL(new Blob([text],{type:mime+';charset=utf-8'}));
  const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}

function applyCfg(){
  const root = document.documentElement;
  if(S.cfg.theme==='light'||S.cfg.theme==='dark') root.setAttribute('data-theme',S.cfg.theme); else root.removeAttribute('data-theme');
  if(/^#[0-9a-f]{6}$/i.test(S.cfg.accent||'')) root.style.setProperty('--accent', S.cfg.accent); else root.style.removeProperty('--accent');
}

document.addEventListener('click', e=>{
  const g = e.target.closest('[data-goal]'); if(g){ S.goal=g.dataset.goal; save(); buildGrids(); render(); return; }
  const c = e.target.closest('[data-cat]'); if(c){ S.cat=c.dataset.cat; save(); buildGrids(); render(); return; }
  const t = e.target.closest('.tab'); if(t){ switchTab(t.dataset.tab); return; }
});
['role','loc','kw'].forEach(id=> $('#'+id).addEventListener('input', render));
$('#copyQuery').addEventListener('click', async()=> toast(await copyText($('#queryOut').textContent) ? 'Copied' : 'Could not copy'));
$('#copyMsg').addEventListener('click', async()=> toast(await copyText($('#msgOut').textContent) ? 'Copied' : 'Could not copy'));
$('#btnImport').addEventListener('click', ()=> doImport($('#importText').value));
$('#btnSample').addEventListener('click', ()=> doImport(['Ayesha Khan - CEO at BrightLoop, Karachi','Daniel Ortiz - VP of Sales at Northwind Freight, Austin','Priya Nair - Head of Data at Lumen Health, Bengaluru','Tom Becker - Senior Software Engineer at Stackly, Berlin','Sara Lindqvist - Talent Acquisition Manager at Fjord Retail, Stockholm'].join('\n')));
$('#searchLeads').addEventListener('input', renderLeads);
$('#btnExport').addEventListener('click', ()=>{ if(!L.length){ toast('No leads to export'); return; } download('bearing-leads.csv', toCsv(), 'text/csv'); toast('CSV downloaded'); });
$('#btnClear').addEventListener('click', ()=>{ if(confirm('Delete all leads?')){ L=[]; save(); renderLeads(); } });
$('#cfgAccent').addEventListener('input', e=>{ S.cfg.accent=e.target.value; save(); applyCfg(); });
$('#cfgTheme').addEventListener('change', e=>{ S.cfg.theme=e.target.value; save(); applyCfg(); });
$('#btnBackup').addEventListener('click', ()=>{ download('bearing-backup.json', JSON.stringify({S,L}), 'application/json'); toast('Backup downloaded'); });
$('#restoreFile').addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return;
  const rd = new FileReader();
  rd.onload = ()=>{ try{ const d = JSON.parse(rd.result); if(!confirm('Replace current data with this backup?')) return; S=d.S||S; L=d.L||L; save(); buildGrids(); render(); renderLeads(); applyCfg(); toast('Restored'); }catch(err){ toast('Invalid backup file'); } };
  rd.readAsText(f);
});
$('#btnReset').addEventListener('click', ()=>{ if(confirm('Erase everything stored in this browser?')){ localStorage.removeItem('bearing.state'); localStorage.removeItem('bearing.leads'); location.reload(); } });

$('#cfgAccent').value = /^#[0-9a-f]{6}$/i.test(S.cfg.accent||'') ? S.cfg.accent : '#0d6b70';
$('#cfgTheme').value = S.cfg.theme;
applyCfg(); buildGrids(); render(); renderLeads();
