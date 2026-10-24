/* Optional on-device Qwen3 worker. Bank data never leaves this worker/browser. */
let tokenizerPromise=null,modelPromise=null,modelId=null,deviceId=null;
const MODEL_ID='onnx-community/Qwen3-0.6B-ONNX';
const CACHE_KEY='pocketwise-qwen3-06b-v1';
const post=(type,data={})=>self.postMessage({type,...data});
async function getModel(progress){
  if(tokenizerPromise&&modelPromise)return Promise.all([tokenizerPromise,modelPromise]);
  post('status',{message:'Loading local AI runtime…'});
  const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1');
  const {AutoTokenizer,AutoModelForCausalLM,env}=lib;
  env.useBrowserCache=true;env.useWasmCache=true;env.cacheKey=CACHE_KEY;env.allowRemoteModels=true;
  // Prefer GPU acceleration. WASM is a slower fallback on devices without WebGPU.
  let device='wasm',dtype='q4';
  try{if(self.navigator?.gpu){const adapter=await self.navigator.gpu.requestAdapter();if(adapter&&adapter.features?.has('shader-f16')){device='webgpu';dtype='q4f16';}}}catch(_){/* keep CPU fallback */}
  post('status',{message:device==='webgpu'?'Preparing Qwen3 on the device GPU…':'Preparing Qwen3 on the device CPU. This may be slower…'});
  const callback=info=>{if(!info||typeof info!=='object')return;const details={status:String(info.status||''),file:String(info.file||info.name||''),progress:Number.isFinite(info.progress)?info.progress:null,loaded:Number.isFinite(info.loaded)?info.loaded:null,total:Number.isFinite(info.total)?info.total:null};progress(details);};
  tokenizerPromise=AutoTokenizer.from_pretrained(MODEL_ID,{progress_callback:callback});
  modelPromise=AutoModelForCausalLM.from_pretrained(MODEL_ID,{device,dtype,progress_callback:callback});
  try{const result=await Promise.all([tokenizerPromise,modelPromise]);modelId=MODEL_ID;deviceId=device;post('ready',{model:MODEL_ID,device});return result;}
  catch(error){tokenizerPromise=null;modelPromise=null;throw error;}
}
async function load(){try{await getModel(d=>post('progress',{detail:d}));post('loaded',{model:MODEL_ID,device:deviceId});}catch(error){post('error',{message:String(error?.message||error||'Unable to load the local AI model.')});}}
function parseJsonObject(text){const s=String(text||'');const first=s.indexOf('{'),last=s.lastIndexOf('}');if(first<0||last<first)throw new Error('The local model did not return a usable column map.');return JSON.parse(s.slice(first,last+1));}
async function mapColumns(headers){
  if(!modelPromise||!tokenizerPromise)await getModel(d=>post('progress',{detail:d}));
  const [tokenizer,model]=await Promise.all([tokenizerPromise,modelPromise]);
  const safeHeaders=(headers||[]).slice(0,80).map((h,i)=>({index:i,label:String(h||'').slice(0,100)}));
  const prompt='Map only these bank statement CSV column labels to the schema. Do not read or invent transaction records. Return JSON only, using zero-based numeric header indices or null: {"date":number|null,"description":number|null,"debit":number|null,"credit":number|null,"amount":number|null,"balance":number|null,"reference":number|null}. Prefer separate debit and credit columns when available. Never use a balance column as the transaction amount. If a field is not clear, use null. Headers: '+JSON.stringify(safeHeaders);
  const inputs=tokenizer.apply_chat_template([{role:'system',content:'You are a strict CSV column-label mapper. Never infer from transaction values. Output a single JSON object and nothing else.'},{role:'user',content:prompt}],{add_generation_prompt:true,return_dict:true,enable_thinking:false});
  const output=await model.generate({...inputs,max_new_tokens:180,do_sample:false});
  const generated=tokenizer.decode(output[0].slice(inputs.input_ids.size(-1)),{skip_special_tokens:true});
  post('map-complete',{length:generated.length});return parseJsonObject(generated);
}
self.addEventListener('message',async event=>{const {id,type,headers}=event.data||{};try{if(type==='load'){await load();}else if(type==='mapColumns'){const mapping=await mapColumns(headers||[]);post('response',{id,mapping});}}catch(error){post('response-error',{id,message:String(error?.message||error||'Local AI failed.')});}});
