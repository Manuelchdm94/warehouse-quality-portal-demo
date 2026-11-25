

const CRIT=[["Product clean, no spill"],["Damaged product packaging"],["Physical code matches WMS"],["Lot matches WMS"],["Expiration date valid"],["Product in full carton"],["Product in box matches code and lot"],["Product information legible"],["Carton undamaged"],["Box properly closed"],["Pallet free of pests, clean and undamaged"],["Pallet stacking and wrapping compliant"]];
const tipo=n=>n<2?"Critical (AQL 0.010)":n<9?"Major (AQL 0.040)":"Minor (AQL NA)";
const GR=[[0,2,"Critical","AQL 0.010"],[2,9,"Major","AQL 0.040"],[9,12,"Minor","AQL NA"]];
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MESES=[_t(0,"January"),_t(1,"February"),_t(2,"March"),_t(3,"April"),_t(4,"May"),_t(5,"June"),_t(6,"July"),_t(7,"August"),_t(8,"September"),_t(9,"October"),_t(10,"November"),_t(11,"December")];
const $=s=>document.querySelector(s);
const esc=v=>String(v==null?"":v).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clone=o=>JSON.parse(JSON.stringify(o));
const fmtF=f=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(f||"");return m?(+m[3])+" "+MES[+m[2]-1]+" "+m[1].slice(2):(f||"");};
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());};
const mesKey=f=>(f||"").slice(0,7);
const mesName=k=>{const p=k.split("-");return (MESES[+p[1]-1]||k)+" "+p[0];};
const isNA=t=>/^\s*(n\s*[\/.\-]?\s*a\.?|no\s+aplica)\s*$/i.test(String(t||""));
const cs=v=>/^\d+$/.test(String(v||"").trim())?String(v).trim()+" CS":(v||"");
const defects=l=>l.res.reduce((a,r)=>a+(parseInt(r,10)||0),0);
const used=l=>!!(l.lote||l.cant||l.muestra||l.ac||l.re||(l.obs&&!isNA(l.obs))||l.res.some(r=>r!==""));
const lotState=l=>!used(l)?"":l.res.some(r=>r!=="")?"ok":"pend";
const blankLot=()=>({lote:"",cant:"",muestra:"",ac:"",re:"",res:Array(12).fill(""),obs:"",dict:""});
function auto(l){const re=parseInt(l.re,10);if(!isNaN(re)&&l.res.some(r=>r!==""))l.dict=defects(l)>=re?"Rejected":"Released";}
const normCod=t=>{const m=String(t||"").toUpperCase().replace(/[\s-]/g,"").replace(/O/g,"0").match(/80\d{6}/);return m?m[0]:"";};
const normLote=t=>{const x=String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"");if(/^[A-Z0-9]{11}$/.test(x)&&x.endsWith("R"))return x;const m=x.match(/[A-Z0-9]{10}/);return m?m[0]+"R":"";};
const parseFolio=f=>{const x=/^R(\d{1,2})-(\d{1,3})$/i.exec((f||"").trim());return x?{m:+x[1],n:+x[2]}:null;};

/* ---------- almacenamiento local (por navegador) ---------- */
let STORE_OK=true;const MEM={};
try{localStorage.setItem("wq:t","1");localStorage.removeItem("wq:t");}catch(e){STORE_OK=false;}
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return k in MEM?MEM[k]:d;}},set(k,v){MEM[k]=v;try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}};
let REC=[];
let WARN={dup:{},del:{}};
const saveRecs=()=>U.set("rec",REC),saveWarn=()=>U.set("warn",WARN);
let S,TAB="insp",HQ="",TARGET="codigo",STREAM=null,PV=null,TT=0,DT=0;

function nextFolio(fecha){const f=fecha||today(),m=+f.slice(5,7),y=f.slice(0,4);let mx=0;REC.forEach(r=>{if(String(r.mes).slice(0,4)!==y)return;const p=parseFolio(r.folio);if(p&&p.m===m&&p.n>mx)mx=p.n;});return "R"+m+"-"+pad(mx+1);}
function newForm(){S={id:uid(),fecha:today(),folio:"",codigo:"",desc:"",nivel:"General Level II",muestreo:"Normal",act:0,lots:[0,1,2,3,4].map(blankLot)};S.folio=nextFolio(S.fecha);saveDraft();}
function saveDraft(){if(!ME||!S)return;U.set("draft",S);}
function draftSoon(){clearTimeout(DT);DT=setTimeout(saveDraft,400);}

/* ---------- avisos ---------- */
function toast(t){const e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(TT);TT=setTimeout(()=>e.hidden=true,3200);}
let BT=0;
function busy(t,cancel){const e=$("#busy");clearTimeout(BT);if(!t){e.hidden=true;e.className="";e.textContent="";return;}
 e.className=cancel?"can":"";e.textContent="";const sp=document.createElement("span");sp.textContent=t;e.appendChild(sp);
 if(cancel){const b=document.createElement("button");b.type="button";b.textContent=_t(12,"Cancel");b.onclick=()=>{busy("");try{cancel();}catch(x){}};e.appendChild(b);}
 e.hidden=false;BT=setTimeout(()=>{busy("");toast(_t(13,"It took too long. Try again or enter it manually."));},90000);}
function dlg(o){$("#dlgT").textContent=o.title;$("#dlgB").textContent=o.body;const bx=$("#dlgBtns");bx.innerHTML="";o.buttons.forEach(b=>{const e=document.createElement("button");e.type="button";e.textContent=b.t;e.className="btn "+(b.cls||"");e.onclick=()=>{$("#dlg").hidden=true;if(b.fn)b.fn();};bx.appendChild(e);});$("#dlg").hidden=false;}
function dupGuard(next){
 const f=(S.folio||"").trim().toUpperCase();if(!f){toast(_t(14,"Enter or generate the record ID first."));return;}
 const mk=mesKey(S.fecha);
 if(!REC.some(r=>r.id!==S.id&&r.mes===mk&&String(r.folio).toUpperCase()===f)){next();return;}
 const k=mk+"|"+f,n=Math.min((WARN.dup[k]||0)+1,3);WARN.dup[k]=n;saveWarn();
 if(n<3)dlg({title:_t(15,"Duplicate record ID · warning  ")+n+_t(16,"  of 3"),body:_t(17,"Record ID  ")+f+_t(18,"  already exists in  ")+mesName(mk)+_t(19,". Correct the record ID. On the third warning you can continue."),buttons:[{t:_t(20,"Fix record ID"),cls:"pri"}]});
 else dlg({title:_t(21,"Duplicate record ID · warning 3 of 3"),body:_t(17,"Record ID  ")+f+_t(18,"  already exists in  ")+mesName(mk)+_t(22,". If you continue, it will be duplicated."),buttons:[{t:_t(20,"Fix record ID")},{t:_t(23,"Continue anyway"),cls:"dg",fn:next}]});
}
function delGuard(id){
 const r=REC.find(x=>x.id===id);if(!r)return;const n=Math.min((WARN.del[id]||0)+1,3);WARN.del[id]=n;saveWarn();
 if(n<3)dlg({title:_t(24,"Delete record · warning  ")+n+_t(16,"  of 3"),body:_t(25,"Deleting  ")+r.folio+_t(26,"  is permanent. It was not deleted. You can do it on the third warning."),buttons:[{t:_t(27,"Got it"),cls:"pri"}]});
 else dlg({title:_t(28,"Delete record · warning 3 of 3"),body:_t(29,"Permanently delete  ")+r.folio+_t(30," ?"),buttons:[{t:_t(12,"Cancel")},{t:_t(25,"Delete"),cls:"dg",fn:()=>{REC=REC.filter(x=>x.id!==id);delete WARN.del[id];WARN.gone=WARN.gone||{};WARN.gone[id]=1;saveRecs();saveWarn();toast(_t(32,"Record ")+r.folio+_t(1003," deleted."));render();}}]});
}

/* ---------- guardar / retomar ---------- */
function saveRec(status){
 S.folio=(S.folio||"").trim().toUpperCase();
 const rec={id:S.id,folio:S.folio,fecha:S.fecha,mes:mesKey(S.fecha),status,upd:Date.now(),by:ME?ME.emp:"",data:clone(S)};
 const i=REC.findIndex(r=>r.id===S.id);if(i>=0)REC[i]=rec;else REC.push(rec);
 const ok=saveRecs();saveDraft();return ok;
}
function load(id){const r=REC.find(x=>x.id===id);if(!r)return;S=clone(r.data);S.id=r.id;S.act=Math.max(0,S.lots.findIndex(l=>lotState(l)==="pend"));saveDraft();TAB="insp";render();window.scrollTo(0,0);toast(_t(32,"Record ")+r.folio+_t(33,"  loaded."));}
function actPend(){if(!S.fecha){toast(_t(34,"Date is missing."));return;}dupGuard(()=>{const ok=saveRec("pendiente");toast(ok?_t(32,"Record ")+S.folio+_t(35,"  saved as pending."):_t(36,"Saved for this session only: the browser does not allow storage."));render();});}
function actFin(){if(!S.codigo.trim()){toast(_t(37,"Code is missing."));return;}if(!S.lots.some(l=>used(l)&&l.lote)){toast(_t(38,"Enter at least one lot."));return;}dupGuard(()=>{const ok=saveRec("completo");render();dlg({title:_t(32,"Record ")+S.folio+_t(39,"  saved"),body:ok?_t(40,"Saved as complete. Do you want to generate the PDF to print?"):_t(41,"Saved for this session only: the browser does not allow storage. Generate the PDF now?"),buttons:[{t:_t(42,"Close")},{t:_t(43,"Generate PDF"),cls:"pri",fn:()=>runPdf(S)}]});});}
function runPdf(d){try{makePdf(d);gstInc("pdf");}catch(err){toast(_t(44,"Could not generate the PDF:  ")+(err&&err.message||err));}}
function actPdf(){dupGuard(()=>runPdf(S));}
async function saveBlob(name,blob){
 try{if(window.claude&&claude.use){try{const dl=await claude.use("downloads");if(dl){await dl.save({filename:name,data:blob});toast(_t(45,"File ready:  ")+name);return;}}catch(e){if(e&&e.code==="declined")return;}}
  const file=new File([blob],name,{type:blob.type||"application/octet-stream"});
  if(/\.pdf$/i.test(name)&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});toast(_t(46,"PDF ready."));return;}catch(e){if(e&&e.name==="AbortError")return;}}
  const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(u);},4000);toast(_t(45,"File ready:  ")+name);
 }catch(e){toast(_t(47,"Could not save the file."));}}
function exportRecs(list,name){saveBlob(name,new Blob([JSON.stringify({app:"rework-demo",version:1,records:list})],{type:"application/json"}));}

