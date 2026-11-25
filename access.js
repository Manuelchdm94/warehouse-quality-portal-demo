/* access.js - demo access control.
   Firebase Anonymous Auth (stable id per device) + Firestore rules enforce:
   - only registered users (name + code) can sign in
   - up to 2 phones + 1 computer per user (visitor: no limit)
   - only the administrator can manage users/devices.
   The code is never stored: the user document id is PBKDF2(code, name). */
(function(){
"use strict";
const FBC={apiKey:"AIzaSyD2LohuxZRFFjhkE-A5Nti4Rhv24bsdsB4",authDomain:"fir-portal-acceso-dd1d8.firebaseapp.com",projectId:"fir-portal-acceso-dd1d8",storageBucket:"fir-portal-acceso-dd1d8.firebasestorage.app",messagingSenderId:"202293778461",appId:"1:202293778461:web:b2f0c6a557c3110bcecef4"};
const BASE="https://www.gstatic.com/firebasejs/13.4.0/",DAYS30=30*864e5;
const AT={
en:{enter:"Enter",note:"Personal access. It works only on your registered devices (up to 2 phones and 1 computer).",checking:"Checking access…",susp:"This access is suspended. Contact the administrator.",limM:"Device limit reached (2 phones). Ask the administrator to free one.",limD:"Device limit reached (1 computer). Ask the administrator to free it.",net:"Could not reach the access server. Check your connection and try again.",rev:"Your access on this device is no longer valid. Sign in again or contact the administrator.",user:"User",dnote:"Everything you enter stays on this device. Only the access check (name and device) uses a server.",admT:"Access control",admI:"Registered users and their devices. Free a slot when someone changes phone.",admOpen:"Manage access",admClose:"Close",reload:"Refresh",ph:"Phones",pc:"Computer",fph:"Free phones",fpc:"Free computer",sus:"Suspend",rea:"Reactivate",del:"Delete",suspT:"Suspended",unl:"no limit",addT:"Add user",fn:"First name",ln:"Last name",cd:"Code",rU:"User",rV:"Visitor",add:"Add",delQ:"Delete this user and free its devices?",addE:"Enter first name, last name and a code of at least 6 characters.",dup:"This user already exists.",done:"Done."},
es:{enter:"Entrar",note:"Acceso personal. Funciona solo en tus dispositivos registrados (hasta 2 celulares y 1 computadora).",checking:"Verificando acceso…",susp:"Este acceso está suspendido. Contacta al administrador.",limM:"Límite de dispositivos alcanzado (2 celulares). Pide al administrador que libere uno.",limD:"Límite de dispositivos alcanzado (1 computadora). Pide al administrador que lo libere.",net:"No se pudo conectar con el servidor de acceso. Revisa tu conexión e inténtalo de nuevo.",rev:"Tu acceso en este dispositivo ya no es válido. Inicia sesión de nuevo o contacta al administrador.",user:"Usuario",dnote:"Todo lo que captures se queda en este dispositivo. Solo la verificación de acceso (nombre y dispositivo) usa un servidor.",admT:"Control de acceso",admI:"Usuarios registrados y sus dispositivos. Libera un espacio cuando alguien cambie de celular.",admOpen:"Administrar accesos",admClose:"Cerrar",reload:"Actualizar",ph:"Celulares",pc:"Computadora",fph:"Liberar celulares",fpc:"Liberar computadora",sus:"Suspender",rea:"Reactivar",del:"Eliminar",suspT:"Suspendido",unl:"sin límite",addT:"Agregar usuario",fn:"Nombre",ln:"Apellido",cd:"Código",rU:"Usuario",rV:"Visitante",add:"Agregar",delQ:"¿Eliminar este usuario y liberar sus dispositivos?",addE:"Escribe nombre, apellido y un código de al menos 6 caracteres.",dup:"Este usuario ya existe.",done:"Listo."},
de:{enter:"Anmelden",note:"Persönlicher Zugang. Funktioniert nur auf deinen registrierten Geräten (bis zu 2 Handys und 1 Computer).",checking:"Zugang wird geprüft…",susp:"Dieser Zugang ist gesperrt. Wende dich an den Administrator.",limM:"Gerätelimit erreicht (2 Handys). Bitte den Administrator, eines freizugeben.",limD:"Gerätelimit erreicht (1 Computer). Bitte den Administrator, ihn freizugeben.",net:"Der Zugangsserver ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.",rev:"Dein Zugang auf diesem Gerät ist nicht mehr gültig. Melde dich erneut an oder kontaktiere den Administrator.",user:"Benutzer",dnote:"Alles, was du eingibst, bleibt auf diesem Gerät. Nur die Zugangsprüfung (Name und Gerät) nutzt einen Server.",admT:"Zugangskontrolle",admI:"Registrierte Benutzer und ihre Geräte. Gib einen Platz frei, wenn jemand das Handy wechselt.",admOpen:"Zugänge verwalten",admClose:"Schließen",reload:"Aktualisieren",ph:"Handys",pc:"Computer",fph:"Handys freigeben",fpc:"Computer freigeben",sus:"Sperren",rea:"Entsperren",del:"Löschen",suspT:"Gesperrt",unl:"unbegrenzt",addT:"Benutzer hinzufügen",fn:"Vorname",ln:"Nachname",cd:"Code",rU:"Benutzer",rV:"Besucher",add:"Hinzufügen",delQ:"Diesen Benutzer löschen und seine Geräte freigeben?",addE:"Gib Vorname, Nachname und einen Code mit mindestens 6 Zeichen ein.",dup:"Dieser Benutzer existiert bereits.",done:"Fertig."},
pt:{enter:"Entrar",note:"Acesso pessoal. Funciona apenas nos seus dispositivos registrados (até 2 celulares e 1 computador).",checking:"Verificando acesso…",susp:"Este acesso está suspenso. Fale com o administrador.",limM:"Limite de dispositivos atingido (2 celulares). Peça ao administrador para liberar um.",limD:"Limite de dispositivos atingido (1 computador). Peça ao administrador para liberá-lo.",net:"Não foi possível conectar ao servidor de acesso. Verifique sua conexão e tente novamente.",rev:"Seu acesso neste dispositivo não é mais válido. Entre novamente ou fale com o administrador.",user:"Usuário",dnote:"Tudo o que você digitar fica neste dispositivo. Somente a verificação de acesso (nome e dispositivo) usa um servidor.",admT:"Controle de acesso",admI:"Usuários registrados e seus dispositivos. Libere uma vaga quando alguém trocar de celular.",admOpen:"Gerenciar acessos",admClose:"Fechar",reload:"Atualizar",ph:"Celulares",pc:"Computador",fph:"Liberar celulares",fpc:"Liberar computador",sus:"Suspender",rea:"Reativar",del:"Excluir",suspT:"Suspenso",unl:"sem limite",addT:"Adicionar usuário",fn:"Nome",ln:"Sobrenome",cd:"Código",rU:"Usuário",rV:"Visitante",add:"Adicionar",delQ:"Excluir este usuário e liberar seus dispositivos?",addE:"Informe nome, sobrenome e um código de pelo menos 6 caracteres.",dup:"Este usuário já existe.",done:"Pronto."},
fr:{enter:"Entrer",note:"Accès personnel. Il ne fonctionne que sur vos appareils enregistrés (jusqu'à 2 téléphones et 1 ordinateur).",checking:"Vérification de l'accès…",susp:"Cet accès est suspendu. Contactez l'administrateur.",limM:"Limite d'appareils atteinte (2 téléphones). Demandez à l'administrateur d'en libérer un.",limD:"Limite d'appareils atteinte (1 ordinateur). Demandez à l'administrateur de le libérer.",net:"Impossible de joindre le serveur d'accès. Vérifiez votre connexion et réessayez.",rev:"Votre accès sur cet appareil n'est plus valide. Reconnectez-vous ou contactez l'administrateur.",user:"Utilisateur",dnote:"Tout ce que vous saisissez reste sur cet appareil. Seule la vérification d'accès (nom et appareil) utilise un serveur.",admT:"Contrôle d'accès",admI:"Utilisateurs enregistrés et leurs appareils. Libérez une place quand quelqu'un change de téléphone.",admOpen:"Gérer les accès",admClose:"Fermer",reload:"Actualiser",ph:"Téléphones",pc:"Ordinateur",fph:"Libérer les téléphones",fpc:"Libérer l'ordinateur",sus:"Suspendre",rea:"Réactiver",del:"Supprimer",suspT:"Suspendu",unl:"illimité",addT:"Ajouter un utilisateur",fn:"Prénom",ln:"Nom",cd:"Code",rU:"Utilisateur",rV:"Visiteur",add:"Ajouter",delQ:"Supprimer cet utilisateur et libérer ses appareils ?",addE:"Saisissez prénom, nom et un code d'au moins 6 caractères.",dup:"Cet utilisateur existe déjà.",done:"Terminé."},
zh:{enter:"进入",note:"个人访问权限。仅限已登记的设备使用（最多2部手机和1台电脑）。",checking:"正在验证访问权限…",susp:"此访问权限已被暂停，请联系管理员。",limM:"已达到设备上限（2部手机）。请联系管理员释放一个名额。",limD:"已达到设备上限（1台电脑）。请联系管理员释放名额。",net:"无法连接访问服务器，请检查网络后重试。",rev:"此设备上的访问权限已失效。请重新登录或联系管理员。",user:"用户",dnote:"您输入的所有内容仅保存在此设备上。只有访问验证（姓名和设备）会使用服务器。",admT:"访问控制",admI:"已登记的用户及其设备。有人更换手机时，请释放名额。",admOpen:"管理访问",admClose:"关闭",reload:"刷新",ph:"手机",pc:"电脑",fph:"释放手机",fpc:"释放电脑",sus:"暂停",rea:"恢复",del:"删除",suspT:"已暂停",unl:"不限",addT:"添加用户",fn:"名",ln:"姓",cd:"代码",rU:"用户",rV:"访客",add:"添加",delQ:"删除此用户并释放其设备？",addE:"请输入名、姓以及至少6位的代码。",dup:"该用户已存在。",done:"完成。"}};
const _a=k=>((AT[LANG]||AT.en)[k])||AT.en[k]||k;
const isMob=()=>/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function hid(nm,code){const en=new TextEncoder(),pw=String(code||"").toUpperCase().replace(/\s/g,"");
 const k=await crypto.subtle.importKey("raw",en.encode(pw),"PBKDF2",false,["deriveBits"]);
 return hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:en.encode("wq|fb|v1|"+nm),iterations:100000},k,256));}
