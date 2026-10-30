/*
 * PocketWise receipt OCR post-processor.
 * Consumes PaddleOCR.js line text + polygons locally. It is deliberately a parser,
 * not an OCR engine: it never invents characters or uploads receipt data.
 */
(function (root) {
  'use strict';

  var HANDLE_PROVIDERS = Object.assign(Object.create(null), {
    oksbi: 'UPI handle', okaxis: 'UPI handle', okicici: 'UPI handle', okhdfcbank: 'UPI handle',
    ybl: 'UPI handle', ibl: 'UPI handle', axl: 'UPI handle', paytm: 'UPI handle',
    upi: 'UPI handle', apl: 'UPI handle', yapl: 'UPI handle'
  });
  function configureHandleMapping(mapping) {
    if (!mapping || typeof mapping !== 'object') return false;
    Object.keys(mapping).forEach(function (key) {
      var handle = String(key || '').trim().replace(/^@/, '').toLowerCase();
      var provider = String(mapping[key] || '').trim().slice(0, 60);
      if (/^[a-z0-9][a-z0-9.-]{0,80}$/.test(handle) && provider) HANDLE_PROVIDERS[handle] = provider;
    });
    return true;
  }
  var VPA_RE = /\b[a-z0-9][a-z0-9._-]{0,120}@[a-z0-9][a-z0-9.-]{0,80}\b/ig;
  var AMOUNT_RE = /(?:₹|\bINR\b|\bRs\.?\s*)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/ig;
  var AMOUNT_LABEL_RE = /\b(?:amount|total|grand\s*total|paid|you\s*paid|transaction\s*amount|debited|credited|sent|received|payment\s*of|paid\s*successfully)\b/i;
  var EXCLUDE_AMOUNT_RE = /\b(?:balance|available|cashback|cash\s*back|reward|discount|limit|savings?|before\s*balance|after\s*balance|minimum\s*due|bill\s*date|account\s*no)\b/i;

  function textOf(item) { return String(item && item.text || '').replace(/\s+/g, ' ').trim(); }
  function getBox(item) {
    var p = item && (item.poly || item.polygon || item.box);
    var xs = [], ys = [];
    if (Array.isArray(p) && p.length) {
      if (Array.isArray(p[0])) p.forEach(function (pt) { if (pt && Number.isFinite(+pt[0]) && Number.isFinite(+pt[1])) { xs.push(+pt[0]); ys.push(+pt[1]); } });
      else if (p.length >= 4) return { x0:+p[0], y0:+p[1], x1:+p[2], y1:+p[3] };
    } else if (p && typeof p === 'object') {
      if (Array.isArray(p.points)) return getBox({ poly:p.points });
      if ([p.x0,p.y0,p.x1,p.y1].every(function (v) { return Number.isFinite(+v); })) return { x0:+p.x0, y0:+p.y0, x1:+p.x1, y1:+p.y1 };
    }
    if (!xs.length) return null;
    return { x0:Math.min.apply(null,xs), y0:Math.min.apply(null,ys), x1:Math.max.apply(null,xs), y1:Math.max.apply(null,ys) };
  }
  function normaliseItems(items) {
    return (Array.isArray(items) ? items : []).map(function (item, index) {
      var box = getBox(item);
      return { text:textOf(item), score:Number(item && item.score) || 0, box:box, sourceIndex:index };
    }).filter(function (item) { return item.text && item.box && item.box.x1 >= item.box.x0 && item.box.y1 >= item.box.y0; })
      .sort(function (a,b) { var dy = ((a.box.y0+a.box.y1)-(b.box.y0+b.box.y1))/2; return Math.abs(dy) > Math.max(8, Math.min(a.box.y1-a.box.y0,b.box.y1-b.box.y0)*.45) ? dy : a.box.x0-b.box.x0; });
  }
  function mean(a,b) { return (a+b)/2; }
  function median(values) {
    var a = values.filter(function (v) { return Number.isFinite(v) && v > 0; }).sort(function (x,y) { return x-y; });
    if (!a.length) return 1;
    var m = Math.floor(a.length/2); return a.length % 2 ? a[m] : mean(a[m-1],a[m]);
  }
  function clamp(n, lo, hi) { return Math.max(lo,Math.min(hi,n)); }
  function editDistance(a,b) {
    var prev = new Array(b.length+1), cur = new Array(b.length+1);
    for (var j=0;j<=b.length;j++) prev[j]=j;
    for (var i=1;i<=a.length;i++) { cur[0]=i; for (var k=1;k<=b.length;k++) cur[k]=Math.min(cur[k-1]+1,prev[k]+1,prev[k-1]+(a[i-1]===b[k-1]?0:1)); var t=prev;prev=cur;cur=t; }
    return prev[b.length];
  }
  function fuzzyLabel(text, labels, maxRatio) {
    var clean = String(text||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
    if (!clean) return null;
    for (var i=0;i<labels.length;i++) {
      var label = labels[i], normal = label.toLowerCase();
      if (clean === normal || clean.indexOf(normal + ' ') === 0 || clean.indexOf(normal + ':') === 0) return { label:label, ratio:0 };
    }
    var best=null, cleanFlat=clean.replace(/ /g,'');
    labels.forEach(function (label) {
      var normalFlat=label.toLowerCase().replace(/ /g,'');
      if (normalFlat.length <= 3) return; // short labels (notably 'to') require an exact match
      var prefix=cleanFlat.slice(0,normalFlat.length);
      var ratio=editDistance(prefix,normalFlat)/Math.max(normalFlat.length,1);
      if (!best || ratio<best.ratio) best={label:label,ratio:ratio};
    });
    return best && best.ratio <= (maxRatio || .22) ? best : null;
  }
  function parseAmount(value) {
    var s=String(value||'').replace(/(?:₹|\bINR\b|\bRs\.?)/ig,'').replace(/\s/g,'').replace(/[^0-9,.]/g,'');
    if (!s || !/\d/.test(s)) return null;
    var parts=s.split('.'); if (parts.length>2 || (parts[1] && !/^\d{1,2}$/.test(parts[1]))) return null;
    var integer=parts[0];
    if (!integer || !/^\d[\d,]*$/.test(integer)) return null;
    if (integer.indexOf(',')>=0) {
      var validIndian=/^\d{1,3}(?:,\d{2})*,\d{3}$/.test(integer);
      var validWestern=/^\d{1,3}(?:,\d{3})+$/.test(integer);
      if (!validIndian && !validWestern) return null;
    }
    var canonical=integer.replace(/,/g,'')+(parts.length===2?'.'+parts[1]:'');
    var amount=Number(canonical);
    if (!Number.isFinite(amount) || amount<=0) return null;
    // Currency amounts are stored as JS numbers. Reject unsafe integer precision rather than truncate digits.
    var major=Number(integer.replace(/,/g,''));
    if (!Number.isSafeInteger(major)) return null;
    return { value:amount, canonical:canonical, formatted:integer+(parts.length===2?'.'+parts[1]:''), digits:integer.replace(/\D/g,'').length };
  }
  function extractVpa(lines) {
    var candidates=[];
    lines.forEach(function (line) {
      var re=new RegExp(VPA_RE.source,'ig'), m;
      while ((m=re.exec(line.text))) {
        var id=m[0].replace(/[.,;:]+$/,'');
        var handle='@'+id.split('@').slice(1).join('@').toLowerCase();
        candidates.push({ id:id, handle:handle, provider:HANDLE_PROVIDERS[handle.slice(1)] || 'Other UPI handle', lineIndex:line.index, confidence:line.score });
      }
    });
    candidates.sort(function(a,b){return b.confidence-a.confidence;});
    return candidates[0] || { id:'', handle:'', provider:'', lineIndex:-1, confidence:0 };
  }
  function isNumericLike(text) { return /^[\s₹₹Rs.INR0-9,.'-]+$/i.test(String(text||'')) && /\d/.test(text); }
  function cleanName(value, vpa) {
    var s=String(value||'');
    if (vpa) s=s.replace(new RegExp(vpa.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),' ');
    s=s.replace(VPA_RE,' ').replace(/\b(?:upi\s*id|vpa|upi|utr|rrn|transaction\s*id|txn\s*id|reference|amount|total|date|time|status|paid|sent|received|from|to|paid\s*by|paid\s*to)\b.*$/i,' ')
      .replace(/(?:₹|\bINR\b|\bRs\.?\s*)\s*[\d,.]+.*$/i,' ')
      .replace(/[|•·:：]+/g,' ').replace(/\s+/g,' ').replace(/^[\s,.;#-]+|[\s,.;#-]+$/g,'').trim();
    if (!s || s.length>90 || isNumericLike(s) || /^(?:paid to|sent to|received from|from|to|paid by|merchant|beneficiary)$/i.test(s)) return '';
    if (!/[a-z]/i.test(s)) return '';
    return s;
  }
  function detectParty(lines, upi) {
    var outgoingLabels=['paid to','sent to','payment to','transferred to','debited to','to','beneficiary','merchant'];
    var incomingLabels=['received from','credited from','paid by','from'];
    var incoming=[], outgoing=[], merchant=[];
    lines.forEach(function (line, i) {
      var lo=line.text.toLowerCase();
      var inc=fuzzyLabel(lo,incomingLabels,.20), out=fuzzyLabel(lo,outgoingLabels,.18), merch=/\bmerchant\b/i.test(lo);
      if (inc) incoming.push({line:line,index:i,label:inc.label,ratio:inc.ratio});
      else if (out) outgoing.push({line:line,index:i,label:out.label,ratio:out.ratio});
      if (merch) merchant.push({line:line,index:i,label:'merchant',ratio:0});
    });
    var direction=incoming.length && !outgoing.length ? 'incoming' : outgoing.length ? 'outgoing' : 'unknown';
    var anchors=direction==='incoming'?incoming:outgoing.length?outgoing:merchant;
    var best=null;
    anchors.forEach(function(anchor){
      var inline=anchor.line.text;
      var labelPattern=anchor.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');
      var afterLabel=inline.replace(new RegExp('^.*?\\b'+labelPattern+'\\b\\s*[:：-]?\\s*','i'),'');
      var candidates=[];
      if (afterLabel && afterLabel!==inline) candidates.push({text:afterLabel,index:anchor.index,inline:true});
      [anchor.index+1,anchor.index+2,anchor.index-1].forEach(function(idx){if(idx>=0&&idx<lines.length)candidates.push({text:lines[idx].text,index:idx,inline:false});});
      candidates.forEach(function(c){
        var name=cleanName(c.text,upi.id);
        if(!name)return;
        var target=lines[c.index], anchorBox=anchor.line.box, targetBox=target.box;
        var dy=Math.abs((targetBox.y0+targetBox.y1-anchorBox.y0-anchorBox.y1)/2);
        var maxH=Math.max(1,anchorBox.y1-anchorBox.y0,targetBox.y1-targetBox.y0);
        var score=.62+Math.min(.18,target.score*.18)+(c.inline?.08:0)-Math.min(.18,dy/(maxH*4)*.18)-anchor.ratio*.10;
        if(c.index<anchor.index)score-=.04;
        var candidate={name:name,confidence:clamp(score,0,.96),direction:direction,lineIndex:c.index,label:anchor.label};
        if(!best||candidate.confidence>best.confidence)best=candidate;
      });
    });
    return { name:best?best.name:'', confidence:best?best.confidence:0, direction:direction, source:best?best.label:'' };
  }
  function extractRefs(lines) {
    var utrLabels=['utr','rrn','upi ref','upi reference','bank reference','reference no','ref no'];
    var txnLabels=['transaction id','txn id','upi transaction id','transaction reference'];
    var result={utr:'',transactionId:'',confidence:0};
    function valueAfter(line,index,label) {
      var same=line.text.match(/(?:[:#-]\s*|\s{1,})([A-Z0-9][A-Z0-9/-]{5,39})\s*$/i);
      if(same)return {value:same[1],lineIndex:index,inline:true};
      var next=lines[index+1]; if(next && /^[A-Z0-9][A-Z0-9/-]{5,39}$/i.test(next.text.trim()))return {value:next.text.trim(),lineIndex:index+1,inline:false};
      return null;
    }
    lines.forEach(function(line,i){
      var label=fuzzyLabel(line.text,utrLabels,.22);
      if(label && !result.utr){var v=valueAfter(line,i,label.label);if(v){result.utr=v.value;result.confidence=Math.max(result.confidence,Math.min(.95,.68+line.score*.25));}}
      var tx=fuzzyLabel(line.text,txnLabels,.18);
      if(tx && !result.transactionId){var tv=valueAfter(line,i,tx.label);if(tv){result.transactionId=tv.value;result.confidence=Math.max(result.confidence,Math.min(.95,.65+line.score*.25));}}
    });
    // Some receipts put reference labels and values in adjacent OCR boxes or on one line.
    var joined=lines.map(function(l){return l.text;}).join('\n');
    if(!result.utr){var m=joined.match(/\b(?:UTR|UTR1|RRN|UPI\s*Ref(?:erence)?|Bank\s*Reference)\b\s*[:#-]?\s*([A-Z0-9/-]{6,40})/i);if(m)result.utr=m[1];}
    if(!result.transactionId){var t=joined.match(/\b(?:UPI\s*)?(?:Transaction\s*ID|Txn\s*ID|Transaction\s*Reference)\b\s*[:#-]?\s*([A-Z0-9/-]{6,40})/i);if(t)result.transactionId=t[1];}
    if(result.utr && result.utr===result.transactionId)result.transactionId='';
    return result;
  }
  function amountCandidates(lines) {
    var heights=lines.map(function(l){return l.box.y1-l.box.y0;});
    var localMedian=median(heights), candidates=[];
    function add(raw, line, idx, extra, merged) {
      var parsed=parseAmount(raw); if(!parsed)return;
      var text=line.text;
      if(EXCLUDE_AMOUNT_RE.test(text))return;
      var hasCurrency=/(?:₹|\bINR\b|\bRs\.?)/i.test(text) || (merged && merged.currencyOnly);
      var hasLabel=AMOUNT_LABEL_RE.test(text) || (merged && merged.label);
      if(!hasCurrency&&!hasLabel)return;
      var h=Math.max(1,line.box.y1-line.box.y0);
      // Relative to the page's median line height, not the tallest (possibly merged) block.
      var sizeFactor=clamp(h/localMedian,.55,2.5);
      var score=.33+(hasCurrency?.25:0)+(hasLabel?.13:0)+Math.min(.15,line.score*.15)+Math.min(.12,Math.max(0,sizeFactor-1)*.08);
      if(parsed.digits>=4)score+=.04;
      if(parsed.digits>=8)score+=.02;
      if(merged)score-=.04;
      candidates.push({value:parsed.value,formatted:parsed.formatted,canonical:parsed.canonical,confidence:clamp(score,0,.97),raw:raw,lineIndex:idx,box:line.box,source:merged?'spatial-currency-join':'paddle-line',hasCurrency:hasCurrency,hasLabel:hasLabel,heightRatio:sizeFactor});
    }
    lines.forEach(function(line,i){
      var re=new RegExp(AMOUNT_RE.source,'ig'),m;
      while((m=re.exec(line.text))) add(m[0],line,i,null,null);
      // Some receipt templates use a label on one line and the amount alone on the next.
      if(AMOUNT_LABEL_RE.test(line.text) && i+1<lines.length){
        var next=lines[i+1], n=next.text.match(/^\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*$/);
        var gap=next.box.y0-line.box.y1, h=Math.max(1,line.box.y1-line.box.y0,next.box.y1-next.box.y0);
        if(n && gap>=-h*.3 && gap<=h*2.2) add(n[1],{text:line.text+' '+next.text,score:Math.min(line.score,next.score),box:{x0:Math.min(line.box.x0,next.box.x0),y0:Math.min(line.box.y0,next.box.y0),x1:Math.max(line.box.x1,next.box.x1),y1:Math.max(line.box.y1,next.box.y1)}},i,{label:true},{label:true});
      }
      // Currency glyph and amount may be separate stacked OCR lines.
      if(/^\s*(?:₹|Rs\.?|INR)\s*$/i.test(line.text) && i+1<lines.length){
        var below=lines[i+1], amountOnly=below.text.match(/^\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*$/);
        var verticalGap=below.box.y0-line.box.y1, lineH=Math.max(1,line.box.y1-line.box.y0,below.box.y1-below.box.y0);
        var horizontalGap=Math.max(0,Math.max(line.box.x0,below.box.x0)-Math.min(line.box.x1,below.box.x1));
        if(amountOnly && verticalGap>=-lineH*.35 && verticalGap<=lineH*1.65 && horizontalGap<lineH*2.4){
          var mergedLine={text:'₹ '+below.text,score:Math.min(line.score,below.score),box:{x0:Math.min(line.box.x0,below.box.x0),y0:line.box.y0,x1:Math.max(line.box.x1,below.box.x1),y1:below.box.y1}};
          add('₹ '+amountOnly[1],mergedLine,i,{currencyOnly:true},{currencyOnly:true});
        }
      }
    });
    candidates.sort(function(a,b){return b.confidence-a.confidence || b.heightRatio-a.heightRatio;});
    // Avoid treating balances/cashback as payment amount: prefer currency-marked candidates,
    // then amount labels, then the larger prominent line as a final tie-breaker.
    return candidates;
  }
  function extract(options) {
    options=options||{};
    var lines=normaliseItems(options.items||[]);
    if(!lines.length && options.text){
      lines=String(options.text).split(/\r?\n/).filter(Boolean).map(function(text,index){return{text:text,score:.5,box:{x0:0,y0:index*20,x1:100,y1:index*20+16},index:index};});
    }
    lines=lines.map(function(l,i){l.index=i;return l;});
    var upi=extractVpa(lines), party=detectParty(lines,upi), refs=extractRefs(lines), amounts=amountCandidates(lines);
    var amount=amounts.find(function(a){return a.confidence>=.62;})||null;
    return {
      amount:amount,
      party:party,
      upi:upi,
      references:refs,
      direction:party.direction,
      lines:lines.map(function(l){return{text:l.text,score:l.score,box:l.box};}),
      candidates:amounts.slice(0,8)
    };
  }

  root.PocketWiseReceiptParser=Object.freeze({version:'1.0.0',extract:extract,parseAmount:parseAmount,configureHandleMapping:configureHandleMapping});
}(typeof window!=='undefined'?window:this));