/* ---------- vistas ---------- */
const sb=t=>`${_t(48,`<button type="button" class="ico" data-scan="`)}${t}${_t(49,`" data-src="cam" aria-label="Take photo"><img src="`)}${IC_CAM}${_t(50,`" alt=""><span>Take photo</span></button><label class="ico" data-scan="`)}${t}${_t(51,`" data-src="gal" for="gal" aria-label="Upload photo"><img src="`)}${IC_GAL}${_t(52,`" alt=""><span>Upload photo</span></label>`)}`;
const fld=(lb,attr,val,o={})=>`<label class="lb">${lb}</label><div class="fld"><input ${attr} value="${esc(val)}"${o.ph?` placeholder="${o.ph}"`:""}${o.im?` inputmode="${o.im}"`:""}>${o.suf?`<span class="suf">${o.suf}</span>`:""}${o.scan?sb(o.scan):""}${o.extra||""}</div>`;
const chips=()=>S.lots.map((x,i)=>`<button type="button" class="chip ${i===S.act?"on":""}" data-lot="${i}"><span class="dot ${lotState(x)}${_t(53,`"></span>Lot  `)}${i+1}<i>${esc(x.lote)||"—"}</i></button>`).join("");
function viewInsp(){
 const l=S.lots[S.act],r=REC.find(x=>x.id===S.id),st=r?r.status:"";
 return `<div class="st"><span class="fo">${esc(S.folio)||_t(54,"No record ID")}</span><span class="bd ${st==="pendiente"?"pend":st==="completo"?"ok":""}">${st==="pendiente"?_t(76,"pending"):st==="completo"?"complete":_t(55,"Draft")}${_t(56,`</span><button type="button" class="btn" style="margin-left:auto;padding:8px 12px" data-a="new">New record</button></div>
 <div class="card"><h2 class="sh"><i>1</i>Record and product</h2>
  <div class="two" style="grid-template-columns:1fr"><div><label class="lb">Date</label><input type="date" data-k="fecha" value="`)}${esc(S.fecha)}${_t(57,`"></div><div><label class="lb">Record ID</label><div class="fld"><input data-k="folio" value="`)}${esc(S.folio)}${_t(58,`" placeholder="R10-01"><button type="button" class="auto" data-a="autofolio">Auto</button></div></div></div>
    `)}${fld(_t(59,"Code"),"data-k=\"codigo\"",S.codigo,{scan:"codigo",im:"numeric",ph:"80XXXXXX"})}
  ${fld(_t(60,"Product description"),"data-k=\"desc\"",S.desc,{scan:"desc",ph:_t(61,"E.g. Feminine pads 30 pcs")})}${_t(62,`
  <div class="two"><div><label class="lb">Inspection level</label><input data-k="nivel" value="`)}${esc(S.nivel)}${_t(63,`"></div><div><label class="lb">Sampling type</label><input data-k="muestreo" value="`)}${esc(S.muestreo)}${_t(64,`"></div></div></div>
 <div class="card"><h2 class="sh"><i>2</i>Lots<em>max. 5 per record</em></h2><div class="chips" id="chips">`)}${chips()}</div>
  ${fld(_t(65,"Lot  ")+(S.act+1),"data-l=\"lote\"",l.lote,{scan:"lote"})}
  <div class="two"><div>${fld(_t(66,"Quantity"),"data-l=\"cant\"",l.cant,{im:"numeric",suf:"CS"})}</div><div>${fld(_t(67,"Sample size"),"data-l=\"muestra\"",l.muestra,{im:"numeric"})}</div></div>
  <div class="two"><div>${fld(_t(68,"Ac (ANSI Z1.4)"),"data-l=\"ac\"",l.ac,{im:"numeric"})}</div><div>${fld(_t(69,"Re (ANSI Z1.4)"),"data-l=\"re\"",l.re,{im:"numeric"})}${_t(70,`</div></div></div>
 <div class="card"><h2 class="sh"><i>3</i>Criteria · Lot  `)}${S.act+1}${_t(71,`<em>number of defects</em></h2>
    `)}${GR.map(g=>`<div class="grp">${_ts(g[2])}<span>${g[3]}</span></div>`+CRIT.slice(g[0],g[1]).map((c,j)=>{const i=g[0]+j;return `<div class="crit"><p><b>${i+1}</b>${_ts(c[0])}</p><input class="num" inputmode="numeric" data-r="${i}" value="${esc(l.res[i])}" placeholder="—"></div>`;}).join("")).join("")}${_t(72,`
  <div class="row3"><button type="button" class="btn" data-a="all0">All to 0</button><button type="button" class="btn" data-a="clr">Clear lot</button></div>
  <div class="tot"><span>Total defects</span><span id="tot">`)}${defects(l)}${_t(73,`</span></div></div>
 <div class="card"><h2 class="sh"><i>4</i>Lot closing  `)}${S.act+1}${_t(74,`</h2>
  <label class="lb">Notes</label><textarea rows="3" data-l="obs">`)}${esc(l.obs)}${_t(75,`</textarea>
  <label class="lb">Disposition</label><select data-l="dict">`)}${["","Released","Rejected"].map(o=>`<option value="${o}"${l.dict===o?" selected":""}>${_ts(o)}</option>`).join("")}${_t(1022,`</select></div>
 <div class="card"><h2 class="sh"><i>5</i>Save</h2>
  <p style="margin:0 0 4px;color:var(--mu);font-size:13px">Lots without entries are printed with an NA diagonal and *. The manual signature goes on the * at the end of the sheet.</p>
  <div class="row3"><button type="button" class="btn" data-a="pend">Leave pending</button><button type="button" class="btn dk" data-a="fin">Finish and save</button><button type="button" class="btn pri full" data-a="pdf">Generate PDF</button></div></div>`)}`;
}
const lotsInfo=d=>{const s=d.lots.map(lotState);const ok=s.filter(x=>x==="ok").length,pe=s.filter(x=>x==="pend").length;return ok+_t(1004," inspected")+(pe?" · "+pe+_t(76,"  pending")+_pl(pe,""):"");};
const folNum=r=>{const p=parseFolio(r.folio);return p?p.n:0;};
const item=r=>`<div class="item"><div class="h"><b>${esc(r.folio)}</b><span class="bd ${r.status==="pendiente"?"pend":"ok"}">${r.status==="dup"?_t(77,"to delete"):r.status==="pendiente"?_t(76,"pending"):r.status==="completo"?"complete":r.status}</span>${r.status==="pendiente"?attBadge(r.id):""}<span style="margin-left:auto;color:var(--mu);font-size:13px">${fmtF(r.fecha)}</span></div>
 <p>${esc(r.data.codigo)||_t(78,"No code")}${r.data.desc?" · "+esc(r.data.desc):""}</p><p>${lotsInfo(r.data)}</p>
 <div class="ac"><button type="button" class="btn ${r.status==="pendiente"?"pri":""}" data-a="open" data-id="${r.id}">${r.status==="pendiente"?_t(79,"Resume"):_t(80,"Open")}${_t(81,`</button><button type="button" class="btn" data-a="pdfrec" data-id="`)}${r.id}">PDF</button><button type="button" class="btn dg" data-a="del" data-id="${r.id}${_t(82,`">Delete</button></div></div>`)}`;
function viewPendMaq(){const l=REC.filter(r=>r.status==="pendiente").sort((a,b)=>b.upd-a.upd);
 return `<div class="card"><h2 class="sh"><i>${l.length}${_t(83,`</i>Pending records</h2><p style="margin:0;color:var(--mu);font-size:13px">Records with lots not yet reworked. Resume them to add the missing lots.</p>`)}${l.length?l.map(item).join(""):_t(84,'<div class="emp">No pending records.</div>')}</div>`;}
function histList(){
 const q=HQ.trim().toLowerCase(),list=REC.filter(r=>!q||(r.folio+" "+r.data.codigo+" "+r.data.desc).toLowerCase().includes(q)),g={};
 list.forEach(r=>(g[r.mes]=g[r.mes]||[]).push(r));const ms=Object.keys(g).sort().reverse();
 if(!ms.length)return _t(85,'<div class="emp">No saved records yet.</div>');
 return ms.map((m,i)=>{const a=g[m].sort((x,y)=>folNum(y)-folNum(x)||y.upd-x.upd),pe=a.filter(r=>r.status==="pendiente").length;
  return `<details class="mes" ${i===0||q?"open":""}><summary><span>${mesName(m)}</span><small>${a.length}${_t(86,`  record`)}${_pl(a.length,"e")}${pe?" · "+pe+_t(1031," pend."):""}</small></summary>${a.map(item).join("")}<div class="row3"><button type="button" class="btn full" data-a="expm" data-id="${m}${_t(87,`">Export backup of  `)}${mesName(m)}</button></div></details>`;}).join("");
}
function viewHistMaq(){return `${_t(88,`<div class="card"><h2 class="sh"><i>▤</i>Rework records by month</h2>`)}${STORE_OK?"":_t(89,'<p style="color:var(--r);font-size:13px">This browser does not allow saving data. Export a backup before leaving.</p>')}${_t(90,`
 <input id="hq" placeholder="Search record, code or product" value="`)}${esc(HQ)}${_t(91,`" style="margin:6px 0 4px">
 <div class="row3"><button type="button" class="btn" data-a="expall">Export all</button><label class="btn" for="imp">Import backup</label></div></div><div id="hl">`)}${histList()}</div>`;}

/* Automatic sample size and Ac/Re (ANSI Z1.4 / AQL General II, normal inspection, single sampling, AQL 0.040).
   N = lot quantity in cases. Letter and sample size from AQL_T (aql.js). Plans with n<500 carry an arrow, so n=500 (0/1) is used; lot <=500 cases = 100%. Editable by hand. */
function mqPlan(N){N=parseInt(N,10);if(!(N>0))return null;if(N<=500)return{n:N,ac:0,re:1,L:"100%"};const z=aqSize(N);const n=Math.max(z.n,500);return{n,ac:n>=800?1:0,re:n>=800?2:1,L:z.L};}
function mqAuto(l,v){const p=/^\s*n/i.test(v)?null:mqPlan(v);if(!p)return;l.muestra=String(p.n);l.ac=String(p.ac);l.re=String(p.re);
 for(const k of["muestra","ac","re"]){const i=document.querySelector('[data-l="'+k+'"]');if(i)i.value=l[k];}refreshCalc();}
function refreshCalc(){const l=S.lots[S.act];auto(l);const t=$("#tot");if(t)t.textContent=defects(l);const s=document.querySelector('[data-l="dict"]');if(s)s.value=l.dict;const c=$("#chips");if(c)c.innerHTML=chips();}

/* ---------- eventos ---------- */
document.addEventListener("input",e=>{const t=e.target;
 if(t.dataset.k)S[t.dataset.k]=t.value;
 else if(t.dataset.l){let v=t.value;if(t.dataset.l==="cant"){v=/^\s*n/i.test(v)?v:v.replace(/\D/g,"");if(v!==t.value)t.value=v;}S.lots[S.act][t.dataset.l]=v;if(t.dataset.l==="cant")mqAuto(S.lots[S.act],v);}
 else if(t.dataset.r){t.value=t.value.replace(/\D/g,"");S.lots[S.act].res[+t.dataset.r]=t.value;}
 else if(t.id==="hq"){HQ=t.value;$("#hl").innerHTML=histList();return;}
 draftSoon();});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset.r!==undefined||["ac","re","lote","cant","muestra"].includes(t.dataset.l))refreshCalc();});
document.addEventListener("click",e=>{
 const sc=e.target.closest("[data-scan]");
 if(sc){TARGET=sc.dataset.scan;if(sc.dataset.src==="cam")$("#cam").click();return;}
 const tb=e.target.closest("[data-tab]");if(tb){TAB=tb.dataset.tab;render();window.scrollTo(0,0);return;}
 const ch=e.target.closest("[data-lot]");if(ch){S.act=+ch.dataset.lot;saveDraft();render();return;}
 const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,id=b.dataset.id,l=S.lots[S.act];
 if(a==="new")attGate("insp",()=>dlg({title:_t(92,"New record"),body:_t(93,"The current form will be cleared. Anything saved in History is kept."),buttons:[{t:_t(12,"Cancel")},{t:_t(92,"New record"),cls:"pri",fn:()=>{newForm();render();window.scrollTo(0,0);}}]}));
 else if(a==="autofolio"){S.folio=nextFolio(S.fecha);saveDraft();render();}
 else if(a==="all0"){l.res.fill("0");auto(l);saveDraft();render();}
 else if(a==="clr"){l.res.fill("");l.dict="";saveDraft();render();}
 else if(a==="pend")actPend();else if(a==="fin")actFin();else if(a==="pdf")actPdf();
 else if(a==="open")load(id);
 else if(a==="pdfrec"){const r=REC.find(x=>x.id===id);if(r)runPdf(r.data);}
 else if(a==="del")delGuard(id);
 else if(a==="expm")exportRecs(REC.filter(r=>r.mes===id),"Rework_records_"+id+".json");
 else if(a==="expall")exportRecs(REC,"Rework_records_backup_"+today()+".json");
});
$("#imp").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
 try{const j=JSON.parse(await f.text()),arr=Array.isArray(j)?j:j.records;let n=0;
  (arr||[]).forEach(r=>{if(!r||!r.id||!r.folio||!r.data||!Array.isArray(r.data.lots))return;const i=REC.findIndex(x=>x.id===r.id);if(i<0){REC.push(r);n++;}else if((r.upd||0)>(REC[i].upd||0)){REC[i]=r;n++;}});
  saveRecs();toast(n+_t(86,"  record")+_pl(n,"e")+_t(1005," imported")+_pl(n,"")+".");render();}catch(err){toast(_t(94,"The backup file is not valid."));}});

/* ---------- Validación SAP vs PrIME ---------- */
const VF={sap:[["gcas",_t(95,"SKU / Material"),1],["desc",_t(96,"Description")],["planta",_t(97,"Plant / Site"),1],["sloc",_t(98,"Sloc / Warehouse"),1],["lote",_t(65,"Lot"),1],["libre",_t(100,"Unrestricted")],["cal",_t(101,"Quality inspection")]],prime:[["gcas",_t(95,"SKU / Material"),1],["desc",_t(96,"Description")],["planta",_t(102,"Plant / Client ID"),1],["estatus",_t(103,"Status"),1],["sloc",_t(104,"Sloc / Warehouse ID")],["cant",_t(66,"Quantity"),1],["lote",_t(65,"Lot"),1],["lpn","LPN"]]};
const VPAT={lpn:/lpn|license|placa|pallet|load number|load no|load id|carga/,estatus:/estatus|status|estado/,desc:/descri|texto breve|description|nombre/,gcas:/gcas|material|codigo|sku|articulo|item|producto/,planta:/planta|centro|plant|site|client id|item client|cliente/,sloc:/sloc|st loc|alm|almacen|storage|ubicacion|warehouse|bodega/,lote:/lote|batch|\blot\b/,cant:/cantidad|cant\b|quantity|qty|unidades|piezas|stock/,libre:/unrestr|libre|disponible/,cal:/quality|calidad|inspec|\bqi\b/,blo:/blocked|bloque/};
const VORD={sap:["desc","gcas","planta","sloc","lote","libre","cal"],prime:["lpn","estatus","desc","gcas","planta","sloc","lote","cant"]};
const BK={libre:_t(105,"Free"),cal:_t(106,"Quality")};
const VEXC=/base unit|unit of measure|unidad de medida|\bum\b|transit|transfer|bloq|blocked|returns|devoluc|(^| )restricted use|uso restringido/;
const VTIPOS=[_t(107,"Missing in WMS"),_t(108,"Missing in ERP"),_t(66,"Quantity"),_t(103,"Status")];
let VAL={sap:null,prime:null,res:null,opt:{noR:false,sapLast:true},stmap:{},filter:"All",lim:100};
const nz=s=>String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const vG=x=>String(x==null?"":x).trim().toUpperCase().replace(/^0+(?=.)/,"");
const vU=x=>String(x==null?"":x).trim().toUpperCase();
const f2=n=>Math.round(n*1000)/1000;
function vN(x){if(typeof x==="number")return x;let s=String(x==null?"":x).trim().replace(/\s/g,"");if(!s)return 0;let neg=false;if(/-$/.test(s)){neg=true;s=s.slice(0,-1);}
 if(/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))s=s.replace(/,/g,"");else if(/^-?\d+,\d+$/.test(s))s=s.replace(",",".");const n=parseFloat(s);return isNaN(n)?0:(neg?-n:n);}
function vGuess(s){const t=nz(s);return /bloq|block|hold|retenid|cuarentena|quarantine/.test(t)?"ign":/calid|quality|insp|\bqi\b|\bqa\b/.test(t)?"cal":/libre|disponib|avail|unrestr|liberad|\bok\b|good|bueno/.test(t)?"libre":"";}
const vBucket=s=>{const b=VAL.stmap[nz(s)]||vGuess(s);return b==="blo"?"ign":b;};
function vMapRow(rows,r,kind){const used=new Set(),map={},row=rows[r]||[],mx=Math.min(kind==="prime"?8:7,row.length);VORD[kind].forEach(f=>{const re=VPAT[f];for(let c=0;c<mx;c++){if(used.has(c))continue;const h=nz(row[c]);if(kind==="sap"&&VEXC.test(h))continue;if(h&&re.test(h)){map[f]=c;used.add(c);break;}}});return map;}
function vDetect(rows,kind){let b={n:-1,row:0,map:{}};for(let r=0;r<Math.min(rows.length,40);r++){const m=vMapRow(rows,r,kind),n=Object.keys(m).length;if(n>b.n)b={n,row:r,map:m};}return b;}
function vParse(kind){const f=VAL[kind];f.ws=f.wb.Sheets[f.sheet];const rg=f.ws["!ref"]?XLSX.utils.decode_range(f.ws["!ref"]):{s:{r:0,c:0}};f.r0=rg.s.r;f.c0=rg.s.c;
 f.rows=XLSX.utils.sheet_to_json(f.ws,{header:1,raw:true,defval:"",blankrows:true});const d=vDetect(f.rows,kind);f.hdr=d.row;f.map=d.map;}
async function vLoad(kind,file){
 if(typeof XLSX==="undefined"){toast(_t(110,"Could not load the Excel reader. Check your connection."));return;}
 busy(_t(111,"Reading  ")+file.name+"…");
 try{const wb=XLSX.read(await file.arrayBuffer(),{type:"array"});VAL[kind]={name:file.name,wb,sheet:wb.SheetNames[0]};vParse(kind);}
 catch(e){toast(_t(112,"Could not open the file. Make sure it is Excel (.xlsx, .xls) or CSV."));}
 finally{OCRON=false;busy("");}
 VAL.res=null;render();}
function vStatuses(){const f=VAL.prime;if(!f||f.map.estatus==null||f.map.cant==null||f.map.gcas==null)return[];const m=new Map();
 for(let i=f.hdr+1;i<f.rows.length;i++){const r=f.rows[i];if(!vG(r[f.map.gcas]))continue;const s=String(r[f.map.estatus]==null?"":r[f.map.estatus]).trim()||_t(113,"(empty)"),e=m.get(s)||{s,n:0,q:0};e.n++;e.q+=vN(r[f.map.cant]);m.set(s,e);}
 return [...m.values()];}
