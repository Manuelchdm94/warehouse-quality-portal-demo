/* Patito Quality: asistente animado de calidad (SVG + CSS, sonido sintetizado). */
(function(){
var T={
en:{n:"Patito Quality",tg:"Quack! Quality first!",sh:"Show Patito Quality",so:"Sound (quack)",on:"On",off:"Off",ttl:"Patito Quality",
 tips:{home:["Quack! Ready for a quality day?","Check your pending items first."],rcv:["Check labels and lot numbers on receiving.","Damaged box? Photograph it before anything else."],sur:["Picking: scan before you move.","Right part, right quantity, right lot."],val:["Validate twice, ship once.","Quantity or lot mismatch? Flag it."],insp:["Rework: record the cause, not only the fix.","Safety glasses on, quack!"],dash:["Numbers tell a story. Look for the trend.","Rising defects? Find the root cause."],pend:["Close pending items before they pile up.","One at a time, quack!"],hist:["History helps you not repeat mistakes."],more:["Need something? It is all in here."],perfil:["Keep your profile up to date.","Helmet, vest, boots: always!"],admin:["Admin: review access with care."],l3d:["Explore the layout in 3D."]}},
es:{n:"Patito Quality",tg:"¡Cuac! ¡Calidad primero!",sh:"Mostrar a Patito Quality",so:"Sonido (cuac)",on:"Sí",off:"No",ttl:"Patito Quality",
 tips:{home:["¡Cuac! ¿Listo para un día de calidad?","Revisa primero tus pendientes."],rcv:["Revisa etiquetas y lotes al recibir.","¿Caja dañada? Fotografíala primero."],sur:["Surtido: escanea antes de mover.","Pieza correcta, cantidad correcta, lote correcto."],val:["Valida dos veces, envía una.","¿Cantidad o lote no coincide? Repórtalo."],insp:["Retrabajo: anota la causa, no solo la solución.","¡Lentes puestos, cuac!"],dash:["Los números cuentan una historia. Busca la tendencia.","¿Defectos subiendo? Busca la causa raíz."],pend:["Cierra pendientes antes de que se acumulen.","Uno a la vez, ¡cuac!"],hist:["El historial ayuda a no repetir errores."],more:["¿Necesitas algo? Aquí está todo."],perfil:["Mantén tu perfil al día.","Casco, chaleco y botas: ¡siempre!"],admin:["Admin: revisa los accesos con cuidado."],l3d:["Explora el layout en 3D."]}},
de:{n:"Patito Quality",tg:"Quak! Qualität zuerst!",sh:"Patito Quality anzeigen",so:"Ton (Quak)",on:"An",off:"Aus",ttl:"Patito Quality",
 tips:{home:["Quak! Bereit für einen Qualitätstag?","Prüfe zuerst deine offenen Punkte."],rcv:["Etiketten und Chargen beim Wareneingang prüfen.","Beschädigter Karton? Erst fotografieren."],sur:["Kommissionieren: erst scannen, dann bewegen.","Richtiges Teil, Menge und Charge."],val:["Zweimal prüfen, einmal senden.","Menge oder Charge weicht ab? Melden."],insp:["Nacharbeit: Ursache festhalten, nicht nur die Lösung.","Schutzbrille auf, quak!"],dash:["Zahlen erzählen eine Geschichte.","Mehr Fehler? Ursache suchen."],pend:["Offene Punkte schließen, bevor sie sich stauen.","Eins nach dem anderen, quak!"],hist:["Der Verlauf hilft, Fehler nicht zu wiederholen."],more:["Brauchst du etwas? Hier ist alles."],perfil:["Halte dein Profil aktuell.","Helm, Weste, Stiefel: immer!"],admin:["Admin: Zugänge sorgfältig prüfen."],l3d:["Erkunde das Layout in 3D."]}},
pt:{n:"Patito Quality",tg:"Quá! Qualidade primeiro!",sh:"Mostrar Patito Quality",so:"Som (quá)",on:"Sim",off:"Não",ttl:"Patito Quality",
 tips:{home:["Quá! Pronto para um dia de qualidade?","Veja primeiro suas pendências."],rcv:["Confira etiquetas e lotes no recebimento.","Caixa danificada? Fotografe primeiro."],sur:["Separação: escaneie antes de mover.","Peça, quantidade e lote corretos."],val:["Valide duas vezes, envie uma.","Quantidade ou lote diferente? Sinalize."],insp:["Retrabalho: registre a causa, não só a solução.","Óculos de proteção, quá!"],dash:["Os números contam uma história.","Defeitos subindo? Ache a causa raiz."],pend:["Feche pendências antes que se acumulem.","Um de cada vez, quá!"],hist:["O histórico ajuda a não repetir erros."],more:["Precisa de algo? Está tudo aqui."],perfil:["Mantenha seu perfil atualizado.","Capacete, colete e botas: sempre!"],admin:["Admin: revise os acessos com cuidado."],l3d:["Explore o layout em 3D."]}},
fr:{n:"Patito Quality",tg:"Coin-coin ! La qualité d'abord !",sh:"Afficher Patito Quality",so:"Son (coin-coin)",on:"Oui",off:"Non",ttl:"Patito Quality",
 tips:{home:["Coin-coin ! Prêt pour une journée qualité ?","Vérifie d'abord tes tâches en attente."],rcv:["Vérifie étiquettes et lots à la réception.","Carton abîmé ? Photographie-le d'abord."],sur:["Préparation : scanne avant de bouger.","Bonne pièce, bonne quantité, bon lot."],val:["Valide deux fois, expédie une.","Quantité ou lot différent ? Signale-le."],insp:["Reprise : note la cause, pas seulement la solution.","Lunettes de sécurité, coin-coin !"],dash:["Les chiffres racontent une histoire.","Défauts en hausse ? Cherche la cause."],pend:["Clos les tâches avant qu'elles s'accumulent.","Une à la fois, coin-coin !"],hist:["L'historique évite de répéter les erreurs."],more:["Besoin de quelque chose ? Tout est ici."],perfil:["Garde ton profil à jour.","Casque, gilet, bottes : toujours !"],admin:["Admin : vérifie les accès avec soin."],l3d:["Explore le plan en 3D."]}},
zh:{n:"Patito Quality",tg:"嘎嘎!质量第一!",sh:"显示 Patito Quality",so:"声音(嘎嘎)",on:"开",off:"关",ttl:"Patito Quality",
 tips:{home:["嘎嘎!准备好迎接质量的一天了吗?","先看看你的待办事项。"],rcv:["收货时核对标签和批号。","箱子破损?先拍照。"],sur:["拣货:先扫描再移动。","零件、数量、批号都要对。"],val:["验证两次,发货一次。","数量或批号不符?请上报。"],insp:["返工:记录原因,而不只是处理方法。","戴好护目镜,嘎嘎!"],dash:["数字会讲故事,留意趋势。","缺陷上升?找出根本原因。"],pend:["待办事项别堆积,及时处理。","一件一件来,嘎嘎!"],hist:["历史记录帮你避免重复错误。"],more:["需要什么?都在这里。"],perfil:["保持个人资料最新。","安全帽、背心、靴子:一直穿戴!"],admin:["管理员:请谨慎审核权限。"],l3d:["用 3D 探索布局。"]}}
};
function L(){return T[(typeof LANG!=="undefined"&&T[LANG])?LANG:"en"];}
function st(){try{var s=JSON.parse(localStorage.getItem("wq:pq")||"{}");return {show:s.show!==false,snd:s.snd!==false};}catch(e){return {show:true,snd:true};}}
function sv(s){try{localStorage.setItem("wq:pq",JSON.stringify(s));}catch(e){}}
var AC=null;
function quack(){var s=st();if(!s.snd)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var c=AC,t=c.currentTime;
 for(var i=0;i<2;i++){var o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),b=t+i*.19;
  o.type="sawtooth";o.frequency.setValueAtTime(420,b);o.frequency.exponentialRampToValueAtTime(230,b+.14);
  f.type="bandpass";f.frequency.value=900;f.Q.value=1.4;
  g.gain.setValueAtTime(0,b);g.gain.linearRampToValueAtTime(.16,b+.015);g.gain.exponentialRampToValueAtTime(.001,b+.16);
  o.connect(f);f.connect(g);g.connect(c.destination);o.start(b);o.stop(b+.18);}
 }catch(e){}}
