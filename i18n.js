/* ===== Languages: English (default), Spanish, German, Portuguese, French =====
   _t(id,"English")  -> text in the active language (falls back to English)
   _ts("English")    -> translates a stored English value (reasons, criteria, etc.)
   Changing the language saves the choice on this device and reloads the app. */
var LX={};
const LANGS=[["en","English","EN"],["es","Español","ES"],["de","Deutsch","DE"],["pt","Português","PT"],["fr","Français","FR"],["zh","中文","中文"]];
let LANG="en";
try{const s=localStorage.getItem("wq:lang");if(s&&LANGS.some(l=>l[0]===s))LANG=s;}catch(e){}
document.documentElement.lang=LANG;
if(LANG!=="en")document.write('<script src="lang-'+LANG+'.js"><\/script>');
const _t=(id,en)=>{if(LANG==="en")return en;const v=LX[id];return v===undefined?en:v;};
const _pl=(n,de)=>n===1?"":(LANG==="zh"?"":LANG==="de"?de:"s");
const TS_IDS={"Rejected": 967, "Released": 968, "Product clean, no spill": 969, "Damaged product packaging": 970, "Physical code matches WMS": 971, "Lot matches WMS": 972, "Expiration date valid": 973, "Product in full carton": 974, "Product in box matches code and lot": 975, "Product information legible": 976, "Carton undamaged": 977, "Box properly closed": 978, "Pallet free of pests, clean and undamaged": 979, "Pallet stacking and wrapping compliant": 980, "Critical": 981, "Major": 982, "Minor": 983, "Code": 59, "Lot": 99, "Quantity": 66, "Unit of measure (CS/IT)": 984, "Damaged product or other": 985, "manual": 486, "validated": 986, "estimated": 987, "file": 988, "description": 989, "missing": 349, "No reason": 439};
const _ts=s=>{if(LANG==="en"||typeof s!=="string")return s;const i=TS_IDS[s];return i===undefined?s:_t(i,s);};
const LT={
 es:["Idioma","Elige el idioma de la aplicación. Se guarda en este dispositivo.","Cancelar"],
 en:["Language","Choose the app language. It is saved on this device.","Cancel"],
 de:["Sprache","Wähle die Sprache der App. Sie wird auf diesem Gerät gespeichert.","Abbrechen"],
 pt:["Idioma","Escolha o idioma do app. Fica salvo neste dispositivo.","Cancelar"],
 fr:["Langue","Choisissez la langue de l'application. Elle est enregistrée sur cet appareil.","Annuler"],
 zh:["语言","选择应用语言。设置会保存在此设备上。","取消"]};
function setLang(c){try{localStorage.setItem("wq:lang",c);}catch(e){}location.reload();}
function langName(){const l=LANGS.find(x=>x[0]===LANG);return l?l[1]:"English";}
function langCard(){return '<div class="card"><h2 class="sh">'+LT[LANG][0]+'</h2><button type="button" class="btn" style="width:100%" data-lang="1">🌐 '+langName()+'</button></div>';}
function langDlg(){
 const t=LT[LANG];
 dlg({title:"🌐 "+t[0],body:t[1],buttons:LANGS.map(l=>({t:(l[0]===LANG?"✓ ":"")+l[1],cls:l[0]===LANG?"pri":"",fn:l[0]===LANG?null:()=>setLang(l[0])})).concat([{t:t[2],cls:"txt"}])});
}
(function(){
 const b=document.getElementById("lang");
 if(b){b.textContent="🌐 "+LANGS.find(l=>l[0]===LANG)[2];b.setAttribute("aria-label",LT[LANG][0]);b.title=LT[LANG][0];}
 document.addEventListener("click",function(e){const t=e.target&&e.target.closest?e.target.closest("[data-lang],#lang"):null;if(t){e.preventDefault();langDlg();}});
})();

/* ---- static texts of index.html ---- */
const ST={
 en:null,
 es:{sub:"Sitio demo",who:"Perfil",cvm:"La cámara integrada no está disponible en esta vista.",cam:"Abrir la cámara del teléfono",cvx:"Cerrar",shut:"Capturar",pvno:"Cancelar",pvg:"Elegir otra",pvc:"Repetir",pvuse:"Usar foto"},
 de:{sub:"Demo-Standort",who:"Profil",cvm:"Die integrierte Kamera ist in dieser Ansicht nicht verfügbar.",cam:"Smartphone-Kamera öffnen",cvx:"Schließen",shut:"Aufnehmen",pvno:"Abbrechen",pvg:"Anderes wählen",pvc:"Wiederholen",pvuse:"Foto verwenden"},
 pt:{sub:"Site demo",who:"Perfil",cvm:"A câmera integrada não está disponível nesta visualização.",cam:"Abrir a câmera do celular",cvx:"Fechar",shut:"Capturar",pvno:"Cancelar",pvg:"Escolher outra",pvc:"Repetir",pvuse:"Usar foto"},
 fr:{sub:"Site démo",who:"Profil",cvm:"L'appareil photo intégré n'est pas disponible dans cette vue.",cam:"Ouvrir l'appareil photo du téléphone",cvx:"Fermer",shut:"Capturer",pvno:"Annuler",pvg:"Choisir une autre",pvc:"Reprendre",pvuse:"Utiliser la photo"},
 zh:{sub:"演示站点",who:"个人",cvm:"此视图中无法使用内置相机。",cam:"打开手机相机",cvx:"关闭",shut:"拍摄",pvno:"取消",pvg:"重新选择",pvc:"重拍",pvuse:"使用照片"}};