function vLpn(f,i){const v=f.rows[i][f.map.lpn];if(typeof v==="number"){const c=f.ws[XLSX.utils.encode_cell({r:f.r0+i,c:f.c0+f.map.lpn})];return String(c&&c.w?c.w:v).replace(/\s/g,"");}return String(v==null?"":v).trim();}
function vMissing(){const m=[];["sap","prime"].forEach(k=>{const f=VAL[k],n=k==="sap"?"SAP":_t(114,"WMS");if(!f){m.push(_t(115,"the file from  ")+n);return;}VF[k].filter(x=>x[2]).forEach(x=>{if(f.map[x[0]]==null)m.push(n+_t(116,": the column  ")+x[1]);});});
 const f=VAL.sap;if(f&&f.map.libre==null&&f.map.cal==null&&f.map.blo==null)m.push(_t(117,"ERP: at least one quantity column"));
 if(VAL.prime&&VAL.prime.map.estatus!=null&&vStatuses().some(x=>!vBucket(x.s)))m.push(_t(118,"WMS: map all statuses"));return m;}
function vBuild(){
 const sap=VAL.sap,pr=VAL.prime,ln=l=>vU(l),isTot=x=>/^(total|overall|grand|resultado|result|suma|gran total)/i.test(String(x==null?"":x).trim());
 const MS=new Map(),MP=new Map(),inf={sap:{n:0,g:new Set()},pr:{n:0,g:new Set(),lpn:new Set(),dup:new Map(),bad:[],ign:0,by:new Map()}};
 const NS=pr.map.sloc==null;
 let sapEnd=sap.rows.length-1;while(sapEnd>sap.hdr&&sap.rows[sapEnd].every(c=>c===""||c==null))sapEnd--;
 inf.sap.skip=0;{const lr=sap.rows[sapEnd]||[];if(VAL.opt.sapLast&&sapEnd>sap.hdr&&!(vG(lr[sap.map.gcas])&&vU(lr[sap.map.planta])&&(NS||vU(lr[sap.map.sloc]))))inf.sap.skip=sapEnd;}
 for(let i=sap.hdr+1;i<sap.rows.length;i++){if(inf.sap.skip&&i===inf.sap.skip)continue;const r=sap.rows[i],raw=r[sap.map.gcas],g=vG(raw);if(!g||isTot(raw))continue;
  const lr=String(r[sap.map.lote]==null?"":r[sap.map.lote]).trim(),p=vU(r[sap.map.planta]),s=NS?"":vU(r[sap.map.sloc]),k=g+"|"+ln(lr)+"|"+p+"|"+s;
  let e=MS.get(k);if(!e){e={g,l:ln(lr),lraw:lr,pl:p,sl:s,desc:"",libre:0,cal:0,blo:0,rows:[],lpns:[]};MS.set(k,e);}
  if(sap.map.libre!=null)e.libre+=vN(r[sap.map.libre]);if(sap.map.cal!=null)e.cal+=vN(r[sap.map.cal]);if(sap.map.blo!=null)e.blo+=vN(r[sap.map.blo]);
  if(!e.desc&&sap.map.desc!=null)e.desc=String(r[sap.map.desc]==null?"":r[sap.map.desc]).trim();
  e.rows.push(sap.r0+i+1);inf.sap.n++;inf.sap.g.add(g);}
 for(let i=pr.hdr+1;i<pr.rows.length;i++){const r=pr.rows[i],raw=r[pr.map.gcas],g=vG(raw);if(!g||isTot(raw))continue;
  const st=String(r[pr.map.estatus]==null?"":r[pr.map.estatus]).trim()||_t(113,"(empty)"),b=vBucket(st),q=vN(r[pr.map.cant]),row=pr.r0+i+1;
  const y=inf.pr.by.get(st)||{n:0,q:0,b};y.n++;y.q+=q;inf.pr.by.set(st,y);inf.pr.n++;inf.pr.g.add(g);
  const lpn=pr.map.lpn!=null?vLpn(pr,i):"";
  if(lpn){inf.pr.lpn.add(lpn);let a=inf.pr.dup.get(lpn);if(!a)inf.pr.dup.set(lpn,a=[]);a.push(row);if(!/^\d{20}$/.test(lpn))inf.pr.bad.push([lpn,row]);}
  if(b==="ign"){inf.pr.ign++;continue;}
  const lr=String(r[pr.map.lote]==null?"":r[pr.map.lote]).trim(),p=vU(r[pr.map.planta]),s=NS?"":vU(r[pr.map.sloc]),k=g+"|"+ln(lr)+"|"+p+"|"+s;
  let e=MP.get(k);if(!e){e={g,l:ln(lr),lraw:lr,pl:p,sl:s,desc:"",libre:0,cal:0,blo:0,rows:[],lpns:[]};MP.set(k,e);}
  e[b]+=q;e.rows.push(row);if(lpn)e.lpns.push(lpn);
  if(!e.desc&&pr.map.desc!=null)e.desc=String(r[pr.map.desc]==null?"":r[pr.map.desc]).trim();}
 return {MS,MP,inf};}
function vRun(){
 gstInc("val");
 const {MS,MP,inf}=vBuild(),D=[],eq=(x,y)=>Math.abs(x-y)<0.0005;
 /* Igual que la macro: llave = GCAS + lote + planta + sloc. El orden y el número de filas de cada lado no importan. */
 const add=(t,o)=>D.push(Object.assign({t,g:"",l:"",pl:"",sl:"",S:[],P:[],txt:""},o));
 const other=(M,e)=>[...M.values()].filter(x=>x.g===e.g&&x.l===e.l&&x.k!==e.k);
 const hint=(M,e,n)=>{const o=other(M,e);return o.length?_t(119,"  Note: the same SKU and lot does exist in  ")+n+_t(120,"  with plant/sloc ")+[...new Set(o.map(x=>x.pl+"/"+x.sl))].join(", ")+".":"";};
 for(const [k,e] of MS){e.k=k;} for(const [k,e] of MP){e.k=k;}
 for(const [k,s] of MS){const p=MP.get(k);
  if(!p){add(_t(107,"Missing in WMS"),{g:s.g,l:s.lraw,pl:s.pl,sl:s.sl,S:[s],P:[],txt:_t(121,"Plant  ")+s.pl+", sloc "+(s.sl||"—")+_t(122,": is in ERP and not in WMS. ERP quality  ")+f2(s.cal)+(s.libre?_t(123,"  · ERP free  ")+f2(s.libre):"")+"."+hint(MP,s,_t(114,"WMS"))});continue;}
  if(eq(s.libre,p.libre)&&eq(s.cal,p.cal))continue;
  const ta=s.libre+s.cal,tb=p.libre+p.cal,same=eq(ta,tb),dif=Object.keys(BK).filter(x=>!eq(s[x],p[x])).map(x=>BK[x]+": SAP "+f2(s[x])+_t(124,"  · WMS  ")+f2(p[x]));
  add(same?_t(103,"Status"):_t(66,"Quantity"),{g:s.g,l:s.lraw,pl:s.pl,sl:s.sl,S:[s],P:[p],txt:(same?_t(125,"Total quantity matches (")+f2(ta)+_t(126,") but the status changes.  "):_t(127,"Quantity does not match (ERP  ")+f2(ta)+_t(124,"  · WMS  ")+f2(tb)+"). ")+dif.join(" | ")});}
 for(const [k,p] of MP)if(!MS.has(k))add(_t(108,"Missing in ERP"),{g:p.g,l:p.lraw,pl:p.pl,sl:p.sl,S:[],P:[p],txt:_t(121,"Plant  ")+p.pl+", sloc "+(p.sl||"—")+_t(128,": is in WMS and not in ERP. WMS quantity  ")+f2(p.libre+p.cal)+"."+hint(MS,p,"SAP")});
 D.sort((a,b)=>VTIPOS.indexOf(a.t)-VTIPOS.indexOf(b.t)||a.g.localeCompare(b.g));
 const sm=(M,k)=>{let t=0;for(const e of M.values())t+=e[k];return f2(t);};
 VAL.res={ns:VAL.prime.map.sloc==null,D,names:[VAL.sap.name,VAL.prime.name],at:new Date(),
  sap:{n:inf.sap.n,g:inf.sap.g.size,c:MS.size,skip:inf.sap.skip?VAL.sap.r0+inf.sap.skip+1:0,libre:sm(MS,"libre"),cal:sm(MS,"cal"),blo:0},
  pr:{n:inf.pr.n,g:inf.pr.g.size,c:MP.size,lpn:inf.pr.lpn.size,ign:inf.pr.ign,libre:sm(MP,"libre"),cal:sm(MP,"cal"),blo:0,by:[...inf.pr.by].map(x=>({s:x[0],n:x[1].n,q:f2(x[1].q),b:x[1].b}))}};
 VAL.filter="All";VAL.lim=100;
 try{hlogAdd({k:"val",t:_t(129,"ERP vs WMS validation"),s:(D.length?D.length+_t(130,"  difference")+_pl(D.length,"en"):_t(131,"All OK"))+" · "+VAL.sap.name+" vs "+VAL.prime.name,st:D.length?"dif":"ok"});}catch(e){}}