/* accesorios por pestaña */
function acc(k){
 var clip='<rect x="128" y="108" width="32" height="44" rx="3" fill="#fff" stroke="#888" stroke-width="1.5"/><rect x="138" y="103" width="12" height="8" rx="2" fill="#888"/><path d="M134 124l4 4 9-9M134 140l4 4 9-9" fill="none" stroke="#2E9E4F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
 var box='<path d="M126 128l17-8 17 8v22l-17 8-17-8z" fill="#C8955A" stroke="#8A5E2E" stroke-width="1.5"/><path d="M126 128l17 8 17-8M143 136v22" fill="none" stroke="#8A5E2E" stroke-width="1.5"/>';
 var lens='<circle cx="140" cy="124" r="14" fill="#cfe9ff" fill-opacity=".6" stroke="#444" stroke-width="3"/><path d="M150 135l12 14" stroke="#444" stroke-width="5" stroke-linecap="round"/>';
 var wr='<path d="M130 152l22-28" stroke="#888" stroke-width="6" stroke-linecap="round"/><circle cx="155" cy="120" r="9" fill="none" stroke="#888" stroke-width="5"/>';
 var ch='<rect x="126" y="112" width="36" height="42" rx="3" fill="#fff" stroke="#888" stroke-width="1.5"/><rect x="132" y="138" width="6" height="12" fill="#3B82F6"/><rect x="141" y="128" width="6" height="22" fill="#2E9E4F"/><rect x="150" y="120" width="6" height="30" fill="#F28C28"/>';
 var m={home:clip,rcv:box,sur:box,val:lens,insp:wr,dash:ch,pend:clip,hist:clip,more:clip,perfil:clip,admin:lens,l3d:box};
 return m[k]||clip;}
