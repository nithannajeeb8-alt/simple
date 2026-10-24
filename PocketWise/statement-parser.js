/* Pocketwise statement parser. Deterministic extraction first; no network or AI dependency. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PWStatementParser=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const MAX_ROWS=20000;
  const clean=value=>String(value??'').replace(/\u00a0/g,' ').replace(/[\u200b-\u200f\ufeff]/g,'').trim();
  const norm=value=>clean(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function parseDate(value){
    const s=clean(value).replace(/[,]/g,' ').replace(/\s+/g,' ');
    if(!s)return null;
    let m=s.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if(m)return validDate(+m[1],+m[2],+m[3]);
    m=s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if(m){let y=+m[3];if(y<100)y+=y<70?2000:1900;return validDate(y,+m[2],+m[1]);} // Indian DMY by default
    m=s.match(/^(\d{1,2})[- /]([A-Za-z]{3,9})[- /](\d{2,4})$/);
    if(m){const monthNames=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];const month=monthNames.findIndex(x=>x===m[2].slice(0,3).toLowerCase())+1;let y=+m[3];if(y<100)y+=y<70?2000:1900;return month?validDate(y,month,+m[1]):null;}
    m=s.match(/^([A-Za-z]{3,9})[ -](\d{1,2})[ ,/-](\d{2,4})$/);
    if(m){const monthNames=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];const month=monthNames.findIndex(x=>x===m[1].slice(0,3).toLowerCase())+1;let y=+m[3];if(y<100)y+=y<70?2000:1900;return month?validDate(y,month,+m[2]):null;}
    return null;
  }
  function validDate(y,m,d){const dt=new Date(y,m-1,d);if(dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==d||y<1900||y>2200)return null;return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}
  function parseMoney(value){
    let s=clean(value).replace(/\s+/g,' ').replace(/^(?:INR|Rs\.?|₹)\s*/i,'').replace(/\bINR\b/ig,'').trim();
    if(!s||/^(?:-|–|—|n\/?a|nil|none)$/i.test(s))return {value:null,sign:null,explicit:false};
    const negParen=/^\(.*\)$/.test(s);if(negParen)s=s.slice(1,-1);
    let sign=null,explicit=false;
    if(/\bDR\.?\s*$/i.test(s)){sign=-1;explicit=true;s=s.replace(/\bDR\.?\s*$/i,'').trim();}
    else if(/\bCR\.?\s*$/i.test(s)){sign=1;explicit=true;s=s.replace(/\bCR\.?\s*$/i,'').trim();}
    if(/-$/.test(s)){sign=-1;explicit=true;s=s.slice(0,-1).trim();}
    if(/^\+/.test(s)){sign=1;explicit=true;s=s.slice(1).trim();}
    else if(/^-/ .test(s)){sign=-1;explicit=true;s=s.slice(1).trim();}
    const numeric=s.replace(/[₹,\s]/g,'');
    if(!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(numeric))return {value:null,sign:null,explicit:false};
    const amount=Math.round((Number(numeric)+Number.EPSILON)*100)/100;if(!Number.isFinite(amount))return {value:null,sign:null,explicit:false};
    if(negParen){sign=-1;explicit=true;}
    return {value:amount,sign,explicit};
  }
  function parseCSV(text){
    const source=String(text??'').replace(/^\uFEFF/,'');
    const sample=source.slice(0,20000);const counts=[',',';','\t','|'].map(delim=>({delim,count:countDelimiter(sample,delim)})).sort((a,b)=>b.count-a.count);
    const delimiter=counts[0]?.count?counts[0].delim:',';const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<source.length;i++){const ch=source[i];if(quoted){if(ch==='"'&&source[i+1]==='"'){field+='"';i++;}else if(ch==='"')quoted=false;else field+=ch;}else if(ch==='"'&&!field){quoted=true;}else if(ch===delimiter){row.push(field);field='';}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&source[i+1]==='\n')i++;row.push(field);if(row.some(c=>clean(c)))rows.push(row);row=[];field='';}else field+=ch;}
    row.push(field);if(row.some(c=>clean(c)))rows.push(row);
    return {rows,delimiter};
  }
  function countDelimiter(text,delimiter){let n=0,quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'&&text[i+1]==='"'){i++;continue;}if(c==='"')quoted=!quoted;else if(c===delimiter&&!quoted)n++;}return n;}
  function headerType(value){
    const h=norm(value);if(!h)return null;
    if(/^(?:transaction )?(?:date|txn date|value date|posting date|transaction date|date of transaction|txn dt|trans date|value dt)$/.test(h)||/\b(value date|transaction date|txn date|posting date|transaction dt)\b/.test(h))return 'date';
    if(/\b(opening balance|closing balance|running balance|available balance|balance amount|balance|closing bal|balance rs)\b/.test(h))return 'balance';
    if(/\b(withdrawal|withdrawals|debit|debits|debit amount|withdrawal amount|paid out|money out|dr amount|withdrawal amt)\b/.test(h))return 'debit';
    if(/\b(deposit|deposits|credit|credits|credit amount|deposit amount|paid in|money in|cr amount|deposit amt)\b/.test(h))return 'credit';
    if(/\b(particulars|description|narration|transaction details|transaction description|remarks|transaction particulars|payee|merchant|beneficiary|particular)\b/.test(h)||/^details$/.test(h)||/^details of transaction$/.test(h))return 'description';
    if(/\b(reference|reference no|ref no|rrn|utr|cheque no|chq no|transaction id|txn id|instrument id)\b/.test(h))return 'reference';
    if(/\b(amount|transaction amount|txn amount|value|amount rs|amount inr)\b/.test(h))return 'amount';
    return null;
  }
  function mapHeaders(headers){
    const map={date:null,description:null,debit:null,credit:null,amount:null,balance:null,reference:null};
    headers.forEach((header,index)=>{const kind=headerType(header);if(kind&&map[kind]===null)map[kind]=index;});
    if(map.date===null){const i=headers.findIndex(h=>/date|dt/i.test(clean(h)));if(i>=0)map.date=i;}
    if(map.description===null){const i=headers.findIndex(h=>/description|narration|particular|remarks|details of transaction|transaction details|payee|merchant|beneficiary/i.test(clean(h))&&!/date|amount|id|reference|balance|account/i.test(clean(h)));if(i>=0)map.description=i;}
    return map;
  }
  function mappingUsable(map){return map&&Number.isInteger(map.date)&&Number.isInteger(map.description)&&(Number.isInteger(map.amount)||(Number.isInteger(map.debit)&&Number.isInteger(map.credit)));}
  function findHeaderRow(rows){const limit=Math.min(Array.isArray(rows)?rows.length:0,25);for(let i=0;i<limit;i++){const headers=(rows[i]||[]).map(clean),map=mapHeaders(headers);const likelyDate=headers.some(h=>headerType(h)==='date'||/date|txn.?dt|trans.?dt/i.test(h));const likelyDesc=headers.some(h=>headerType(h)==='description'||/description|narration|particular|transaction details|remarks/i.test(h));const likelyMoney=headers.some(h=>['amount','debit','credit','balance'].includes(headerType(h))||/debit|credit|withdraw|deposit|amount|balance/i.test(h));if(likelyDate&&likelyDesc&&likelyMoney)return i;}return -1;}
  function validateMapping(map,headersLength){const out={date:null,description:null,debit:null,credit:null,amount:null,balance:null,reference:null};for(const k of Object.keys(out)){const i=map?.[k];if(Number.isInteger(i)&&i>=0&&i<headersLength)out[k]=i;}if(!mappingUsable(out))return null;const active=[out.date,out.description,out.amount!==null?out.amount:out.debit,out.amount!==null?null:out.credit,out.balance,out.reference].filter(v=>v!==null);if(new Set(active).size!==active.length)return null;return out;}
  function parseMatrix(rows,mapping){
    if(!Array.isArray(rows)||rows.length<2)return {transactions:[],issues:[],error:'The statement does not contain a header row and transactions.'};
    const headers=rows[0].map(clean),map=validateMapping(mapping||mapHeaders(headers),headers.length);
    if(!map)return {transactions:[],issues:[],headers, mapping:mapHeaders(headers), error:'Could not reliably identify the date, description and amount/debit/credit columns. Map the columns before continuing.'};
    const parsed=[],issues=[];let candidateCount=0;
    for(let ri=1;ri<rows.length&&ri<=MAX_ROWS;ri++){
      const cells=rows[ri]||[];if(!cells.some(v=>clean(v)))continue;const date=parseDate(cells[map.date]);
      if(!date){if(looksLikeTransaction(cells,map)){candidateCount++;issues.push({row:ri+1,reason:'Could not read transaction date.'});}continue;}
      const description=clean(cells[map.description]).replace(/\s+/g,' ').slice(0,500);let debit=map.debit===null?{value:null}:parseMoney(cells[map.debit]);let credit=map.credit===null?{value:null}:parseMoney(cells[map.credit]);let amount=map.amount===null?{value:null,sign:null,explicit:false}:parseMoney(cells[map.amount]);const balance=map.balance===null?{value:null}:parseMoney(cells[map.balance]);const reference=map.reference===null?'':clean(cells[map.reference]).slice(0,100);
      const hasSeparate=map.debit!==null||map.credit!==null;let val=null,type=null,confidence='normal',reason='';
      if(hasSeparate){const d=Number(debit.value||0),c=Number(credit.value||0);if(d>0&&c>0){reason='Both debit and credit columns contain amounts.';}else if(d>0){val=d;type='expense';}else if(c>0){val=c;type='income';}else if(d===0&&c===0){continue;}else reason='Could not read a debit or credit amount.';}
      else if(amount.value!==null){val=amount.value;if(amount.explicit)type=amount.sign<0?'expense':'income';else {const header=norm(headers[map.amount]||'');if(/debit|withdrawal|paid out|money out/.test(header))type='expense';else if(/credit|deposit|paid in|money in/.test(header))type='income';}}
      if(val===null||!Number.isFinite(val)||val<=0){reason=reason||'Could not read a non-zero transaction amount.';}
      if(!description){reason=reason||'Transaction description is empty.';}
      parsed.push({date,description,amount:val,type,balance:balance.value,reference,sourceRow:ri+1,rawCells:cells.map(clean),confidence,issue:reason,selected:!reason&&!!type});
      if(reason)issues.push({row:ri+1,reason});
    }
    if(rows.length-1>MAX_ROWS)issues.push({row:MAX_ROWS+1,reason:`Only the first ${MAX_ROWS.toLocaleString('en-IN')} data rows were processed for safety.`});
    // Reconcile transaction direction and amounts against running balances whenever a neighboring
    // balance exists. This is a warning gate, never a license to rewrite a parsed amount silently.
    const dateOrder=detectDateOrder(parsed);for(let i=0;i<parsed.length;i++){const tx=parsed[i];if(tx.amount===null||tx.balance===null)continue;let adjacent=null;if(dateOrder==='ascending'&&i>0)adjacent=parsed[i-1].balance;else if(dateOrder==='descending'&&i+1<parsed.length)adjacent=parsed[i+1].balance;else if(dateOrder==='ascending'&&i===0)adjacent=findOpeningBalance(rows);if(adjacent===null||adjacent===undefined)continue;const delta=Math.round((tx.balance-adjacent)*100)/100;if(Math.abs(delta)<0.005)continue;if(!tx.type){if(Math.abs(Math.abs(delta)-tx.amount)<=0.03){tx.type=delta<0?'expense':'income';tx.selected=!tx.issue;tx.directionFromBalance=true;}else{tx.issue=tx.issue||'Amount does not reconcile with the balance change.';tx.confidence='review';tx.selected=false;}}else if(Math.abs(Math.abs(delta)-tx.amount)>0.03||(tx.type==='expense'&&delta>0)||(tx.type!=='expense'&&delta<0)){tx.issue=tx.issue||'Running-balance change does not match the amount or direction.';tx.confidence='review';tx.selected=false;issues.push({row:tx.sourceRow,reason:tx.issue});}}
    for(const tx of parsed){if(!tx.type&&tx.amount!==null){tx.issue=tx.issue||'Direction is unclear; choose income or expense manually.';tx.confidence='review';tx.selected=false;if(!issues.some(x=>x.row===tx.sourceRow))issues.push({row:tx.sourceRow,reason:tx.issue});}}
    const transactions=parsed.filter(t=>t.amount!==null&&t.date&&t.description);
    return {transactions,issues,headers,mapping:map,unparsedRows:issues.length,detectedRows:transactions.length,sourceRows:rows.length-1,dateOrder,hasBalance:map.balance!==null};
  }
  function detectDateOrder(parsed){const dates=parsed.filter(x=>x.date).map(x=>x.date);if(dates.length<2)return 'unknown';let asc=0,desc=0;for(let i=1;i<dates.length;i++){if(dates[i]>dates[i-1])asc++;else if(dates[i]<dates[i-1])desc++;}if(asc>desc)return 'ascending';if(desc>asc)return 'descending';return 'unknown';}
  function findOpeningBalance(rows){for(const row of rows.slice(0,5)){const text=row.map(norm).join(' ');if(/opening balance|balance b f|balance brought forward/.test(text)){for(const cell of row){const v=parseMoney(cell);if(v.value!==null)return v.value;}}}return null;}
  function looksLikeTransaction(cells,map){return cells.some(c=>parseDate(c))||cells.some(c=>/\b(?:NEFT|RTGS|IMPS|UPI|ATM|POS|ACH|NACH|CHEQUE|CHQ)\b/i.test(clean(c)));}
  // Keep duplicate-looking legitimate payments separate when a statement has no bank reference.
  // When a reference exists, it remains the primary idempotency key across repeated imports.
  function fingerprintKey(row,accountId){const reference=clean(row?.reference).toLowerCase();const identity=reference||norm(row?.description);return [String(accountId||''),String(row?.date||''),String(row?.type||''),Number(row?.amount).toFixed(2),identity].join('|');}
  function makeFingerprint(row,accountId,occurrence=1){const key=fingerprintKey(row,accountId);const input=clean(row?.reference)?key:`${key}|occurrence:${Math.max(1,Math.trunc(Number(occurrence)||1))}`;let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return `stmt_${(hash>>>0).toString(16)}`;}
  function pdfItemsToLines(items){const kept=(items||[]).filter(x=>x&&typeof x.str==='string'&&clean(x.str));const lines=[];for(const item of kept){const x=Number(item.transform?.[4]||0),y=Number(item.transform?.[5]||0);let line=lines.find(l=>Math.abs(l.y-y)<=2.5);if(!line){line={y,items:[]};lines.push(line);}line.items.push({x,y,text:clean(item.str)});}for(const line of lines){line.items.sort((a,b)=>a.x-b.x);line.text=line.items.map(x=>x.text).join(' ').replace(/\s+/g,' ').trim();}return lines.sort((a,b)=>b.y-a.y);}
  function pdfPageToMatrix(lines){
    let activeHeader=null;const output=[];const issues=[];
    for(let li=0;li<lines.length;li++){
      const line=lines[li];const itemLabels=line.items.map(it=>({it,kind:headerType(it.text)}));
      const unique=new Map();for(const {it,kind} of itemLabels){if(kind&&!unique.has(kind))unique.set(kind,it.x);}
      const lineHasHeader=unique.has('date')&&unique.has('description')&&(unique.has('amount')||unique.has('debit')||unique.has('credit'));
      if(lineHasHeader){activeHeader=[...unique.entries()].map(([kind,x])=>({kind,x})).sort((a,b)=>a.x-b.x);continue;}
      const dateCandidate=line.items.some(it=>parseDate(it.text));
      if(activeHeader&&dateCandidate){
        const bounds=activeHeader.map((col,i)=>({kind:col.kind,left:i===0?-Infinity:(activeHeader[i-1].x+col.x)/2,right:i===activeHeader.length-1?Infinity:(col.x+activeHeader[i+1].x)/2}));const cells=activeHeader.map(()=>[]);
        for(const it of line.items){let idx=activeHeader.findIndex((col,i)=>it.x>=bounds[i].left&&it.x<bounds[i].right);if(idx<0)idx=activeHeader.length-1;cells[idx].push(it.text);}
        const record={};activeHeader.forEach((col,i)=>record[col.kind]=cells[i].join(' ').trim());
        const row=activeHeader.map(col=>record[col.kind]||'');output.push({row,activeHeader:activeHeader.map(c=>c.kind)});continue;
      }
      if(output.length&&!dateCandidate&&activeHeader){
        const amountLike=line.items.some(it=>parseMoney(it.text).value!==null);
        const descriptionTexts=line.items.filter(it=>it.x>=activeHeader.find(x=>x.kind==='description')?.x).map(it=>it.text).join(' ').trim();
        if(descriptionTexts&&!amountLike&&!/page\s+\d+|continued|opening balance|closing balance|statement period/i.test(line.text)){const last=output[output.length-1];const idx=last.activeHeader.indexOf('description');if(idx>=0&&descriptionTexts.length<250)last.row[idx]=`${last.row[idx]} ${descriptionTexts}`.trim();}
      }
    }
    if(!output.length)return {rows:null,lines:lines.map(l=>l.text),issues:['No recognizable table header was detected in the PDF.']};
    const kinds=output[0].activeHeader;const rows=[kinds.map(k=>({date:'Date',description:'Description',debit:'Debit',credit:'Credit',amount:'Amount',balance:'Balance',reference:'Reference'}[k]||k))];for(const item of output){const obj={};item.activeHeader.forEach((k,i)=>obj[k]=item.row[i]||'');rows.push(kinds.map(k=>obj[k]||''));}
    return {rows,lines:lines.map(l=>l.text),issues};
  }
  return {parseDate,parseMoney,parseCSV,headerType,mapHeaders,mappingUsable,findHeaderRow,validateMapping,parseMatrix,pdfItemsToLines,pdfPageToMatrix,fingerprintKey,makeFingerprint,norm,MAX_ROWS};
});
