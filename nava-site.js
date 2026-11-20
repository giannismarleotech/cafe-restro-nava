/* Café Restaurant Nava — gedeelde scripts (alle pagina's) */
/* ---------- taal ---------- */
let lang="en";
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function pickLang(){const q=new URLSearchParams(location.search).get("lang"),s=store.get("nava-lang");return [q,s].find(l=>l&&T[l])||"en";}
function setLang(l){
  lang=l;store.set("nava-lang",l);document.documentElement.lang=l;document.documentElement.dir=(l==="fa")?"rtl":"ltr";
  document.querySelectorAll("[data-i18n]").forEach(el=>{const v=T[l][el.dataset.i18n];if(v!=null)el.innerHTML=v;});
  document.querySelectorAll("#langs button").forEach(b=>b.classList.toggle("on",b.dataset.lang===l));
  buildMenu();renderShop();renderStatus();renderTake();
  if(updTake)updTake();
  document.querySelectorAll(".done").forEach(d=>d.classList.remove("show"));
  if($("marq")){$("marq").innerHTML=marqHtml();}
}
document.querySelectorAll("#langs button").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));

const $=i=>document.getElementById(i);

/* ---------- foto's ---------- */
document.querySelectorAll("img[data-img]").forEach(i=>i.src=IMG[i.dataset.img]);
const hb=document.querySelector(".hero .bg");
if(hb){const heroChain=[IMG.hero_01];
  const heroFallback=()=>{const n=heroChain.shift();if(!n){hb.onerror=null;return}hb.src=n};
  hb.onerror=heroFallback; if(hb.complete&&hb.naturalWidth===0)heroFallback();}

/* ---------- lightbox ---------- */
const lb=$("lb");
function openLb(src,cap){if(!lb)return;lb.querySelector("img").src=src;lb.querySelector("b").textContent=cap||"";lb.classList.add("open");}
if(lb){lb.addEventListener("click",()=>lb.classList.remove("open"));
document.addEventListener("keydown",e=>{if(e.key==="Escape")lb.classList.remove("open")});}
document.querySelectorAll("[data-lb]").forEach(el=>el.addEventListener("click",()=>openLb(IMG[el.dataset.lb],el.dataset.cap)));

/* ---------- openingsuren ---------- */
const OPEN=10,CLOSE=20,CLOSED_DAY=3; /* woensdag */
const brusselsClock=new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Brussels",dateStyle:"short",timeStyle:"medium"});
const brusselsNow=()=>new Date(brusselsClock.format(new Date()).replace(" ","T"));
const pad=n=>String(n).padStart(2,"0");
const isoDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function statusText(){
  const now=brusselsNow(),h=now.getHours()+now.getMinutes()/60,t=T[lang];
  if(now.getDay()!==CLOSED_DAY&&h>=OPEN&&h<CLOSE)return {open:true,txt:t.st_open};
  let d=new Date(now);if(h>=CLOSE||now.getDay()===CLOSED_DAY)d.setDate(d.getDate()+1);
  while(d.getDay()===CLOSED_DAY)d.setDate(d.getDate()+1);
  const diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5);
  const when=diff===0?t.st_today:diff===1?t.st_tomorrow:t.days[d.getDay()];
  return {open:false,txt:`${t.st_closed} ${when} ${t.st_at} 10:00`};
}
function renderStatus(){const el=$("status");if(!el)return;const st=statusText();el.textContent=st.txt;el.classList.toggle("closed",!st.open);}
setInterval(renderStatus,60000);

