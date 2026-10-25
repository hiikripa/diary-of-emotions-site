/* Diary of Emotions - shared helpers (used by public pages and admin.html).
   Contains NO privileged logic: real protection is enforced by firestore.rules. */

// Firebase client configuration (public by design; protected by Firestore rules + API key restrictions).
const firebaseConfig = {
  apiKey: "AIzaSyAN3PZkQPwyccacKtYKSkZUxWU1vPgbwF8",
  authDomain: "diary-of-emotions-43aa7.firebaseapp.com",
  projectId: "diary-of-emotions-43aa7",
  storageBucket: "diary-of-emotions-43aa7.firebasestorage.app",
  messagingSenderId: "470878888247",
  appId: "1:470878888247:web:fa25b86b370327a46e3ab2",
  measurementId: "G-K63EVQKXYW"
};
// The owner's UID is NOT a secret. It is only an identifier; knowing it grants nothing.
const OWNER_UID = "J3QSrYKfINYUmCOCBah7lNSf5T83";

// ------------------------------------------------------------------ defaults
const DEFAULT_TC = {rose:'#C9828A',roseDeep:'#A45D65',lav:'#B8A9C9',lavLight:'#EDE8F5',cream:'#FDF8F4',plum:'#2E1A2E',plumMid:'#4A3050'};
const DEFAULT_SS = {
  name:'Diary of Emotions', tag:'Aesthetic Gift Hampers',
  ann:'🎁 Flat Rs. 50 delivery &nbsp;|&nbsp; PAN India delivery &nbsp;|&nbsp; WhatsApp: +91 9332414150',
  wa:'919332414150', ig:'dilsepannetak', fb:'https://facebook.com/share/1KNr3Dnrrj/', email:'hiikripa@gmail.com',
  upi:'hiikripa@okicici', delivery:50, freeAbove:0, radius:'16px',
  flashOn:false, flashEnd:null
};
const DEFAULT_CONTENT = {
  hero:{eyebrow:'Handcrafted with love in India',title1:'Gift someone a',titleEm:'feeling',
    body:'Dreamy, aesthetic hampers filled with stationery, self-care · little joys · curated for every occasion.',
    trust1:'Made with love',trust2:'PAN India delivery',trust3:'Custom gifting',btn1:'Explore Hampers',btn2:'Custom Order',
    badge1:'Gift Hampers',badge2:'500+ Happy Gifters',badge3:'Made with Love'},
  home:{
    catEyebrow:'Browse by vibe',catTitle:'What are you feeling?',
    favEyebrow:'Most loved',favTitle:'Fan Favourites',
    whyEyebrow:'Why us',whyTitle1:'Gifting that actually',whyTitleEm:'feels special',
    whyBody:"We don't just pack boxes … we curate emotions.",
    whyPoints:[
      {icon:'🎁',title:'Handpicked items',desc:'Each product chosen for its aesthetic and feel'},
      {icon:'💍',title:'Beautiful packaging',desc:'Instagram-worthy boxes, ready to gift'},
      {icon:'📦',title:'PAN India delivery',desc:'We ship across all of India'},
      {icon:'💌',title:'Personal message',desc:'Add a custom note with every order'}],
    stat1n:'500+',stat1l:'Happy gifters',stat2n:'★ 4.9',stat2l:'Average rating',stat3n:'30+',stat3l:'Unique hampers',
    testiEyebrow:'Real love notes',testiTitle:'What gifters are saying',
    testimonials:[
      {text:'The packaging was SO beautiful, my friend literally cried when she opened it!',author:'Customer, Mumbai'},
      {text:'Ordered the Cosmic Book Lover for my sister. She loved every single item. Amazing quality!',author:'Sneha R., Bangalore'},
      {text:'Diary of Emotions is genuinely different. Everything feels curated with care.',author:'Aanya K., Delhi'}],
    igEyebrow:'Stay in the loop',igTitle:'Follow our journey 💕',igBody:'New launches, gifting inspo, behind the scenes - all on Instagram.'
  },
  shop:{eyebrow:'All hampers',title:'Shop by feeling',sub:'Every box curated to make someone feel truly special.',
    customTitle:'Need something custom?',customSub:'We create personalised hampers for every occasion and budget.'},
  about:{eyebrow:'Our story',heroTitle:'Born from a love of gifting',heroSub:'Every hamper is a little diary entry - filled with feelings, not just products.',
    h2:'We believe a gift should feel like a hug',
    p1:'Diary of Emotions started with one simple frustration - gifts that looked pretty but felt hollow inside.',
    p2:'Every hamper we create starts with an emotion - what do you want the other person to feel? We build backwards from there.',
    p3:"We're a small Indian brand, handpicking every item ourselves. Nothing goes in a box unless we'd love to receive it ourselves.",
    values:[
      {icon:'💕',title:'Emotion first',desc:'We think about feelings, not just products.'},
      {icon:'✨',title:'Aesthetic always',desc:'Everything beautiful, from box to every item.'},
      {icon:'🎉',title:'No fillers',desc:"Every product earns its place or doesn't come in."},
      {icon:'🏠',title:'Made in India',desc:'Supporting Indian small businesses.'},
      {icon:'📦',title:'PAN India',desc:'Shipping everywhere, packaged to arrive perfect.'},
      {icon:'💌',title:'Personal touch',desc:'Handwritten messages with every order.'}]},
  contact:{eyebrow:'Say hello',heroTitle:"We'd love to hear from you",heroSub:"Custom hampers, bulk orders, any question … we're here.",
    waNote:'Fastest response',igNote:'DM us anytime',fbNote:'Follow us on Facebook',
    responseTime:'2–4 hours',responseNote:'on WhatsApp. We personally read every message.'},
  policies:{title:'Shipping, Returns & Privacy',updated:'Last updated: July 2026',sections:[
    {title:'Shipping Policy',points:['Orders processed within 1–2 business days.','Standard delivery: 4–7 business days.','Express available on request via WhatsApp.','Tracking shared after dispatch.']},
    {title:'Return & Exchange Policy',points:['Damaged items: contact within 24 hours with photo.','No returns for change of mind.','Custom orders non-cancellable once production starts.']},
    {title:'Cancellation Policy',points:['Cancel within 6 hours for full refund.','After 6 hours before dispatch: 50% refund.']},
    {title:'Privacy Policy',points:['Data collected only to process orders.','We never sell your data.','Request deletion anytime.']}]},
  footer:{tagline:'Making someone smile, one hamper at a time.',copyright:'© 2026 Diary of Emotions. All rights reserved.'}
};
// Starter catalogue. Used only (a) by admin "Import starter products" on an empty store and
// (b) as an offline fallback on the public site if Firestore cannot be reached at all.
const SEED_PRODUCTS = [
  {id:1,name:'Cosmic Book Lover',cat:'Best Friends',price:799,compareAt:999,cost:350,emoji:'📚',images:[],desc:'Perfect for the bookworm bestie',long:'A dreamy hamper for the book lover in your life, filled with things to make reading even cosier.',includes:['Scented candle','Floral bookmark','Sticky notes','Gold pen set','Artisan chocolate'],stock:12,lowAt:5,featured:true,badge:'Popular',disc:{on:true,type:'percent',val:20,label:''}},
  {id:2,name:'Self Care Ritual',cat:'Self Care',price:599,compareAt:699,cost:280,emoji:'🌞',images:[],desc:'Unwind and recharge beautifully',long:'A gentle collection of self-care essentials to help someone feel nurtured and calm.',includes:['Bath salts','Face mask','Journal','Lavender sachet','Lip balm'],stock:5,lowAt:5,featured:true,badge:'',disc:{on:true,type:'flat',val:100,label:''}},
  {id:3,name:'Study Buddy Box',cat:'Study Vibes',price:349,compareAt:0,cost:180,emoji:'📝',images:[],desc:'Fuel the grind with stationery',long:'Everything a student needs to stay motivated, organised, and caffeinated.',includes:['Pastel highlighters','Grid sticky notes','Mini planner','Snack mix','Stickers'],stock:20,lowAt:5,featured:false,badge:'New',disc:{on:false,type:'percent',val:0,label:''}},
  {id:4,name:'Galaxy Dream Kit',cat:'Galaxy',price:1299,compareAt:1499,cost:620,emoji:'🌌',images:[],desc:'Cosmic vibes, luxury feel',long:'An ethereal collection for the one who loves all things mystical and beautiful.',includes:['Star projector','Crystal pendant','Moon journal','Glitter pens','Cosmic face mask'],stock:3,lowAt:5,featured:true,badge:'Sale',disc:{on:true,type:'flat',val:200,label:'Flash Deal'}},
  {id:5,name:'Premium Luxe Hamper',cat:'Premium Luxe',price:1999,compareAt:0,cost:950,emoji:'✨',images:[],desc:'The ultimate gift statement',long:'Our most opulent hamper … everything curated for maximum wow factor.',includes:['Luxury soy candle','Silk scrunchies','Belgian chocolates','Gold journal','Rose quartz'],stock:0,lowAt:3,featured:true,badge:'',disc:{on:false,type:'percent',val:0,label:''}},
  {id:6,name:'BFF Forever Box',cat:'Best Friends',price:449,compareAt:549,cost:200,emoji:'💓',images:[],desc:'Celebrate your ride-or-die',long:"A hamper packed with little love notes and things to remind them you're always there.",includes:['Friendship bracelet kit','Card','Sticker pack','Mini frame','Snacks'],stock:8,lowAt:5,featured:false,badge:'',disc:{on:true,type:'percent',val:18,label:''}},
  {id:7,name:'Morning Rituals',cat:'Self Care',price:699,compareAt:0,cost:320,emoji:'☕',images:[],desc:'Start every day beautifully',long:'A morning wellness kit to make every sunrise feel intentional.',includes:['Herbal tea set','Journal','Lip balm','Eye mask','Affirmation cards'],stock:15,lowAt:5,featured:false,badge:'',disc:{on:false,type:'percent',val:0,label:''}},
  {id:8,name:'Study Snack Attack',cat:'Study Vibes',price:399,compareAt:0,cost:190,emoji:'🍫',images:[],desc:'Snacks and stationery combo',long:'Because studying is always better with snacks.',includes:['Mixed snacks','Colour pens','To-do pad','Sticker sheet'],stock:25,lowAt:10,featured:false,badge:'',disc:{on:false,type:'percent',val:0,label:''}}
];
const CATEGORIES = ['Best Friends','Self Care','Study Vibes','Premium Luxe','Galaxy','Custom'];
const ORDER_STATUSES = ['pending_confirmation','confirmed','packed','shipped','delivered','cancelled'];
const STATUS_LABEL = {pending_confirmation:'Pending',confirmed:'Confirmed',packed:'Packed',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled'};

// ------------------------------------------------------------------ state shared by pages
let PRODUCTS = [];
let SS = JSON.parse(JSON.stringify(DEFAULT_SS));
let TC = {...DEFAULT_TC};
let CONTENT = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
let offersOn = true;

// ------------------------------------------------------------------ helpers
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// For owner-authored copy: strips markup but keeps character entities such as &#127873; / &nbsp;
function txt(s){return String(s==null?'':s).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function dec(s){const t=document.createElement('textarea');t.innerHTML=String(s==null?'':s);return t.value;}
function fmt(n){return 'Rs. '+Number(n||0).toLocaleString('en-IN');}
function clone(o){return JSON.parse(JSON.stringify(o));}
function deepMerge(base,over){
  if(Array.isArray(base)||Array.isArray(over)) return over===undefined?base:over;
  if(base&&typeof base==='object'&&over&&typeof over==='object'){
    const out={...base};
    Object.keys(over).forEach(k=>{out[k]=k in base?deepMerge(base[k],over[k]):over[k];});
    return out;
  }
  return over===undefined?base:over;
}
function waDisplay(){const d=String(SS.wa||'').replace(/\D/g,'');return d.length>10?'+'+d.slice(0,d.length-10)+' '+d.slice(-10):d;}
function flashActive(){return !!SS.flashOn&&Number(SS.flashEnd)>Date.now();}

function stars(n){return [1,2,3,4,5].map(s=>`<span class="star${s<=n?'':' e'}">&#9733;</span>`).join('');}

// ------------------------------------------------------------------ pricing
function effPrice(p){
  if(!offersOn||!p.disc||!p.disc.on||!p.disc.val)return p.price;
  const t=p.disc.type,v=Number(p.disc.val);
  if(t==='percent')return Math.max(0,Math.round(p.price*(1-v/100)));
  if(t==='flat')return Math.max(0,p.price-v);
  if(t==='flash'&&flashActive())return Math.max(0,Math.round(p.price*(1-v/100)));
  return p.price;
}
function discLabel(p){
  if(!offersOn||!p.disc||!p.disc.on)return null;
  if(p.disc.type==='flash'&&!flashActive())return null;
  if(p.disc.label)return txt(p.disc.label);
  if(p.disc.type==='percent'&&p.disc.val)return '-'+p.disc.val+'%';
  if(p.disc.type==='flat'&&p.disc.val)return '-Rs.'+p.disc.val;
  if(p.disc.type==='flash')return '🔥 Flash -'+p.disc.val+'%';
  if(p.disc.type==='freeship')return 'Free Ship';
  if(p.disc.type==='bxgy')return 'Buy X Get Y';
  return null;
}
function stockSt(p){const s=Number(p.stock);return (isNaN(s)||s<=0)?'sold-out':s<=Number(p.lowAt)?'low-stock':'in-stock';}
function deliveryFor(subtotal,cartItems){
  const base=Number(SS.delivery);const d=isNaN(base)?50:base;
  if(SS.freeAbove>0&&subtotal>=SS.freeAbove)return 0;
  if(cartItems&&cartItems.length&&cartItems.every(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return p&&p.disc&&p.disc.on&&p.disc.type==='freeship'&&offersOn;}))return 0;
  return d;
}

// ------------------------------------------------------------------ theme
function mix(hex,withHex,pct){
  const a=hex.replace('#',''),b=withHex.replace('#','');
  const c=i=>Math.round(parseInt(a.substr(i,2),16)*(1-pct)+parseInt(b.substr(i,2),16)*pct);
  return '#'+[0,2,4].map(i=>c(i).toString(16).padStart(2,'0')).join('');
}
function applyTheme(){
  const r=document.documentElement.style,t=TC;
  r.setProperty('--rose',t.rose);r.setProperty('--rose-deep',t.roseDeep);
  r.setProperty('--rose-light',mix(t.rose,'#ffffff',.72));
  r.setProperty('--lav',t.lav);r.setProperty('--lav-light',t.lavLight);r.setProperty('--lav-deep',mix(t.lav,'#000000',.38));
  r.setProperty('--cream',t.cream);r.setProperty('--cream-dark',mix(t.cream,'#000000',.045));
  r.setProperty('--plum',t.plum);r.setProperty('--plum-mid',t.plumMid);
  if(SS.radius)r.setProperty('--radius',SS.radius);
}

// ------------------------------------------------------------------ toast
let toastT=null;
function toast(msg,type=''){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;
  el.className='toast show'+(type==='ok'?' ok':type==='err'?' err':type==='info'?' info':'');
  clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),3400);
}

