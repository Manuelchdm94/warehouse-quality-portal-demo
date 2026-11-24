/* ===== Inicio, Más, Pendientes, Historial de todos los procesos, ayudas ===== */
let HLOG=[],HF="all",HLIM=30;
function hlogLoad(){HLOG=U.get("hlog",[]);if(!Array.isArray(HLOG))HLOG=[];}
function hlogAdd(o){HLOG.unshift(Object.assign({id:uid(),at:Date.now()},o));HLOG=HLOG.slice(0,100);U.set("hlog",HLOG);}
function hlogMerge(a){let n=0;(Array.isArray(a)?a:Object.values(a||{})).forEach(r=>{if(r&&r.id&&!HLOG.some(x=>x.id===r.id)){HLOG.push(r);n++;}});if(n){HLOG.sort((x,y)=>y.at-x.at);HLOG=HLOG.slice(0,100);U.set("hlog",HLOG);}return n;}

/* ===== Avisos de atención, procesos pendientes y marcas del administrador ===== */
let ATT={};
function attLoad(){ATT=U.get("att",{});if(!ATT||typeof ATT!=="object"||Array.isArray(ATT))ATT={};}
function attSave(){U.set("att",ATT);cloudSoon();gPush();}
function attList(){const a=[];Object.keys(LP).forEach(m=>LP[m].S.filter(s=>s.lpn&&s.status==="proceso").forEach(s=>a.push({id:s.id,m,t:LCFG[m].name+" · LPN "+lpFmt(s.lpn)})));
 REC.filter(r=>r.status==="pendiente").forEach(r=>a.push({id:r.id,m:"insp",t:_t(870,"Rework · record ")+r.folio}));return a;}
const attIs=id=>!!(ATT[id]&&ATT[id].att);
const attBadge=id=>attIs(id)?_t(871,'<span class="bd" style="background:var(--erb);color:var(--er)">⚠ Attention</span>'):(ATT[id]&&ATT[id].wn?_t(872,'<span class="bd pend">notice ')+ATT[id].wn+_t(873,' of 2</span>'):'');
function attGate(m,go){
 const L=attList().filter(x=>x.m===m);if(!L.length){go();return;}
 const n=Math.max.apply(null,L.map(x=>(ATT[x.id]||{}).wn||0)),mark=()=>{L.forEach(x=>{const e=ATT[x.id]=ATT[x.id]||{wn:0};e.wn=Math.max(e.wn||0,2);e.att=1;e.at=e.at||Date.now();});attSave();};
 if(n>=2){mark();go();return;}
 L.forEach(x=>{const e=ATT[x.id]=ATT[x.id]||{wn:0};e.wn=n+1;});attSave();
 const lst=L.slice(0,5).map(x=>"• "+x.t).join("\n")+(L.length>5?_t(874,"\n• and ")+(L.length-5)+_t(147," more"):"");
 if(n===0)dlg({title:_t(876,"⚠ Notice 1 of 2"),body:_t(877,"You have an unfinished process:\n")+lst+_t(878,"\n\nFinish it before starting another one. If it will not be finished, say so on the next attempt."),buttons:[{t:_t(879,"View pending"),cls:"pri",fn:()=>{TAB="pend";render();}},{t:_t(27,"Got it")}]});
 else dlg({title:_t(880,"⚠ Notice 2 of 2"),body:_t(881,"Still unfinished:\n")+lst+_t(882,"\n\nIf you start another process, the pending one will be flagged with ATTENTION and a supervisor will be able to see it."),buttons:[{t:_t(879,"View pending"),fn:()=>{TAB="pend";render();}},{t:_t(883,"Start another"),cls:"pri",fn:()=>{mark();go();}}]});}
/* lista compacta para el administrador (invitados) */
function attPl(){const a=[];Object.keys(LP).forEach(m=>LP[m].S.filter(s=>s.lpn).sort((x,y)=>(y.upd||0)-(x.upd||0)).slice(0,25).forEach(s=>a.push({m,k:s.lpn,id:s.id,st:s.status,ok:s.items.filter(i=>i.st==="ok").length,n:s.items.length,u:s.upd||s.at||0,w:(ATT[s.id]||{}).wn||0,a:attIs(s.id)?1:0})));
 REC.filter(r=>r.status==="pendiente"||r.status==="dup").slice(0,25).forEach(r=>a.push({m:"insp",k:r.folio,id:r.id,st:r.status,ok:0,n:0,u:r.upd||0,w:(ATT[r.id]||{}).wn||0,a:attIs(r.id)?1:0}));return a;}