function fillTimes(sel,dateStr,first,last,minAhead){
  const now=brusselsNow(),today=dateStr===isoDate(now);
  const prev=sel.value;sel.innerHTML="";
  for(let m=first*60;m<=last*60;m+=30){
    if(today&&m<now.getHours()*60+now.getMinutes()+minAhead)continue;
    const o=document.createElement("option");o.value=o.textContent=`${pad(Math.floor(m/60))}:${pad(m%60)}`;sel.appendChild(o);
  }
  if([...sel.options].some(o=>o.value===prev))sel.value=prev;
  return sel.options.length>0;
}
function setupDate(inp,sel,first,last,minAhead,err){
  const now=brusselsNow(),max=new Date(now);max.setDate(max.getDate()+60);
  inp.min=isoDate(now);inp.max=isoDate(max);
  let d=new Date(now);if(now.getHours()*60+now.getMinutes()+minAhead>last*60)d.setDate(d.getDate()+1);while(d.getDay()===CLOSED_DAY)d.setDate(d.getDate()+1);
  inp.value=isoDate(d);
  const upd=()=>{
    err.textContent="";
    const dt=new Date(inp.value+"T12:00");
    if(isNaN(dt)){sel.innerHTML="";return}
    if(dt.getDay()===CLOSED_DAY){err.textContent=T[lang].x_wed;sel.innerHTML="";return}
    if(!fillTimes(sel,inp.value,first,last,minAhead))err.textContent=T[lang].x_past;
  };
  inp.addEventListener("change",upd);upd();return upd;
}
const WA="32494617413",MAIL="info@cafenava.be";
function showDone(box,title,sub,msg){
  box.innerHTML=`<h4>${title}</h4><p style="color:var(--dim)">${sub}</p><pre></pre><div class="send">
   <a class="btn solid" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}">${T[lang].wa} ✦</a>
   <a class="btn" href="mailto:${MAIL}?subject=${encodeURIComponent(msg.split("\n")[0])}&body=${encodeURIComponent(msg)}">${T[lang].mail}</a>
   <a class="btn" href="tel:+3293869065">${T[lang].call}</a></div>`;
  box.querySelector("pre").textContent=msg;
  box.classList.add("show");box.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function niceDate(str){const d=new Date(str+"T12:00");return `${T[lang].days[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`}

/* ---------- menukaart ---------- */
const menucard=$("menucard"),chapEl=$("chapters");
const dn=k=>(lang==="fa"&&D[k].nfa)?D[k].nfa:D[k].n;
const dishDescription=k=>{
  const dish=D[k];
  const description=dish.d?`<small>${dish.d[lang]||dish.d.en}</small>`:"";
  return description+(dish.vegetarian?`<small class="veg-option">${T[lang].vegetarian_option}</small>`:"");
};
const thumb=k=>D[k].img?`<img class="th" src="${IMG[D[k].img]}" alt="" data-lbk="${k}" loading="lazy">`:`<span class="noth">${(D[k].n[0]||"·").replace(/[“"]/,"")}</span>`;
let tab=0;
const secOf=id=>PAGES.find(p=>p[0]===id);
function sectionHtml([t,fa,items]){
  const rows=items.map(k=>k[0]==="#"?`<div class="sub">${PT[k.slice(1)][lang]}</div>`:
    `<div class="it">${thumb(k)}<span><b>${dn(k)}</b>${dishDescription(k)}</span><span class="pr">€ ${D[k].p}</span></div>`).join("");
  return `<section class="sec"><h3>${PT[t][lang]}</h3><div class="fa">${t==="bier"?T[lang].draft_beer:PT[fa][lang]||"&nbsp;"}</div>${rows}</section>`;
}
function showTab(i,scroll){
  if(!menucard)return;
  tab=i;
  menucard.innerHTML=TABS[i][1].map(id=>sectionHtml(secOf(id))).join("");
  menucard.classList.remove("in");void menucard.offsetWidth;menucard.classList.add("in");
  chapEl.querySelectorAll("button").forEach((b,j)=>b.classList.toggle("on",j===i));
  menucard.querySelectorAll(".th").forEach(t=>t.addEventListener("click",()=>openLb(t.src,dn(t.dataset.lbk))));
  if(scroll)chapEl.scrollIntoView({behavior:"smooth",block:"start"});
}
function buildMenu(){
  if(!chapEl)return;
  chapEl.innerHTML=TABS.map(([k],i)=>`<button type="button" data-t="${i}">${TABLABEL[k][lang]}</button>`).join("");
  chapEl.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>showTab(+b.dataset.t,true)));
  showTab(Math.min(tab,TABS.length-1),false);
}

/* ---------- winkel ---------- */
const pgrid=document.getElementById("pgrid"),sfilters=document.getElementById("filters"),saisles=document.getElementById("aisles");
let filt="all";
function shopCards(){
  if(!pgrid)return;
  const list=PRODUCTS.filter(p=>filt==="all"||p.c===filt);
  pgrid.innerHTML=list.map(p=>`<article class="pcard"><div class="ph" style="background:${SIMG[p.i].bg}"><img src="${SIMG[p.i].f}" alt="${p.n[lang]}" loading="lazy" decoding="async" data-c="${p.n[lang]}" onerror="this.remove()"></div><div class="t">${p.b?`<span class="br">${p.b}</span>`:""}<b>${p.n[lang]}</b><small>${p.d[lang]}</small></div></article>`).join("");
  pgrid.querySelectorAll("img").forEach(im=>im.addEventListener("click",()=>openLb(im.src,im.dataset.c)));
}
function renderShop(){
  if(!pgrid)return;
  const used=[...new Set(PRODUCTS.map(p=>p.c))];
  sfilters.innerHTML=`<button data-f="all">${T[lang].s_all}</button>`+used.map(k=>`<button data-f="${k}">${AISLE_T[k][lang][0]}</button>`).join("");
  sfilters.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",b.dataset.f===filt);b.addEventListener("click",()=>{filt=b.dataset.f;renderShop();});});
  shopCards();
  saisles.innerHTML=AISLES.map(a=>`<section class="aisle"><h4><i>&#10022;</i>${AISLE_T[a.k][lang][0]}</h4><div class="fa">${AISLE_T[a.k][lang][1]}</div><ul>${a.it[lang].map(x=>`<li>${x}</li>`).join("")}</ul></section>`).join("");
}