function svg(tab){
 return '<svg viewBox="0 0 190 200" width="100%" height="100%" aria-hidden="true">'
 +'<ellipse cx="95" cy="190" rx="46" ry="5" fill="#000" opacity=".13" class="pq-sh"/>'
 +'<g class="pq-body">'
 +'<path d="M62 168h28v14H56q-6 0-6-5t6-7z" fill="#4A3322"/><path d="M128 168h-28v14h34q6 0 6-5t-6-7z" fill="#4A3322"/><ellipse cx="62" cy="176" rx="6" ry="4" fill="#B8BEC4"/><ellipse cx="128" cy="176" rx="6" ry="4" fill="#B8BEC4"/>'
 +'<ellipse cx="95" cy="125" rx="40" ry="38" fill="#FFD93B"/>'
 +'<g class="pq-wl"><ellipse cx="57" cy="128" rx="12" ry="22" fill="#F2C21B"/><circle cx="55" cy="147" r="6" fill="#fff" stroke="#999"/></g>'
 +'<path d="M63 116L82 110L95 128L108 110L127 116L132 150Q95 166 58 150Z" fill="#C9E600" stroke="#8FA600"/>'
 +'<path d="M62 134h66M60 143h70" stroke="#E8E8E8" stroke-width="4"/>'
 +'<g class="pq-wr"><ellipse cx="133" cy="128" rx="12" ry="22" fill="#F2C21B"/></g>'
 +'<g class="pq-it">'+acc(tab)+'</g>'
 +'<g class="pq-head"><circle cx="95" cy="72" r="30" fill="#FFD93B"/>'
 +'<path d="M68 56Q95 24 122 56Z" fill="#FFD21F"/><rect x="64" y="54" width="62" height="7" rx="3" fill="#F2B800"/>'
 +'<g class="pq-eye"><circle cx="84" cy="68" r="6" fill="#fff"/><circle cx="106" cy="68" r="6" fill="#fff"/><circle cx="85" cy="69" r="3" fill="#222"/><circle cx="105" cy="69" r="3" fill="#222"/></g>'
 +'<circle cx="84" cy="68" r="9.5" fill="none" stroke="#2B2B2B" stroke-width="2.2"/><circle cx="106" cy="68" r="9.5" fill="none" stroke="#2B2B2B" stroke-width="2.2"/><line x1="93" y1="68" x2="97" y2="68" stroke="#2B2B2B" stroke-width="2.2"/>'
 +'<g class="pq-beak"><ellipse cx="95" cy="87" rx="15" ry="8" fill="#F28C28"/><path d="M82 87Q95 90 108 87" fill="none" stroke="#B85F0C" stroke-width="1.5"/></g>'
 +'<path d="M84 105l11 7 11-7-11-3z" fill="#2563EB"/><circle cx="95" cy="106" r="3" fill="#1E40AF"/></g>'
 +'</g></svg>';}