let FB=null;
async function fbInit(){if(FB)return FB;
 const [a,au,fs]=await Promise.all([import(BASE+"firebase-app.js"),import(BASE+"firebase-auth.js"),import(BASE+"firebase-firestore.js")]);
 const app=a.initializeApp(FBC);FB={au,fs,auth:au.getAuth(app),db:fs.getFirestore(app)};return FB;}
async function fbUid(){const F=await fbInit();await F.auth.authStateReady();if(!F.auth.currentUser)await F.au.signInAnonymously(F.auth);return F.auth.currentUser.uid;}
const uref=(F,id)=>F.fs.doc(F.db,"users",id);
async function ensureAdmin(F,uid,id){const r=F.fs.doc(F.db,"admins",uid);let s=null;try{s=await F.fs.getDoc(r);}catch(e){}
 if(!s||!s.exists())await F.fs.setDoc(r,{u:id});}
function mkMe(s){const adm=s.r==="a";
 const me=allowMe({id:String(s.id).slice(0,10),n:s.n,a:s.a,r:adm?"a":"v",adm:adm});
 me.role=adm?"admin":s.r==="u"?"user":"visitor";me.named=true;me.fid=s.id;return me;}
function enterSes(s){ME=mkMe(s);LS.set("wq:session",s);AUTH={mode:"menu",f:{},err:""};loadUserData();TAB="home";render();window.scrollTo(0,0);cloudStart();}
let BUSY=false;
window.enterBlock=()=>'<div class="abtns"><button type="button" class="btn pri" data-ua="doAccess">'+esc(_a("enter"))+'</button></div><p class="anote">'+esc(_a("note"))+'</p>';
window.doAccess=async function(){
 if(BUSY)return;const f=AUTH.f,nm=normNm((f.an||"")+" "+(f.aa||"")),code=f.ac||"";
 if(!nm||!code)return authErr(_t(224,"Enter your first name, last name and code."));
 BUSY=true;authErr(_a("checking"));
 try{
  const id=await hid(nm,code),F=await fbInit(),uid=await fbUid(),ref=uref(F,id);
  const snap=await F.fs.getDoc(ref);
  if(!snap.exists()){BUSY=false;return authErr(_t(225,"Wrong name or code. If you do not have access, request it from the app owner."));}
  const d=snap.data();
  if(d.s){BUSY=false;return authErr(_a("susp"));}
  if(d.r!=="v"){
   if(![d.m1,d.m2,d.d1].includes(uid)){
    const mob=isMob(),k=(mob?["m1","m2"]:["d1"]).find(x=>!d[x]);
    if(!k){BUSY=false;return authErr(_a(mob?"limM":"limD"));}
    try{await F.fs.updateDoc(ref,{[k]:uid});}catch(e){BUSY=false;return authErr(_a(mob?"limM":"limD"));}
   }
   if(d.r==="a")await ensureAdmin(F,uid,id);
  }
  BUSY=false;
  enterSes({fb:1,id,r:d.r,n:d.n,a:d.a,uid,t:Date.now()});
 }catch(e){BUSY=false;authErr(_a("net")+" ("+(e&&(e.code||e.message)||"?")+")");}
};
async function recheck(){
 const s=LS.get("wq:session",null);if(!s||!s.fb||!navigator.onLine)return;
 try{
  const F=await fbInit(),uid=await fbUid(),snap=await F.fs.getDoc(uref(F,s.id));
  const d=snap.exists()?snap.data():null;
  const bad=!d||d.s||(d.r!=="v"&&![d.m1,d.m2,d.d1].includes(uid))||(s.uid&&s.uid!==uid&&d.r!=="v");
  if(bad){logout();authErr(_a(d&&d.s?"susp":"rev"));return;}
  if(d.r!==s.r||d.n!==s.n||d.a!==s.a){s.r=d.r;s.n=d.n;s.a=d.a;ME=mkMe(s);}
  s.t=Date.now();LS.set("wq:session",s);
 }catch(e){/* offline or server unreachable: keep the local session until it expires */}
}
window.boot=function(){applyTheme();
 const s=LS.get("wq:session",null),ui=LS.get("wq:ui",null),fresh=ui&&ui.ts&&Date.now()-ui.ts<10*60*1000;
 if(s&&s.fb&&s.t&&Date.now()-s.t<DAYS30){ME=mkMe(s);loadUserData();TAB=fresh&&ui.emp===ME.emp&&TNAME[ui.tab]?ui.tab:"home";render();setTimeout(recheck,300);}
 else{ME=null;LS.set("wq:session",null);render();}
};
/* ---------- profile: texts + admin panel ---------- */
const ACC={open:false,list:null,busy:false,err:"",ok:"",f:{fn:"",ln:"",cd:"",r:"u"}};
const rr=()=>{const y=window.scrollY;render();window.scrollTo(0,y);};
const rl=r=>r==="a"?_t(1034,"Administrator"):r==="u"?_a("rU"):_a("rV");
function row(u){const adm=u.r==="a",vis=u.r==="v",bt='class="btn" style="padding:6px 10px;font-size:13px"';
 const ph=[u.m1,u.m2].filter(Boolean).length,pc=u.d1?1:0;
 let h='<div style="border-top:1px solid rgba(128,128,128,.3);padding:10px 0"><b>'+esc(u.n+" "+u.a)+'</b> <span class="tg" style="margin-left:6px;font-size:11px">'+esc(rl(u.r))+'</span>'+(u.s?' <span class="tg" style="font-size:11px">'+esc(_a("suspT"))+'</span>':"");
 h+='<div class="mu" style="font-size:13px;margin-top:2px">'+(vis?"📱💻 "+esc(_a("unl")):"📱 "+ph+"/2 · 💻 "+pc+"/1")+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">';
 if(!vis){if(ph)h+='<button type="button" '+bt+' data-acc="free:'+u.id+':m">'+esc(_a("fph"))+'</button>';if(pc)h+='<button type="button" '+bt+' data-acc="free:'+u.id+':d">'+esc(_a("fpc"))+'</button>';}
 if(!adm){h+='<button type="button" '+bt+' data-acc="sus:'+u.id+'">'+esc(u.s?_a("rea"):_a("sus"))+'</button><button type="button" '+bt+' data-acc="del:'+u.id+'">'+esc(_a("del"))+'</button>';}
 return h+'</div></div>';}