/* ---------- galerij ---------- */
const grid=$("grid");
if(grid){
grid.innerHTML=GAL.map(([f,c])=>`<figure data-f="${f}" data-c="${c}"><img src="${IMG[f]}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`).join("");
grid.querySelectorAll("figure").forEach((f,i)=>{f.style.transitionDelay=(i%6)*80+"ms";f.addEventListener("click",()=>openLb(IMG[f.dataset.f],f.dataset.c))});
}

/* ---------- reviews ---------- */
if($("revgrid")){
const REV=[["Quiet atmosphere, warm design and a spotless caf\u00e9; the Gheimeh and Kashke Bademjan were exceptional."], ["The food was great and the atmosphere cosy; we were treated like guests in a home."], ["A cosy Iranian restaurant with a shop full of Iranian snacks and ingredients downstairs."], ["Ghormeh Sabzi and Gheimeh were amazing: tender meat, perfectly balanced flavours, lovely teas afterwards."], ["Super cosy Persian caf\u00e9; it feels like eating your grandma's cooking."]];
document.getElementById("revgrid").innerHTML=REV.map(r=>`<article><span class="st">★★★★★</span><p>${r[0]}</p><small>Google</small></article>`).join("");
}
if($("iggrid")){
document.getElementById("iggrid").innerHTML=["hero_02","kotlet","chormehsabsi","mastokhiyar","sekanjebin","kashke_e_badamjaan"].map(f=>`<a href="https://www.instagram.com/cafenava.be/" target="_blank" rel="noopener" aria-label="Instagram"><img src="${IMG[f]}" alt="" loading="lazy"></a>`).join("");
}

function marqHtml(){const names=["chainava","tokhme","sekanjebin","kashk","gheimeh","ghormeh","bademjan","kotlet","bandari","kuku","saffice","faludeh","mastokhiar","zeitoon"].map(k=>D[k].n).map(n=>`<span>${n}</span>`).join("");return names+names}