let GPL="";
function gPush(){if(!ME||!ME.guest)return;const u=cloudCfg();if(!u||navigator.onLine===false)return;const g=gst(),pl=attPl(),sg=JSON.stringify(pl);if(sg===GPL)return;GPL=sg;g.pl=pl;g.last=Date.now();g.nm=ME.nombre||"";LS.set("wq:g",g);
 try{fetch(u+"/wq_guests/"+g.id+".json",{method:"PUT",body:JSON.stringify(Object.assign({ua:(navigator.userAgent.match(/iPhone|iPad|Android|Windows|Macintosh|Linux/)||["?"])[0]},g))}).catch(()=>{});}catch(e){}}
setInterval(()=>{try{gPush();}catch(e){}},45000);
/* marcas del administrador: "para borrar", restaurar, borrar definitivamente */
async function marksPull(){if(!ME)return;const u=cloudCfg();if(!u||navigator.onLine===false)return;
 const key=ME.guest?"g"+gst().id:"u"+ME.emp;let mk=null;try{mk=await fetch(u+"/wq_marks/"+key+".json",{cache:"no-store"}).then(r=>r.ok?r.json():null);}catch(e){return;}
 if(!mk)return;let ch=false;
 Object.keys(mk).forEach(id=>{const k=mk[id];if(!k||!k.st)return;
  const arr=[["rcv",LP.rcv.S],["sur",LP.sur.S]];
  arr.forEach(([m,S])=>{const i=S.findIndex(x=>x.id===id);if(i<0)return;const s=S[i];if((k.at||0)<=(s.mk||0))return;
   if(k.st==="dup"&&s.status!=="dup"){s.prev=s.status;s.status="dup";s.mk=k.at;s.upd=Date.now();if(LP[m].CUR&&LP[m].CUR.id===id)LP[m].CUR=null;ch=true;}
   else if(k.st==="ok"&&s.status==="dup"){s.status=s.prev||"proceso";s.mk=k.at;s.upd=Date.now();ch=true;}
   else if(k.st==="del"){S.splice(i,1);if(LP[m].CUR&&LP[m].CUR.id===id)LP[m].CUR=null;ch=true;}
   if(ch){U.set(LP[m].c.keys[1],LP[m].S);U.set(LP[m].c.keys[2],LP[m].CUR?LP[m].CUR.id:null);}});
  const j=REC.findIndex(x=>x.id===id);if(j>=0){const r=REC[j];if((k.at||0)>(r.mk||0)){
   if(k.st==="dup"&&r.status!=="dup"){r.prev=r.status;r.status="dup";r.mk=k.at;r.upd=Date.now();ch=true;}
   else if(k.st==="ok"&&r.status==="dup"){r.status=r.prev||"pendiente";r.mk=k.at;r.upd=Date.now();ch=true;}
   else if(k.st==="del"){REC.splice(j,1);ch=true;}
   if(ch)saveRecs();}}});
 if(ch){cloudSoon();gPush();render();}}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")marksPull();});
setInterval(()=>{if(document.visibilityState==="visible")marksPull();},90000);

