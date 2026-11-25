/* Demo master data: fictitious item codes -> product family. */
const MZ_DATE="demo",MZ_RAW={
"FHC":"80910011 80910027 80910035 80910043 80910051 80910069",
"HRC":"80920018 80920026 80920034 80920042",
"FEM":"80930012 80930020"
};
let MZ_MAP=null;
function mzFam(code){if(!MZ_MAP){MZ_MAP=new Map();Object.keys(MZ_RAW).forEach(f=>MZ_RAW[f].split(" ").forEach(c=>MZ_MAP.set(c,f)));}return MZ_MAP.get(String(code||"").trim().replace(/^0+(?=.)/,""))||"";}