/* --- vistas --- */
const vColOpts=(f,cur,kind)=>{const h=f.rows[f.hdr]||[],mx=kind==="prime"?Math.min(8,h.length):h.length;let o="";for(let c=0;c<mx;c++)o+=`<option value="${c}" ${c===cur?"selected":""}>${XLSX.utils.encode_col(c+f.c0)}: ${esc(String(h[c]==null?"":h[c]).trim()||_t(113,"(empty)"))}</option>`;return o;};
function vFileCard(kind,title,n){
 const f=VAL[kind],fields=VF[kind];
 let h=`<div class="card"><h2 class="sh"><i>${n}</i>${title}${_t(132,`</h2><label class="btn  `)}${f?"":"pri"}" for="f${kind}" style="display:block">${f?_t(133,"Change file"):_t(134,"Choose Excel file")}</label>`;
 if(f){const miss=fields.filter(x=>x[2]&&f.map[x[0]]==null).map(x=>x[1]);
  h+=`<p class="vf">${esc(f.name)} · ${f.rows.length}${_t(135,`  rows</p><p class="vf" style="margin-top:4px">`)}${kind==="sap"?_t(136,"The Blocked, Base Unit of Measure and Transit and Transfer columns and the last totals row are ignored."):_t(137,"Only columns A to H are read; column I onward is ignored.")}</p>`;
  if(f.wb.SheetNames.length>1)h+=`${_t(138,`<label class="lb">Sheet</label><select data-vs="`)}${kind}">${f.wb.SheetNames.map(s=>`<option ${s===f.sheet?"selected":""}>${esc(s)}</option>`).join("")}</select>`;
  h+=`<details class="vd" ${miss.length?"open":""}${_t(139,`><summary>Detected columns · headers in row  `)}${f.r0+f.hdr+1}${miss.length?_t(140,"  · missing:  ")+miss.join(", "):""}${_t(141,`</summary>
  <label class="lb">Header row</label><input type="number" min="1" data-vh="`)}${kind}" value="${f.r0+f.hdr+1}">
  ${fields.map(x=>`<label class="lb">${x[1]}${x[2]?" *":""}</label><select data-vm="${kind}:${x[0]}${_t(142,`"><option value="">— do not use —</option>`)}${vColOpts(f,f.map[x[0]],kind)}</select>`).join("")}</details>`;}
 return h+`</div>`;}
const vRows=(a,lim)=>{const r=a.reduce((x,e)=>x.concat(e.rows),[]);return r.length?_t(143,"row")+_pl(r.length,"n")+" "+r.slice(0,lim).join(", ")+(r.length>lim?" … +"+(r.length-lim):""):"—";};
function vSide(a,prime){if(!a.length)return _t(144,"<span style=\"color:var(--mu)\">No records</span>");
 return a.slice(0,4).map(e=>`${esc(e.pl)} / ${esc(e.sl)} · ${vRows([e],6)}${_t(145,`<br>Free  `)}${f2(e.libre)}${_t(146,`  · Quality  `)}${f2(e.cal)}${prime&&e.lpns.length?"<br>LPN: "+e.lpns.slice(0,4).map(esc).join(", ")+(e.lpns.length>4?" … +"+(e.lpns.length-4):""):""}`).join("<hr style=\"border:0;border-top:1px solid var(--bd);margin:6px 0\">")+(a.length>4?"<br>… +"+(a.length-4)+_t(147,"  more"):"");}
function vResHtml(){
 const R=VAL.res,D=R.D,ok=!D.length,cnt={};D.forEach(d=>cnt[d.t]=(cnt[d.t]||0)+1);
 const lst=VAL.filter==="All"?D:D.filter(d=>d.t===VAL.filter),shown=lst.slice(0,VAL.lim);
 const row=(n,a,b)=>`<tr><td>${n}</td><td>${a}</td><td>${b}</td><td style="color:${Math.abs(a-b)<0.0005?"var(--ok)":"var(--r)"};font-weight:700">${Math.abs(a-b)<0.0005?"OK":f2(a-b)}</td></tr>`;
 const ts=R.sap.libre+R.sap.cal,tp=R.pr.libre+R.pr.cal;
 let h=`<div id="vres"><div class="vbanner ${ok?"ok":"no"}">${ok?_t(148,"All OK: ERP and WMS match on SKU, lot, plant, sloc, quantities and status."):D.length+_t(130,"  difference")+_pl(D.length,"en")+_t(1006," found")+_pl(D.length,"")+"."}${_t(149,`</div>
 <div class="card"><h2 class="sh"><i>▤</i>Summary</h2>
    `)}${R.ns?`${_t(150,`<p class="mu" style="margin:0 0 10px;font-size:13px">WMS has no Sloc column: compared by SKU, lot and plant (without Sloc).</p>`)}`:""}<div class="vsum"><div class="vs"><b>${R.sap.n}${_t(151,`</b><span>ERP rows ·  `)}${R.sap.g}${_t(152,`  SKUs`)}${R.sap.skip?_t(153,"  · row  ")+R.sap.skip+_t(1007," ignored"):""}</span></div><div class="vs"><b>${R.pr.n}${_t(154,`</b><span>WMS rows ·  `)}${R.pr.g}${_t(155,`  SKUs</span></div><div class="vs"><b>`)}${R.sap.c}${_t(156,`</b><span>SKU/lot/plant/sloc combinations in ERP</span></div><div class="vs"><b>`)}${R.pr.c}${_t(157,`</b><span>combinations in WMS</span></div><div class="vs"><b>`)}${R.pr.lpn}${_t(158,`</b><span>unique LPNs in WMS</span></div><div class="vs"><b>`)}${R.pr.ign}${_t(159,`</b><span>WMS rows ignored</span></div></div>
  <table class="vt"><tr><th>Quantities</th><th>ERP</th><th>WMS</th><th>Diff.</th></tr>`)}${row(_t(105,"Free"),R.sap.libre,R.pr.libre)}${row(_t(106,"Quality"),R.sap.cal,R.pr.cal)}${row(_t(160,"<b>Total</b>"),f2(ts),f2(tp))}${_t(161,`</table>
  <table class="vt"><tr><th>WMS status</th><th>Rows</th><th>Qty</th><th>Maps to</th></tr>`)}${R.pr.by.map(x=>`<tr><td>${esc(x.s)}</td><td>${x.n}</td><td>${x.q}</td><td>${x.b==="ign"?_t(162,"Ignored"):BK[x.b]||"—"}</td></tr>`).join("")}</table>
  <p style="font-size:12px;color:var(--mu);margin:8px 0 0">${esc(R.names[0])} vs ${esc(R.names[1])} · ${R.at.toLocaleString(_t(163,"en-US"))}${_t(164,`</p>
  <div class="row3"><button type="button" class="btn dk full" data-va="exp">Download Excel with details</button></div></div>`)}`;
 if(!ok){h+=`${_t(165,`<div class="card"><h2 class="sh"><i>!</i>Differences<em>`)}${lst.length}${_t(166,`</em></h2><div class="vc"><button type="button" data-va="flt" data-t="All" class="`)}${VAL.filter==="All"?"on":""}${_t(167,`">All  `)}${D.length}</button>${VTIPOS.filter(t=>cnt[t]).map(t=>`<button type="button" data-va="flt" data-t="${t}" class="${VAL.filter===t?"on":""}">${t} ${cnt[t]}</button>`).join("")}</div>`;
  h+=shown.map(d=>{const ds=(d.S[0]&&d.S[0].desc)||(d.P[0]&&d.P[0].desc)||"";
   return `<div class="vx"><div class="t"><span class="tg">${d.t}</span><b>${esc(d.g)}${d.l?_t(168,"  · lot  ")+esc(d.l):""}</b></div>${ds?`<p style="margin:2px 0 0;font-size:12px;color:var(--mu)">${esc(ds)}</p>`:""}<p style="margin:6px 0 0;font-size:13px">${esc(d.txt)}</p>${d.S.length||d.P.length?`<div class="sd"><div><b>SAP</b>${vSide(d.S,false)}${_t(169,`</div><div><b>WMS</b>`)}${vSide(d.P,true)}</div></div>`:""}</div>`;}).join("");
  if(lst.length>shown.length)h+=`${_t(170,`<div class="row3"><button type="button" class="btn full" data-va="more">Show more (`)}${lst.length-shown.length})</button></div>`;
  h+=`</div>`;}
 return h+`</div>`;}
function viewVal(){
 const st=VAL.prime?vStatuses():[],miss=vMissing();
 let h=`${_t(171,`<div class="card"><p style="margin:0;color:var(--mu);font-size:13px">Upload the inventory exported from the ERP and the one from the WMS, as you export them. SKU, lot, plant, sloc, quantities and status are validated. Only the WMS file carries LPN. Files are read on your device and are not uploaded to any server.</p></div>`)}`;
 h+=vFileCard("sap",_t(172,"ERP file"),1)+vFileCard("prime",_t(173,"WMS file (with LPN)"),2);
 if(st.length)h+=`${_t(174,`<div class="card"><h2 class="sh"><i>3</i>WMS status<em>mapping to ERP</em></h2><p style="margin:0 0 4px;color:var(--mu);font-size:13px">The ERP is compared in Free (Unrestricted) and Quality (Quality Inspection). Assign each WMS status to one of them, or choose Ignore (for example, Blocked). It is saved for next time.</p>
    `)}${st.map(x=>{const cur=VAL.stmap[nz(x.s)]||vGuess(x.s);return `<div class="crit"><p><b style="color:var(--tx)">${esc(x.s)}</b><br><span style="font-size:12px;color:var(--mu)">${x.n}${_t(175,`  rows · quantity  `)}${f2(x.q)}</span></p><select style="width:150px;flex:none" data-vst="${esc(x.s)}">${[["",_t(176,"Choose…")],["libre",_t(105,"Free")],["cal",_t(106,"Quality")],["ign",_t(177,"Ignore")]].map(o=>`<option value="${o[0]}" ${o[0]===cur?"selected":""}>${o[1]}</option>`).join("")}</select></div>`;}).join("")}</div>`;
 h+=`<div class="card"><h2 class="sh"><i>${st.length?4:3}${_t(178,`</i>Compare</h2><label class="lrow"><span>Ignore the last ERP row (totals)</span><input type="checkbox" class="sw" data-vo="sapLast"  `)}${VAL.opt.sapLast?"checked":""}></label>
  ${miss.length?`${_t(179,`<p style="margin:0 0 10px;color:var(--wn);font-size:13px">Missing:  `)}${esc(miss.slice(0,3).join(" · "))}</p>`:""}
  <div class="row3"><button type="button" class="btn pri" data-va="cmp" ${miss.length?"disabled style=\"opacity:.5\"":""}${_t(1023,`>Compare files</button><button type="button" class="btn" data-va="clr">Clear</button></div></div>`)}`;
 return h+(VAL.res?vResHtml():"");}
function vExport(){
 const R=VAL.res;if(!R||typeof XLSX==="undefined")return;
 const sumA=(a,k)=>f2(a.reduce((x,e)=>x+e[k],0)),rowsA=a=>a.reduce((x,e)=>x.concat(e.rows),[]).join(", "),lp=a=>a.reduce((x,e)=>x.concat(e.lpns),[]).join(", ");
 const ts=R.sap.libre+R.sap.cal,tp=R.pr.libre+R.pr.cal;
 const r1=[[_t(129,"ERP vs WMS validation")],[_t(172,"ERP file"),R.names[0]],[_t(182,"WMS file"),R.names[1]],[_t(183,"Date"),R.at.toLocaleString(_t(163,"en-US"))],[_t(184,"Result"),R.D.length?R.D.length+_t(185,"  differences"):_t(131,"All OK")],[],["","SAP",_t(114,"WMS"),_t(186,"Difference")],[_t(187,"Rows"),R.sap.n,R.pr.n,""],[_t(188,"Unique SKUs"),R.sap.g,R.pr.g,""],[_t(189,"SKU/lot/plant/sloc combinations"),R.sap.c,R.pr.c,""],[_t(190,"Unique LPNs"),"",R.pr.lpn,""],[_t(105,"Free"),R.sap.libre,R.pr.libre,f2(R.sap.libre-R.pr.libre)],[_t(106,"Quality"),R.sap.cal,R.pr.cal,f2(R.sap.cal-R.pr.cal)],[_t(191,"Total"),f2(ts),f2(tp),f2(ts-tp)],[],[_t(192,"WMS status"),_t(187,"Rows"),_t(66,"Quantity"),_t(193,"Maps to")]].concat(R.pr.by.map(x=>[x.s,x.n,x.q,x.b==="ign"?_t(162,"Ignored"):BK[x.b]||""]));
 const r2=[[_t(194,"Type"),_t(152,"SKU"),_t(65,"Lot"),_t(121,"Plant"),_t(197,"Sloc"),_t(198,"ERP rows"),_t(199,"ERP free"),_t(200,"ERP quality"),_t(201,"WMS rows"),_t(202,"WMS LPN"),_t(203,"WMS free"),_t(204,"WMS quality"),_t(205,"Detail")]].concat(R.D.map(d=>[d.t,d.g,d.l,d.pl||(d.S[0]||d.P[0]||{}).pl||"",d.sl||(d.S[0]||d.P[0]||{}).sl||"",rowsA(d.S),sumA(d.S,"libre"),sumA(d.S,"cal"),rowsA(d.P),lp(d.P),sumA(d.P,"libre"),sumA(d.P,"cal"),d.txt]));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(r1),_t(206,"Summary"));XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(r2),_t(207,"Differences"));
 const out=XLSX.write(wb,{bookType:"xlsx",type:"array"});
 saveBlob(_t(208,"Validation_ERP_vs_WMS_")+today()+".xlsx",new Blob([out],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));}
/* --- eventos --- */
async function vPick(kind,e){const f=e.target.files[0];e.target.value="";if(f)await vLoad(kind,f);}
$("#fsap").addEventListener("change",e=>vPick("sap",e));$("#fprime").addEventListener("change",e=>vPick("prime",e));
document.addEventListener("change",e=>{const t=e.target,d=t.dataset;
 if(d.vs){const k=d.vs;VAL[k].sheet=t.value;vParse(k);VAL.res=null;render();}
 else if(d.vh){const k=d.vh,f=VAL[k];f.hdr=Math.max(0,Math.min(f.rows.length-1,(+t.value||1)-1-f.r0));f.map=vMapRow(f.rows,f.hdr,k);VAL.res=null;render();}
 else if(d.vm){const p=d.vm.split(":");VAL[p[0]].map[p[1]]=t.value===""?undefined:+t.value;VAL.res=null;render();}
 else if(d.vst!==undefined){VAL.stmap[nz(d.vst)]=t.value;U.set("stmap",VAL.stmap);VAL.res=null;render();}
 else if(d.vo){VAL.opt[d.vo]=t.checked;VAL.res=null;render();}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-va]");if(!b||b.disabled)return;const a=b.dataset.va;
 if(a==="cmp"){const m=vMissing();if(m.length){toast(_t(209,"Missing:  ")+m[0]);return;}busy(_t(210,"Comparing…"));
  setTimeout(()=>{try{vRun();}catch(err){toast(_t(211,"Could not compare:  ")+(err&&err.message||err));}busy("");render();const r=$("#vres");if(r)r.scrollIntoView();},30);}
 else if(a==="flt"){VAL.filter=b.dataset.t;VAL.lim=100;render();}
 else if(a==="more"){VAL.lim+=100;render();}
 else if(a==="exp")vExport();
 else if(a==="clr"){VAL.sap=null;VAL.prime=null;VAL.res=null;render();}});