var CSS='#pq{position:fixed;left:8px;bottom:calc(74px + env(safe-area-inset-bottom,0px));width:78px;height:82px;z-index:39;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;touch-action:manipulation}'
+'#pq .pq-w{width:100%;height:100%;animation:pqb 2.6s ease-in-out infinite}'
+'#pq.hop .pq-w{animation:pqh .7s ease-out}'
+'#pq svg *{transform-box:fill-box}'
+'#pq .pq-body{transform-origin:50% 100%;animation:pqs 2.6s ease-in-out infinite}'
+'#pq .pq-head{transform-origin:50% 90%;animation:pqt 5.5s ease-in-out infinite}'
+'#pq .pq-eye{transform-origin:50% 50%;animation:pqe 4.2s infinite}'
+'#pq .pq-wl{transform-origin:80% 15%}#pq.wv .pq-wl{animation:pqw .5s ease-in-out 4}'
+'#pq .pq-it{transform-origin:50% 100%;animation:pqi .35s ease-out}'
+'#pq.tk .pq-beak{transform-origin:50% 30%;animation:pqk .16s ease-in-out infinite alternate}'
+'#pq .pq-bub{position:absolute;left:70px;bottom:40px;width:max-content;max-width:min(230px,calc(100vw - 100px));background:var(--card,#fff);color:var(--tx,#222);border:1px solid rgba(0,0,0,.12);border-radius:14px 14px 14px 4px;padding:8px 11px;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.18);opacity:0;transform:translateY(6px) scale(.96);transition:.25s;pointer-events:none}'
+'#pq.sb .pq-bub{opacity:1;transform:none}'
+'@keyframes pqb{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}'
+'@keyframes pqs{0%,100%{transform:scale(1,1)}50%{transform:scale(1.02,.975)}}'
+'@keyframes pqt{0%,70%,100%{transform:rotate(0)}78%{transform:rotate(-7deg)}88%{transform:rotate(6deg)}}'
+'@keyframes pqe{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}'
+'@keyframes pqw{0%,100%{transform:rotate(0)}50%{transform:rotate(-55deg)}}'
+'@keyframes pqi{from{transform:scale(.2) rotate(-25deg);opacity:0}to{transform:none;opacity:1}}'
+'@keyframes pqk{from{transform:scaleY(1)}to{transform:scaleY(1.45)}}'
+'@keyframes pqh{0%{transform:translateY(0)}35%{transform:translateY(-22px) rotate(-6deg)}70%{transform:translateY(0) rotate(4deg)}100%{transform:none}}'
+'@media (prefers-reduced-motion:reduce){#pq .pq-w,#pq .pq-body,#pq .pq-head,#pq .pq-eye{animation:none}}';
var el=null,tmr=0,bt=0,cur="",ti=0,last="";
function ok(){return typeof ME!=="undefined"&&ME&&st().show;}
function say(txt,quk){if(!el)return;var b=el.querySelector(".pq-bub");b.textContent=txt;el.classList.add("sb","tk");if(quk)quack();
 clearTimeout(bt);setTimeout(function(){if(el)el.classList.remove("tk");},1400);
 bt=setTimeout(function(){if(el)el.classList.remove("sb","tk");},4800);}