// ------------------------------------------------------------------ lightbox (image zoom)
var lbImages=[],lbIndex=0,lbScale=1,lbTouchX=0,lbTouchY=0;
function openProductLB(productId,startIndex){
  const p=PRODUCTS.find(x=>x.id===productId);if(!p)return;
  if(!p.images||!p.images.length)return;
  openLB(p.images,startIndex||0);
}
function openLB(images,startIndex){
  if(!images||!images.length)return;
  lbImages=Array.isArray(images)?images.slice():[images];lbIndex=startIndex||0;lbScale=1;lbRender();
  const ov=document.getElementById('lb-overlay');if(ov)ov.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLB(){
  const ov=document.getElementById('lb-overlay'),img=document.getElementById('lb-img');
  if(ov)ov.classList.remove('open');
  if(img){img.style.transform='';img.classList.remove('zoomed');}
  document.body.style.overflow='';lbScale=1;
}
function lbRender(){
  const img=document.getElementById('lb-img'),prev=document.getElementById('lb-prev'),next=document.getElementById('lb-next'),
        counter=document.getElementById('lb-counter'),thumbs=document.getElementById('lb-thumbs');
  if(!img)return;
  img.src=lbImages[lbIndex];img.style.transform='';img.classList.remove('zoomed');lbScale=1;
  const multi=lbImages.length>1;
  if(prev)prev.style.display=multi?'flex':'none';
  if(next)next.style.display=multi?'flex':'none';
  if(counter){counter.style.display=multi?'block':'none';if(multi)counter.textContent=(lbIndex+1)+' / '+lbImages.length;}
  if(thumbs){
    thumbs.style.display=multi?'flex':'none';
    if(multi)thumbs.innerHTML=lbImages.map((src,i)=>'<img class="lb-thumb'+(i===lbIndex?' active':'')+'" src="'+esc(src)+'" onclick="lbGoTo('+i+')" alt="Thumbnail '+(i+1)+'"/>').join('');
  }
}
function lbNav(dir){lbIndex=(lbIndex+dir+lbImages.length)%lbImages.length;lbRender();}
function lbGoTo(i){lbIndex=i;lbRender();}
function lbClickOutside(e){if(e.target&&e.target.id==='lb-overlay')closeLB();}
const LIGHTBOX_HTML=`<div class="lb-overlay" id="lb-overlay" onclick="lbClickOutside(event)">
  <div class="lb-inner"><div class="lb-img-wrap"><img class="lb-img" id="lb-img" src="" alt="Product image" onclick="event.stopPropagation()" draggable="false"/></div></div>
  <button class="lb-close" onclick="closeLB()" title="Close (Esc)">&#x2715;</button>
  <button class="lb-nav lb-prev" id="lb-prev" onclick="lbNav(-1)" style="display:none">&#8249;</button>
  <button class="lb-nav lb-next" id="lb-next" onclick="lbNav(1)" style="display:none">&#8250;</button>
  <div class="lb-dots" id="lb-dots"></div><div class="lb-thumb-strip" id="lb-thumbs"></div>
  <div class="lb-counter" id="lb-counter" style="display:none"></div>
</div>`;
document.addEventListener('keydown',e=>{
  const ov=document.getElementById('lb-overlay');if(!ov||!ov.classList.contains('open'))return;
  if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')lbNav(1);if(e.key==='ArrowLeft')lbNav(-1);
});
window.addEventListener('load',()=>{
  const ov=document.getElementById('lb-overlay'),img=document.getElementById('lb-img');if(!ov||!img)return;
  ov.addEventListener('wheel',e=>{
    if(e.target.id!=='lb-img')return;e.preventDefault();
    lbScale=Math.min(5,Math.max(1,lbScale-e.deltaY*0.003));
    img.style.transform='scale('+lbScale+')';img.classList.toggle('zoomed',lbScale>1);
  },{passive:false});
  img.addEventListener('dblclick',()=>{
    if(lbScale>1){lbScale=1;img.style.transform='';img.classList.remove('zoomed');}
    else{lbScale=2.5;img.style.transform='scale(2.5)';img.classList.add('zoomed');}
  });
  ov.addEventListener('touchstart',e=>{lbTouchX=e.touches[0].clientX;lbTouchY=e.touches[0].clientY;},{passive:true});
  ov.addEventListener('touchend',e=>{
    const dx=lbTouchX-e.changedTouches[0].clientX,dy=Math.abs(lbTouchY-e.changedTouches[0].clientY);
    if(Math.abs(dx)>50&&dy<80&&lbImages.length>1)lbNav(dx>0?1:-1);
  },{passive:true});
});