/* ---------- Cuentas, perfil y navegación ---------- */
let ME=null,AUTH={mode:"menu",f:{},err:""};
let USERS=LS.get("wq:users",[]);if(!Array.isArray(USERS))USERS=[];
const saveUsers=()=>LS.set("wq:users",USERS);
const U={get(k,d){return ME&&!ME.guest?LS.get("wq:u"+ME.emp+":"+k,d):LS.get("wq:ug:"+k,d);},set(k,v){if(ME&&!ME.guest){const r=LS.set("wq:u"+ME.emp+":"+k,v);cloudSoon();if(typeof teamSoon==="function")teamSoon();return r;}return LS.set("wq:ug:"+k,v);}};
const GLYPH='<svg viewBox="0 0 24 24"><g class="lp"><rect x="4.5" y="10" width="6" height="5" rx=".6"/><rect x="11.5" y="10" width="6" height="5" rx=".6"/><rect x="8" y="5.5" width="6" height="4.5" rx=".6"/><path d="M3 16h18v2.2H3zM5 18.2v2.3M12 18.2v2.3M19 18.2v2.3"/></g><circle class="bk" cx="18.2" cy="6" r="4.4"/><path class="ck" d="M16.2 6l1.5 1.5 2.8-3"/></svg>';
const IC={insp:'<path d="M9 4h6l1 2h3v14H5V6h3z"/><path d="M9 13l2 2 4-4"/>',pend:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',hist:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',val:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',rcv:'<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',perfil:'<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>',home:'<path d="M4 11l8-7 8 7v9H5z"/><path d="M10 20v-6h4v6"/>',sur:'<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',dash:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="4" rx="1.5"/><rect x="13" y="10" width="7" height="10" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/>',more:'<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>'};
const TNAME={home:_t(212,"Home"),rcv:_t(213,"Receiving"),sur:_t(214,"Picking"),val:_t(215,"Validation"),insp:_t(216,"Rework"),dash:_t(217,"Dashboards"),pend:_t(218,"Pending"),hist:_t(219,"History"),more:_t(220,"More"),perfil:_t(221,"Profile"),admin:_t(222,"Admin"),l3d:_t(223,"3D Layout")};
const initials=u=>((u.nombre||_t(30,"?"))[0]+((u.apellido||"")[0]||"")).toUpperCase();
const titleCase=s=>s.trim().replace(/\s+/g," ").toLowerCase().replace(/(^|[\s'-])([a-záéíóúüñ])/g,(m,a,b)=>a+b.toUpperCase());
const NAME_RE=/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{2,40}$/;
async function hashPin(emp,pin){try{const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("wq|"+emp+"|"+pin));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}catch(e){return "x"+btoa(emp+":"+pin);}}
function loadUserData(){REC=U.get("rec",[]);if(!Array.isArray(REC))REC=[];WARN=U.get("warn",{dup:{},del:{}});WARN.dup=WARN.dup||{};WARN.del=WARN.del||{};VAL.stmap=U.get("stmap",{});
 const d=U.get("draft",null);if(d&&d.id&&Array.isArray(d.lots)&&d.lots.length===5)S=d;else newForm();lpLoad();hlogLoad();dshLoad();attLoad();GPL="";setTimeout(()=>{marksPull();gPush();if(typeof teamSync==="function")teamSync();},2500);}
function enterUser(u){ME={emp:u.emp,nombre:u.nombre,apellido:u.apellido,guest:false};LS.set("wq:session",{emp:u.emp});AUTH={mode:"menu",f:{},err:""};loadUserData();TAB="home";render();window.scrollTo(0,0);cloudStart();}
const ALLOW=[{id:"demo",n:"Demo",a:"Visitor",h:"",r:"v"}];
const isAdm=()=>!!(ME&&ME.role==="admin");
const normNm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
async function hashAcc(nm,code){const t="wq|acc|"+nm+"|"+String(code||"").toUpperCase().replace(/\s/g,"");try{const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}catch(e){return "";}}
function allowMe(u){let emp="U"+u.id;if(u.adm){const m=USERS.find(x=>normNm(x.nombre)===normNm(u.n)&&normNm(x.apellido).split(" ")[0]===normNm(u.a))||(USERS.length===1?USERS[0]:null);if(m)emp=m.emp;}return {emp,nombre:u.n,apellido:u.a,guest:false,al:!u.adm,role:u.r==="a"?"admin":"visitor",named:u.id!=="demo"};}
function enterAllow(u){ME=allowMe(u);LS.set("wq:session",{al:u.id});AUTH={mode:"menu",f:{},err:""};loadUserData();TAB="home";render();window.scrollTo(0,0);cloudStart();}
async function doAccess(){const f=AUTH.f,nm=normNm((f.an||"")+" "+(f.aa||"")),code=f.ac||"";
 if(!nm||!code)return authErr(_t(224,"Enter your first name, last name and code."));
 const hs=await hashAcc(nm,code),u=ALLOW.find(x=>normNm(x.n+" "+x.a)===nm&&x.h===hs);
 if(!u)return authErr(_t(225,"Wrong name or code. If you do not have access, request it from the app owner."));
 enterAllow(u);}
function logout(){if(typeof TEAM!=="undefined"){TEAM=[];TSIG="";}lpReset();ME=null;S=null;REC=[];WARN={dup:{},del:{}};VAL.sap=null;VAL.prime=null;VAL.res=null;LS.set("wq:session",null);AUTH={mode:"menu",f:{},err:""};TAB="home";render();window.scrollTo(0,0);}
function authErr(t){AUTH.err=t;renderAuth();}
async function doLogin(){const f=AUTH.f,emp=(f.emp||"").trim();let u=USERS.find(x=>x.emp===emp);
 if(f.curl&&f.curl.trim()&&f.curl.trim()!==cloudCfg())LS.set("wq:cloud",{url:normUrl(f.curl)});
 if(!u)return authErr(_t(226,"There is no admin account with that number on this device."));
 if(cloudCfg()){const ra=await cloudGet(emp);if(ra&&ra.acct){if(ra.acct.off)return authErr(_t(227,"This account is suspended. Contact the administrator."));if(ra.acct.reset&&ra.acct.reset>(u.resetSeen||0)){u.pin=null;u.resetSeen=ra.acct.reset;saveUsers();}}}
 if(u.pin&&(await hashPin(emp,f.pin||""))!==u.pin)return authErr(_t(1012,"Incorrect PIN."));
 enterUser(u);}
async function doSignup(){const f=AUTH.f,nombre=titleCase(f.nombre||""),apellido=titleCase(f.apellido||""),emp=(f.emp||"").trim();
 if(!NAME_RE.test(nombre))return authErr(_t(228,"Enter your first name (letters only)."));
 if(!NAME_RE.test(apellido))return authErr(_t(229,"Enter your last name (letters only)."));
 if(!/^\d{4,8}$/.test(emp))return authErr(_t(230,"The employee number must be digits only (normally 5)."));
 if(USERS.some(x=>x.emp===emp))return authErr(_t(231,"An account with that employee number already exists on this device. Sign in."));
 if(cloudCfg()){const ra=await cloudGet(emp);if(ra&&ra.acct&&ra.acct.nombre)return authErr(_t(232,"That employee number already has an account on the server. Sign in."));}
 let pin=null;
 if(f.usepin){if(!/^\d{4}$/.test(f.pin||""))return authErr(_t(233,"The PIN must be 4 digits."));if(f.pin!==f.pin2)return authErr(_t(234,"The PINs do not match."));pin=await hashPin(emp,f.pin);}
 const make=()=>{const first=USERS.length===0,u={emp,nombre,apellido,pin,created:Date.now()};USERS.push(u);saveUsers();
  if(first)["rec","warn","draft","stmap"].forEach(k=>{const v=LS.get("wq:"+k,null);if(v!=null)LS.set("wq:u"+emp+":"+k,v);});
  enterUser(u);};
 if(emp.length!==5)dlg({title:_t(235,"Employee number"),body:_t(236,"It normally has 5 digits. Do you confirm that  ")+emp+_t(999," is correct?"),buttons:[{t:_t(990,"Fix")},{t:_t(991,"Confirm"),cls:"pri",fn:make}]});else make();}
const FOOT=_t(1030,'<footer class="foot">Demo · Developed by Manuel Chagala Domínguez</footer>');
function renderAuth(){
 document.body.classList.add("noauth");$("#tabs").innerHTML="";
 const A=AUTH,f=A.f,v=k=>esc(f[k]||""),er=A.err?`<div class="aerr">${esc(A.err)}</div>`:"";
 let h=`<div class="aw"><div class="aicon">${GLYPH}${_t(1014,`</div><h1 style="font-size:26px;line-height:1.15">Logistics Control</h1><p class="asub">Demo site</p>`)}`;
 if(A.mode==="menu")h+=`${_t(237,`<div class="card"><label class="lb">First name</label><input data-au="an" autocomplete="off" autocapitalize="words" maxlength="30" placeholder="First name" value="`)}${v("an")}${_t(1015,`"><label class="lb">Last name</label><input data-au="aa" autocomplete="off" autocapitalize="words" maxlength="30" placeholder="Last name" value="`)}${v("aa")}${_t(239,`"><label class="lb">Access code</label><input data-au="ac" type="password" autocomplete="off" autocapitalize="characters" maxlength="12" placeholder="Code" value="`)}${v("ac")}"></div>${er}${enterBlock()}`;
 else h+=`${_t(241,`<h2 style="margin:0 0 10px;font-size:20px">Admin access</h2>`)}`+(USERS.length?`<div class="lst">${USERS.map(u=>`<button type="button" class="lr ${f.emp===u.emp?"on":""}" data-ua="pick:${esc(u.emp)}"><span class="av">${esc(initials(u))}</span><span><b>${esc(u.nombre+" "+u.apellido)}</b><small>No. ${esc(u.emp)}${u.pin?_t(242,"  · with PIN"):""}</small></span></button>`).join("")}</div>`:"")+er
  +`${_t(243,`<div class="card"><label class="lb">Employee number</label><input data-au="emp" inputmode="numeric" maxlength="8" autocomplete="off" value="`)}${v("emp")}${_t(1016,`" placeholder="12345"><label class="lb">PIN (if you set one)</label><input data-au="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" value="`)}${v("pin")}" placeholder="••••"></div><div class="abtns"><button type="button" class="btn pri" data-ua="doLogin">Enter</button><button type="button" class="btn txt" data-ua="mode:menu">Volver</button></div>`;
 $("#app").innerHTML=h+`</div>`+FOOT;}
function viewPerfil(){let h=viewPerfil0();if(!isAdm())h=h.replace(/<button[^>]*data-ua="demoreset"[^>]*>[^<]*<\/button>/,"");return h+`<div class="card"><button type="button" class="btn" style="width:100%" data-ua="logout">${ME&&ME.named?_t(1037,"Sign out"):_t(1033,"Sign in with access code")}</button></div>`;}
function viewPerfil0(){const g=ME.guest,th=LS.get("wq:theme","system");
 return `<div class="card center"><div class="av big">${esc(initials(ME))}</div><h2 class="nm">${esc(g?ME.nombre:ME.nombre+" "+ME.apellido)}<span class="tg" style="margin-left:8px;font-size:11px;vertical-align:middle">${isAdm()?_t(1034,"Administrator"):_t(1035,"Visitor")}</span>${_t(1017,`</h2><p class="mu" style="margin:4px 0 0">Demo visitor · data stays on this device</p></div>
 `)}${g?`<div class="card"><h2 class="sh">${_t(1028,"Your name")}</h2><input data-gn value="${esc(ME.nombre==="Visitor"?"":ME.nombre)}"${_t(1029,` maxlength="30" placeholder="What should I call you"></div>`)}`:""}${langCard()}${_t(251,`
 <div class="card"><h2 class="sh">Appearance</h2><div class="seg">`)}${[["system",_t(252,"System")],["light",_t(253,"Light")],["dark",_t(254,"Dark")]].map(o=>`<button type="button" class="${th===o[0]?"on":""}" data-ua="theme:${o[0]}">${o[1]}</button>`).join("")}${_t(1018,`</div></div>
 <div class="card"><h2 class="sh">Install on your phone</h2><p class="mu" style="margin:6px 0 0;font-size:14px">To open it as an app: in Safari tap Share and choose "Add to Home Screen". In Chrome, menu ⋮ and "Install app".</p></div>
 <div class="card"><h2 class="sh">Demo data</h2><p class="mu" style="margin:6px 0 12px;font-size:14px">Everything you enter stays on this device only. Nothing is sent to any server.</p><button type="button" class="btn dg" style="width:100%" data-ua="demoreset">Reset demo data</button></div>
  `)}${l3dPerfil()}${_t(1019,`
 <p class="mu" style="text-align:center;font-size:12px">Logistics Control · demo build</p>
 <button type="button" class="btn" style="width:100%" data-upd="1">Check for updates (clear cache)</button>`)}`;}
const BAR=["home","rcv","sur","val","insp","more"],MORE=["dash","pend","hist","l3d","perfil","admin"];
function render(){
 if(!ME){renderAuth();return;}
 document.body.classList.remove("noauth");
 if(!TNAME[TAB])TAB="home";if(TAB==="admin"&&!admOn())TAB="perfil";
 const np=pendCount(),act=MORE.includes(TAB)?"more":TAB;
 try{LS.set("wq:ui",{emp:ME.emp,tab:TAB,ts:Date.now()});}catch(e){}
 $("#tabs").innerHTML=BAR.map(t=>`<button type="button" class="tab ${t===act?"on":""}" data-tab="${t}"><svg viewBox="0 0 24 24">${IC[t]}</svg>${TNAME[t]}${t==="more"&&np?`<span class="pb">${np}</span>`:""}</button>`).join("");
 $("#who").textContent=initials(ME);
 const V={home:viewHome,rcv:()=>lpView("rcv"),sur:()=>lpView("sur"),val:viewVal,insp:viewInsp,dash:viewDash,pend:viewPend,hist:viewHist,more:viewMore,perfil:viewPerfil,admin:viewAdmin,l3d:viewL3d,seg:(typeof viewSeg==="function"?viewSeg:()=>"")};
 const back=MORE.includes(TAB)?`${_t(259,`<button type="button" class="back" data-tab="more">‹ More</button>`)}`:"";
 $("#app").innerHTML=(TAB==="home"?"":back+`<h1 class="lt">${TNAME[TAB]}</h1>`)+V[TAB]()+FOOT;
 if(TAB==="rcv"||TAB==="sur"||TAB==="insp")warmOcr();if(typeof firstHelp==="function")setTimeout(firstHelp,250);}
function applyTheme(){const t=LS.get("wq:theme","system"),r=document.documentElement;if(t==="light"||t==="dark")r.setAttribute("data-theme",t);else r.removeAttribute("data-theme");}
document.addEventListener("input",e=>{const t=e.target,k=t.dataset.au;if(!k||t.type==="checkbox")return;let v=t.value;if(k==="emp"||k==="pin"||k==="pin2"){v=v.replace(/\D/g,"");if(v!==t.value)t.value=v;}AUTH.f[k]=v;});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset.au==="usepin"){AUTH.f.usepin=t.checked;renderAuth();}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.dataset&&e.target.dataset.au){e.preventDefault();if(AUTH.mode==="login")doLogin();else if(AUTH.mode==="menu")doAccess();}});
document.addEventListener("click",e=>{
 if(e.target.closest("#who")){TAB="perfil";render();window.scrollTo(0,0);return;}
 const b=e.target.closest("[data-ua]");if(!b)return;const p=b.dataset.ua.split(":"),a=p[0],v=p[1];
 if(a==="mode"){AUTH.mode=v;AUTH.err="";if(v==="menu")AUTH.f={};renderAuth();}
 else if(a==="doAccess")doAccess();
 else if(a==="doLogin")doLogin();else if(a==="doSignup")doSignup();
 else if(a==="pick"){AUTH.f.emp=v;AUTH.f.pin="";AUTH.err="";renderAuth();}
 else if(a==="logout")logout();

 else if(a==="demoreset"&&isAdm())dlg({title:_t(1020,"Reset demo data"),body:_t(1021,"This clears everything you entered in this demo on this device."),buttons:[{t:_t(12,"Cancel")},{t:"Reset",cls:"dg",fn:()=>{try{Object.keys(localStorage).filter(k=>k.indexOf("wq:")===0).forEach(k=>localStorage.removeItem(k));}catch(x){}location.reload();}}]});
 else if(a==="csave")cloudSave();else if(a==="cnow")cloudPush(true);else if(a==="crec")cloudRecover();else if(a==="coff"){LS.set("wq:cloud",null);CL.st="";toast(_t(260,"Server backup disabled."));render();}
 else if(a==="gwipe")dlg({title:_t(261,"Delete my data"),body:_t(262,"Your saved records, LPNs, validations and dashboards on this device will be deleted. This cannot be undone."),buttons:[{t:_t(12,"Cancel")},{t:_t(25,"Delete"),cls:"dg",fn:()=>{try{Object.keys(localStorage).filter(k=>k.indexOf("wq:ug:")===0).forEach(k=>localStorage.removeItem(k));}catch(x){}lpReset();loadUserData();toast(_t(264,"Data deleted."));TAB="home";render();}}]});
 else if(a==="theme"){LS.set("wq:theme",v);applyTheme();render();}
 else if(a==="delacc")dlg({title:_t(265,"Delete account"),body:_t(266,"Your account and all your saved records on this device will be deleted. This cannot be undone."),buttons:[{t:_t(12,"Cancel")},{t:_t(25,"Delete"),cls:"dg",fn:()=>{const e2=ME.emp;["rec","warn","draft","stmap","rcvx","rcvs","rcvcur","surx","surs","surcur","hlog","dsh"].forEach(k=>{try{localStorage.removeItem("wq:u"+e2+":"+k);}catch(x){}});USERS=USERS.filter(u=>u.emp!==e2);saveUsers();logout();toast(_t(267,"Account deleted."));}}]});});