function accCard(){if(!isAdm())return"";
 let h='<div class="card"><h2 class="sh">'+esc(_a("admT"))+'</h2><p class="mu" style="margin:6px 0 12px;font-size:14px">'+esc(_a("admI"))+'</p>';
 if(!ACC.open)return h+'<button type="button" class="btn" style="width:100%" data-acc="open">'+esc(_a("admOpen"))+'</button></div>';
 if(ACC.err)h+='<p style="color:#c0392b;font-size:14px;margin:0 0 8px">'+esc(ACC.err)+'</p>';
 if(ACC.ok)h+='<p style="color:#1e8e3e;font-size:14px;margin:0 0 8px">'+esc(ACC.ok)+'</p>';
 h+=ACC.busy?'<p class="mu">…</p>':(ACC.list||[]).map(row).join("");
 const inp=(k,l,ex)=>'<label class="lb">'+esc(l)+'</label><input data-acf="'+k+'" autocomplete="off"'+(ex||"")+' value="'+esc(ACC.f[k])+'">';
 h+='<div style="border-top:1px solid rgba(128,128,128,.3);margin-top:6px;padding-top:10px"><h3 style="margin:0 0 6px;font-size:15px">'+esc(_a("addT"))+'</h3>'+inp("fn",_a("fn"))+inp("ln",_a("ln"))+inp("cd",_a("cd"),' autocapitalize="characters" maxlength="20"')+
  '<select data-acf="r" style="width:100%;padding:10px;margin-bottom:8px"><option value="u"'+(ACC.f.r==="u"?" selected":"")+'>'+esc(_a("rU"))+'</option><option value="v"'+(ACC.f.r==="v"?" selected":"")+'>'+esc(_a("rV"))+'</option></select>'+
  '<button type="button" class="btn pri" style="width:100%" data-acc="add">'+esc(_a("add"))+'</button></div>';
 h+='<div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="btn" style="flex:1" data-acc="reload">'+esc(_a("reload"))+'</button><button type="button" class="btn" style="flex:1" data-acc="close">'+esc(_a("admClose"))+'</button></div></div>';
 return h;}
