/* Optional small on-device SmolLM2 worker for bank-column interpretation.
   It receives only column labels. Financial rows are parsed and validated separately. */
let tokenizerPromise=null,modelPromise=null,modelLoadPromise=null,modelId=null,deviceId=null;
const MODEL_ID='onnx-community/SmolLM2-135M-Instruct-ONNX-MHA';
const CACHE_KEY='pocketwise-smollm2-135m-v1';
const post=(type,data={})=>self.postMessage({type,...data});
function isMobileDevice(){
  const ua=String(self.navigator?.userAgent||'');
  const iPadOS=/Macintosh/i.test(ua)&&Number(self.navigator?.maxTouchPoints||0)>1;
  return /Android|iPhone|iPad|iPod/i.test(ua)||iPadOS;
}
async function getModel(progress){
  if(modelLoadPromise)return modelLoadPromise;
  modelLoadPromise=(async()=>{
    post('status',{message:'Loading the small local AI runtime…'});
    const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1');
    const {AutoTokenizer,AutoModelForCausalLM,env}=lib;
    env.useBrowserCache=true;env.useWasmCache=true;env.cacheKey=CACHE_KEY;env.allowRemoteModels=true;
    // Sequential loading reduces the peak memory footprint during startup.
    let adapter=null;
    try{if(self.navigator?.gpu)adapter=await self.navigator.gpu.requestAdapter();}catch(_){adapter=null;}
    const mobile=isMobileDevice();
    if(mobile&&!adapter){
      throw new Error('This mobile browser does not expose WebGPU. To protect PocketWise from a memory crash, local AI will not start on the CPU. Statement parsing and manual column mapping still work.');
    }
    let device='wasm',dtype='q4';
    if(adapter){device='webgpu';dtype=adapter.features?.has('shader-f16')?'q4f16':'q4';}
    if(device==='wasm'&&env.backends?.onnx?.wasm){env.backends.onnx.wasm.numThreads=1;}
    post('status',{message:device==='webgpu'?`Preparing small SmolLM2 on the device GPU (${dtype==='q4f16'?'low-memory FP16':'quantized'} mode)…`:'Preparing small SmolLM2 on the desktop CPU…'});
    const callback=info=>{if(!info||typeof info!=='object')return;const details={status:String(info.status||''),file:String(info.file||info.name||''),progress:Number.isFinite(info.progress)?info.progress:null,loaded:Number.isFinite(info.loaded)?info.loaded:null,total:Number.isFinite(info.total)?info.total:null};progress(details);};
    const tokenizer=await AutoTokenizer.from_pretrained(MODEL_ID,{progress_callback:callback});
    const model=await AutoModelForCausalLM.from_pretrained(MODEL_ID,{device,dtype,progress_callback:callback});
    tokenizerPromise=Promise.resolve(tokenizer);modelPromise=Promise.resolve(model);modelId=MODEL_ID;deviceId=device;
    post('ready',{model:MODEL_ID,device,dtype});
    return [tokenizer,model];
  })();
  try{return await modelLoadPromise;}
  catch(error){tokenizerPromise=null;modelPromise=null;modelLoadPromise=null;throw error;}
}
async function load(){try{await getModel(d=>post('progress',{detail:d}));post('loaded',{model:MODEL_ID,device:deviceId});}catch(error){post('error',{message:String(error?.message||error||'Unable to load the local AI model.')});}}
function parseJsonObject(text){const s=String(text||'');const first=s.indexOf('{'),last=s.lastIndexOf('}');if(first<0||last<first)throw new Error('The local model did not return a usable column map.');return JSON.parse(s.slice(first,last+1));}
async function mapColumns(headers){
  if(!modelPromise||!tokenizerPromise)await getModel(d=>post('progress',{detail:d}));
  const [tokenizer,model]=await Promise.all([tokenizerPromise,modelPromise]);
  const safeHeaders=(headers||[]).slice(0,80).map((h,i)=>({index:i,label:String(h||'').slice(0,100)}));
  const prompt='Map only these bank statement CSV column labels to the schema. Do not read or invent transaction records. Return JSON only, using zero-based numeric header indices or null: {"date":number|null,"description":number|null,"debit":number|null,"credit":number|null,"amount":number|null,"balance":number|null,"reference":number|null}. Prefer separate debit and credit columns when available. Never use a balance column as the transaction amount. If a field is not clear, use null. Headers: '+JSON.stringify(safeHeaders);
  const inputs=tokenizer.apply_chat_template([{role:'system',content:'You are a strict CSV column-label mapper. Never infer from transaction values. Output a single JSON object and nothing else.'},{role:'user',content:prompt}],{add_generation_prompt:true,return_dict:true,enable_thinking:false});
  const output=await model.generate({...inputs,max_new_tokens:120,do_sample:false});
  const generated=tokenizer.decode(output[0].slice(inputs.input_ids.size(-1)),{skip_special_tokens:true});
  post('map-complete',{length:generated.length});return parseJsonObject(generated);
}
self.addEventListener('message',async event=>{const {id,type,headers}=event.data||{};try{if(type==='load'){await load();}else if(type==='mapColumns'){const mapping=await mapColumns(headers||[]);post('response',{id,mapping});}}catch(error){const message=String(error?.message||error||'Local AI mapping failed.');if(type==='load')post('error',{message});else post('response-error',{id,message});}});