/* ---------- take-away ---------- */
let updTake=null;
const TAKE=[["brood",["soup","bandari","smos","kotlet","kuku"]],["dish",["kashk","dopiazeh","gheimeh","ghormeh","bademjan"]],["sub_side",["mastokhiar","shirazi","zeitoon"]],["sub_des",["saffice","faludeh","cake","chocake"]],["sub_snack",["olives","almonds","platter"]],["limo",["tokhme","sekanjebin","kahkshir","zaferun","ablimoo"]]];
const cart=(()=>{try{return JSON.parse(localStorage.getItem("nava-cart")||"{}")}catch(e){return {}}})();
const num=p=>parseFloat(p.split("/")[0].replace(",","."));
const eur=n=>"€ "+n.toFixed(2).replace(".",",");
function saveCart(){try{localStorage.setItem("nava-cart",JSON.stringify(cart))}catch(e){}}
function qtyCtl(k){const q=cart[k]||0;return `<span class="qty ${q?"":"zero"}"><button type="button" data-k="${k}" data-d="-1" aria-label="-">−</button><span>${q}</span><button type="button" data-k="${k}" data-d="1" aria-label="+">+</button></span>`}
function inViewport(el){if(!el)return false;const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}
function cartCount(){return Object.keys(cart).filter(k=>cart[k]>0).reduce((a,k)=>a+cart[k],0)}
function cartTotal(){return Object.keys(cart).filter(k=>cart[k]>0).reduce((a,k)=>a+cart[k]*num(D[k].p),0)}
function renderBadge(){
  const badge=$("cartbadge");if(!badge)return;
  const n=cartCount();badge.textContent=`🛍 ${n} · ${eur(cartTotal())}`;
  badge.classList.toggle("show",n>0&&!inViewport($("cart")));
}
function renderTake(){
  const el=$("takeitems");if(!el){renderBadge();return}
  el.innerHTML=TAKE.map(([g,items])=>`<h3>${PT[g][lang]}</h3>`+items.map(k=>`<div class="it">${D[k].img?`<img src="${IMG[D[k].img]}" alt="" data-lbk="${k}">`:`<span class="noth">${D[k].n[0].replace(/[“"]/,"")}</span>`}<span><b>${dn(k)}</b>${dishDescription(k)}</span><span class="pr">€ ${D[k].p.split("/")[0].trim()}</span>${qtyCtl(k)}</div>`).join("")).join("");
  el.querySelectorAll("img[data-lbk]").forEach(i=>i.addEventListener("click",()=>openLb(i.src,dn(i.dataset.lbk))));
  renderCart();
}
function renderCart(){
  const lines=$("lines");
  if(lines){
    const keys=Object.keys(cart).filter(k=>cart[k]>0),t=T[lang];let tot=0;
    lines.innerHTML=keys.length?keys.map(k=>{tot+=cart[k]*num(D[k].p);return `<div class="ln"><span>${dn(k)}</span><span>${eur(cart[k]*num(D[k].p))}</span>${qtyCtl(k)}</div>`}).join(""):`<p class="empty">${t.t_empty}</p>`;
    $("total").textContent=eur(tot);
    document.querySelectorAll("#takeitems .qty").forEach(q=>{const k=q.querySelector("button").dataset.k,c=cart[k]||0;q.querySelector("span").textContent=c;q.classList.toggle("zero",!c)});
  }
  renderBadge();
}
document.addEventListener("click",e=>{const b=e.target.closest(".qty button");if(!b)return;const k=b.dataset.k;cart[k]=Math.max(0,(cart[k]||0)+ +b.dataset.d);saveCart();renderCart();});
addEventListener("scroll",renderBadge,{passive:true});
if($("takeform")){
  const tform=$("takeform"),terr=$("terr");
  updTake=setupDate($("tdate"),$("ttime"),OPEN+0.5,CLOSE,30,terr);
  tform.addEventListener("submit",e=>{
    e.preventDefault();const f=new FormData(tform),t=T[lang];terr.textContent="";
    const keys=Object.keys(cart).filter(k=>cart[k]>0);
    if(!keys.length){terr.textContent=t.x_empty;return}
    if(!f.get("date")||!f.get("time")){terr.textContent=t.x_past;return}
    if(new Date(f.get("date")+"T12:00").getDay()===CLOSED_DAY){terr.textContent=t.x_wed;return}
    if(!f.get("name").trim()||!f.get("phone").trim()){terr.textContent=t.x_req;return}
    let tot=0;const rows=keys.map(k=>{tot+=cart[k]*num(D[k].p);return `${cart[k]}× ${dn(k)} — ${eur(cart[k]*num(D[k].p))}`}).join("\n");
    const msg=`${t.m_order} Café Restaurant Nava\n${t.m_pickup}: ${niceDate(f.get("date"))} ${f.get("time")}\n\n${rows}\n${t.t_total}: ${eur(tot)} (${t.m_pay})\n\n${t.m_name}: ${f.get("name")}\n${t.m_phone}: ${f.get("phone")}${f.get("note")?"\n"+t.m_note+": "+f.get("note"):""}`;
    showDone($("tdone"),t.ok_take,t.ok_take_p,msg);
  });
}

/* ---------- contactformulier ---------- */
if($("form")){
document.getElementById("form").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target);location.href=`mailto:info@cafenava.be?subject=${encodeURIComponent(f.get("subject"))}&body=${encodeURIComponent(f.get("message")+"\n\n"+f.get("name")+" — "+f.get("email"))}`;});
}

/* ---------- juridisch ---------- */
const modal=document.getElementById("modal");
document.querySelectorAll("[data-legal]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const t=LEGAL[a.dataset.legal];document.getElementById("mbody").innerHTML=t[lang]||t.en;modal.classList.add("open");modal.querySelector(".box").scrollTop=0;}));
document.getElementById("mclose").addEventListener("click",()=>modal.classList.remove("open"));
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")modal.classList.remove("open")});

/* juridische documenten ook vanaf de winkelpagina openen */
(()=>{const q=new URLSearchParams(location.search).get("legal");
 if(q&&LEGAL[q]){const t=LEGAL[q];document.getElementById("mbody").innerHTML=t[lang]||t.en;modal.classList.add("open");}})();

setLang(pickLang());

/* ---------- reveal + nav + mobiel ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll(".rv,.grid figure").forEach(el=>io.observe(el));
const totop=$("totop");
function onScroll(){if(totop)totop.classList.toggle("show",scrollY>600);}
addEventListener("scroll",onScroll,{passive:true});onScroll();
if(totop)totop.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
const side=$("side"),burger=$("burger");
if(burger){
  const mobile=matchMedia("(max-width:900px)");
  function setMobileMenu(open){
    side.classList.toggle("open",open);
    burger.classList.toggle("x",open);
    burger.setAttribute("aria-expanded",String(open));
    side.inert=mobile.matches&&!open;
  }
  setMobileMenu(false);
  mobile.addEventListener("change",()=>setMobileMenu(false));
  burger.addEventListener("click",()=>setMobileMenu(!side.classList.contains("open")));
  side.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>setMobileMenu(false)));
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&side.classList.contains("open")){
      setMobileMenu(false);
      burger.focus();
    }
  });
}
(()=>{const p=document.body.dataset.page;document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.p===p));})();
