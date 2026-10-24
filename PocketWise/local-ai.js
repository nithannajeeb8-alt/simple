/* Settings and lifecycle bridge for the small, optional local statement-column mapper. */
(function(){
  'use strict';
  const MODEL_CACHE='pocketwise-smollm2-135m-v1';
  const READY_KEY='pocketwise-smollm2-last-prepared-v1';
  const LEGACY_MODEL_CACHE='pocketwise-qwen3-06b-v1';
  const LEGACY_READY_KEY='pocketwise-qwen3-last-prepared-v1';
  let worker=null,seq=0,requests=new Map(),loadPromise=null,loadState='idle',lastError='',currentIntent='prepare';
  const $=s=>document.querySelector(s);
  function settingStatus(message){const el=$('#pw-local-ai-status');if(el)el.textContent=message;}
  function setActionButtons(){const busy=loadState==='loading';const dl=$('#pw-local-ai-download'),remove=$('#pw-local-ai-remove');if(dl){dl.disabled=busy;dl.textContent=busy?'Preparing…':loadState==='ready'?'AI cached · Prepare again':'Download small AI';}if(remove)remove.disabled=busy;}
  function progressText(detail){if(detail?.progress!==null&&detail?.progress!==undefined){const n=Math.max(0,Math.min(100,Math.round(detail.progress)));return `${detail.file||'Model files'} · ${n}%`;}return detail?.file||detail?.status||'Downloading model files…';}
  function releaseWorker(){const old=worker;worker=null;try{old?.terminate();}catch(_){}}
  function ensureWorker(){
    if(worker)return worker;
    worker=new Worker(new URL('local-ai-worker.js',document.baseURI),{type:'module',name:'pocketwise-local-ai'});
    worker.addEventListener('message',event=>{
      const msg=event.data||{};
      if(msg.type==='status'){settingStatus(msg.message||'Preparing the small local model…');return;}
      if(msg.type==='progress'){settingStatus(progressText(msg.detail));return;}
      if(msg.type==='loaded'||msg.type==='ready'){
        loadState='ready';lastError='';try{localStorage.setItem(READY_KEY,'1');}catch(_){}
        settingStatus(`SmolLM2 is cached and available for local use${msg.device?` (${msg.device==='webgpu'?'GPU':'CPU'}).`:'.'} The model runtime is released after preparation or each mapping to reduce memory use.`);setActionButtons();
        if(loadPromise){const resolve=loadPromise.resolve;loadPromise=null;resolve(msg);}
        // Preparing from Settings should only warm/download the browser cache, not leave the model resident.
        if(currentIntent==='prepare')releaseWorker();
        return;
      }
      if(msg.type==='error'){
        loadState='error';lastError=msg.message||'Local AI could not be loaded.';settingStatus(`Could not prepare local AI: ${lastError} Statement parsing and manual column mapping remain available.`);setActionButtons();
        if(loadPromise){const reject=loadPromise.reject;loadPromise=null;reject(new Error(lastError));}
        releaseWorker();return;
      }
      if(msg.type==='response'||msg.type==='response-error'){
        const request=requests.get(msg.id);if(!request)return;requests.delete(msg.id);
        if(msg.type==='response')request.resolve(msg.mapping);else request.reject(new Error(msg.message||'Local AI mapping failed.'));
        // Releasing the worker drops model/GPU allocations after the one small mapping task.
        releaseWorker();
      }
    });
    worker.addEventListener('error',event=>{
      lastError=event.message||'The local AI worker failed.';loadState='error';settingStatus(`Local AI unavailable: ${lastError} Manual column mapping remains available.`);setActionButtons();
      if(loadPromise){loadPromise.reject(new Error(lastError));loadPromise=null;}releaseWorker();
      for(const [id,request] of requests){request.reject(new Error(lastError));requests.delete(id);}
    });
    return worker;
  }
  function isDownloaded(){try{return localStorage.getItem(READY_KEY)==='1';}catch(_){return false;}}
  async function ensureLoaded(intent='prepare'){
    currentIntent=intent;
    if(loadState==='ready')return true;
    if(loadPromise)return loadPromise.promise;
    loadState='loading';setActionButtons();settingStatus('Preparing the small local AI. The model is cached only after the browser successfully loads it.');
    const w=ensureWorker();let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});loadPromise={promise,resolve,reject};w.postMessage({type:'load'});return promise;
  }
  function initializeSettings(){
    // The former 0.6B model is no longer used. Delete its large cache without touching PocketWise records.
    if('caches'in window)caches.delete(LEGACY_MODEL_CACHE).catch(()=>{});
    try{localStorage.removeItem(LEGACY_READY_KEY);}catch(_){}
    if(isDownloaded())settingStatus('Small SmolLM2 was prepared on this browser before. PocketWise will verify it when used; browser storage can be cleared by the system.');
    else settingStatus('Optional SmolLM2 135M · about 120 MB with WebGPU or 185 MB on desktop CPU. Mobile requires WebGPU to avoid a risky CPU fallback. Download is user-triggered; statement rows stay on this device.');
    setActionButtons();
    $('#pw-local-ai-download')?.addEventListener('click',async()=>{try{await ensureLoaded('prepare');}catch(_){/* status explains fallback */}});
    $('#pw-local-ai-remove')?.addEventListener('click',async()=>{
      if(!confirm('Remove the cached PocketWise local AI files from this browser? Your transactions and other PocketWise data will not be changed.'))return;
      try{
        releaseWorker();loadPromise=null;loadState='idle';
        for(const [id,request] of requests){request.reject(new Error('Local AI cache was removed.'));requests.delete(id);}
        if('caches'in window)await Promise.all([caches.delete(MODEL_CACHE),caches.delete(LEGACY_MODEL_CACHE)]);
        try{localStorage.removeItem(READY_KEY);localStorage.removeItem(LEGACY_READY_KEY);}catch(_){}
        settingStatus('Local AI cache removed. Existing PocketWise records were not changed.');setActionButtons();
      }catch(error){settingStatus(`Could not remove the model cache: ${error.message||error}`);}
    });
  }
  async function mapColumns(headers){
    currentIntent='map';
    await ensureLoaded('map');
    const w=ensureWorker(),id=++seq;
    return new Promise((resolve,reject)=>{
      requests.set(id,{resolve,reject});
      w.postMessage({type:'mapColumns',id,headers:(headers||[]).slice(0,80).map(String)});
      setTimeout(()=>{const request=requests.get(id);if(request){requests.delete(id);request.reject(new Error('The local AI took too long to respond. Use manual column mapping instead.'));releaseWorker();}},90000);
    });
  }
  window.PocketwiseLocalAI={ensureLoaded,mapColumns,isLoaded:()=>loadState==='ready',isDownloaded,modelName:'SmolLM2-135M-Instruct',initializeSettings};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeSettings,{once:true});else initializeSettings();
})();