/* ---------- respaldo en servidor (Firebase Realtime Database, vía REST) ---------- */
const CLOUD_DEFAULT="";/* opcional: pon aquí la dirección del servidor para que todos tus compañeros la usen sin configurar */
const CL={st:"",ing:false};let CT=0;
const normUrl=s=>{s=(s||"").trim().replace(/\/+$/,"");if(s&&!/^https?:\/\//i.test(s))s="https://"+s;return s;};
function cloudCfg(){const c=LS.get("wq:cloud",null);return normUrl(c&&c.url?c.url:CLOUD_DEFAULT);}
const cloudEp=emp=>cloudCfg()+"/wq/u"+emp+".json";
const hhmm=t=>new Date(t).toLocaleString(_t(163,"en-US"),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
function cloudPack(){const u=USERS.find(x=>x.emp===ME.emp)||{};return {ts:Date.now(),acct:{nombre:ME.nombre,apellido:ME.apellido,pin:u.pin||null},rec:REC,warn:WARN,draft:S,stmap:VAL.stmap||{},rcvs:LP.rcv.S.filter(s=>s.lpn),surs:LP.sur.S.filter(s=>s.lpn),hlog:HLOG,dsh:DSH,att:ATT};}
function cloudSoon(){if(!ME||ME.guest||!cloudCfg())return;LS.set("wq:u"+ME.emp+":cpend",1);clearTimeout(CT);CT=setTimeout(()=>cloudPush(false),2500);}
async function cloudGet(emp){try{const r=await fetch(cloudEp(emp),{cache:"no-store"});if(!r.ok)throw 0;return await r.json();}catch(e){return undefined;}}
async function cloudPush(manual,hide){
 if(!ME||ME.guest)return false;if(!cloudCfg()){if(manual)toast(_t(268,"First save the server address."));return false;}
 if(CL.ing&&!manual)return false;
 if(navigator.onLine===false){CL.st=_t(269,"Offline · will back up when the internet returns");if(manual)toast(CL.st);if(TAB==="perfil")render();return false;}
 CL.ing=true;
 try{const body=cloudPack(),txt=JSON.stringify(body);
  const r=await fetch(cloudEp(ME.emp),{method:"PUT",body:txt,keepalive:!!hide&&txt.length<60000});if(!r.ok)throw new Error(r.status);
  LS.set("wq:u"+ME.emp+":cpend",0);LS.set("wq:u"+ME.emp+":cts",body.ts);CL.st=_t(270,"Backed up  ")+hhmm(body.ts);if(manual)toast(_t(271,"Backup ready."));CL.ing=false;if(TAB==="perfil"&&!hide)render();return true;}
 catch(e){CL.ing=false;CL.st=_t(272,"Could not reach the server · will retry automatically");if(manual)toast(CL.st);if(TAB==="perfil"&&!hide)render();return false;}
}
function cloudMerge(rm,force){
 let n=0;const lst=Array.isArray(rm.rec)?rm.rec:Object.values(rm.rec||{}),rw=rm.warn||{};
 WARN.gone=Object.assign({},rw.gone||{},WARN.gone||{});
 lst.forEach(r=>{if(!r||!r.id||WARN.gone[r.id])return;const i=REC.findIndex(x=>x.id===r.id);if(i<0){REC.push(r);n++;}else if((r.upd||0)>(REC[i].upd||0)){REC[i]=r;n++;}});
 REC=REC.filter(r=>!WARN.gone[r.id]);
 ["dup","del"].forEach(k=>{WARN[k]=WARN[k]||{};Object.keys(rw[k]||{}).forEach(x=>{WARN[k][x]=Math.max(WARN[k][x]||0,rw[k][x]);});});
 VAL.stmap=Object.assign({},rm.stmap||{},VAL.stmap||{});
 const cts=LS.get("wq:u"+ME.emp+":cts",0),pend=LS.get("wq:u"+ME.emp+":cpend",0);
 const d=rm.draft;
 if(d&&d.id&&Array.isArray(d.lots)&&d.lots.length===5&&(force||!cts||(!pend&&(rm.ts||0)>cts))){S=d;n++;}
 n+=lpMerge("rcv",rm.rcvs)+lpMerge("sur",rm.surs)+hlogMerge(rm.hlog)+dshMerge(rm.dsh);
 U.set("rec",REC);U.set("warn",WARN);U.set("stmap",VAL.stmap);if(S)U.set("draft",S);
 return n;
}
async function cloudStart(){
 if(!ME||ME.guest||!cloudCfg())return;
 if(navigator.onLine===false){CL.st=_t(269,"Offline · will back up when the internet returns");return;}
 const rm=await cloudGet(ME.emp);
 if(rm===undefined){CL.st=_t(272,"Could not reach the server · will retry automatically");cloudSoon();return;}
 if(rm&&rm.acct&&rm.acct.off){logout();dlg({title:_t(273,"Account suspended"),body:_t(274,"The administrator suspended this account. Contact them to use it again."),buttons:[{t:_t(27,"Got it"),cls:"pri"}]});return;}
 let n=0;if(rm&&(rm.rec||rm.draft))n=cloudMerge(rm,false);
 await cloudPush(false);render();
 if(n)toast(_t(275,"Progress recovered from the server."));
}
async function cloudRecover(){
 if(!cloudCfg()){toast(_t(268,"First save the server address."));return;}
 busy(_t(276,"Checking the server…"));const rm=await cloudGet(ME.emp);busy("");
 if(rm===undefined){toast(_t(277,"Could not reach the server."));return;}
 if(!rm||!(rm.rec||rm.draft)){toast(_t(278,"The server has no backup of yours yet."));return;}
 dlg({title:_t(279,"Recover from server"),body:_t(280,"Missing records will be added and the record in progress that the server had will be restored (")+(rm.ts?hhmm(rm.ts):"")+_t(281,"). Your current records are not deleted."),buttons:[{t:_t(12,"Cancel")},{t:_t(282,"Recover"),cls:"pri",fn:()=>{const n=cloudMerge(rm,true);cloudPush(false);toast(n?_t(283,"Progress recovered."):_t(284,"You already had everything."));TAB="insp";render();}}]});
}
async function cloudSave(){
 const u=normUrl(CL.url||"");if(!u){toast(_t(285,"Enter the server address."));return;}
 busy(_t(286,"Testing connection…"));
 try{const r=await fetch(u+"/wq/ping.json",{method:"PUT",body:JSON.stringify({t:Date.now()})});if(!r.ok)throw new Error(r.status);}
 catch(e){busy("");toast(_t(287,"Could not write to that address. Check the URL and the server rules."));return;}
 busy("");LS.set("wq:cloud",{url:u});CL.url=u;toast(_t(288,"Server connected."));await cloudStart();render();
}
function viewCloud(){
 const on=!!cloudCfg(),pend=LS.get("wq:u"+ME.emp+":cpend",0),cts=LS.get("wq:u"+ME.emp+":cts",0);
 const st=on?(CL.st||(pend?_t(289,"Pending backup"):cts?_t(270,"Backed up  ")+hhmm(cts):_t(290,"Connected"))):_t(291,"No server configured");
 return `${_t(292,`<div class="card"><h2 class="sh">Server backup</h2><p class="mu" style="margin:6px 0 10px;font-size:14px">Your records and the record in progress are copied automatically to the server. If the internet drops or you change phones, they are recovered when you sign back in.</p>
 <p style="margin:0 0 10px;font-size:14px"><b>Status:</b>  `)}${esc(st)}${_t(293,`</p>
 <label class="lb">Server address</label><input data-cu="url" autocomplete="off" autocapitalize="off" value="`)}${esc(CL.url!==undefined?CL.url:cloudCfg())}${_t(294,`" placeholder="https://your-project.example.com">
 <div class="row3" style="margin-top:10px"><button type="button" class="btn pri" data-ua="csave">`)}${on?_t(295,"Update"):_t(296,"Connect")}</button>${on?`<button type="button" class="btn" data-ua="cnow">Back up now</button><button type="button" class="btn" data-ua="crec">Recover</button>`:""}</div>${on?`<button type="button" class="btn txt" style="width:100%;margin-top:6px" data-ua="coff">Disable</button>`:""}</div>`;}
document.addEventListener("input",e=>{if(e.target.dataset&&e.target.dataset.cu==="url")CL.url=e.target.value;});
addEventListener("online",()=>{if(ME&&!ME.guest&&LS.get("wq:u"+ME.emp+":cpend",0))cloudPush(false);});
document.addEventListener("visibilitychange",()=>{if(!ME||ME.guest||!cloudCfg())return;if(document.visibilityState==="hidden"){if(LS.get("wq:u"+ME.emp+":cpend",0))cloudPush(false,true);}else if(LS.get("wq:u"+ME.emp+":cpend",0))cloudPush(false);});
setInterval(()=>{if(ME&&!ME.guest&&cloudCfg()&&LS.get("wq:u"+ME.emp+":cpend",0))cloudPush(false);},60000);
/* ---------- invitados y administrador ---------- */
function gst(){let g=LS.get("wq:g",null);if(!g||!g.id)g={id:Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3),first:Date.now(),n:0,pdf:0,val:0,rcv:0};return g;}
function gstInc(k){if(!ME||!ME.guest)return;const g=gst();g[k]=(g[k]||0)+1;g.last=Date.now();g.nm=ME.nombre||"";try{g.pl=attPl();}catch(e){}LS.set("wq:g",g);const u=cloudCfg();if(!u||navigator.onLine===false)return;
 try{fetch(u+"/wq_guests/"+g.id+".json",{method:"PUT",body:JSON.stringify(Object.assign({ua:(navigator.userAgent.match(/iPhone|iPad|Android|Windows|Macintosh|Linux/)||[_t(30,"?")])[0]},g))}).catch(()=>{});}catch(e){}}
const ADM={list:null,guests:null,err:"",exp:{},loading:false};
const admOn=()=>isAdm()&&LS.get("wq:adm",0)===1;
async function admHash(c){try{const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("wq|admin|"+c));return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");}catch(e){return "x"+btoa("admin:"+c);}}
async function admLogin(){
 const code=(ADM.code||"").trim();if(!cloudCfg()){toast("First connect the server in Server backup.");return;}
 if(code.length<6){toast("The code must be at least 6 characters.");return;}
 busy("Verifying…");
 try{const h=await admHash(code),r=await fetch(cloudCfg()+"/wq_admin.json",{cache:"no-store"});if(!r.ok)throw 0;const cur=await r.json();
  if(cur===null){const w=await fetch(cloudCfg()+"/wq_admin.json",{method:"PUT",body:JSON.stringify({h,at:Date.now(),by:ME.emp})});if(!w.ok)throw 0;LS.set("wq:adm",1);toast("Admin code created.");}
  else if(cur.h===h){LS.set("wq:adm",1);toast("Admin access.");}
  else{toast("Wrong code.");busy("");return;}
 }catch(e){busy("");toast(_t(277,"Could not reach the server."));return;}
 busy("");ADM.code="";TAB="admin";admLoad();render();}
async function admLoad(){
 const u=cloudCfg();if(!u)return;ADM.loading=true;ADM.err="";if(TAB==="admin")render();
 try{const r=await fetch(u+"/wq.json?shallow=true",{cache:"no-store"});if(!r.ok)throw 0;const keys=Object.keys((await r.json())||{}).filter(k=>/^u\d{4,8}$/.test(k));
  const rows=await Promise.all(keys.map(k=>fetch(u+"/wq/"+k+".json",{cache:"no-store"}).then(x=>x.json()).then(j=>({emp:k.slice(1),j:j||{}})).catch(()=>({emp:k.slice(1),j:{}}))));
  ADM.list=rows.sort((a,b)=>((b.j.ts)||0)-((a.j.ts)||0));
  const g=await fetch(u+"/wq_guests.json",{cache:"no-store"}).then(x=>x.json()).catch(()=>null);
  ADM.guests=Object.values(g||{}).sort((a,b)=>(b.last||0)-(a.last||0));
  ADM.marks=await fetch(u+"/wq_marks.json",{cache:"no-store"}).then(x=>x.json()).catch(()=>null)||{};
 }catch(e){ADM.err="Could not read the server. Check the connection and the database rules.";}
 ADM.loading=false;if(TAB==="admin")render();}
async function admPatch(emp,body){const u=cloudCfg();const r=await fetch(u+"/wq/u"+emp+"/acct.json",{method:"PATCH",body:JSON.stringify(body)});if(!r.ok)throw 0;}
async function admAct(a,emp){
 try{
  if(a==="off"){await admPatch(emp,{off:true});toast("Account  "+emp+" suspendida.");}
  else if(a==="on"){await admPatch(emp,{off:false});toast("Account  "+emp+" activada.");}
  else if(a==="reset"){await admPatch(emp,{reset:Date.now(),pin:null});toast("PIN reset. Next time sign in without a PIN.");}
  else if(a==="del"){const r=await fetch(cloudCfg()+"/wq/u"+emp+".json",{method:"DELETE"});if(!r.ok)throw 0;toast("Server data deleted.");}
  else if(a==="gdel"){await fetch(cloudCfg()+"/wq_guests/"+emp+".json",{method:"DELETE"});}
 }catch(e){toast("Could not complete. Check the connection.");}
 admLoad();}
function viewAdminCard(){
 if(admOn())return `<div class="card"><h2 class="sh">Administrator</h2><p class="mu" style="margin:6px 0 12px;font-size:14px">Accounts, guests and progress of all users of the server.</p><button type="button" class="btn pri" style="width:100%" data-ad="open">Open panel</button><button type="button" class="btn txt" style="width:100%;margin-top:6px" data-ad="lock">Leave admin mode</button></div>`;
 return `<div class="card"><h2 class="sh">Administrator</h2><p class="mu" style="margin:6px 0 8px;font-size:13px">Only for the app owner. The first time, create your code (minimum 6 characters); afterwards use it to enter.</p><input data-ad-in type="password" autocomplete="off" placeholder="Admin code" value="${esc(ADM.code||"")}"><button type="button" class="btn" style="width:100%;margin-top:10px" data-ad="login">Enter</button></div>`;}

/* ---- atención y duplicados (administrador) ---- */
const MN={rcv:_t(213,"Receiving"),sur:_t(214,"Picking"),insp:_t(216,"Rework")};
function admAtt(){const E=[],mk=ADM.marks||{},arr=v=>Array.isArray(v)?v:Object.values(v||{});
 (ADM.list||[]).forEach(x=>{const j=x.j,a=j.acct||{},who=((a.nombre||"")+" "+(a.apellido||"")).trim()||("No.  "+x.emp),src="u"+x.emp,at=j.att||{};
  [["rcv",j.rcvs],["sur",j.surs]].forEach(([m,v])=>arr(v).forEach(s=>{if(s&&s.id&&s.lpn)E.push({who,src,m,k:s.lpn,id:s.id,st:s.status,ok:(s.items||[]).filter(i=>i.st==="ok").length,n:(s.items||[]).length,u:s.upd||s.at||0,w:(at[s.id]||{}).wn||0,a:(at[s.id]||{}).att?1:0});}));
  arr(j.rec).forEach(r=>{if(r&&r.id&&(r.status==="pendiente"||r.status==="dup"||r.status==="completo"))E.push({who,src,m:"insp",k:r.folio,id:r.id,st:r.status,ok:0,n:0,u:r.upd||0,w:(at[r.id]||{}).wn||0,a:(at[r.id]||{}).att?1:0});});});
 (ADM.guests||[]).forEach(g=>{const who=_t(249,"Guest  ")+(g.nm&&g.nm!==_t(249,"Guest")?g.nm+" · ":"")+g.id,src="g"+g.id;arr(g.pl).forEach(p=>E.push({who,src,m:p.m,k:p.k,id:p.id,st:p.st,ok:p.ok||0,n:p.n||0,u:p.u||0,w:p.w||0,a:p.a||0}));});
 E.forEach(e=>{const k=(mk[e.src]||{})[e.id];if(k&&k.st==="dup")e.st="dup";e.del=!!(k&&k.st==="del");});
 const live=E.filter(e=>!e.del),G={};live.forEach(e=>{(G[e.m+"|"+e.k]=G[e.m+"|"+e.k]||[]).push(e);});
 const dups=[],singles=[];
 Object.keys(G).forEach(k=>{const g=G[k],act=g.filter(e=>e.st!=="dup");
  if(g.length>1&&g.some(e=>e.st==="proceso"||e.st==="pendiente"||e.st==="dup"||e.a)){const sc=e=>(e.st==="ok"||e.st==="dif"||e.st==="completo"?1000:0)+e.ok*10+(e.st==="dup"?-5000:0)+e.u/1e13;g.sort((x,y)=>sc(y)-sc(x));dups.push(g);}
  else g.forEach(e=>{if(e.a||(e.w&&(e.st==="proceso"||e.st==="pendiente"))||e.st==="dup")singles.push(e);});});
 return {dups,singles};}
function admEnt(e,best){const f=t=>t?new Date(t).toLocaleString(_t(163,"en-US"),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"—";
 const tag=e.st==="dup"?_t(794,'<span class="tg" style="background:var(--erb);color:var(--er)">To delete</span>'):e.a?'<span class="tg" style="background:var(--erb);color:var(--er)">⚠ Attention</span>':e.w?'<span class="tg">aviso '+e.w+'/2</span>':'';
 const sc=best===1?'<span class="tg" style="background:var(--okb);color:var(--ok)">Probably correct</span>':best===0?'<span class="tg">Probable duplicado</span>':'';
 const sts=e.st==="ok"?"correct":e.st==="dif"?"with differences":e.st==="proceso"?"in progress":e.st==="pendiente"?"pendiente":e.st==="completo"?"completo":e.st;
 const bt=e.st==="dup"?`<button type="button" class="btn" data-ad="mk" data-src="${e.src}" data-id="${e.id}" data-st="ok">Restore</button><button type="button" class="btn dg" data-ad="mk" data-src="${e.src}" data-id="${e.id}" data-st="del">Delete permanently</button>`:`<button type="button" class="btn dg" data-ad="mk" data-src="${e.src}" data-id="${e.id}" data-st="dup">Mark for deletion</button>`;
 return `<div class="vx" style="margin-top:8px"><div class="t"><b>${esc(e.who)}</b>${tag}${sc}</div><p style="margin:4px 0 0;font-size:12px;color:var(--mu)">${MN[e.m]||e.m} · ${esc(e.m==="insp"?"folio "+e.k:"LPN "+lpFmt(e.k))} · ${esc(sts)}${e.n?" · "+e.ok+" of "+e.n+" verified":""}  · last change  ${esc(f(e.u))}</p><div class="row3" style="margin-top:6px">${bt}</div></div>`;}
function admAttCard(){const r=admAtt(),n=r.dups.length+r.singles.length;
 let h=`<div class="card"><h2 class="sh"><i>⚠</i>Attention and duplicates<em>${n}</em></h2><p class="mu" style="margin:6px 0 0;font-size:13px">Unfinished processes with warnings and repeated records. «Mark for deletion» only sets them aside (they are not lost); delete them permanently whenever you want.</p>`;
 if(!n)return h+'<div class="emp">No processes with attention or duplicates.</div></div>';
 r.dups.forEach(g=>{h+=`<div style="margin-top:12px"><b style="font-size:14px">Duplicate · ${MN[g[0].m]||g[0].m} ${esc(g[0].m==="insp"?g[0].k:lpFmt(g[0].k))}</b>${g.map((e,i)=>admEnt(e,i===0?1:0)).join("")}</div>`;});
 if(r.singles.length)h+=`<div style="margin-top:12px"><b style="font-size:14px">Unfinished with attention</b>${r.singles.map(e=>admEnt(e,-1)).join("")}</div>`;
 return h+"</div>";}
async function admMark(src,id,st){const u=cloudCfg();if(!u)return;
 const go=async()=>{try{const r=await fetch(u+"/wq_marks/"+src+"/"+id+".json",{method:"PUT",body:JSON.stringify({st,at:Date.now()})});if(!r.ok)throw 0;ADM.marks=ADM.marks||{};(ADM.marks[src]=ADM.marks[src]||{})[id]={st,at:Date.now()};toast(st==="dup"?"Marked for deletion. The user will see it when opening the app.":st==="del"?"It will be deleted from the user phone.":"Restored.");render();}catch(e){toast("Could not save the mark. Check the connection.");}};
 if(st==="del")dlg({title:"Delete permanently",body:"This record will be removed from the user phone the next time they open the app. This cannot be undone.",buttons:[{t:_t(12,"Cancel")},{t:_t(25,"Delete"),cls:"dg",fn:go}]});else go();}

function viewAdmin(){
 if(!admOn())return '<p class="mu">No access.</p>';
 const fh=t=>t?new Date(t).toLocaleString(_t(163,"en-US"),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"—";
 let h=`<div class="row3" style="margin-top:0"><button type="button" class="btn" data-ad="refresh">${ADM.loading?_t(312,"Updating…"):_t(295,"Update")}</button><button type="button" class="btn" data-ad="back">Back</button></div>${ADM.err?`<div class="vbanner no" style="margin-top:12px">${esc(ADM.err)}</div>`:""}`;
 const L=ADM.list||[];
 h+=admAttCard();
 h+=`<div class="card"><h2 class="sh"><i>👤</i>Accounts<em>${L.length}</em></h2>${L.length?L.map(x=>{const j=x.j,a=j.acct||{},rec=Array.isArray(j.rec)?j.rec:Object.values(j.rec||{}),pn=rec.filter(r=>r&&r.status==="pendiente").length,rs=Array.isArray(j.rcvs)?j.rcvs:Object.values(j.rcvs||{}),open=ADM.exp[x.emp];
  return `<div class="vx"><div class="t"><b>${esc((a.nombre||_t(30,"?"))+" "+(a.apellido||""))}</b><span class="tg" ${a.off?'style="background:var(--erb);color:var(--er)"':''}>${a.off?"Suspendida":"Activa"}</span></div><p style="margin:4px 0 0;font-size:12px;color:var(--mu)">No. ${esc(x.emp)}${a.pin?_t(242,"  · with PIN"):""}  · last backup  ${esc(fh(j.ts))}</p><p style="margin:2px 0 0;font-size:12px;color:var(--mu)">${rec.length}  records (${pn} pendientes) · ${rs.length} LPN</p>
  <div class="row3" style="margin-top:8px"><button type="button" class="btn" data-ad="exp" data-id="${x.emp}">${open?"Hide":"View detail"}</button><button type="button" class="btn" data-ad="${a.off?"on":"off"}" data-id="${x.emp}">${a.off?"Activate":"Suspend"}</button><button type="button" class="btn" data-ad="reset" data-id="${x.emp}">Reset PIN</button><button type="button" class="btn" data-ad="del" data-id="${x.emp}">Delete data</button></div>
    ${open?`<div style="margin-top:8px;font-size:12px;color:var(--mu)">${rec.slice(-15).reverse().map(r=>r?esc(r.folio)+" · "+esc(r.status):"").join("<br>")||"No records."}${rs.length?"<br><b>LPN:</b> "+rs.slice(-10).reverse().map(s=>s?esc(s.lpn)+" · "+esc(s.status):"").join("<br>"):""}</div>`:""}</div>`;}).join(""):'<p class="mu" style="margin:8px 0 0;font-size:14px">No accounts backed up on the server yet.</p>'}</div>`;
 const G=ADM.guests||[];
 h+=`<div class="card"><h2 class="sh"><i>👥</i>Guests<em>${G.length}</em></h2>${G.length?G.map(g=>`<div class="vx"><div class="t"><b>${esc(g.nm&&g.nm!==_t(249,"Guest")?g.nm+" · ":"")}${_t(249,`Guest  `)}${esc(g.id)}</b><span class="tg">${esc(g.ua||"")}</span></div><p style="margin:4px 0 0;font-size:12px;color:var(--mu)">Last seen  ${esc(fh(g.last))} · ${g.n||0} entries · ${g.pdf||0} PDF · ${g.val||0} validations · ${g.rcv||0} receivings · ${g.sur||0} pickings · ${g.dash||0} dashboards</p><div class="row3" style="margin-top:8px"><button type="button" class="btn" data-ad="gdel" data-id="${esc(g.id)}">Remove from registry</button></div></div>`).join(""):'<p class="mu" style="margin:8px 0 0;font-size:14px">No guests registered yet.</p>'}</div>`;
 return h;}
document.addEventListener("input",e=>{if(e.target.dataset&&e.target.dataset.adIn!==undefined)ADM.code=e.target.value;});
document.addEventListener("click",e=>{const b=e.target.closest("[data-ad]");if(!b)return;const a=b.dataset.ad,id=b.dataset.id;
 if(a==="login")admLogin();
 else if(a==="open"){TAB="admin";admLoad();render();window.scrollTo(0,0);}
 else if(a==="lock"){LS.set("wq:adm",0);toast("You left admin mode.");render();}
 else if(a==="back"){TAB="perfil";render();}
 else if(a==="refresh")admLoad();
 else if(a==="mk")admMark(b.dataset.src,id,b.dataset.st);
 else if(a==="exp"){ADM.exp[id]=!ADM.exp[id];render();}
 else if(a==="del")dlg({title:"Delete server data",body:"The backup of account  "+id+"  on the server will be deleted. If that person keeps using their phone, the backup is recreated. To block access use Suspend.",buttons:[{t:_t(12,"Cancel")},{t:_t(25,"Delete"),cls:"dg",fn:()=>admAct("del",id)}]});
 else if(a==="gdel"||a==="off"||a==="on"||a==="reset")admAct(a,id);});
/* ---------- recuperar avances ---------- */
function flushAll(){try{if(ME){if(S)saveDraft();lpFlush();LS.set("wq:ui",{emp:ME.emp,tab:TAB,ts:Date.now()});if(!ME.guest&&cloudCfg()&&LS.get("wq:u"+ME.emp+":cpend",0))cloudPush(false,true);}}catch(e){}}
addEventListener("pagehide",flushAll);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flushAll();});
let ERRN=0;addEventListener("error",()=>{flushAll();if(ERRN++<2)toast(_t(297,"Something failed, but your progress is saved."));});addEventListener("unhandledrejection",()=>{flushAll();});
function boot(){applyTheme();const ses=LS.get("wq:session",null),ui=LS.get("wq:ui",null),fresh=ui&&ui.ts&&Date.now()-ui.ts<10*60*1000;
 if(ses&&ses.al){const u=ALLOW.find(x=>x.id===ses.al);if(u){ME=allowMe(u);loadUserData();TAB=fresh&&ui.emp===ME.emp&&TNAME[ui.tab]?ui.tab:"home";}}
 else if(ses&&!ses.guest){const u=ses&&USERS.find(x=>x.emp===ses.emp);if(u){ME={emp:u.emp,nombre:u.nombre,apellido:u.apellido,guest:false};loadUserData();TAB=fresh&&ui.emp===ME.emp&&TNAME[ui.tab]?ui.tab:"home";}}
 if(!ME){ME=allowMe(ALLOW[0]);LS.set("wq:session",{al:"demo"});loadUserData();TAB="home";}
 render();}

/* ---------- cámara y galería ---------- */
const PROMPT=_t(298,'Read the label or document in the photo. Extract: codigo (product code/SKU/material), lote (lot/batch) and descripcion (full product name, for example feminine pad, soap or shampoo, with its brand or variant and the content or quantity exactly as it appears, for example 400 ml, 30 pieces or 3 in 1). The code has 8 digits and starts with 80. The lot has 10 characters of numbers and letters: return only the lot, without prefixes. Transcribe exactly what you see, do not invent. Reply ONLY with a JSON {"codigo":"","lote":"","descripcion":""}; use an empty string if you do not see the data.');
function stopCam(){if(STREAM){STREAM.getTracks().forEach(t=>t.stop());STREAM=null;}$("#vd").srcObject=null;$("#cv").hidden=true;}
async function openCam(){
 $("#cvm").hidden=true;$("#vd").hidden=false;$("#fr").hidden=false;$("#shut").hidden=false;$("#cv").hidden=false;
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){noCam();return;}
 try{STREAM=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}},audio:false});const v=$("#vd");v.srcObject=STREAM;await v.play().catch(()=>{});}
 catch(err){noCam();}
}
function noCam(){if(STREAM){STREAM.getTracks().forEach(t=>t.stop());STREAM=null;}$("#vd").hidden=true;$("#fr").hidden=true;$("#shut").hidden=true;$("#cvm").hidden=false;}
$("#cvx").onclick=stopCam;
$("#shut").onclick=()=>{const v=$("#vd");if(!v.videoWidth)return;const k=Math.min(1,2000/Math.max(v.videoWidth,v.videoHeight)),c=document.createElement("canvas");c.width=Math.round(v.videoWidth*k);c.height=Math.round(v.videoHeight*k);c.getContext("2d").drawImage(v,0,0,c.width,c.height);c.toBlob(b=>{stopCam();ocr(b,TARGET);},"image/jpeg",.82);};
async function shrink(file){
 let bm=null;try{bm=await createImageBitmap(file);}catch(e){}
 if(!bm||!(bm.width>0)){bm=await new Promise((ok,no)=>{const fr=new FileReader();fr.onerror=no;fr.onload=()=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=fr.result;};fr.readAsDataURL(file);});}
 const w=bm.width||bm.naturalWidth,h=bm.height||bm.naturalHeight;if(!(w>0&&h>0))throw new Error("img");
 const k=Math.min(1,2000/Math.max(w,h)),c=document.createElement("canvas");c.width=Math.round(w*k);c.height=Math.round(h*k);
 const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(bm,0,0,c.width,c.height);
 const url=c.toDataURL("image/jpeg",.85),bin=atob(url.split(",")[1]),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
 return {blob:new Blob([u8],{type:"image/jpeg"}),url};}