const lpProc=()=>{const a=[];Object.keys(LP).forEach(m=>LP[m].S.filter(s=>s.lpn&&s.status==="proceso").forEach(s=>a.push({m,s})));return a.sort((x,y)=>(attIs(y.s.id)-attIs(x.s.id))||(y.s.upd||0)-(x.s.upd||0));};
const pendCount=()=>REC.filter(r=>r.status==="pendiente").length+lpProc().length;
const fdate=t=>new Date(t).toLocaleString(_t(163,"en-US"),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const HELP={
 rcv:[_t(884,"How Receiving works"),_t(885,"1. Upload the inventory Excel with the LPNs.\n2. Take a photo of the LPN label. Brackets and spaces in the numbers are not a problem.\n3. Take a photo of the code and lot of each product and type how many cases there are. Photos are kept as evidence.\n4. The app compares against the Excel and warns you about any code, lot or quantity difference. You can retake the photo, correct by hand or record the difference.\n5. Finish the LPN and download the PDF report. You can save progress and continue with another LPN.")],
 sur:[_t(886,"How Picking works"),_t(887,"1. Upload the picking Excel with LPNs, codes, lots and quantities.\n2. Take a photo of the LPN label.\n3. Take a photo of the code and lot of each picked product and enter the cases.\n4. The app validates against the Excel and flags any difference.\n5. Finish the LPN and download the PDF report. Progress is saved so you can continue later.")],
 val:[_t(888,"How Validation works"),_t(889,"1. Upload the ERP inventory and the WMS inventory, as you export them.\n2. Map each WMS status to Unrestricted, Quality or Ignore (it is remembered).\n3. Compare: code, lot, plant, storage location, quantities and status are checked, regardless of row order.\n4. Download the Excel with the details of the differences.")],
 dash:[_t(890,"How Dashboards work"),_t(891,"1. Upload an Excel or CSV file.\n2. Ask for the information in the Builder: what to measure, how to group it, what to filter and how to view it. Or let the app build an automatic dashboard.\n3. If you prefer, write a SQL-style or Google Query-style query.\n4. Filter the whole dashboard with one tap, save the layout and download the report as PDF or Excel.")]
};
function helpDlg(k){const h=HELP[k];if(!h)return;dlg({title:h[0],body:h[1],buttons:[{t:_t(27,"Got it"),cls:"pri"}]});}
let HELPED="";
function firstHelp(){if(!ME||HELPED===TAB)return;HELPED=TAB;if(!HELP[TAB])return;const key="wq:help:"+TAB;if(LS.get(key,0))return;LS.set(key,1);helpDlg(TAB);}
function resumeItem(){
 const hasDraft=!!(S&&(S.codigo||S.lots.some(l=>used(l))));
 const a=[];
 lpProc().slice(0,1).forEach(x=>a.push({t:LCFG[x.m].name+" · LPN "+lpFmt(x.s.lpn),s:x.s.items.filter(i=>i.st==="ok").length+_t(363," of ")+x.s.items.length+" verificados",go:x.m,m:x.m,id:x.s.id}));
 if(hasDraft)a.push({t:_t(870,"Rework · record ")+(S.folio||_t(892,"no ID")),s:(S.codigo||_t(78,"No code"))+_t(893," · draft"),go:"insp"});
 return a[0]||null;}
const TILES=[["rcv",_t(213,"Receiving"),_t(894,"Validates LPNs, codes and lots against the Excel")],["sur",_t(214,"Picking"),_t(895,"Validates picked items against the Excel")],["val",_t(215,"Validation"),_t(896,"Compares ERP against WMS inventory")],["insp",_t(216,"Rework"),_t(897,"Inline inspection form with PDF")],["l3d",_t(992,"Layout 3D"),_t(898,"Walk through the warehouse area")],["dash",_t(217,"Dashboards"),_t(899,"Extract insights from your files")],["pend",_t(218,"Pending"),_t(900,"What you left unfinished")],["hist",_t(219,"History"),_t(901,"All your processes")],["perfil",_t(221,"Profile"),_t(902,"Theme, data and demo reset")]];
function tileSub(k){
 if(k==="rcv"||k==="sur"){const p=LP[k],n=p.S.filter(s=>s.lpn&&s.status==="proceso").length,t=p.S.filter(s=>s.lpn).length;return t?t+" LPN"+(n?" · "+n+_t(701," in progress"):""):(p.X?_t(904,"Excel loaded"):_t(905,"Upload your Excel and start"));}
 if(k==="val")return VAL.res?(VAL.res.D.length?VAL.res.D.length+_t(185," differences"):_t(131,"All OK")):_t(896,"Compares ERP against WMS inventory");
 if(k==="insp"){const n=REC.length;return n?n+_t(86," record")+_pl(n,"e")+_t(39," saved")+_pl(n,""):_t(897,"Inline inspection form with PDF");}
 if(k==="dash")return DSH.length?DSH.length+_t(39," saved")+_pl(DSH.length,""):_t(899,"Extract insights from your files");
 if(k==="pend"){const n=pendCount(),tn=TEAM.length;return (n?n+_t(909," to finish"):_t(910,"Nothing pending"))+(tn?" · "+tn+_t(911," from the team"):"");}
 if(k==="hist"){const n=REC.length+HLOG.length+Object.keys(LP).reduce((a,m)=>a+LP[m].S.filter(s=>s.lpn).length,0);return n?n+_t(86," record")+_pl(n,"e"):_t(901,"All your processes");}
 return (TILES.find(x=>x[0]===k)||[0,0,""])[2];}
function viewHome(){
 const g=ME.guest,nm=g?(ME.nombre===_t(249,"Visitor")?"":ME.nombre):ME.nombre,hr=new Date().getHours(),sal=hr<12?_t(912,"Good morning"):hr<19?_t(913,"Good afternoon"):_t(914,"Good evening"),r=resumeItem();
 let fd=new Date().toLocaleDateString(_t(163,"en-US"),{weekday:"long",day:"numeric",month:"long"});fd=fd.charAt(0).toUpperCase()+fd.slice(1);
 return `${festHero()}<div class="hero">${seaChip()}<p>${sal}${nm?",":""}</p><h1>${nm?esc(nm):_t(915,"Welcome")}</h1><small>${esc(fd)}</small></div>
 ${r?`<button type="button" class="resume" ${r.m?`data-pgo="${r.m}:${r.id}"`:`data-tab="${r.go}"`}${_t(916,`><span><small>Pick up where you left off</small><b>`)}${esc(r.t)}</b><em>${esc(r.s)}</em></span><i>›</i></button>`:""}
 <div class="tiles">${TILES.map((t,i)=>`<button type="button" class="tile" data-tab="${t[0]}"><span class="ti c${(i%2)+1}"><svg viewBox="0 0 24 24">${IC[t[0]]||IC.perfil}</svg></span><b>${t[1]}</b><small>${esc(tileSub(t[0]))}</small>${t[0]==="pend"&&pendCount()?`<span class="pb" style="top:12px;right:12px;left:auto">${pendCount()}</span>`:""}</button>`).join("")}</div>${demoCard()}`;}
const DEMO_DIR="",DEMO_PH=["Receiving_101_LPN_label","Receiving_101_box_80910011","Receiving_101_box_80910027","Receiving_102_LPN_label","Receiving_102_box_80920018","Receiving_102_box_80920026","Receiving_103_LPN_label","Receiving_103_box_80910035","Receiving_103_box_80920034","Picking_201_LPN_label","Picking_201_box_80910011","Picking_201_box_80910043","Picking_202_LPN_label","Picking_202_box_80920018","Picking_202_box_80920034"];
function demoCard(){return `${_t(1024,`<div class="card" style="margin-top:14px"><h2 class="sh"><i>★</i>Try it with sample data</h2><p class="mu" style="margin:6px 0 10px;font-size:14px">One tap loads a fictitious Excel and opens the module. Sample label photos are below to test the camera or photo upload.</p>
 <div class="row3"><button type="button" class="btn pri" data-demo="rcv">Receiving</button><button type="button" class="btn pri" data-demo="sur">Picking</button><button type="button" class="btn pri" data-demo="val">Validation</button><button type="button" class="btn" data-demo="dash">Dashboards</button></div>
 <details style="margin-top:12px"><summary style="cursor:pointer;font-weight:600;font-size:14px">Sample label photos (`)}${DEMO_PH.length})</summary><p class="mu" style="margin:6px 0;font-size:12px">Open one, then save it to your device or take a screenshot and upload it in the module with Upload photo.</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${DEMO_PH.map(n=>`<a href="${DEMO_DIR}${n}.jpg" target="_blank" rel="noopener"><img src="${DEMO_DIR}${n}.jpg" alt="${n.replace(/_/g," ")}" loading="lazy" style="width:100%;border-radius:8px;border:1px solid var(--bd)"></a>`).join("")}</div></details></div>`;}
async function demoFile(n){const r=await fetch(DEMO_DIR+n);if(!r.ok)throw new Error(n);return new File([await r.blob()],n,{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-demo]");if(!b)return;const k=b.dataset.demo;
 try{busy(_t(1025,"Loading sample…"));
  if(k==="rcv"||k==="sur"){const f=await demoFile(k==="rcv"?"DEMO_WMS_Receiving.xlsx":"DEMO_WMS_Picking.xlsx");busy("");TAB=k;render();window.scrollTo(0,0);await lpPick(k,{target:{files:[f],value:""}});}
  else if(k==="val"){const a=await demoFile("DEMO_Validation_ERP.xlsx"),w=await demoFile("DEMO_Validation_WMS.xlsx");busy("");TAB="val";render();window.scrollTo(0,0);await vLoad("sap",a);await vLoad("prime",w);}
  else{const f=await demoFile("DEMO_WMS_Receiving.xlsx");busy("");TAB="dash";render();window.scrollTo(0,0);await dsPick({target:{files:[f],value:""}});}
 }catch(x){busy("");toast(_t(1026,"Could not load the sample. Open the app from its web address (not as a local file)."));}});
function viewMore(){
 const rows=[["l3d",_t(992,"Layout 3D"),tileSub("l3d")],["dash",_t(217,"Dashboards"),tileSub("dash")],["pend",_t(218,"Pending"),tileSub("pend")],["hist",_t(219,"History"),tileSub("hist")],["seg",TNAME.seg,tileSub("seg")],["perfil",_t(221,"Profile"),tileSub("perfil")]];if(admOn())rows.push(["admin",_t(222,"Administrator"),_t(918,"Accounts and guests")]);
 return `<div class="mrows">${rows.map(x=>`<button type="button" class="mrow" data-tab="${x[0]}"><span class="ti c${x[0]==="dash"||x[0]==="hist"?1:2}" style="width:38px;height:38px"><svg viewBox="0 0 24 24">${IC[x[0]]||IC.perfil}</svg></span><span style="flex:1"><b>${x[1]}</b><small>${esc(x[2])}</small></span><i>›</i></button>`).join("")}</div>`;}
function dlgDel(what,name,fn){
 dlg({title:_t(25,"Delete ")+what,body:_t(25,"Delete ")+name+_t(921,"? This cannot be undone."),buttons:[{t:_t(12,"Cancel")},{t:_t(374,"Continue"),cls:"dg",fn:()=>setTimeout(()=>dlg({title:_t(922,"Final confirmation"),body:_t(923,"Second confirmation: permanently deleting ")+name+_t(924," permanently."),buttons:[{t:_t(925,"No, keep it"),cls:"pri"},{t:_t(926,"Yes, delete"),cls:"dg",fn:fn}]}),150)}]});}
const lpCard=(m,s,ac)=>{const ok=s.items.filter(i=>i.st==="ok").length,bd=s.status==="dup"?_t(927,'<span class="bd" style="background:var(--erb);color:var(--er)">to delete</span>'):s.status==="proceso"?_t(928,'<span class="bd pend">in progress</span>')+attBadge(s.id):s.status==="ok"?_t(929,'<span class="bd ok">correct</span>'):_t(930,'<span class="bd" style="background:var(--erb);color:var(--er)">differences</span>');
 return `<div class="item"><div class="h"><b>${esc(lpFmt(s.lpn))}</b>${bd}<span style="margin-left:auto;color:var(--mu);font-size:13px">${esc(fdate(s.upd||s.at))}</span></div><p>${LCFG[m].name} · ${ok}${_t(363,` of `)}${s.items.length}${_t(409,` rows OK`)}${s.extras.length?" · "+s.extras.length+_t(783," extra(s)"):""}</p>
 <div class="ac"><button type="button" class="btn ${s.status==="proceso"?"pri":""}" data-pgo="${m}:${s.id}">${s.status==="proceso"?_t(374,"Continue"):_t(80,"Open")}</button>${s.status==="proceso"?"":`<button type="button" class="btn" data-lr="pdf1" data-m="${m}" data-id="${s.id}">PDF</button>`}<button type="button" class="btn dg" data-ldel="${m}:${s.id}${_t(82,`">Delete</button></div></div>`)}`;};
function viewPend(){teamPullSoon();const lp=lpProc(),na=attList().filter(x=>attIs(x.id)).length;
 return `${teamCard()}${na?`${_t(931,`<div class="vbanner no" style="margin-bottom:12px;font-weight:600">⚠ `)}${na}${_t(932,` process(es) unfinished with attention. A supervisor can see them. Finish them or report if they will not be finished.</div>`)}`:""}${lp.length?`<div class="card"><h2 class="sh"><i>${lp.length}${_t(933,`</i>LPNs in progress</h2><p style="margin:0;color:var(--mu);font-size:13px">Receiving and Picking with rows left to verify.</p>`)}${lp.map(x=>lpCard(x.m,x.s)).join("")}</div>`:""}${viewPendMaq()}`;}
const HFS=[["all",_t(934,"All")],["rcv",_t(213,"Receiving")],["sur",_t(214,"Picking")],["val",_t(215,"Validation")],["insp",_t(216,"Rework")],["dash",_t(217,"Dashboards")]];
function logCard(h){const bd=h.st==="ok"?'<span class="bd ok">OK</span>':h.st==="dif"?_t(930,'<span class="bd" style="background:var(--erb);color:var(--er)">differences</span>'):'';
 return `<div class="item"><div class="h"><b>${esc(h.t)}</b>${bd}<span style="margin-left:auto;color:var(--mu);font-size:13px">${esc(fdate(h.at))}</span></div><p>${esc(h.s||"")}</p><div class="ac"><button type="button" class="btn dg" data-hdel="${h.id}${_t(82,`">Delete</button></div></div>`)}`;}
const dshCard=d=>`<div class="item"><div class="h"><b>${esc(d.name)}${_t(935,`</b><span class="bd">saved dashboard</span><span style="margin-left:auto;color:var(--mu);font-size:13px">`)}${esc(fdate(d.upd))}</span></div><p>${d.w.length}${_t(936,` blocks. Filled when you upload the file.</p><div class="ac"><button type="button" class="btn pri" data-ds="open" data-id="`)}${d.id}${_t(937,`">Open</button><button type="button" class="btn dg" data-ds="rm" data-id="`)}${d.id}${_t(82,`">Delete</button></div></div>`)}`;
function viewHist(){
 const chips=`<div class="vc" style="margin-top:0">${HFS.map(f=>`<button type="button" class="${HF===f[0]?"on":""}" data-hf="${f[0]}">${f[1]}</button>`).join("")}</div>`;
 if(HF==="insp")return `<div class="card" style="padding:12px 16px 4px">${chips}</div>${viewHistMaq()}`;
 const E=[];
 if(HF==="all"||HF==="insp")REC.forEach(r=>E.push({at:r.upd||0,h:item(r)}));
 ["rcv","sur"].forEach(m=>{if(HF==="all"||HF===m)LP[m].S.filter(s=>s.lpn).forEach(s=>E.push({at:s.upd||s.at||0,h:lpCard(m,s)}));});
 HLOG.forEach(h=>{if(HF==="all"||HF===h.k)E.push({at:h.at,h:logCard(h)});});
 if(HF==="all"||HF==="dash")DSH.forEach(d=>E.push({at:d.upd||0,h:dshCard(d)}));
 E.sort((a,b)=>b.at-a.at);const shown=E.slice(0,HLIM);
 return `<div class="card" style="padding:12px 16px 14px">${chips}${shown.length?shown.map(x=>x.h).join(""):_t(938,'<div class="emp">There are no records for this process yet.</div>')}${E.length>shown.length?`${_t(939,`<div class="row3"><button type="button" class="btn full" data-hf="more">Show more (`)}${E.length-shown.length})</button></div>`:""}</div>`;}

/* ---- eventos ---- */
document.addEventListener("click",e=>{
 const g=e.target.closest("[data-pgo]");
 if(g&&g.dataset.pgo){const p=g.dataset.pgo.split(":"),P=LP[p[0]];if(P){const s=P.S.find(x=>x.id===p[1]);if(s){P.CUR=s;P.UI.msg=null;U.set(P.c.keys[2],s.id);TAB=p[0];render();window.scrollTo(0,0);return;}}}
 const h=e.target.closest("[data-help]");if(h){helpDlg(h.dataset.help);return;}
 const f=e.target.closest("[data-hf]");if(f){if(f.dataset.hf==="more")HLIM+=30;else{HF=f.dataset.hf;HLIM=30;}render();return;}
 const d=e.target.closest("[data-hdel]");if(d){const id=d.dataset.hdel,h=HLOG.find(x=>x.id===id);if(h)dlgDel(_t(940,"history record"),'"'+h.t+'"',()=>{HLOG=HLOG.filter(x=>x.id!==id);U.set("hlog",HLOG);render();toast(_t(941,"Record deleted."));});return;}
 const ld=e.target.closest("[data-ldel]");if(ld){const p=ld.dataset.ldel.split(":"),P=LP[p[0]],s=P&&P.S.find(x=>x.id===p[1]);if(!s)return;
  dlgDel(s.status==="proceso"?_t(942,"LPNs in progress"):_t(943,"LPNs from history"),_t(944,"the LPN ")+lpFmt(s.lpn)+" ("+LCFG[p[0]].name+")",()=>{P.S=P.S.filter(x=>x.id!==s.id);if(P.CUR&&P.CUR.id===s.id){P.CUR=null;U.set(P.c.keys[2],null);}U.set(P.c.keys[1],P.S);render();toast(_t(945,"LPN deleted."));});}});
document.addEventListener("input",e=>{if(e.target.dataset&&e.target.dataset.gn!==undefined&&ME&&ME.guest){const v=e.target.value.trim().slice(0,30);ME.nombre=v?titleCase(v):_t(249,"Visitor");LS.set("wq:gname",v?titleCase(v):"");$("#who").textContent=initials(ME);}});


function festApply(){}
function festHero(){return "";}
function festPerfil(){return "";}

/* ===== Layout 3D (sección + presentación al entrar, una vez al día por usuario) ===== */
IC.l3d='<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>';
const l3dTheme=()=>{const t=LS.get("wq:theme","system");return t==="light"||t==="dark"?"&t="+t:"";};
function viewL3d(){return `<div class="l3dw"><iframe id="l3df" title="3D warehouse layout" src="layout3d.html#emb${l3dTheme()}${_t(951,`" loading="lazy" style="height:1100px"></iframe></div><p class="mu" style="font-size:12px;margin:8px 0 0">Drag to rotate, pinch to zoom. Estimated dimensions.</p>`)}`;}
const l3dSpOn=()=>LS.get("wq:l3dsp","on")!=="off";
function l3dPerfil(){return `${_t(952,`<div class="card"><h2 class="sh">Layout intro</h2><p class="mu" style="margin:6px 0 12px;font-size:14px">The first 7 times you open the app each day, the 3D layout is shown for a few seconds. You can skip it with a tap.</p><button type="button" class="btn" style="width:100%" data-l3d="tog">`)}${l3dSpOn()?_t(953,"On · tap to turn off"):_t(954,"Off · tap to turn on")}</button></div>`;}
let L3DSHOWN=false,L3DTM=0;
function l3dClose(){const o=document.getElementById("l3dsp");clearTimeout(L3DTM);if(!o)return;const f=o.querySelector("iframe");if(f)f.src="about:blank";o.classList.add("out");setTimeout(()=>{try{o.remove();}catch(e){}},260);}
function l3dMaybe(){
 if(L3DSHOWN||!ME||!l3dSpOn())return;
 const day=new Date().toLocaleDateString("sv-SE"),key="wq:l3dday:"+ME.emp;
 const raw=String(LS.get(key,"")),pr=raw.split("|"),cnt=pr[0]===day?(+pr[1]||1):0;
 if(cnt>=7){L3DSHOWN=true;return;}
 L3DSHOWN=true;
 try{if(matchMedia("(prefers-reduced-motion:reduce)").matches||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2))return;}catch(e){}
 LS.set(key,day+"|"+(cnt+1));
 setTimeout(()=>{if(document.getElementById("l3dsp")||!ME)return;
  const o=document.createElement("div");o.id="l3dsp";
  o.innerHTML=`<iframe title="Layout 3D" src="layout3d.html#splash${l3dTheme()}${_t(1027,`" onload="this.classList.add('on')"></iframe><div class="l3t"><b>Logistics Control</b><span>Demo warehouse · 3D layout</span></div><button type="button" class="btn pri l3b" data-l3d="skip">Enter</button><i class="l3p"></i>`)}${typeof sgIntro==="function"?sgIntro():`<p class="l3q">${safeQ(LANG,"g")}</p>`}`;
  document.body.appendChild(o);L3DTM=setTimeout(l3dClose,9000);},700);}
document.addEventListener("click",e=>{const b=e.target.closest("[data-l3d]");if(!b)return;
 if(b.dataset.l3d==="skip")l3dClose();
 else if(b.dataset.l3d==="tog"){LS.set("wq:l3dsp",l3dSpOn()?"off":"on");render();}});
window.addEventListener("message",e=>{if(e.origin!==location.origin||!e.data)return;
 if(e.data.l3d==="nogl")l3dClose();
 if(e.data.l3dgo){const f=document.getElementById("l3df");if(f&&e.source===f.contentWindow&&["rcv","sur","insp","pend","hist"].includes(e.data.l3dgo)){TAB=e.data.l3dgo;render();window.scrollTo(0,0);}}
 if(e.data.l3dh){const f=document.getElementById("l3df");if(f&&e.source===f.contentWindow)f.style.height=Math.min(3000,e.data.l3dh)+"px";}});
{const _r3=render;render=function(){_r3.apply(this,arguments);try{l3dMaybe();}catch(e){}};}

/* ===== Pendientes compartidos del equipo (servidor) ===== */
let TEAM=[],TSIG="",TMR=null,TL=0,TBUSY=false;
const teamUrl=id=>cloudCfg()+"/wq_team"+(id?"/"+id:"")+".json";
const teamWho=()=>({emp:ME.emp,n:(ME.nombre+" "+(ME.apellido||"")).trim()});
const teamStrip=o=>JSON.parse(JSON.stringify(o,(k,v)=>typeof v==="string"&&v.indexOf("data:")===0?"":v));
function teamMine(){const a=[];
 REC.filter(r=>r.status==="pendiente").forEach(r=>a.push({id:r.id,k:"insp",t:_t(870,"Rework · record ")+r.folio,s:((r.data&&r.data.codigo)||"")+((r.data&&r.data.desc)?" · "+r.data.desc:""),upd:r.upd||0,rec:r}));
 Object.keys(LP).forEach(m=>LP[m].S.filter(s=>s.lpn&&s.status==="proceso").forEach(s=>{const ok=(s.items||[]).filter(i=>i.st==="ok").length;a.push({id:s.id,k:"lp",m,t:LCFG[m].name+" · LPN "+lpFmt(s.lpn),s:ok+_t(363," of ")+(s.items||[]).length+_t(409," rows OK"),upd:s.upd||s.at||0,ses:s});}));
 return a;}
function teamSoon(){if(!ME||ME.guest||!cloudCfg())return;clearTimeout(TMR);TMR=setTimeout(teamSync,3000);}
async function teamPush(){
 const tp=U.get("tp",{}),mine=teamMine(),ids=new Set(mine.map(x=>x.id));let ch=false;
 for(const p of mine){if(tp[p.id]===p.upd)continue;
  try{const body=teamStrip(Object.assign({},p,{by:teamWho()}));const r=await fetch(teamUrl(p.id),{method:"PUT",body:JSON.stringify(body)});if(r.ok){tp[p.id]=p.upd;ch=true;}}catch(e){}}
 for(const id of Object.keys(tp)){if(ids.has(id))continue;
  try{const r=await fetch(teamUrl(id),{method:"DELETE"});if(r.ok){delete tp[id];ch=true;}}catch(e){}}
 if(ch)U.set("tp",tp);}
async function teamPull(){
 let all;try{const r=await fetch(teamUrl(),{cache:"no-store"});if(!r.ok)return;all=await r.json();}catch(e){return;}
 all=all||{};const me=ME.emp,tp=U.get("tp",{}),list=[];let moved=0;
 Object.keys(all).forEach(id=>{const it=all[id];if(!it||!it.by)return;it.id=it.id||id;
  if(it.by.emp===me)return;list.push(it);
  if(tp[id]!==undefined){ /* alguien más lo tomó: sale de mi lista */
   if(it.k==="insp"&&REC.some(r=>r.id===id&&r.status==="pendiente")){REC=REC.filter(r=>r.id!==id);saveRecs();moved++;}
   else if(it.k==="lp"){const P=LP[it.m];if(P&&P.S.some(s=>s.id===id&&s.status==="proceso")){P.S=P.S.filter(s=>s.id!==id);if(P.CUR&&P.CUR.id===id){P.CUR=null;U.set(P.c.keys[2],null);}U.set(P.c.keys[1],P.S);moved++;}}
   delete tp[id];U.set("tp",tp);}});
 list.sort((a,b)=>(b.upd||0)-(a.upd||0));TEAM=list;
 const sig=list.map(x=>x.id+":"+x.upd+":"+x.by.emp).join("|")+"|"+moved;
 if(moved)toast(moved+_t(955," pending item(s) moved to a colleague."));
 if(sig!==TSIG){TSIG=sig;if(TAB==="pend"||TAB==="home"||TAB==="more")render();}}
async function teamSync(){if(TBUSY||!ME||ME.guest||!cloudCfg()||navigator.onLine===false)return;TBUSY=true;try{await teamPush();await teamPull();}finally{TBUSY=false;}}
function teamPullSoon(){if(Date.now()-TL<8000)return;TL=Date.now();setTimeout(teamSync,50);}
setInterval(()=>{if(ME&&!ME.guest&&document.visibilityState==="visible")teamSync();},30000);
function teamCard(){if(!ME||ME.guest||!cloudCfg())return "";
 return `<div class="card"><h2 class="sh"><i>${TEAM.length}${_t(956,`</i>Team pending items</h2><p style="margin:0;color:var(--mu);font-size:13px">Items left by your colleagues. If you take one, it moves to your list and disappears for the others. Refreshes every 30 seconds.</p>`)}${TEAM.length?TEAM.map(x=>`<div class="item"><div class="h"><b>${esc(x.t)}${_t(957,`</b><span class="bd pend">pending</span><span style="margin-left:auto;color:var(--mu);font-size:13px">`)}${esc(fdate(x.upd))}${_t(958,`</span></div><p>Left by: `)}${esc(x.by.n)}</p>${x.s?`<p>${esc(x.s)}</p>`:""}<div class="ac"><button type="button" class="btn pri" data-tk="${esc(x.id)}${_t(959,`">Take and continue</button></div></div>`)}`).join(""):_t(960,'<div class="emp">Nothing pending from the team.</div>')}</div>`;}
async function teamTake(id){
 const it=TEAM.find(x=>x.id===id);if(!it)return;busy(_t(961,"Taking the pending item…"));
 let cur=null;try{const r=await fetch(teamUrl(id),{cache:"no-store"});cur=r.ok?await r.json():null;}catch(e){busy("");toast(_t(962,"No connection. Try again."));return;}
 busy("");if(!cur||!cur.by||cur.by.emp!==it.by.emp){toast(cur&&cur.by?cur.by.n+_t(963," already took it."):_t(964,"That pending item is already closed."));TL=0;teamSync();return;}
 const now=Date.now(),tp=U.get("tp",{});
 if(cur.k==="insp"){const r=cur.rec;r.by=ME.emp;r.upd=now;REC=REC.filter(x=>x.id!==r.id);REC.push(r);saveRecs();tp[id]=now;U.set("tp",tp);
  try{await fetch(teamUrl(id),{method:"PUT",body:JSON.stringify(teamStrip(Object.assign({},cur,{rec:r,upd:now,by:teamWho()})))});}catch(e){}
  TEAM=TEAM.filter(x=>x.id!==id);load(id);}
 else{const P=LP[cur.m];if(!P){toast(_t(965,"Could not open this pending item."));return;}const s=cur.ses;if(!Array.isArray(s.items))s.items=[];if(!Array.isArray(s.extras))s.extras=[];s.items.forEach(i=>{if(!Array.isArray(i.ph))i.ph=[];});s.upd=now;
  P.S=P.S.filter(x=>x.id!==s.id);P.S.push(s);P.CUR=s;P.UI.msg=null;U.set(P.c.keys[1],P.S);U.set(P.c.keys[2],s.id);tp[id]=now;U.set("tp",tp);
  try{await fetch(teamUrl(id),{method:"PUT",body:JSON.stringify(teamStrip(Object.assign({},cur,{ses:s,upd:now,by:teamWho()})))});}catch(e){}
  TEAM=TEAM.filter(x=>x.id!==id);TAB=cur.m;render();window.scrollTo(0,0);toast(_t(966,"Pending item taken. Photos are not shared."));}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-tk]");if(b)teamTake(b.dataset.tk);});