const vp0=window.viewPerfil;
window.viewPerfil=function(){let h=vp0();
 h=h.replace(/<p class="mu" style="margin:6px 0 12px;font-size:14px">[^<]*<\/p>/,'<p class="mu" style="margin:6px 0 12px;font-size:14px">'+esc(_a("dnote"))+'</p>');
 if(ME&&ME.role==="user")h=h.replace(">"+_t(1035,"Visitor")+"</span>",">"+esc(_a("user"))+"</span>");
 const c=accCard();if(c){const i=h.lastIndexOf('<div class="card"><button type="button" class="btn" style="width:100%" data-ua="logout">');h=i<0?h+c:h.slice(0,i)+c+h.slice(i);}
 return h;};
async function accLoad(){ACC.busy=true;ACC.err="";rr();
 try{const F=await fbInit();await fbUid();const q=await F.fs.getDocs(F.fs.collection(F.db,"users"));
  ACC.list=q.docs.map(d=>Object.assign({id:d.id},d.data())).sort((a,b)=>({a:0,u:1,v:2}[a.r]-{a:0,u:1,v:2}[b.r])||(a.n+a.a).localeCompare(b.n+b.a));
 }catch(e){ACC.err=_a("net")+" ("+(e.code||e.message)+")";}
 ACC.busy=false;rr();}