function showPreview(img,src){PV={blob:img.blob,src,url:img.url};const e=$("#pvimg");e.style.background="#fff";e.src=img.url;$("#pvg").hidden=src!=="gal";$("#pvc").hidden=src==="gal";$("#cv").hidden=true;$("#pv").hidden=false;}
const tmo=(p,ms)=>new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error("timeout")),ms);p.then(v=>{clearTimeout(t);ok(v);},e=>{clearTimeout(t);no(e);});});
async function onFile(e,src){const f=e.target.files[0];e.target.value="";if(!f)return;busy(_t(299,"Preparing photo…"));await new Promise(r=>setTimeout(r,40));
 try{showPreview(await tmo(shrink(f),25000),src);}catch(err){toast(err&&err.message==="timeout"?_t(300,"The photo took too long to open. Try another one or use the camera."):_t(301,"Could not open that image."));}busy("");}
$("#gal").addEventListener("change",e=>onFile(e,"gal"));$("#cam").addEventListener("change",e=>onFile(e,"cam"));
$("#pvno").onclick=()=>{$("#pv").hidden=true;};
$("#pvc").onclick=()=>{$("#pv").hidden=true;$("#cam").click();};
$("#pvuse").onclick=()=>{$("#pv").hidden=true;if(PV){if(String(TARGET).indexOf("L:")===0){const q=String(TARGET).split(":");lpPhoto(q[1],PV,q[2]);}else ocr(PV.blob,TARGET);}};
const WK={};let OCRON=false;
function dropWorkers(){Object.keys(WK).forEach(k=>{const p=WK[k];delete WK[k];Promise.resolve(p).then(w=>w&&w.terminate&&w.terminate()).catch(()=>{});});}
const withTimeout=(p,ms)=>new Promise((ok,no)=>{const t=setTimeout(()=>{dropWorkers();no(new Error("timeout"));},ms);p.then(v=>{clearTimeout(t);ok(v);},e=>{clearTimeout(t);no(e);});});
const getWorker=t=>(t=t==="lote"?"codigo":t,WK[t])||(WK[t]=(async()=>{const w=await Tesseract.createWorker(t==="desc"?"spa":"eng",1,{logger:m=>{if(!OCRON)return;if(m.status==="recognizing text")busy(_t(302,"Reading label…  ")+Math.round((m.progress||0)*100)+"%",CANC);else if(m.status)busy(_t(303,"Preparing reader…"),CANC);}});
 await w.setParameters({tessedit_pageseg_mode:t==="desc"?"3":"11"});return w;})());