const SEAN={"de": {"New Year": "Neujahr", "Three Kings Day": "Dreikönigstag", "Love and Friendship": "Liebe und Freundschaft", "Flag Day": "Tag der Flagge", "Spring": "Frühling", "Children's Day": "Kindertag", "Battle of Puebla": "Schlacht von Puebla", "Mother's Day": "Muttertag", "Father's Day": "Vatertag", "Summer holidays": "Sommerferien", "Back to school": "Schulbeginn", "Independence Day": "Unabhängigkeitstag", "Pink October": "Rosa Oktober", "Halloween": "Halloween", "Day of the Dead": "Día de Muertos", "Mexican Revolution": "Mexikanische Revolution", "Christmas": "Weihnachten", "Virgin of Guadalupe": "Jungfrau von Guadalupe"}, "pt": {"New Year": "Ano Novo", "Three Kings Day": "Dia de Reis", "Love and Friendship": "Amor e Amizade", "Flag Day": "Dia da Bandeira", "Spring": "Primavera", "Children's Day": "Dia da Criança", "Battle of Puebla": "Batalha de Puebla", "Mother's Day": "Dia das Mães", "Father's Day": "Dia dos Pais", "Summer holidays": "Férias de verão", "Back to school": "Volta às aulas", "Independence Day": "Festas Pátrias", "Pink October": "Outubro Rosa", "Halloween": "Halloween", "Day of the Dead": "Dia de Finados", "Mexican Revolution": "Revolução Mexicana", "Christmas": "Natal", "Virgin of Guadalupe": "Virgem de Guadalupe"}, "fr": {"New Year": "Nouvel An", "Three Kings Day": "Fête des Rois", "Love and Friendship": "Amour et Amitié", "Flag Day": "Jour du Drapeau", "Spring": "Printemps", "Children's Day": "Fête des enfants", "Battle of Puebla": "Bataille de Puebla", "Mother's Day": "Fête des Mères", "Father's Day": "Fête des Pères", "Summer holidays": "Vacances d'été", "Back to school": "Rentrée scolaire", "Independence Day": "Fête de l'Indépendance", "Pink October": "Octobre rose", "Halloween": "Halloween", "Day of the Dead": "Día de Muertos", "Mexican Revolution": "Révolution mexicaine", "Christmas": "Noël", "Virgin of Guadalupe": "Vierge de Guadalupe"}, "es": {"New Year": "Año Nuevo", "Three Kings Day": "Día de Reyes", "Love and Friendship": "Amor y Amistad", "Flag Day": "Día de la Bandera", "Spring": "Primavera", "Children's Day": "Día del Niño", "Battle of Puebla": "Batalla de Puebla", "Mother's Day": "Día de las Madres", "Father's Day": "Día del Padre", "Summer holidays": "Vacaciones de verano", "Back to school": "Regreso a clases", "Independence Day": "Fiestas Patrias", "Pink October": "Octubre Rosa", "Halloween": "Halloween", "Day of the Dead": "Día de Muertos", "Mexican Revolution": "Revolución Mexicana", "Christmas": "Navidad", "Virgin of Guadalupe": "Virgen de Guadalupe"},"zh": {"New Year": "新年", "Three Kings Day": "三王节", "Love and Friendship": "爱与友谊", "Flag Day": "国旗日", "Spring": "春天", "Children's Day": "儿童节", "Battle of Puebla": "普埃布拉战役", "Mother's Day": "母亲节", "Father's Day": "父亲节", "Summer holidays": "暑假", "Back to school": "开学季", "Independence Day": "独立日", "Pink October": "粉红十月", "Halloween": "万圣节", "Day of the Dead": "亡灵节", "Mexican Revolution": "墨西哥革命纪念日", "Christmas": "圣诞节", "Virgin of Guadalupe": "瓜达卢佩圣母节"}};
const _tsea=n=>(SEAN[LANG]&&SEAN[LANG][n])||n;
(function(){
 const c=ST[LANG];if(!c)return;const q=s=>document.querySelector(s);
 const bs=q("#bsub");if(bs&&c.sub)bs.textContent=c.sub;const w=q("#who");if(w)w.setAttribute("aria-label",c.who);
 const m=q("#cvm p");if(m)m.textContent=c.cvm;const cl=q("#cvm label");if(cl)cl.textContent=c.cam;
 [["#cvx","cvx"],["#pvno","pvno"],["#pvg","pvg"],["#pvc","pvc"],["#pvuse","pvuse"]].forEach(a=>{const e=q(a[0]);if(e)e.textContent=c[a[1]];});
 const sh=q("#shut");if(sh)sh.setAttribute("aria-label",c.shut);
})();
