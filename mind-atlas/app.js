const DB_KEY = "mind-atlas-v1";
const COMPONENTS = [
  {id:"core",name:"Core memory & search",symbol:"▤",desc:"Local thread storage, indexing, retrieval and exportable memory records.",version:"Built-in",size:"~0 KB extra",required:true},
  {id:"language",name:"Language analyzer",symbol:"Aa",desc:"Extract recurring terms, phrases and lightweight language patterns.",version:"Compromise · package",size:"Bundle varies",required:true,package:"compromise"},
  {id:"pdf",name:"PDF reader",symbol:"▧",desc:"Read PDFs and extract searchable document text where supported.",version:"PDF.js · package",size:"Bundle varies",required:false,package:"pdfjs-dist"},
  {id:"ocr",name:"Image text scanner",symbol:"▦",desc:"OCR for photographs, scans and screenshots. Processing may be slow on phones.",version:"Tesseract.js · package",size:"Model downloaded separately",required:false,package:"tesseract.js"},
  {id:"semantic",name:"Semantic engine",symbol:"✳",desc:"Model-based similarity, concept matching and meaning-based retrieval.",version:"Transformers.js · package",size:"Model weights downloaded separately",required:false,package:"@huggingface/transformers"},
  {id:"graph",name:"Knowledge graph",symbol:"⌘",desc:"Represent ideas as nodes and relationships as edges; analyze connected concepts.",version:"Graphology · package",size:"Bundle varies",required:false,package:"graphology"},
  {id:"diagnostics",name:"Hardware diagnostics",symbol:"◉",desc:"Check browser capabilities and local storage availability without fake device claims.",version:"Built-in",size:"~0 KB extra",required:true},
  {id:"backup",name:"Backup & recovery",symbol:"↗",desc:"Export your workspace as JSON and restore it later.",version:"Built-in",size:"~0 KB extra",required:true},
  {id:"privacy",name:"Privacy controls",symbol:"◇",desc:"Choose whether to record editor activity and manage your local data.",version:"Built-in",size:"~0 KB extra",required:true}
];
let state = loadState();
let currentView = "home";
let editingId = null;
let toastTimer;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function loadState(){
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || "{}");
    return {notes:Array.isArray(parsed.notes)?parsed.notes:[], installed:parsed.installed||{core:true,language:true,diagnostics:true,backup:true,privacy:true}, settings:{typingAnalysis:false,autoInsights:true,...parsed.settings}};
  } catch { return {notes:[],installed:{core:true,language:true,diagnostics:true,backup:true,privacy:true},settings:{typingAnalysis:false,autoInsights:true}}; }
}
function saveState(){localStorage.setItem(DB_KEY,JSON.stringify(state));}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400);}
function fmtDate(v){return new Date(v).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function fmtShort(v){return new Date(v).toLocaleDateString(undefined,{month:"short",day:"numeric"});}
function wordCount(){return state.notes.reduce((n,x)=>n+(x.body.trim()?x.body.trim().split(/\s+/).length:0),0);}
function uniqueSubjects(){return [...new Set(state.notes.map(n=>n.subject.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));}
function updateNav(){document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));}
function go(view){currentView=view;updateNav();render();window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
function header(title,desc,action=""){return `<div class="page-title"><span class="eyebrow">MIND ATLAS / ${esc(title.toUpperCase())}</span><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>`;}
function stat(label,value,note,symbol){return `<div class="stat-card"><span class="stat-icon">${symbol}</span><div class="stat-label">${esc(label)}</div><div class="stat-value">${value}</div><div class="stat-note">${esc(note)}</div></div>`;}
function empty(title,desc,btn="Create your first thought"){return `<div class="empty-state"><div class="big-icon">✳</div><h2>${esc(title)}</h2><p>${esc(desc)}</p><button class="primary-btn" data-action="new-note">${esc(btn)} <span>↗</span></button></div>`;}
function renderHome(){
 const notes=[...state.notes].sort((a,b)=>b.updatedAt-a.updatedAt);
 const subjects=uniqueSubjects();
 const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return {key:d.toDateString(),label:d.toLocaleDateString(undefined,{weekday:"short"}),count:notes.filter(n=>new Date(n.updatedAt).toDateString()===d.toDateString()).length};});
 const max=Math.max(1,...days.map(d=>d.count));
 const pts=days.map((d,i)=>`${20+i*80},${160-(d.count/max)*120}`).join(" ");
 const chart=notes.length?`<div class="chart-wrap"><svg viewBox="0 0 500 180" role="img" aria-label="Notes updated over the last seven days"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#d99a49" stop-opacity=".25"/><stop offset="100%" stop-color="#d99a49" stop-opacity="0"/></linearGradient></defs><path d="M ${pts} L 500 180 L 20 180 Z" fill="url(#fill)"/><polyline points="${pts}" fill="none" stroke="#e3a653" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${days.map((d,i)=>`<circle cx="${20+i*80}" cy="${160-(d.count/max)*120}" r="4" fill="#f0bd75" stroke="#12110f" stroke-width="2"/>`).join("")}</svg><div class="chart-labels">${days.map(d=>`<span>${d.label}</span>`).join("")}</div></div>`:`<div class="empty-graph"><div><strong>Your activity starts here</strong>Write a thought to begin your real progress timeline.<br>No sample data, no pretend progress.</div></div>`;
 return `<div class="hero-row"><div><span class="eyebrow">YOUR SPACE / OVERVIEW</span><h1>Make sense of your mind.</h1><p class="lead">A growing map of what you think, learn, and create. Start with a thought. The connections come with time.</p></div><button class="primary-btn" data-action="new-note">＋ Capture a thought</button></div>
 <div class="stat-grid">${stat("Thoughts",state.notes.length,"Saved in this workspace","✳")}${stat("Words recorded",wordCount().toLocaleString(),"Across your notes","≋")}${stat("Subjects",subjects.length,"Your evolving taxonomy","⌘")}${stat("Components ready",Object.values(state.installed).filter(Boolean).length,"Local setup status","◈")}</div>
 <div class="dashboard-grid"><div><section class="panel"><div class="panel-head"><div><h2>Activity timeline</h2><p>Notes updated in the last seven days</p></div><span class="pill">LIVE DATA</span></div>${chart}</section><section class="panel"><div class="panel-head"><div><h2>Explore your subjects</h2><p>Subjects are created from your notes</p></div><button class="text-link" data-view="library">Open library ↗</button></div>${subjects.length?`<div class="subject-grid">${subjects.slice(0,6).map(s=>{const ns=state.notes.filter(n=>n.subject===s);return `<div class="subject-card"><div class="subject-symbol">◈</div><strong>${esc(s)}</strong><p>${ns.length} thought${ns.length===1?"":"s"} · ${ns.reduce((a,n)=>a+n.body.trim().split(/\s+/).filter(Boolean).length,0)} words</p><div class="meter"><span style="width:${Math.min(100,ns.length*18)}%"></span></div><div class="meter-label"><span>Recorded activity</span><span>${ns.length}</span></div></div>`}).join("")}</div>`:empty("Your subjects will grow here","Add a subject when you save a thought. Mind Atlas will group your notes without locking you into a rigid taxonomy.","Write a thought")}</section></div>
 <div><section class="panel"><div class="panel-head"><div><h2>Recent thoughts</h2><p>Your latest additions and edits</p></div><button class="text-link" data-view="library">View all ↗</button></div>${notes.length?`<div class="activity-list">${notes.slice(0,5).map(n=>`<div class="activity-item"><i class="activity-dot"></i><div><strong>${esc(n.title)}</strong><small>${esc(n.subject||"Unsorted")} · ${fmtShort(n.updatedAt)}</small></div></div>`).join("")}</div>`:`<div class="empty-graph"><div><strong>A clean slate</strong>Your first thought will appear here.</div></div>`}</section>
 <section class="panel"><div class="panel-head"><div><h2>System status</h2><p>What is actually available</p></div><span class="status ready"><i></i> LOCAL</span></div><div class="activity-list"><div class="activity-item"><i class="activity-dot"></i><div><strong>Browser storage</strong><small>Notes saved to this browser</small></div></div><div class="activity-item"><i class="activity-dot"></i><div><strong>Semantic model</strong><small>${state.installed.semantic?"Marked enabled · model availability still needs verification":"Not enabled"} </small></div></div><div class="activity-item"><i class="activity-dot"></i><div><strong>Privacy</strong><small>${state.settings.typingAnalysis?"Editor activity analysis enabled":"Editor activity analysis off"}</small></div></div></div><button class="secondary-btn" style="width:100%;margin-top:14px" data-view="installer">Manage components ↗</button></section></div></div>`;
}
function renderLibrary(){
 const q=(window.libraryQuery||"").toLowerCase();
 const filtered=[...state.notes].filter(n=>(n.title+" "+n.body+" "+n.subject).toLowerCase().includes(q)).sort((a,b)=>b.updatedAt-a.updatedAt);
 return `${header("Library","A searchable archive of your thoughts. Your notes remain editable and exportable.")}<div class="toolbar"><input class="searchbox" id="librarySearch" placeholder="Search titles, notes and subjects…" value="${esc(window.libraryQuery||"")}"><button class="secondary-btn" data-action="new-note">＋ New thought</button><button class="secondary-btn" data-action="import">Import</button></div>${filtered.length?`<div class="notes-list">${filtered.map(n=>`<article class="note-card"><div style="min-width:0;flex:1"><h3>${esc(n.title)}</h3><p>${esc(n.body.length>280?n.body.slice(0,280)+"…":n.body)}</p><div class="note-meta"><span class="pill">${esc(n.subject||"Unsorted")}</span><span>Updated ${fmtDate(n.updatedAt)}</span><span>${n.body.trim().split(/\s+/).filter(Boolean).length} words</span></div></div><div class="note-actions"><button class="small-icon" title="Edit" data-action="edit-note" data-id="${n.id}">↗</button><button class="small-icon" title="Delete" data-action="delete-note" data-id="${n.id}">×</button></div></article>`).join("")}</div>`:state.notes.length?empty("No matching thoughts","Try a different search."):empty("Your library is waiting","Capture a thought, paste an idea, or import a Mind Atlas JSON backup.")}`;
}
function renderGraph(){
 const notes=state.notes; const subs=uniqueSubjects();
 if(!notes.length)return `${header("Knowledge graph","See how your subjects and thoughts connect. Connections will be based on actual note content.")}${empty("Nothing connected yet","Add a few notes with subjects. The first version shows a transparent, simple subject map rather than inventing relationships.")}`;
 const nodes=[];
 subs.slice(0,7).forEach((s,i)=>nodes.push({id:"s"+i,label:s,x:300+Math.cos(i*2*Math.PI/Math.max(subs.length,1))*155,y:170+Math.sin(i*2*Math.PI/Math.max(subs.length,1))*105,subject:s}));
 const center={id:"root",label:"Your ideas",x:300,y:170};nodes.push(center);
 const links=nodes.filter(n=>n.id!=="root").map(n=>`<line x1="${center.x}" y1="${center.y}" x2="${n.x}" y2="${n.y}" stroke="#76522a" stroke-opacity=".65" stroke-width="1.4"/>`).join("");
 const svg=`<svg viewBox="0 0 600 340" role="img" aria-label="Subject map based on your notes">${links}${nodes.map(n=>`<g class="graph-node" data-subject="${esc(n.subject||"")}" tabindex="0" role="button" aria-label="Open ${esc(n.label)}"><circle cx="${n.x}" cy="${n.y}" r="${n.id==="root"?32:25}"/><text x="${n.x}" y="${n.y+4}">${esc(n.label.length>14?n.label.slice(0,12)+"…":n.label)}</text></g>`).join("")}</svg>`;
 return `${header("Knowledge graph","A first map of your subjects. Future versions can add semantic edges after a model is installed and tested.")}<div class="panel"><div class="panel-head"><div><h2>Your subject network</h2><p>${subs.length} subjects · ${notes.length} thoughts · ${Math.max(0,subs.length)} basic links</p></div><span class="pill amber">FROM YOUR DATA</span></div><div class="graph-stage">${svg}</div><div class="graph-legend"><span><i></i> Subject</span><span><i style="background:#e9e2d4"></i> Your workspace</span><span>Tap a subject to search its notes</span></div></div><div class="notice"><strong>Honest by design.</strong> These are basic subject relationships, not AI-discovered semantic connections. Semantic links should only appear after the model produces a score and the app can show the notes that support the link.</div>`;
}
function renderProgress(){
 const subs=uniqueSubjects();
 const rows=subs.map(s=>({s,n:state.notes.filter(n=>n.subject===s).length,words:state.notes.filter(n=>n.subject===s).reduce((a,n)=>a+n.body.trim().split(/\s+/).filter(Boolean).length,0)}));
 return `${header("Progress","Track the evidence of your learning over time. This early version measures recorded activity, not mastery.")}<div class="stat-grid">${stat("Notes created",state.notes.length,"Recorded thoughts","✳")}${stat("Words written",wordCount().toLocaleString(),"Across your workspace","≋")}${stat("Subjects explored",subs.length,"Unique subject labels","⌘")}${stat("Last 30 days",state.notes.filter(n=>Date.now()-n.createdAt<30*86400000).length,"Notes first created","◷")}</div><section class="panel"><div class="panel-head"><div><h2>Subject activity</h2><p>Based on saved notes, not inferred mastery</p></div><span class="pill">EVIDENCE</span></div>${rows.length?`<div class="progress-bars">${rows.map(r=>`<div class="progress-row"><div class="row-head"><span>${esc(r.s)}</span><span>${r.n} notes · ${r.words} words</span></div><div class="meter"><span style="width:${Math.max(3,Math.min(100,r.n/Math.max(...rows.map(x=>x.n))*100))}%"></span></div></div>`).join("")}</div>`:empty("Your progress starts with a note","As you write, the app will track activity by subject.")}</section><section class="panel"><div class="panel-head"><div><h2>Next level of measurement</h2><p>Evidence needed before claiming real learning progress</p></div></div><div class="diagnostic-grid"><div class="diagnostic"><strong>Coverage</strong><span>Subtopics explored and mapped to a subject.</span></div><div class="diagnostic"><strong>Retention</strong><span>Recall checks at later dates, not just rereading.</span></div><div class="diagnostic"><strong>Application</strong><span>Exercises, projects, or decisions showing use.</span></div></div></section>`;
}
function renderInstaller(){
 const installed=COMPONENTS.filter(c=>state.installed[c.id]).length;
 return `${header("Components","Manage the building blocks of your personal knowledge system. Status is tracked locally; packages are not falsely marked installed just because a button was pressed.")}<div class="installer-intro"><div><span class="eyebrow">FIRST SETUP / COMPONENT MANAGER</span><h2 style="font-size:22px;margin-top:9px">Your mind, carefully indexed.</h2><p>Core workspace functions work now. Optional libraries are listed with their intended packages. A production installer must fetch, verify, and load real package assets before reporting them as installed.</p></div><div><span class="pill amber">${installed} / ${COMPONENTS.length} enabled</span></div></div><div class="module-grid">${COMPONENTS.map(c=>{const on=!!state.installed[c.id];return `<article class="module-card ${on?"installed":""}"><div class="module-top"><div class="module-symbol">${c.symbol}</div><span class="status ${on?"ready":c.required?"":"optional"}"><i></i>${on?"ENABLED":c.required?"REQUIRED":"OPTIONAL"}</span></div><h3>${c.name}</h3><p>${c.desc}</p><div class="module-meta"><span>${esc(c.version)}</span><span>${esc(c.size)}</span></div><div class="module-foot"><span class="status ${on?"ready":""}"><i></i>${on?"Available in this prototype":"Not loaded"}</span>${c.required?`<button class="secondary-btn" disabled>Core</button>`:`<button class="${on?"secondary-btn":"primary-btn"}" data-action="toggle-component" data-id="${c.id}">${on?"Disable":"Enable"}</button>`}</div><div class="module-progress"><span style="width:${on?"100":"0"}%"></span></div></article>`}).join("")}</div><div class="notice"><strong>Important:</strong> “Enable” in this prototype changes the local component preference only. It does not download or install a JavaScript package or AI model. Real package installation needs a build pipeline and integrity checks. Model weights are separate downloads and may be large on mobile.</div><section class="panel" style="margin-top:17px"><div class="panel-head"><div><h2>Browser diagnostics</h2><p>Real checks from this browser session</p></div><button class="secondary-btn" data-action="diagnostics">Run checks ↗</button></div><div id="diagnostics" class="diagnostic-grid">${diagnosticMarkup()}</div></section>`;
}
function diagnosticMarkup(){
 let storage="Available";try{const k="__ma_test";localStorage.setItem(k,"1");localStorage.removeItem(k);}catch{storage="Blocked";}
 const data=[["Local storage",storage],["IndexedDB",("indexedDB" in window)?"Supported":"Unavailable"],["Service workers",("serviceWorker" in navigator)?"Supported":"Unavailable"],["Online status",navigator.onLine?"Online":"Offline"],["WebGPU",("gpu" in navigator)?"API present":"Not detected"],["Device memory",navigator.deviceMemory?`${navigator.deviceMemory} GB reported`:"Not exposed by browser"]];
 return data.map(([a,b])=>`<div class="diagnostic"><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join("");
}
function renderSettings(){
 return `${header("Settings","Control how Mind Atlas stores information and what activity it records.")}<section class="panel"><div class="panel-head"><div><h2>Privacy & analysis</h2><p>Optional analysis should be clear and reversible</p></div><span class="pill">YOUR CONTROL</span></div><div class="settings-list"><div class="setting-row"><div><strong>Editor activity analysis</strong><p>Record basic writing-session timing in this app. Does not monitor other apps.</p></div><input class="toggle" type="checkbox" id="typingToggle" ${state.settings.typingAnalysis?"checked":""} aria-label="Enable editor activity analysis"></div><div class="setting-row"><div><strong>Automatic local insights</strong><p>Allow the app to derive lightweight summaries from saved notes.</p></div><input class="toggle" type="checkbox" id="insightsToggle" ${state.settings.autoInsights?"checked":""} aria-label="Enable automatic local insights"></div></div></section><section class="panel"><div class="panel-head"><div><h2>Your data</h2><p>Export a backup or clear this browser workspace</p></div></div><div class="toolbar"><button class="primary-btn" data-action="export">Export workspace JSON ↗</button><button class="secondary-btn" data-action="import">Import backup</button><button class="secondary-btn" data-action="clear-data">Clear workspace</button></div><div class="notice">Browser storage is not a substitute for a backup. Clearing website data in your browser may also remove this workspace.</div></section><section class="panel"><div class="panel-head"><div><h2>About this build</h2><p>Mind Atlas first variant · local-first prototype</p></div><span class="pill amber">V1.0</span></div><p style="font-size:12px;color:var(--muted);line-height:1.7;margin:0">This version includes working note creation, editing, deletion, search, local persistence, JSON export/import, a basic subject map, activity summaries, component preferences, and browser capability checks. Advanced model inference and real module downloads still require integration and verification.</p></section>`;
}
function render(){
 const map={home:renderHome,library:renderLibrary,graph:renderGraph,progress:renderProgress,installer:renderInstaller,settings:renderSettings};
 $("#content").innerHTML=(map[currentView]||renderHome)();
 $("#breadcrumb").innerHTML=`YOUR SPACE <span>/</span> ${currentView.toUpperCase()}`;
 updateNav();
}
function openNote(id=null){
 editingId=id;const note=state.notes.find(n=>n.id===id);
 $("#dialogTitle").textContent=note?"Edit thought":"New thought";
 $("#noteTitle").value=note?.title||"";$("#noteSubject").value=note?.subject||"";$("#noteBody").value=note?.body||"";
 $("#noteDialog").showModal();setTimeout(()=>$("#noteTitle").focus(),80);
}
function saveNote(){
 const title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim(),subject=$("#noteSubject").value.trim();
 if(!title||!body){toast("Add a title and some text first.");return;}
 const now=Date.now();
 if(editingId){const n=state.notes.find(n=>n.id===editingId);if(n)Object.assign(n,{title,body,subject,updatedAt:now,revision:(n.revision||0)+1});}
 else state.notes.push({id:crypto.randomUUID?crypto.randomUUID():String(now)+Math.random(),title,body,subject,createdAt:now,updatedAt:now,revision:1});
 saveState();$("#noteDialog").close();render();toast(editingId?"Thought updated":"Thought saved locally");editingId=null;
}
function exportData(){
 const blob=new Blob([JSON.stringify({format:"mind-atlas-backup",version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`mind-atlas-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Backup exported");
}
function importData(){ $("#importFile").click(); }
function handleImport(file){
 const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!Array.isArray(data.notes))throw new Error("This file does not contain a Mind Atlas notes list.");if(!confirm(`Import ${data.notes.length} notes? This replaces the current workspace.`))return;state={notes:data.notes,installed:{...state.installed,...(data.installed||{})},settings:{...state.settings,...(data.settings||{})}};saveState();render();toast("Workspace restored");}catch(e){toast("Import failed: "+e.message);}};reader.readAsText(file);
}
document.addEventListener("click",e=>{
 const view=e.target.closest("[data-view]");if(view){go(view.dataset.view);return;}
 const b=e.target.closest("[data-action]");if(!b)return;
 const action=b.dataset.action,id=b.dataset.id;
 if(action==="new-note")openNote();
 if(action==="edit-note")openNote(id);
 if(action==="delete-note"){const n=state.notes.find(n=>n.id===id);if(n&&confirm(`Delete “${n.title}”? This cannot be undone unless you have a backup.`)){state.notes=state.notes.filter(n=>n.id!==id);saveState();render();toast("Thought deleted");}}
 if(action==="export")exportData();
 if(action==="import")importData();
 if(action==="clear-data"&&confirm("Permanently clear all notes and preferences stored by this app in this browser? Export a backup first if needed.")){state={notes:[],installed:{core:true,language:true,diagnostics:true,backup:true,privacy:true},settings:{typingAnalysis:false,autoInsights:true}};saveState();render();toast("Workspace cleared");}
 if(action==="toggle-component"){state.installed[id]=!state.installed[id];saveState();render();toast("Preference updated. No package was downloaded.");}
 if(action==="diagnostics"){$("#diagnostics").innerHTML=diagnosticMarkup();toast("Browser checks refreshed");}
});
$("#newNote").addEventListener("click",()=>openNote());
$("#noteForm").addEventListener("submit",e=>{e.preventDefault();saveNote();});
$("#closeDialog").addEventListener("click",()=>$("#noteDialog").close());
$("#exportBtn").addEventListener("click",exportData);
$("#importFile").addEventListener("change",e=>{if(e.target.files[0])handleImport(e.target.files[0]);e.target.value="";});
$("#content").addEventListener("input",e=>{if(e.target.id==="librarySearch"){const p=e.target.selectionStart;window.libraryQuery=e.target.value;render();const n=$("#librarySearch");n.focus();n.setSelectionRange(p,p);}});
$("#content").addEventListener("change",e=>{if(e.target.id==="typingToggle"){state.settings.typingAnalysis=e.target.checked;saveState();toast("Privacy preference saved");}if(e.target.id==="insightsToggle"){state.settings.autoInsights=e.target.checked;saveState();toast("Insight preference saved");}});
$("#content").addEventListener("click",e=>{const node=e.target.closest("[data-subject]");if(node&&node.dataset.subject){window.libraryQuery=node.dataset.subject;go("library");}});
$("#content").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-subject]")){e.preventDefault();window.libraryQuery=e.target.dataset.subject;go("library");}});
$("#todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
render();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