function act(){if(!el)return;var r=Math.random();
 if(r<.35){el.classList.remove("wv");void el.offsetWidth;el.classList.add("wv");}
 else if(r<.6){el.classList.remove("hop");void el.offsetWidth;el.classList.add("hop");quack();}
 else{var a=(L().tips[cur]||L().tips.home);say(a[ti++%a.length],false);}}
function sync(){
 var tab=(typeof TAB!=="undefined"&&TAB)||"home";
 if(!ok()){if(el){el.remove();el=null;}clearInterval(tmr);tmr=0;return;}
 if(!el){var s=document.createElement("style");s.id="pqcss";if(!document.getElementById("pqcss")){s.textContent=CSS;document.head.appendChild(s);}
  el=document.createElement("div");el.id="pq";el.setAttribute("role","button");el.setAttribute("aria-label",L().n);
  el.innerHTML='<div class="pq-w"></div><div class="pq-bub"></div>';document.body.appendChild(el);cur="";last="";
  el.addEventListener("click",function(e){e.stopPropagation();var a=L().tips[cur]||L().tips.home;el.classList.remove("hop");void el.offsetWidth;el.classList.add("hop");say(Math.random()<.4?L().tg:a[ti++%a.length],true);});
  tmr=setInterval(act,9000);setTimeout(function(){say(L().tg,false);},900);}
 var key=tab+"|"+(typeof LANG!=="undefined"?LANG:"");
 if(key!==last){last=key;var chg=tab!==cur;cur=tab;el.querySelector(".pq-w").innerHTML=svg(tab);el.setAttribute("aria-label",L().n);
  if(chg){var a=L().tips[tab]||L().tips.home;setTimeout(function(){say(a[ti++%a.length],false);},500);}}
}
var r0=window.render;
window.render=function(){var x=r0.apply(this,arguments);try{sync();}catch(e){}return x;};
var vp=window.viewPerfil;
window.viewPerfil=function(){var h=vp();var s=st();
 var c='<div class="card"><h2 class="sh">'+L().ttl+'</h2><div style="display:flex;gap:10px;align-items:center"><div style="width:54px;height:58px;flex:none">'+svg("home")+'</div><div style="flex:1;display:flex;flex-direction:column;gap:8px">'
 +'<button type="button" class="btn'+(s.show?' pri':'')+'" data-pq="show">'+esc(L().sh)+': '+esc(s.show?L().on:L().off)+'</button>'
 +'<button type="button" class="btn'+(s.snd?' pri':'')+'" data-pq="snd">'+esc(L().so)+': '+esc(s.snd?L().on:L().off)+'</button></div></div></div>';
 var i=h.lastIndexOf('<div class="card"><button type="button" class="btn" style="width:100%" data-ua="logout">');
 return i<0?h+c:h.slice(0,i)+c+h.slice(i);};
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-pq]");if(!b)return;e.preventDefault();
 var s=st(),k=b.dataset.pq;if(k==="show")s.show=!s.show;else{s.snd=!s.snd;if(s.snd)quack();}sv(s);render();},true);
window.addEventListener("load",function(){try{sync();}catch(e){}});
})();