let CANC=null;
async function prep(blob,max,bin){const bm=await createImageBitmap(blob),k=Math.min(1,(max||1100)/Math.max(bm.width,bm.height)),c=document.createElement("canvas");c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);
 const x=c.getContext("2d");x.drawImage(bm,0,0,c.width,c.height);if(bm.close)bm.close();const im=x.getImageData(0,0,c.width,c.height),p=im.data,g=new Uint8Array(p.length/4);let lo=255,hi=0;
 for(let i=0,j=0;i<p.length;i+=4,j++){const v=(p[i]*.299+p[i+1]*.587+p[i+2]*.114)|0;g[j]=v;if(v<lo)lo=v;if(v>hi)hi=v;}
 if(bin){const h=new Array(256).fill(0);for(let j=0;j<g.length;j++)h[g[j]]++;let sum=0;for(let t=0;t<256;t++)sum+=t*h[t];let sB=0,wB=0,mx=0,th=128;
  for(let t=0;t<256;t++){wB+=h[t];if(!wB)continue;const wF=g.length-wB;if(!wF)break;sB+=t*h[t];const mB=sB/wB,mF=(sum-sB)/wF,vv=wB*wF*(mB-mF)*(mB-mF);if(vv>mx){mx=vv;th=t;}}
  for(let i=0,j=0;i<p.length;i+=4,j++){const v=g[j]>th?255:0;p[i]=p[i+1]=p[i+2]=v;}}
 else{const sc=hi>lo?255/(hi-lo):1;for(let i=0,j=0;i<p.length;i+=4,j++){const v=Math.max(0,Math.min(255,(g[j]-lo)*sc))|0;p[i]=p[i+1]=p[i+2]=v;}}
 x.putImageData(im,0,0);return c;}
/* Lee una foto con hasta dos intentos (normal y blanco/negro). Nunca se queda colgada: tiene tiempo límite y botón Cancelar. */
async function ocrRaw(blob,o){o=o||{};let cancelled=false;OCRON=true;CANC=()=>{cancelled=true;dropWorkers();};
 try{if(typeof Tesseract==="undefined")throw new Error("lib");
  busy(_t(303,"Preparing reader…"),CANC);await new Promise(r=>setTimeout(r,40));
  const lang=o.lang||"codigo",psm=lang==="desc"?"3":"11";
  const passes=[{wl:o.digits?"0123456789() ":"",max:o.max||1100,bin:false},{wl:"",max:o.max2||1600,bin:true}];let out="";
  for(const ps of passes){if(cancelled)throw new Error("cancel");
   const img=await prep(blob,ps.max,ps.bin),w=await getWorker(lang);
   await w.setParameters({tessedit_char_whitelist:ps.wl,tessedit_pageseg_mode:psm});
   const r=await withTimeout(w.recognize(img),30000);out+="\n"+((r&&r.data&&r.data.text)||"");
   if(o.stop&&o.stop(out))break;}
  if(cancelled)throw new Error("cancel");return out;
 }catch(e){if(cancelled)throw new Error("cancel");throw e;}
 finally{OCRON=false;CANC=null;busy("");try{const w=WK[o.lang||"codigo"];if(w)Promise.resolve(w).then(x=>x.setParameters({tessedit_char_whitelist:"",tessedit_pageseg_mode:"11"})).catch(()=>{});}catch(e){}}}
const toks=t=>String(t||"").toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
function readCod(t){for(const k of toks(t)){const u=k.replace(/O/g,"0").replace(/[IL]/g,"1");if(/^80\d{6}$/.test(u))return u;}const m=String(t||"").replace(/\s/g,"").toUpperCase().replace(/O/g,"0").match(/80\d{6}/);return m?m[0]:"";}
function readLote(t){const a=toks(t);
 for(const k of a)if(k.length===11&&k.endsWith("R")&&/\d/.test(k))return k;
 for(const k of a)if(k.length===10&&/\d/.test(k)&&/[A-Z]/.test(k))return k+"R";
 for(const k of a)if(k.length===10&&/\d/.test(k)&&!/^80\d{6}/.test(k))return k+"R";return "";}
function readDesc(t){const lines=String(t||"").split("\n").map(x=>x.trim()).filter(x=>x.length>2);
 const unitRe=/\d+(?:[.,]\d+)?\s*(?:ml|g|gr|kg|l|lt|oz|pzas?|pzs|pcs?|pieces?|piezas?|pack|toallas?|bolsas?|u|un|und)\b/i,prodRe=/toalla|jab[oó]n|shampoo|champ[uú]|acondicionador|pa[nñ]al|detergente|suavizante|crema|desodorante|pasta|enjuague|rastrillo|cepillo|bolsas|detergent|softener|laundry|dish|soap|conditioner|pads?|diapers?|toothpaste|razor|brush/i,skip=/lote|lot\b|batch|c[oó]digo|sku|caduc|exp|fecha/i;
 const k=lines.filter(l=>!skip.test(l)&&!/80\d{6}/.test(l)&&(prodRe.test(l)||unitRe.test(l)));
 const r=k.length?k.join(" "):(lines.filter(l=>!skip.test(l)&&!/^[\d\W]+$/.test(l)).sort((a,b)=>b.length-a.length)[0]||"");return r.slice(0,140).trim();}
let WARMED=false;function warmOcr(){if(WARMED||typeof Tesseract==="undefined"||navigator.onLine===false)return;WARMED=true;setTimeout(()=>{getWorker("codigo").catch(()=>{delete WK.codigo;WARMED=false;});},1500);}
addEventListener("pagehide",()=>{try{dropWorkers();WARMED=false;}catch(e){}});
async function ocr(blob,target){
 const idx=S.act,rd=target==="codigo"?readCod:target==="desc"?readDesc:readLote;let txt="";
 try{txt=await ocrRaw(blob,{lang:target==="desc"?"desc":"codigo",stop:t=>!!rd(t)});}
 catch(err){const x=err&&err.message;if(x==="cancel")return;delete WK[target];toast(x==="timeout"?_t(304,"Reading took too long. Move the camera closer, improve the light or enter it manually."):_t(305,"Could not read the photo (")+String(x||"error").slice(0,40)+_t(306,"). The first time it needs internet to download the reader. You can also enter it manually."));return;}
 let val="",sel="";
 if(target==="codigo"){val=readCod(txt);if(val){S.codigo=val;sel='[data-k="codigo"]';}}
 else if(target==="desc"){val=readDesc(txt);if(val){S.desc=val;sel='[data-k="desc"]';}}
 else{val=readLote(txt);if(val){S.lots[idx].lote=val;sel=S.act===idx?'[data-l="lote"]':"";}}
 if(!val){toast(target==="codigo"?_t(307,"I did not find an 8-digit code starting with 80."):target==="lote"?_t(308,"I did not find a 10-character lot."):_t(309,"Description not detected. Move closer and improve the light."));return;}
 const inp=sel&&document.querySelector(sel);if(inp)inp.value=val;const c=$("#chips");if(c)c.innerHTML=chips();saveDraft();toast(_t(310,"Loaded:  ")+val+_t(311,". Please review it."));}
function makePdf(S){
 const {jsPDF}=window.jspdf;const d=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
 const L=10,W=277;
 const txt=(t,x,y,o={})=>{d.setFont("helvetica",o.b?"bold":"normal");d.setFontSize(o.sz||7);d.setTextColor(...(o.col||[0,0,0]));d.text(t,x,y,o.al?{align:o.al}:undefined);};
 const box=(x,y,w,h,t,o={})=>{if(o.fill){d.setFillColor(...o.fill);d.rect(x,y,w,h,"FD");}else d.rect(x,y,w,h);
  if(isNA(t)){na(x,y,w,h);return;}
  if(t!==""&&t!=null){d.setFont("helvetica",o.b?"bold":"normal");d.setFontSize(o.sz||7);d.setTextColor(...(o.col||[0,0,0]));
  let z=o.sz||7;{while(z>4.2&&d.getTextWidth(String(t))>w-2){z-=.3;d.setFontSize(z);}}
  const s=d.splitTextToSize(String(t),w-2)[0]||"";d.text(s,o.c?x+w/2:x+1,y+h/2+1.1,o.c?{align:"center"}:undefined);}};
 const na=(x,y,w,h,snap)=>{d.setDrawColor(0);d.setLineWidth(.2);d.line(x,y+h,x+w,y);
  const big=h>=11,sz=big?9:6,cap=sz*.254,dx=big?Math.min(w*.2,8):w*.3,cx=x+w/2;
  const yc=snap?y+Math.floor((h/2)/snap)*snap+snap/2:y+h/2,ly=px=>y+h-(px-x)*h/w;
  const nx=big?cx-dx:x+w*.2,ax=big?cx+dx:x+w*.8;
  txt("N",nx,Math.min(yc+cap/2,ly(nx)-.5),{b:1,sz,al:"center"});txt("A",ax,Math.max(yc+cap/2,ly(ax)+.5+cap),{b:1,sz,al:"center"});
  txt("*",x+w-(big?3.5:2.6),y+(big?4.5:3.2),{b:1,sz:big?11:8});};
 const fb=(x,y,w,h,t,o)=>{box(x,y,w,h,t,o);if(!String(t||"").trim())na(x,y,w,h);};
 d.setDrawColor(0);d.setLineWidth(.2);
 d.setFillColor(0,0,0);d.rect(L,10,W,14,"F");d.setTextColor(255);d.setFont("helvetica","bold");d.setFontSize(12);
 d.text("Inline inspection and sampling form",148.5,16,{align:"center"});d.text("Rework Inspection",148.5,21,{align:"center"});
 d.addImage(LOGO,"PNG",250,10,37,14);
 const runs=[];S.lots.forEach((l,i)=>{if(!used(l)){const r=runs[runs.length-1];if(r&&r[1]===i-1)r[1]=i;else runs.push([i,i]);}});
 const G=[128,128,128],g=[190,190,190],H=5.5,X0=130,CW=31.4,RH=5.1;
 box(L,26,W,5,"GENERAL DATA",{fill:G,b:1,col:[255,255,255]});
 let y=31;
 box(L,y,25,H,"Date:",{b:1});fb(35,y,95,H,fmtF(S.fecha));box(135,y,32,H,"Record ID:",{b:1});fb(167,y,120,H,S.folio);y+=H;
 box(L,y,25,H,"Code:",{b:1});fb(35,y,95,H,S.codigo);box(135,y,32,H,"Inspection level:",{b:1});box(167,y,120,H,S.nivel);y+=H;
 box(L,y,25,H,"Description:",{b:1});fb(35,y,95,H,S.desc,{fit:1});box(135,y,32,H,"Sampling type:",{b:1});box(167,y,120,H,S.muestreo);y+=H;
 box(L,y,25,H,"Lot(s):",{b:1});box(135,y,32,H,"Sample size:",{b:1});
 const yL=y;S.lots.forEach((l,i)=>{if(used(l)){fb(35+i*19,y,19,H,l.lote);fb(167+i*24,y,24,H,l.muestra);}});y+=H;
 box(L,y,25,H,"Quantity(ies):",{b:1});S.lots.forEach((l,i)=>{if(used(l))fb(35+i*19,y,19,H,cs(l.cant));});
 runs.forEach(([a,b])=>{const n=b-a+1;for(let k=a;k<=b;k++){d.rect(35+k*19,yL,19,H);d.rect(35+k*19,yL+H,19,H);d.rect(167+k*24,yL,24,H);}na(35+a*19,yL,n*19,2*H);na(167+a*24,yL,n*24,H);});y+=H+1.5;
 box(L,y,W,5,"INSPECTION CRITERIA",{fill:G,b:1,col:[255,255,255]});y+=5;
 box(L,y,10,10,"No.",{fill:g,b:1,c:1});box(20,y,22,10,"Defect type",{fill:g,b:1,c:1});box(42,y,88,10,"Inspection criterion",{fill:g,b:1,c:1});
 S.lots.forEach((l,i)=>{box(X0+i*CW,y,CW,5,"Lot No.  "+(i+1),{fill:g,b:1,c:1});box(X0+i*CW,y+5,CW,5,"Ac: "+l.ac+"   Re: "+l.re,{c:1,sz:6.5});});y+=10;
 const r0=y;
 CRIT.forEach((c,i)=>{
  box(L,y,10,RH,String(i+1),i<2?{c:1,fill:[150,150,150]}:{c:1});
  if(i===0||i===2||i===9){const gh=RH*(i===0?2:i===2?7:3),t=tipo(i).split(" (");d.rect(20,y,22,gh);const yc=y+gh/2;txt(t[0],31,yc-.2,{sz:6.5,al:"center"});txt("("+t[1],31,yc+2.6,{sz:6.5,al:"center"});}
  box(42,y,88,RH,c[0]);
  S.lots.forEach((l,k)=>{if(!used(l))return;const x=X0+k*CW,v=l.res[i];box(x,y,CW,RH,v,{c:1,b:1});if(v==="")na(x,y,CW,RH);});y+=RH;});
 box(L,y,120,H,"Total defects:",{fill:g,b:1});S.lots.forEach((l,k)=>{if(used(l))box(X0+k*CW,y,CW,H,String(defects(l)),{fill:g,c:1,b:1});});y+=H;
 box(L,y,120,12,"Notes:",{fill:g,b:1});S.lots.forEach((l,k)=>{if(!used(l))return;d.setFillColor(...g);d.rect(X0+k*CW,y,CW,12,"FD");d.setFontSize(5.5);d.setFont("helvetica","normal");d.setTextColor(0);if(isNA(l.obs))na(X0+k*CW,y,CW,12);else d.text(d.splitTextToSize(l.obs||"",CW-2).slice(0,4),X0+k*CW+1,y+3);});y+=12;
 box(L,y,120,H,"**Disposition:",{fill:g,b:1});S.lots.forEach((l,k)=>{if(used(l))box(X0+k*CW,y,CW,H,l.dict,{fill:g,c:1,b:1});});y+=H;
 runs.forEach(([a,b])=>{const x=X0+a*CW,w=(b-a+1)*CW,gy=r0+12*RH;d.setFillColor(...g);d.rect(x,gy,w,y-gy,"F");for(let k=a;k<=b;k++){const cx=X0+k*CW;for(let j=0;j<12;j++)d.rect(cx,r0+j*RH,CW,RH);d.rect(cx,gy,CW,H);d.rect(cx,gy+H,CW,12);d.rect(cx,gy+H+12,CW,H);}na(x,r0,w,y-r0,RH);});
 txt("* Ac = ANSI Z1.4 table acceptance value and Re = ANSI Z1.4 table rejection value.",L,y+4,{sz:6});txt("**Released / Rejected",L,y+7.5,{sz:6});y+=10;
 txt("Quality inspector signature:",148.5,y+1,{b:1,sz:8,al:"center"});d.line(100,y+9,197,y+9);y+=16;
 const legal="Demo document generated with fictitious data. Not an official record.";
 d.setFont("helvetica","normal");d.setFontSize(5);d.setTextColor(0);
 d.splitTextToSize(legal,W).forEach((ln,i)=>d.text(ln,148.5,y+3.5+i*2.3,{align:"center"}));
 txt("*",L,202,{b:1,sz:16});d.line(L+6,202,L+75,202);
 const name=("Inline_inspection_"+(S.folio||S.codigo||"no-record")+"_"+S.fecha+".pdf").replace(/[^\w.-]/g,"_");
 saveBlob(name,d.output("blob"));
}


document.addEventListener("click",e=>{if(!e.target.closest("[data-upd]"))return;toast(_t(312,"Updating…"));
 (async()=>{try{const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)));}catch(x){}
  try{const r=await navigator.serviceWorker.getRegistrations();await Promise.all(r.map(x=>x.unregister()));}catch(x){}
  setTimeout(()=>location.reload(),400);})();});
