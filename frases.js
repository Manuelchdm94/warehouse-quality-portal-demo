/* Frases de seguridad (intro y layout). safeQ(lang, "g"|"w") devuelve una al azar. */
var SAFE_Q={
 "g": {
  "es": [
   "La seguridad es lo primero, siempre y en todo lo que hacemos.",
   "La seguridad es de todos.",
   "Hacerlo bien, hacerlo seguro.",
   "No hay prisa que justifique un riesgo.",
   "Ver un riesgo y actuar es liderazgo.",
   "Cuida a quien trabaja a tu lado como cuidas de ti.",
   "Sé el ejemplo: trabaja seguro y otros te seguirán."
  ],
  "en": [
   "Safety comes first, always and in everything we do.",
   "Safety belongs to everyone.",
   "Do it right, do it safely.",
   "No rush is worth a risk.",
   "Seeing a risk and acting on it is leadership.",
   "Look out for the person next to you as you do for yourself.",
   "Lead by example: work safely and others will follow."
  ],
  "de": [
   "Sicherheit steht an erster Stelle, immer und bei allem, was wir tun.",
   "Sicherheit geht alle an.",
   "Richtig arbeiten, sicher arbeiten.",
   "Keine Eile ist ein Risiko wert.",
   "Ein Risiko erkennen und handeln ist Führung.",
   "Achte auf den Menschen neben dir wie auf dich selbst.",
   "Sei ein Vorbild: Arbeite sicher, und andere folgen dir."
  ],
  "pt": [
   "A segurança vem primeiro, sempre e em tudo o que fazemos.",
   "A segurança é de todos.",
   "Fazer bem, fazer com segurança.",
   "Nenhuma pressa justifica um risco.",
   "Ver um risco e agir é liderança.",
   "Cuide de quem trabalha ao seu lado como cuida de você.",
   "Seja o exemplo: trabalhe com segurança e outros o seguirão."
  ],
  "zh": [
   "安全永远排在第一位，无论做什么。",
   "安全是每个人的事。",
   "做得对，也要做得安全。",
   "再赶时间，也不值得冒险。",
   "发现风险并采取行动，就是领导力。",
   "像关心自己一样，关心身边的同事。",
   "以身作则：安全作业，别人自然会跟上。"
  ],
  "zh": [
   "只走标有标线的人行通道。",
   "做安全问候。"
  ],
  "fr": [
   "La sécurité passe avant tout, toujours et dans tout ce que nous faisons.",
   "La sécurité est l'affaire de tous.",
   "Bien faire, faire en sécurité.",
   "Aucune urgence ne justifie un risque.",
   "Voir un risque et agir, c'est du leadership.",
   "Prenez soin de votre collègue comme de vous-même.",
   "Montrez l'exemple : travaillez en sécurité et les autres suivront."
  ]
 },
 "w": {
  "es": [
   "Camina sobre los pasillos delimitados.",
   "Realiza el saludo seguro."
  ],
  "en": [
   "Walk only on the marked walkways.",
   "Do the safe greeting."
  ],
  "de": [
   "Gehe nur auf den markierten Gehwegen.",
   "Mache den sicheren Gruß."
  ],
  "pt": [
   "Caminhe apenas pelos corredores demarcados.",
   "Faça a saudação segura."
  ],
  "fr": [
   "Marchez uniquement sur les allées délimitées.",
   "Faites le salut sécurité."
  ]
 }
};
function safeQ(lang,k){var a=(SAFE_Q[k||"g"]||{})[lang]||(SAFE_Q[k||"g"]||{}).en||[];return a.length?a[Math.floor(Math.random()*a.length)]:"";}
