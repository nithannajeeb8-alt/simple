(()=>{
  'use strict';
  const KEY='pocketwise-onboarding-complete-v1';
  const steps=[
    {target:null,title:'Welcome to PocketWise',body:'A calmer way to understand your money. This quick tour shows you the essentials. Your financial records are stored in this browser on this device.',icon:'welcome'},
    {target:'.money-card',title:'Your money at a glance',body:'See your available balance, income, expenses and monthly position. Use the balance privacy control if you want to hide amounts.',icon:'balance'},
    {target:'#mobile-add',title:'The + button does the work',body:'Tap + to choose Quick entry, Detailed entry, or Import payment. Import a UPI screenshot from your gallery or paste a bank SMS, then review the extracted details before saving.',icon:'plus'},
    {target:'[data-page="activity"]',title:'Find any transaction',body:'Activity keeps your transaction history searchable. Filter spending, inspect records and export a CSV when you need it.',icon:'activity'},
    {target:'[data-page="insights"]',title:'Understand your patterns',body:'Insights turns your records into trends so you can spot where money goes and track goals over time.',icon:'insights'},
    {target:'[data-page="settings"]',title:'Make it yours and keep it safe',body:'Settings contains appearance, reminders, accounts, categories, privacy controls and backup/restore. Export backups regularly because local browser data can be lost.',icon:'settings'}
  ];
  let index=0,overlay=null,activeTarget=null,shown=false;
  // Remote Unsplash photography gives the tour real human/device imagery instead of inline SVG drawings.
  // Images are decorative; the tour remains usable if the remote image host is unavailable.
  const art={
    welcome:{src:'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=80',alt:'Hand holding a smartphone'},
    balance:{src:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',alt:'Personal finance planning'},
    plus:{src:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',alt:'Making a digital payment'},
    activity:{src:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80',alt:'Secure online payment'},
    insights:{src:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',alt:'Spending insights'},
    settings:{src:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',alt:'Using a mobile app'}
  };
  function ensure(){if(overlay)return;overlay=document.createElement('div');overlay.className='pw-tour-overlay';overlay.hidden=true;overlay.innerHTML='<section class="pw-tour-card" role="dialog" aria-modal="true" aria-labelledby="pw-tour-title"><div class="pw-tour-visual"><img alt="" decoding="async" fetchpriority="low"></div><span class="pw-tour-kicker" id="pw-tour-kicker"></span><h2 id="pw-tour-title"></h2><p id="pw-tour-body"></p><div class="pw-tour-progress" aria-hidden="true"></div><div class="pw-tour-actions"><button type="button" class="pw-tour-skip" id="pw-tour-skip">Skip tour</button><button type="button" class="primary-button pw-tour-next" id="pw-tour-next">Next</button></div></section>';document.body.appendChild(overlay);overlay.querySelector('#pw-tour-next').addEventListener('click',next);overlay.querySelector('#pw-tour-skip').addEventListener('click',finish);overlay.addEventListener('click',e=>{if(e.target===overlay)finish()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&shown)finish()});}
  function clearTarget(){if(activeTarget){activeTarget.classList.remove('pw-tour-target');activeTarget=null;}}
  function render(){ensure();clearTarget();const step=steps[index];if(step.target){const el=document.querySelector(step.target);if(el){activeTarget=el;el.classList.add('pw-tour-target');try{el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center',inline:'nearest'})}catch{}}}
    const illustration=art[step.icon]||art.welcome;const img=overlay.querySelector('.pw-tour-visual img');img.alt=illustration.alt;img.src=illustration.src;img.onerror=()=>{img.style.display='none';overlay.querySelector('.pw-tour-visual').classList.add('image-unavailable')};img.onload=()=>{img.style.display='block';overlay.querySelector('.pw-tour-visual').classList.remove('image-unavailable')};
    overlay.querySelector('#pw-tour-kicker').textContent=`POCKETWISE GUIDE · ${index+1} OF ${steps.length}`;
    overlay.querySelector('#pw-tour-title').textContent=step.title;overlay.querySelector('#pw-tour-body').textContent=step.body;
    overlay.querySelector('.pw-tour-progress').innerHTML=steps.map((_,i)=>`<span class="${i<=index?'active':''}"></span>`).join('');
    overlay.querySelector('#pw-tour-next').textContent=index===steps.length-1?'Finish tour':'Next';
  }
  function start(force=false){if(shown)return;if(!force){try{if(localStorage.getItem(KEY)==='1')return}catch{}}if(document.querySelector('#app-modal')?.open){document.querySelector('#app-modal').addEventListener('close',()=>setTimeout(()=>start(force),180),{once:true});return}shown=true;index=0;render();overlay.hidden=false;document.body.style.overflow='hidden';overlay.querySelector('#pw-tour-next').focus({preventScroll:true});}
  function next(){if(index<steps.length-1){index++;render()}else finish();}
  function finish(){if(!shown)return;shown=false;clearTarget();overlay.hidden=true;document.body.style.overflow='';try{localStorage.setItem(KEY,'1')}catch{}document.querySelector('#replay-app-tour')?.focus({preventScroll:true});}
  document.addEventListener('click',e=>{if(e.target.closest('#replay-app-tour')){e.preventDefault();start(true)}});
  // First-run tour waits until the app is rendered and any initial profile dialog is dismissed.
  window.addEventListener('load',()=>setTimeout(()=>start(false),900));
})();