async function dropAdmins(F,u,uids,keepSelf){const me=F.auth.currentUser.uid;
 if(u.r!=="a")return;for(const x of uids){if(x&&x!==me)try{await F.fs.deleteDoc(F.fs.doc(F.db,"admins",x));}catch(e){}}}
async function accDo(fn){ACC.err="";ACC.ok="";try{const F=await fbInit();await fbUid();await fn(F);ACC.ok=_a("done");}catch(e){ACC.err=e&&e.dup?_a("dup"):_a("net")+" ("+(e.code||e.message)+")";ACC.ok="";}await accLoad();}
async function accClick(a){const p=a.split(":"),k=p[0],id=p[1],u=ACC.list&&ACC.list.find(x=>x.id===id);
 if(k==="open"){ACC.open=true;ACC.ok="";return accLoad();}
 if(k==="close"){ACC.open=false;return rr();}
 if(k==="reload"){ACC.ok="";return accLoad();}
 if(k==="free"&&u){const ks=p[2]==="m"?["m1","m2"]:["d1"],patch={};ks.forEach(x=>patch[x]=null);
  return accDo(async F=>{await F.fs.updateDoc(uref(F,id),patch);await dropAdmins(F,u,ks.map(x=>u[x]));});}
 if(k==="sus"&&u)return accDo(F=>F.fs.updateDoc(uref(F,id),{s:!u.s}));
 if(k==="del"&&u)return dlg({title:u.n+" "+u.a,body:_a("delQ"),buttons:[{t:_t(12,"Cancel")},{t:_a("del"),cls:"dg",fn:()=>accDo(async F=>{await dropAdmins(F,u,[u.m1,u.m2,u.d1]);await F.fs.deleteDoc(uref(F,id));})}]});
 if(k==="add"){const f=ACC.f,fn=f.fn.trim(),ln=f.ln.trim(),cd=f.cd.replace(/\s/g,"");
  if(!fn||!ln||cd.length<6){ACC.err=_a("addE");ACC.ok="";return rr();}
  const id2=await hid(normNm(fn+" "+ln),cd);
  return accDo(async F=>{const ex=await F.fs.getDoc(uref(F,id2));if(ex.exists())throw{dup:1};
   await F.fs.setDoc(uref(F,id2),{n:fn,a:ln,r:f.r,s:false,m1:null,m2:null,d1:null});ACC.f={fn:"",ln:"",cd:"",r:f.r};});}
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-acc]");if(b&&isAdm())accClick(b.dataset.acc);});
document.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.acf)ACC.f[t.dataset.acf]=t.value;});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.acf)ACC.f[t.dataset.acf]=t.value;});
window.__wqAccess={hid};
})();
