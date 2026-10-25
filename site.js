/* Diary of Emotions - public storefront (index, shop, about, contact, policies).
   Customer features only. There is deliberately NO admin code, UI or login in this file.
   All store data is read live from Firestore, so anything changed in admin.html shows up on every page. */

firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const fbDb = firebase.firestore();
fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});

const PAGE = document.body.dataset.page || 'home';
let cart = [];            // [{id, qty}] - persisted in localStorage so it survives page changes
let curP = null, mQty = 1, currentSlide = 0, revRating = 5, shopFilter = 'All';
// Simple human check (a layer of friction against basic bots; real server-side protection = Firebase App Check)
let CAP = {q:'', ans:0}; const PAGE_T0 = Date.now();
const STATES=['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
// Structured address fields (shared by My Addresses and checkout). p = id prefix ('ad' or 'co').
function addrFieldsHTML(p,v){v=v||{};
  const line=v.line!==undefined?v.line:(v.address||'');
  return `<div class="form-group" style="margin-bottom:10px"><label for="${p}-line">Address (House/Flat no., street, area) *</label><textarea class="form-control" id="${p}-line" rows="2" maxlength="200" autocomplete="address-line1" placeholder="House/Flat no., building, street, landmark">${esc(line)}</textarea></div>
  <div class="form-group" style="margin-bottom:10px"><label for="${p}-city">City / Town / Village *</label><input class="form-control" id="${p}-city" maxlength="60" autocomplete="address-level2" value="${esc(v.city||'')}"/></div>
  <div class="form-group" style="margin-bottom:10px"><label for="${p}-district">District *</label><input class="form-control" id="${p}-district" maxlength="60" value="${esc(v.district||'')}"/></div>
  <div class="form-group" style="margin-bottom:10px"><label for="${p}-state">State *</label><select class="form-control" id="${p}-state" autocomplete="address-level1"><option value="">Select state / UT</option>${STATES.map(x=>`<option ${x===v.state?'selected':''}>${x}</option>`).join('')}</select></div>
  <div class="form-group" style="margin-bottom:10px"><label for="${p}-pin">PIN code *</label><input class="form-control" id="${p}-pin" inputmode="numeric" maxlength="6" autocomplete="postal-code" placeholder="6-digit PIN" value="${esc(v.pin||'')}" oninput="pinLookup('${p}')"/><div id="${p}-pinhint" style="font-size:12px;margin-top:4px;min-height:14px"></div></div>`;}
function readAddr(p){const g=i=>(document.getElementById(p+'-'+i)?.value||'').trim();
  return {line:g('line'),city:g('city'),district:g('district'),state:g('state'),pin:g('pin').replace(/\s/g,'')};}
function addrError(a){
  if(!a.line||!a.city||!a.district||!a.state||!a.pin)return 'Please fill address, city/town/village, district, state and PIN code';
  if(a.line.length<5)return 'Please enter the complete address';
  if(!/^[1-9]\d{5}$/.test(a.pin))return 'Enter a valid 6-digit PIN code';
  return '';}
// PIN lookup via the free India Post API (no key). Fills district/state (and city if empty). If it fails, the form works normally.
const PIN_CACHE={};
async function pinLookup(p){
  const pin=document.getElementById(p+'-pin'),hint=document.getElementById(p+'-pinhint');if(!pin||!hint)return;
  const v=pin.value.replace(/\s/g,'');
  if(!/^[1-9]\d{5}$/.test(v)){hint.textContent='';return;}
  hint.style.color='var(--muted)';hint.textContent='Checking PIN…';
  try{
    let r=PIN_CACHE[v];
    if(!r){const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);
      const res=await fetch('https://api.postalpincode.in/pincode/'+v,{signal:c.signal});clearTimeout(t);
      r=(await res.json())[0];PIN_CACHE[v]=r;}
    if(pin.value.replace(/\s/g,'')!==v)return;
    const po=r&&r.Status==='Success'&&r.PostOffice&&r.PostOffice[0];
    if(!po){hint.style.color='#b3261e';hint.textContent='This PIN code was not found. Please check it.';return;}
    const set=(k,val)=>{const e=document.getElementById(p+'-'+k);if(e&&val)e.value=val;};
    set('district',po.District);
    const st=STATES.find(x=>x.toLowerCase()===String(po.State).toLowerCase())||(/jammu/i.test(po.State)?'Jammu and Kashmir':'');
    if(st)set('state',st);
    const city=document.getElementById(p+'-city');
    if(city&&!city.value.trim())city.value=(po.Block&&po.Block!=='NA')?po.Block:po.Name;
    hint.style.color='#2e7d32';hint.textContent='✔ '+po.District+', '+po.State;
  }catch(e){hint.textContent='';}
}
function composeAddr(a){return `${a.line}, ${a.city}, Dist. ${a.district}, ${a.state} - ${a.pin}`;}
function newCaptcha(){
  const a=2+Math.floor(Math.random()*8),b=2+Math.floor(Math.random()*8),m=Math.random();
  if(m<.4){CAP={q:`${a} + ${b}`,ans:a+b};}
  else if(m<.7){const x=Math.max(a,b),y=Math.min(a,b);CAP={q:`${x} − ${y}`,ans:x-y};}
  else{CAP={q:`${a} × ${Math.min(b,5)}`,ans:a*Math.min(b,5)};}
}
newCaptcha();
function captchaBox(id){
  return `<div class="form-group" style="margin-bottom:12px"><label for="${id}">Security check: what is <strong class="cap-q">${CAP.q}</strong> ? <a style="font-size:11px;color:var(--rose-deep);cursor:pointer;margin-left:6px" onclick="refreshCaptcha()">↻ new</a></label><input class="form-control" id="${id}" inputmode="numeric" autocomplete="off" placeholder="Answer" style="max-width:140px"/>
  <input type="text" id="${id}-hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0;width:0"/></div>`;
}
function refreshCaptcha(){newCaptcha();document.querySelectorAll('.cap-q').forEach(e=>e.textContent=CAP.q);['signup-cap','co-cap'].forEach(i=>{const e=document.getElementById(i);if(e)e.value='';});}
function captchaOk(id){
  const v=document.getElementById(id),hp=document.getElementById(id+'-hp');
  if(hp&&hp.value)return false;
  if(!v||String(v.value).trim()===''||Number(v.value)!==CAP.ans){toast('Security check answer is wrong - please try again','err');refreshCaptcha();return false;}
  return true;
}
let PROFILE = null, signingUp = false, addrEditing = null, authReady = false;
let currentUser = null, loggedIn = false, productsReady = false, view = 'main', flashTimer = null;

// ------------------------------------------------------------------ cart persistence
function loadCart(){try{const c=JSON.parse(localStorage.getItem('doe_cart')||'[]');if(Array.isArray(c))cart=c.filter(i=>i&&Number.isFinite(i.id)&&i.qty>0);}catch(e){}}
function saveCart(){try{localStorage.setItem('doe_cart',JSON.stringify(cart));}catch(e){}}
function cartLines(){
  return cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return p?{id:p.id,qty:i.qty,p,price:effPrice(p)}:null;}).filter(Boolean);
}
function reconcileCart(){
  if(!productsReady)return;
  cart=cart.filter(i=>{const p=PRODUCTS.find(x=>x.id===i.id);if(!p||stockSt(p)==='sold-out')return false;i.qty=Math.min(i.qty,Number(p.stock)||1);return i.qty>0;});
  saveCart();
}

// ------------------------------------------------------------------ chrome (header, pages, footer, overlays)
const NAV = [['home','index.html','Home'],['shop','shop.html','Shop'],['about','about.html','About'],['contact','contact.html','Contact'],['policies','policies.html','Policies']];
const G_SVG = '<svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>';

function buildChrome(){
  document.getElementById('app').innerHTML = `
<div class="ann-bar" id="ann-bar"></div>
<div class="occ-strip" id="occ-strip" style="display:none"></div>
<header class="site-header" id="site-header"><div class="header-inner">
  <button class="hamburger" onclick="openMob()" aria-label="Menu"><span></span><span></span><span></span></button>
  <a class="logo" href="index.html"><span class="logo-main" id="logo-name"></span><span class="logo-sub" id="logo-tag"></span></a>
  <nav class="main-nav">${NAV.map(([k,h,l])=>`<button class="nl${k===PAGE?' active':''}" onclick="location.href='${h}'">${l}</button>`).join('')}</nav>
  <div class="nav-acts">
    <button class="icon-btn" id="acc-btn" onclick="goAccount()" title="Account" aria-label="Account"><span id="acc-dot" style="display:none;position:absolute;top:5px;right:5px;width:9px;height:9px;border-radius:50%;background:#4CAF50;border:1.5px solid #fff"></span><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
    <button class="icon-btn" onclick="openCart()" title="Cart" aria-label="Cart"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span class="cbadge" id="cart-badge" style="display:none">0</span></button>
  </div>
</div></header>
<div class="nav-ov" id="nav-ov" onclick="closeMob()"></div>
<div class="mob-nav" id="mob-nav"><button class="mob-nav-close" onclick="closeMob()">&#x2715;</button>
  ${NAV.map(([k,h,l])=>`<button class="nl" onclick="location.href='${h}'">${l}</button>`).join('')}
  <button class="nl" id="mob-install" style="display:none" onclick="closeMob();window.installApp&&installApp()">&#128242; Install App</button>
  <button class="nl" id="mob-logout" style="display:none;color:var(--danger)" onclick="closeMob();doLogout()">Log Out</button></div>

<div class="page active" id="page-main"></div>

<div class="page" id="page-login"><div class="auth-page"><div class="auth-card">
  <div class="auth-logo"><div class="lm" data-name></div><div class="ls" data-tag></div></div>
  <h2 class="auth-title">Welcome back</h2><p class="auth-sub">Log in to your account</p>
  <div class="form-group"><label>Email</label><input class="form-control" id="login-email" type="email" autocomplete="email" placeholder="Your email ID"/></div>
  <div class="form-group"><label>Password</label><input class="form-control" id="login-password" type="password" autocomplete="current-password" placeholder="••••••••"/></div>
  <button class="btn btn-primary btn-full" onclick="doLogin()">Log In</button>
  <div style="text-align:right;margin-top:8px"><a style="font-size:12px;color:var(--rose-deep);cursor:pointer" onclick="doReset()">Forgot password?</a></div>
  <div class="auth-div"><span>or</span></div>
  <button class="g-btn" onclick="doGoogleLogin()">${G_SVG} Continue with Google</button>
  <div class="auth-sw">Don't have an account? <a onclick="showView('signup')">Sign up</a></div>
</div></div></div>

<div class="page" id="page-signup"><div class="auth-page"><div class="auth-card">
  <div class="auth-logo"><div class="lm" data-name></div><div class="ls" data-tag></div></div>
  <h2 class="auth-title">Create account</h2><p class="auth-sub">Join to track orders and leave reviews</p>
  <div class="form-group"><label>Name</label><input class="form-control" id="signup-name" autocomplete="name" placeholder="Your name"/></div>
  <div class="form-group"><label>Mobile number</label><input class="form-control" id="signup-phone" type="tel" autocomplete="tel" placeholder="10-digit mobile number"/></div>
  <div class="form-group"><label>Email</label><input class="form-control" id="signup-email" type="email" autocomplete="email" placeholder="Your email ID"/></div>
  <div class="form-group"><label>Password</label><input class="form-control" id="signup-password" type="password" autocomplete="new-password" placeholder="Min. 6 characters"/></div>
  ${captchaBox('signup-cap')}
  <button class="btn btn-primary btn-full" onclick="doSignup()">Create Account</button>
  <div class="auth-div"><span>or</span></div>
  <button class="g-btn" onclick="doGoogleLogin()">${G_SVG} Continue with Google</button>
  <div class="auth-sw">Already have an account? <a onclick="showView('login')">Log in</a></div>
</div></div></div>

<div class="page" id="page-account"></div>
<div id="site-footer"></div>

<div class="modal-overlay" id="modal-ov" onclick="if(event.target===this)closeModal()"><div class="modal-box" id="modal-box">
  <div class="modal-img" id="modal-img"></div>
  <div class="modal-body">
    <div class="modal-name" id="modal-name"></div>
    <div class="modal-price-row"><span class="modal-price" id="modal-price"></span><span class="modal-orig" id="modal-orig"></span><span class="modal-disc" id="modal-disc" style="display:none"></span></div>
    <div class="modal-desc" id="modal-desc"></div>
    <div class="inc-title">What's inside</div><div class="inc-list" id="modal-inc"></div>
    <div id="modal-stock"></div>
    <div class="qty-row" id="qty-row" style="display:none"><span style="font-size:12.5px;color:var(--muted)">Qty:</span>
      <button class="qty-btn" onclick="changeQty(-1)">-</button><span id="mq" style="font-size:14px;font-weight:500;color:var(--plum);min-width:18px;text-align:center">1</span><button class="qty-btn" onclick="changeQty(1)">+</button></div>
    <div class="modal-acts" id="modal-acts"></div>
    <div class="reviews-sec"><div class="reviews-title" id="rev-title">Customer Reviews</div><div id="modal-revs"></div>
      <div class="rev-form" id="rev-form"><h4>Write a review</h4><div class="star-pick" id="star-pick"></div>
        <textarea class="rev-ta" id="rev-ta" maxlength="1000" placeholder="Share your experience..."></textarea>
        <div style="margin-top:9px"><button class="btn btn-primary btn-sm" onclick="submitRev()">Post Review</button></div></div>
      <div class="login-req" id="login-req" style="display:none"><p>Log in to leave a review.</p><a onclick="closeModal();showView('login')">Log In</a></div>
    </div>
  </div>
</div></div>

<div class="cart-ov" id="cart-ov" onclick="closeCart()"></div>
<aside class="cart-sb" id="cart-sb"><div class="cart-hd"><h3>Your Cart</h3><button class="icon-btn" onclick="closeCart()">&#x2715;</button></div>
  <div class="cart-body" id="cart-body"></div><div id="cart-ft"></div></aside>
<nav class="tabbar" id="tabbar" aria-label="App navigation">
  <a class="tb${PAGE==='home'?' on':''}" href="index.html"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z"/></svg><span>Home</span></a>
  <a class="tb${PAGE==='shop'?' on':''}" href="shop.html"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-1-4-6-4-6-1.5S10 8 12 8zm0 0c1-4 6-4 6-1.5S14 8 12 8z"/></svg><span>Shop</span></a>
  <button class="tb" type="button" onclick="openCart()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span>Cart</span><i class="tb-bad" id="tb-badge" style="display:none"></i></button>
  <button class="tb" type="button" onclick="goAccount()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Account</span></button>
</nav>
<div class="toast" id="toast"></div>
${LIGHTBOX_HTML}`;
  window.addEventListener('scroll',()=>document.getElementById('site-header').classList.toggle('scrolled',window.scrollY>30));
}

// ------------------------------------------------------------------ page templates (rendered from CONTENT/SS)
function igUrl(){return 'https://instagram.com/'+encodeURIComponent(String(SS.ig||'').replace(/^@/,''));}

function tplHome(){
  const h=CONTENT.hero,c=CONTENT.home;
  return `<div class="hero"><div>
    <p class="hero-eyebrow">${txt(h.eyebrow)}</p>
    <h1 class="hero-title">${txt(h.title1)}<br><em>${txt(h.titleEm)}</em></h1>
    <p class="hero-body">${txt(h.body)}</p>
    <div class="hero-btns"><button class="btn btn-primary" onclick="location.href='shop.html'">${txt(h.btn1)}</button><button class="btn btn-ghost" onclick="location.href='contact.html'">${txt(h.btn2)}</button></div>
    <div class="hero-trust"><span>&#10003; ${txt(h.trust1)}</span><span>&#10003; ${txt(h.trust2)}</span><span>&#10003; ${txt(h.trust3)}</span></div>
  </div><div class="hero-visual"><div class="blob"></div>
    <div class="fc"><span class="fc-emoji">🎁</span><span class="fc-label">${txt(h.badge1)}</span></div>
    <div class="fc"><span class="fc-emoji">★</span><span class="fc-label">${txt(h.badge2)}</span></div>
    <div class="fc"><span class="fc-emoji">💕</span><span class="fc-label">${txt(h.badge3)}</span></div></div></div>
  <div class="flash-strip" id="flash-strip" style="display:none"><div><h3>🔥 Flash Sale - Limited Time!</h3><p style="font-size:12px;opacity:.85">Grab these deals before they're gone</p></div>
    <div class="flash-timer"><div class="timer-block"><span class="timer-num" id="t-h">00</span><span class="timer-lbl">Hrs</span></div><span style="font-size:22px;font-weight:700">:</span><div class="timer-block"><span class="timer-num" id="t-m">00</span><span class="timer-lbl">Min</span></div><span style="font-size:22px;font-weight:700">:</span><div class="timer-block"><span class="timer-num" id="t-s">00</span><span class="timer-lbl">Sec</span></div></div></div>
  <section class="section" style="background:var(--cream-dark)"><div class="container">
    <div class="sec-head"><span class="eyebrow">${txt(c.catEyebrow)}</span><h2 class="sec-title">${txt(c.catTitle)}</h2></div>
    <div class="cats-grid">
      ${[['Best Friends','💫','For your forever person'],['Self Care','🌞','Pamper and recharge'],['Study Vibes','📚','Stationery and snacks'],['Premium Luxe','✨','Go all out'],['Galaxy','🌟','Cosmic and dreamy']].map(([k,i,d])=>`<div class="cat-card" onclick="location.href='shop.html?category=${encodeURIComponent(k)}'"><div class="cat-icon">${i}</div><div class="cat-name">${k==='Galaxy'?'Galaxy Aesthetic':k}</div><div class="cat-desc">${d}</div></div>`).join('')}
      <div class="cat-card" style="background:var(--lav-light);border-color:var(--lav)" onclick="location.href='contact.html'"><div class="cat-icon">🎁</div><div class="cat-name">Custom Hamper</div><div class="cat-desc">Build your own</div></div>
    </div></div></section>
  <section class="section"><div class="container">
    <div class="sec-head"><span class="eyebrow">${txt(c.favEyebrow)}</span><h2 class="sec-title">${txt(c.favTitle)}</h2></div>
    <div class="products-grid" id="home-grid"></div>
    <div style="text-align:center;margin-top:40px"><button class="btn btn-primary" onclick="location.href='shop.html'">View All Hampers</button></div></div></section>
  <section class="section" style="background:var(--lav-light)"><div class="container"><div class="whyus-inner"><div>
    <span class="eyebrow">${txt(c.whyEyebrow)}</span><h2 class="sec-title">${txt(c.whyTitle1)}<br><em>${txt(c.whyTitleEm)}</em></h2>
    <p style="font-size:14.5px;color:var(--muted);margin:14px 0 0;line-height:1.75">${txt(c.whyBody)}</p>
    <ul class="whyus-list">${c.whyPoints.map(w=>`<li><span style="font-size:21px;flex-shrink:0">${txt(w.icon)}</span><div><strong style="display:block;color:var(--plum);font-weight:500;margin-bottom:1px">${txt(w.title)}</strong><span style="font-size:13px;color:var(--muted)">${txt(w.desc)}</span></div></li>`).join('')}</ul></div>
    <div class="whyus-visual"><div class="wv-blob"></div>
      <div class="wv-card wvc1"><div class="wvc-num">${txt(c.stat1n)}</div><div class="wvc-label">${txt(c.stat1l)}</div></div>
      <div class="wv-card wvc2"><div class="wvc-num">${txt(c.stat2n)}</div><div class="wvc-label">${txt(c.stat2l)}</div></div>
      <div class="wv-card wvc3"><div class="wvc-num">${txt(c.stat3n)}</div><div class="wvc-label">${txt(c.stat3l)}</div></div></div></div></div></section>
  <section class="section"><div class="container"><div class="sec-head"><span class="eyebrow">${txt(c.testiEyebrow)}</span><h2 class="sec-title">${txt(c.testiTitle)}</h2></div>
    <div class="testi-grid">${c.testimonials.map((t,i)=>`<div class="tcard${i===1?' feat':''}"><div class="tcard-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="tcard-text">"${txt(t.text)}"</p><div class="tcard-author">- ${txt(t.author)}</div></div>`).join('')}</div></div></section>
  <section class="section" style="background:var(--cream-dark)"><div class="container"><div class="insta-inner"><div>
    <span class="eyebrow">${txt(c.igEyebrow)}</span><h2 class="sec-title">${txt(c.igTitle)}</h2>
    <p style="font-size:14.5px;color:var(--muted);margin:14px 0 26px;line-height:1.6">${txt(c.igBody)}</p>
    <a href="${esc(igUrl())}" target="_blank" rel="noopener" class="btn btn-primary" style="background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);border:none">@${esc(String(SS.ig||'').replace(/^@/,''))}</a></div>
    <div class="ig-grid"><div class="ig-tile">🎁</div><div class="ig-tile">✨</div><div class="ig-tile">💕</div><div class="ig-tile">🌟</div></div></div></div></section>`;
}
function tplShop(){
  const s=CONTENT.shop;
  return `<div class="page-hero"><div class="container"><span class="eyebrow">${txt(s.eyebrow)}</span><h1>${txt(s.title)}</h1><p>${txt(s.sub)}</p></div></div>
  <section class="section" style="padding-top:28px"><div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:22px">
      <div class="cat-filters" id="cat-filters">${['All',...CATEGORIES.filter(c=>c!=='Custom')].map(c=>`<button class="cat-btn${c===shopFilter?' active':''}" onclick="filterShop('${c}',this)">${c}</button>`).join('')}</div>
      <select class="form-control" id="sort-sel" style="width:auto;min-width:170px" onchange="renderShop()"><option value="default">Sort: Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="name">Name A-Z</option><option value="discount">Biggest Discount</option></select>
    </div>
    <div class="products-grid" id="shop-grid"></div>
    <div style="text-align:center;margin-top:44px;padding:28px;background:var(--lav-light);border-radius:var(--radius);border:1px solid var(--border)">
      <p style="font-family:'Cormorant Garamond',serif;font-size:21px;color:var(--plum);margin-bottom:7px">${txt(s.customTitle)}</p>
      <p style="font-size:12.5px;color:var(--muted);margin-bottom:16px">${txt(s.customSub)}</p>
      <button class="btn btn-primary" onclick="location.href='contact.html'">Request Custom Hamper</button></div></div></section>`;
}
function tplAbout(){
  const a=CONTENT.about;
  return `<div class="page-hero" style="background:linear-gradient(135deg,var(--lav-light),var(--rose-light))"><div class="container"><span class="eyebrow">${txt(a.eyebrow)}</span><h1>${txt(a.heroTitle)}</h1><p>${txt(a.heroSub)}</p></div></div>
  <section class="section"><div class="container"><div class="about-grid"><div>
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:2.3rem;font-weight:400;color:var(--plum);margin-bottom:16px">${txt(a.h2)}</h2>
    <p style="font-size:14.5px;color:var(--muted);margin-bottom:13px;line-height:1.75">${txt(a.p1)}</p>
    <p style="font-size:14.5px;color:var(--muted);margin-bottom:13px;line-height:1.75">${txt(a.p2)}</p>
    <p style="font-size:14.5px;color:var(--muted);margin-bottom:22px;line-height:1.75">${txt(a.p3)}</p>
    <button class="btn btn-primary" onclick="location.href='shop.html'">Shop our hampers</button></div><div class="about-vis">🎁</div></div>
    <div class="values-grid">${a.values.map(v=>`<div class="val-card"><div style="font-size:30px;margin-bottom:12px">${txt(v.icon)}</div><div style="font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;color:var(--plum);margin-bottom:7px">${txt(v.title)}</div><div style="font-size:13px;color:var(--muted);line-height:1.6">${txt(v.desc)}</div></div>`).join('')}</div></div></section>`;
}
function tplContact(){
  const c=CONTENT.contact,ig=String(SS.ig||'').replace(/^@/,'');
  return `<div class="page-hero"><div class="container"><span class="eyebrow">${txt(c.eyebrow)}</span><h1>${txt(c.heroTitle)}</h1><p>${txt(c.heroSub)}</p></div></div>
  <section class="section" style="padding-top:44px"><div class="container"><div class="contact-grid">
    <div class="cform-box"><h3>Send us a message</h3>
      <div class="form-group"><label>Your Name</label><input class="form-control" id="cf-name" placeholder="Put your name"/></div>
      <div class="form-group"><label>Email</label><input class="form-control" id="cf-email" type="email" placeholder="Your email ID"/></div>
      <div class="form-group"><label>WhatsApp Number</label><input class="form-control" id="cf-phone" type="tel" placeholder="Your mobile no. with country code"/></div>
      <div class="form-group"><label>Topic</label><select class="form-control" id="cf-type"><option value="">Select a topic</option><option>Custom Hamper Request</option><option>Order Enquiry</option><option>Bulk / Corporate Order</option><option>Other</option></select></div>
      <div class="form-group"><label>Message</label><textarea class="form-control" id="cf-msg" style="min-height:100px" placeholder="Write your message here..."></textarea></div>
      <button class="btn btn-success btn-full" onclick="sendWA()">Send via WhatsApp 💬</button></div>
    <div><h3 style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;color:var(--plum);margin-bottom:20px">Other ways to reach us</h3>
      <a href="https://wa.me/${esc(String(SS.wa).replace(/\D/g,''))}" target="_blank" rel="noopener" class="cmethod"><span style="font-size:21px">💬</span><div><div class="cm-lbl">WhatsApp</div><div class="cm-val">${esc(waDisplay())} - ${txt(c.waNote)}</div></div></a>
      <a href="${esc(igUrl())}" target="_blank" rel="noopener" class="cmethod"><span style="font-size:21px">📷</span><div><div class="cm-lbl">Instagram</div><div class="cm-val">@${esc(ig)} - ${txt(c.igNote)}</div></div></a>
      <a href="${esc(SS.fb)}" target="_blank" rel="noopener" class="cmethod"><span style="font-size:21px">👤</span><div><div class="cm-lbl">Facebook</div><div class="cm-val">${txt(c.fbNote)}</div></div></a>
      <a href="mailto:${esc(SS.email)}" class="cmethod"><span style="font-size:21px">💌</span><div><div class="cm-lbl">Email</div><div class="cm-val">${esc(SS.email)}</div></div></a>
      <div style="margin-top:20px;background:var(--lav-light);border-radius:var(--radius);padding:18px;border:1px solid var(--border)"><span class="eyebrow">Response time</span>
        <p style="font-size:13px;color:var(--muted);line-height:1.65;margin-top:7px">We reply within <strong style="color:var(--plum)">${txt(c.responseTime)}</strong> ${txt(c.responseNote)}</p></div></div>
  </div></div></section>`;
}
function tplPolicies(){
  const p=CONTENT.policies;
  return `<div class="page-hero" style="background:linear-gradient(135deg,var(--lav-light),var(--rose-light))"><div class="container"><span class="eyebrow">Policies</span><h1>${txt(p.title)}</h1></div></div>
  <section class="section"><div class="container"><div class="policy-box">
    ${p.sections.map(s=>`<h2>${txt(s.title)}</h2><ul>${s.points.map(x=>`<li>${txt(x)}</li>`).join('')}</ul>`).join('')}
    <p style="border-top:1px solid var(--border);padding-top:18px;margin-top:6px">${esc(SS.email)} | ${txt(p.updated)}</p></div></div></section>`;
}
function tplFooter(){
  const f=CONTENT.footer,wa=String(SS.wa).replace(/\D/g,'');
  return `<footer class="site-footer"><div class="container"><div class="footer-grid">
    <div><div class="footer-logo">${txt(SS.name)}</div><p class="footer-tag">${txt(f.tagline)}</p><div class="footer-soc">
      <a href="${esc(SS.fb)}" target="_blank" rel="noopener" aria-label="Facebook"><svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
      <a href="${esc(igUrl())}" target="_blank" rel="noopener" aria-label="Instagram"><svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
      <a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a></div></div>
    <div class="footer-links"><h4>Shop</h4><a href="shop.html">All Hampers</a><a href="shop.html?category=Best%20Friends">Best Friends</a><a href="contact.html">Custom Order</a></div>
    <div class="footer-links"><h4>Help</h4><a href="contact.html">Contact Us</a><a href="about.html">About Us</a><a href="policies.html">Shipping Policy</a></div>
    <div class="footer-links"><h4>Connect</h4><a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a><a href="${esc(igUrl())}" target="_blank" rel="noopener">Instagram</a><a href="mailto:${esc(SS.email)}">Email Us</a></div>
  </div><div class="footer-bot"><p>${txt(f.copyright)}</p><span><a href="policies.html">Privacy Policy</a> &nbsp;·&nbsp; <a style="cursor:pointer" onclick="window.installApp&&installApp()">&#128242; Install App</a></span></div></div></footer>`;
}

let lastMainSig = '';

// ------------------------------------------------------------------ occasion themes (festive colours + effects)
let OCC = {mode:'off'}, occRes = null, OCC_IMG = {};
function occasionColors(){return occRes?{...DEFAULT_TC,...occRes.o.colors}:null;}
function applyOccasion(){
  occRes = (typeof resolveOccasion==='function')?resolveOccasion(OCC):null;
  applyTheme();
  const strip=document.getElementById('occ-strip');
  document.body.dataset.occ = occRes?occRes.o.id:'';
  if(strip){
    if(!occRes){strip.style.display='none';strip.innerHTML='';}
    else{
      const o=occRes.o,g=occRes.greet||o.greet,sub=occRes.sub||o.sub,img=OCC_IMG[o.id];
      const side=img?`<img class="occ-img" src="${esc(img)}" alt="">`:`<span class="occ-em">${o.emoji}</span>`;
      const gl=(o.glyphs&&o.glyphs.length?o.glyphs:[o.emoji]).join('  ');
      strip.style.display='block';
      strip.innerHTML=`<div class="occ-in">${side}<div class="occ-txt"><b>${txt(g)}</b><span>${txt(sub)}</span></div>${img?`<img class="occ-img occ-flip" src="${esc(img)}" alt="">`:`<span class="occ-em">${o.emoji}</span>`}</div><div class="occ-garland" aria-hidden="true"><div class="occ-track">${Array(2).fill(Array(30).fill(gl).join('   ')).map(t=>`<span>${t}</span>`).join('')}</div></div>`;
      if(!img&&!OCC_IMG['_t'+o.id]){OCC_IMG['_t'+o.id]=1;
        fbDb.collection('settings').doc('occimg_'+o.id).get().then(d=>{const v=d.exists&&d.data().img;if(v&&typeof v==='string'&&v.startsWith('data:image/')){OCC_IMG[o.id]=v;applyOccasion();}}).catch(()=>{});}
    }
  }
  if(typeof FX!=='undefined'){
    FX.start(occRes?occRes.o:null);
    let b=document.getElementById('fx-toggle');
    if(occRes&&occRes.o.fx&&FX.hasMotion()){
      if(!b){b=document.createElement('button');b.id='fx-toggle';b.className='fx-toggle';b.type='button';b.onclick=()=>{const on=FX.toggle();b.classList.toggle('off',!on);b.setAttribute('aria-pressed',on);toast(on?'Festive effects on':'Festive effects off','info');};document.body.appendChild(b);}
      b.textContent='✨';b.title='Festive effects on/off';b.setAttribute('aria-label','Festive effects on/off');b.classList.toggle('off',FX.isMuted());
    }else if(b)b.remove();
  }
}
function renderChrome(){
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=dec(v);};
  set('logo-name',SS.name);set('logo-tag',SS.tag);
  document.querySelectorAll('[data-name]').forEach(e=>e.textContent=dec(SS.name));
  document.querySelectorAll('[data-tag]').forEach(e=>e.textContent=dec(SS.tag));
  const ann=document.getElementById('ann-bar');ann.innerHTML=txt(SS.ann);ann.style.display=SS.ann?'block':'none';
  document.title=PAGE==='home'?dec(SS.name)+' - '+dec(SS.tag):dec(SS.name)+' | '+({shop:'Shop',about:'About',contact:'Contact',policies:'Policies'})[PAGE];
  document.getElementById('site-footer').innerHTML=tplFooter();
}
function renderMain(force){
  const sig=JSON.stringify([CONTENT,SS.ig,SS.fb,SS.email,SS.wa]);
  if(!force&&sig===lastMainSig)return;
  lastMainSig=sig;
  const tpl={home:tplHome,shop:tplShop,about:tplAbout,contact:tplContact,policies:tplPolicies}[PAGE];
  // keep what a visitor is typing on the contact page if content refreshes
  const keep=PAGE==='contact'?['cf-name','cf-email','cf-phone','cf-type','cf-msg'].map(i=>[i,document.getElementById(i)?.value]):[];
  document.getElementById('page-main').innerHTML=tpl();
  keep.forEach(([i,v])=>{const e=document.getElementById(i);if(e&&v)e.value=v;});
  renderProducts();updateFlash();
}
function renderProducts(){
  if(document.getElementById('home-grid'))renderHome();
  if(document.getElementById('shop-grid'))renderShop();
}
function noProducts(){return `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0">${productsReady?'No hampers here yet - check back soon 💕':'Loading hampers…'}</p>`;}
function renderHome(){
  const feat=PRODUCTS.filter(p=>p.featured).slice(0,4);
  document.getElementById('home-grid').innerHTML=(feat.length?feat:PRODUCTS.slice(0,4)).map(buildCard).join('')||noProducts();
}
function renderShop(){
  let ps=[...PRODUCTS];
  if(shopFilter!=='All')ps=ps.filter(p=>p.cat===shopFilter);
  const sv=document.getElementById('sort-sel')?.value||'default';
  if(sv==='low')ps.sort((a,b)=>effPrice(a)-effPrice(b));
  else if(sv==='high')ps.sort((a,b)=>effPrice(b)-effPrice(a));
  else if(sv==='name')ps.sort((a,b)=>a.name.localeCompare(b.name));
  else if(sv==='discount')ps.sort((a,b)=>(b.price-effPrice(b))-(a.price-effPrice(a)));
  document.getElementById('shop-grid').innerHTML=ps.map(buildCard).join('')||noProducts();

}
function filterShop(cat,btn){shopFilter=cat;document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderShop();}

// ------------------------------------------------------------------ flash sale strip
function updateFlash(){
  const strip=document.getElementById('flash-strip');
  clearInterval(flashTimer);
  if(!strip)return;
  const hasFlash=PRODUCTS.some(p=>p.disc&&p.disc.on&&p.disc.type==='flash');
  if(!offersOn||!flashActive()||!hasFlash){strip.style.display='none';return;}
  strip.style.display='flex';
  const tick=()=>{
    const left=SS.flashEnd-Date.now();
    if(left<=0){clearInterval(flashTimer);strip.style.display='none';renderProducts();return;}
    const pad=n=>String(n).padStart(2,'0');
    document.getElementById('t-h').textContent=pad(Math.floor(left/3600000));
    document.getElementById('t-m').textContent=pad(Math.floor((left%3600000)/60000));
    document.getElementById('t-s').textContent=pad(Math.floor((left%60000)/1000));
  };
  tick();flashTimer=setInterval(tick,1000);
}

// ------------------------------------------------------------------ product card + modal
function buildCard(p){
  const price=effPrice(p),sold=stockSt(p)==='sold-out',low=stockSt(p)==='low-stock';
  const dl=discLabel(p),showDisc=dl&&price!==p.price,saving=showDisc?p.price-price:0;
  const img=p.images&&p.images[0];
  const ci=cart.find(i=>i.id===p.id);
  return `<div class="pcard${sold?' sold-out':''}" onclick="openModal(${p.id})">
    <div class="pcard-img" ${img?`onclick="event.stopPropagation();openProductLB(${p.id},0)"`:''}>
      ${img?`<img src="${esc(img)}" alt="${esc(dec(p.name))}" title="Click to zoom" loading="lazy"/>`:`<span>${txt(p.emoji)}</span>`}
      ${img?'<span class="zoom-hint">&#128269; Zoom</span>':''}
      <div class="pcard-badges">
        ${sold?'<span class="badge badge-sold">Sold Out</span>':''}
        ${!sold&&low?`<span class="badge badge-low">Only ${p.stock} left</span>`:''}
        ${showDisc&&!sold?`<span class="badge badge-offer">${dl}</span>`:''}
        ${p.badge&&!sold?`<span class="badge badge-new">${txt(p.badge)}</span>`:''}
        ${img&&p.images.length>1?`<span class="badge" style="background:rgba(0,0,0,.45);color:#fff">&#128247; ${p.images.length}</span>`:''}
      </div></div>
    <div class="pcard-body"><div class="pcard-cat">${txt(p.cat)}</div><div class="pcard-name">${txt(p.name)}</div><div class="pcard-desc">${txt(p.desc)}</div>
      <div class="pcard-foot"><div class="price-wrap"><span class="price-curr">${fmt(price)}</span>${showDisc?`<span class="price-orig">${fmt(p.price)}</span>`:''}${saving>0?`<span class="price-save">Save ${fmt(saving)}</span>`:''}</div>
      ${sold?'<button class="add-btn" disabled>Sold</button>':ci?`<div class="card-qty" onclick="event.stopPropagation()"><button aria-label="Decrease quantity" onclick="event.stopPropagation();changeCardQty(${p.id},-1)">−</button><span>${ci.qty}</span><button aria-label="Increase quantity" onclick="event.stopPropagation();changeCardQty(${p.id},1)" ${ci.qty>=p.stock?'disabled':''}>+</button></div>`:`<button class="add-btn" aria-label="Add to cart" onclick="event.stopPropagation();addCart(${p.id})">+</button>`}
      </div></div></div>`;
}
function openModal(id){
  const p=PRODUCTS.find(x=>x.id===id);if(!p)return;
  curP=p;mQty=1;currentSlide=0;
  const price=effPrice(p),sold=stockSt(p)==='sold-out',low=stockSt(p)==='low-stock';
  const dl=discLabel(p),showD=dl&&price!==p.price;
  const imgs=p.images||[],mi=document.getElementById('modal-img');
  if(imgs.length){
    mi.style.height='320px';
    mi.innerHTML=`<div class="swiper-wrap" id="sw-wrap" style="width:100%;height:100%" ontouchstart="swTouchStart(event)" ontouchend="swTouchEnd(event)">
      <div class="swiper-track" id="sw-track">${imgs.map((src,i)=>`<div class="swiper-slide" onclick="openLB(curP.images,${i})"><img src="${esc(src)}" alt="${esc(dec(p.name))}" style="pointer-events:none;width:100%;height:100%;object-fit:contain;background:#fff"/></div>`).join('')}</div>
      ${imgs.length>1?`<button class="swiper-btn swiper-prev" onclick="swGo(-1)">&#8249;</button><button class="swiper-btn swiper-next" onclick="swGo(1)">&#8250;</button>
      <div class="swiper-dots">${imgs.map((_,i)=>`<div class="sdot-pill${i===0?' active':''}" onclick="swGoTo(${i})"></div>`).join('')}</div><div class="swiper-count">1 / ${imgs.length}</div>`:''}</div>
      <button class="modal-close-btn" onclick="closeModal()" style="position:absolute;top:12px;right:12px;z-index:10">&#x2715;</button>`;
  }else{
    mi.style.height='200px';
    mi.innerHTML=`<span style="font-size:76px">${txt(p.emoji)}</span><button class="modal-close-btn" onclick="closeModal()">&#x2715;</button>`;
  }
  document.getElementById('modal-name').innerHTML=txt(p.name);
  document.getElementById('modal-price').textContent=fmt(price);
  document.getElementById('modal-orig').textContent=showD?fmt(p.price):'';
  const dd=document.getElementById('modal-disc');if(showD){dd.innerHTML=dl;dd.style.display='inline-flex';}else dd.style.display='none';
  document.getElementById('modal-desc').innerHTML=txt(p.long);
  document.getElementById('modal-inc').innerHTML=(p.includes||[]).map(i=>`<span>${txt(i)}</span>`).join('');
  const sc=document.getElementById('modal-stock');
  sc.className=sold?'stock-out':low?'stock-low':'stock-ok';
  sc.innerHTML=sold?'&#9679; Sold Out':low?`&#9679; Only ${p.stock} left - hurry!`:'&#9679; In Stock';
  document.getElementById('qty-row').style.display=sold?'none':'flex';
  document.getElementById('mq').textContent=1;
  document.getElementById('modal-acts').innerHTML=(!sold?`<button class="btn btn-primary" onclick="addCartModal()">&#128722; Add to Cart</button>`:'')+`<button class="btn btn-success" onclick="askWA(${p.id})">&#128172; Ask on WhatsApp</button>`;
  renderSP();syncReviewForm();loadReviews(id);
  document.getElementById('modal-ov').classList.add('open');
}
function swGo(dir){const p=curP;if(!p||!p.images||p.images.length<2)return;currentSlide=(currentSlide+dir+p.images.length)%p.images.length;swGoTo(currentSlide);}
function swGoTo(idx){
  const p=curP;if(!p||!p.images)return;currentSlide=idx;
  const t=document.getElementById('sw-track');if(t)t.style.transform=`translateX(-${idx*100}%)`;
  document.querySelectorAll('.sdot-pill').forEach((d,i)=>d.classList.toggle('active',i===idx));
  const c=document.querySelector('.swiper-count');if(c)c.textContent=`${idx+1} / ${p.images.length}`;
}
let swTouchX=0;
function swTouchStart(e){swTouchX=e.touches[0].clientX;}
function swTouchEnd(e){const d=swTouchX-e.changedTouches[0].clientX;if(Math.abs(d)>40)swGo(d>0?1:-1);}
function closeModal(){document.getElementById('modal-ov').classList.remove('open');}
function changeQty(d){mQty=Math.max(1,Math.min(Number(curP.stock)||99,mQty+d));document.getElementById('mq').textContent=mQty;}
function addCartModal(){addCart(curP.id,mQty);closeModal();}
function askWA(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;window.open(`https://wa.me/${String(SS.wa).replace(/\D/g,'')}?text=${encodeURIComponent('Hello! Interested in "'+dec(p.name)+'" ('+fmt(effPrice(p))+'). Available?')}`,'_blank');}

// ------------------------------------------------------------------ reviews (stored in Firestore, public read, signed-in write)
function syncReviewForm(){
  const ok=loggedIn&&currentUser.emailVerified;
  document.getElementById('rev-form').style.display=ok?'block':'none';
  const lr=document.getElementById('login-req');
  lr.style.display=ok?'none':'block';
  lr.innerHTML=loggedIn?"<p>Please verify your email to leave a review.</p><a onclick=\"closeModal();showView('account')\">Open my account</a>":"<p>Log in to leave a review.</p><a onclick=\"closeModal();showView('login')\">Log In</a>";
}
async function loadReviews(id){
  const box=document.getElementById('modal-revs');box.innerHTML='<p class="no-rev">Loading reviews…</p>';
  try{
    const snap=await fbDb.collection('reviews').where('productId','==',String(id)).get();
    if(!curP||curP.id!==id)return;
    const revs=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0));
    const avg=revs.length?(revs.reduce((s,r)=>s+(r.rating||0),0)/revs.length).toFixed(1):null;
    document.getElementById('rev-title').innerHTML='Customer Reviews'+(avg?` <span style="font-size:13px;color:var(--muted)">(${revs.length} review${revs.length>1?'s':''}, &#9733; ${avg})</span>`:'');
    box.innerHTML=revs.length?revs.map(r=>`<div class="rev-card"><div class="rev-hd"><div class="rev-av">${esc((r.name||'?')[0])}</div><div style="flex:1"><div class="rev-name">${esc(r.name)}</div><div class="rev-date">${r.createdAt?new Date(r.createdAt.seconds*1000).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}</div></div><div class="rev-stars">${stars(r.rating)}</div></div><p class="rev-text">${esc(r.text)}</p>${currentUser&&r.uid===currentUser.uid?`<button class="rev-del" onclick="delRev('${r.id}',${id})">Remove</button>`:''}</div>`).join(''):'<p class="no-rev">No reviews yet. Be the first!</p>';
  }catch(e){box.innerHTML='<p class="no-rev">Reviews are unavailable right now.</p>';console.warn(e);}
}
async function delRev(rid,pid){try{await fbDb.collection('reviews').doc(rid).delete();toast('Review removed');loadReviews(pid);}catch(e){toast('Could not remove review','err');}}
function renderSP(){document.getElementById('star-pick').innerHTML=[1,2,3,4,5].map(s=>`<button class="sp" style="color:${s<=revRating?'#FFD700':'#ddd'}" onmouseenter="hS(${s})" onmouseleave="uhS()" onclick="setS(${s})">&#9733;</button>`).join('');}
function setS(s){revRating=s;renderSP();}
function hS(s){document.querySelectorAll('.sp').forEach((e,i)=>e.style.color=i<s?'#FFD700':'#ddd');}
function uhS(){document.querySelectorAll('.sp').forEach((e,i)=>e.style.color=i<revRating?'#FFD700':'#ddd');}
async function submitRev(){
  if(!loggedIn){toast('Please log in to review','err');return;}
  if(!currentUser.emailVerified){toast('Please verify your email first','err');return;}
  const text=document.getElementById('rev-ta').value.trim();
  if(!text){toast('Please write something first','err');return;}
  const name=(currentUser.displayName||(currentUser.email||'Customer').split('@')[0]).slice(0,60);
  try{
    await fbDb.collection('reviews').doc(String(curP.id)+'_'+currentUser.uid).set({productId:String(curP.id),name,rating:revRating,text:text.slice(0,1000),uid:currentUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    document.getElementById('rev-ta').value='';toast('Review posted!','ok');loadReviews(curP.id);
  }catch(e){console.error(e);toast(e.code==='permission-denied'?'You have already reviewed this product. Remove your review first to write a new one.':'Could not post your review','err');}
}

// ------------------------------------------------------------------ cart + checkout
function addCart(id,qty=1){
  const p=PRODUCTS.find(x=>x.id===id);if(!p||stockSt(p)==='sold-out')return;
  const ex=cart.find(i=>i.id===id),cur=ex?ex.qty:0,next=Math.min(Number(p.stock)||99,cur+qty);
  if(next<=cur){toast('Available stock limit reached','info');return;}
  if(ex)ex.qty=next;else cart.push({id,qty:next});
  saveCart();updBadge();renderProducts();toast(dec(p.name)+' added to cart','ok');
}
function changeCardQty(id,delta){
  const item=cart.find(i=>i.id===id);if(!item)return;
  const p=PRODUCTS.find(x=>x.id===id);
  if(delta>0&&(!p||item.qty>=Number(p.stock))){toast('Available stock limit reached','info');return;}
  item.qty+=delta;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);
  saveCart();updBadge();renderProducts();
  if(document.getElementById('cart-sb').classList.contains('open'))renderCart();
}
function updBadge(){const n=cart.reduce((s,i)=>s+i.qty,0),b=document.getElementById('cart-badge');if(!b)return;b.textContent=n;b.style.display=n>0?'flex':'none';const t=document.getElementById('tb-badge');if(t){t.textContent=n;t.style.display=n>0?'flex':'none';}}
function openCart(){renderCart();document.getElementById('cart-ov').classList.add('open');document.getElementById('cart-sb').classList.add('open');}
function closeCart(){document.getElementById('cart-ov').classList.remove('open');document.getElementById('cart-sb').classList.remove('open');}
function chQ(id,d){changeCardQty(id,d);renderCart();}
function remItem(id){cart=cart.filter(i=>i.id!==id);saveCart();updBadge();renderProducts();renderCart();}
function totals(){const L=cartLines(),subtotal=L.reduce((s,i)=>s+i.price*i.qty,0),delivery=L.length?deliveryFor(subtotal,L):0;return{L,subtotal,delivery,total:subtotal+delivery};}
function renderCart(){
  const body=document.getElementById('cart-body'),ft=document.getElementById('cart-ft');
  const keep=['co-addr','co-name','co-phone','co-line','co-city','co-district','co-state','co-pin','co-payment','co-cap'].map(i=>[i,document.getElementById(i)?.value]);
  const {L,subtotal,delivery,total}=totals();
  if(!L.length){body.innerHTML='<div class="cart-empty"><div style="font-size:38px;margin-bottom:11px">&#128158;</div><p>Your cart is empty</p></div>';ft.innerHTML='';return;}
  body.innerHTML=L.map(i=>`<div class="cart-item"><div class="ci-img">${i.p.images&&i.p.images[0]?`<img src="${esc(i.p.images[0])}" alt=""/>`:`<span>${txt(i.p.emoji)}</span>`}</div>
    <div class="ci-info"><div class="ci-name">${txt(i.p.name)}</div><div class="ci-price">${fmt(i.price*i.qty)}</div>
    <div class="ci-qr"><button class="cqb" onclick="chQ(${i.id},-1)">-</button><span class="cqn">${i.qty}</span><button class="cqb" onclick="chQ(${i.id},1)">+</button></div></div>
    <button class="ci-rem" aria-label="Remove" onclick="remItem(${i.id})">&#x2715;</button></div>`).join('');
  ft.innerHTML=`<div class="cart-ft">
    ${loggedIn&&PROFILE&&PROFILE.addresses.length?`<div class="form-group" style="margin-bottom:10px"><label for="co-addr">Deliver to</label><select class="form-control" id="co-addr" onchange="pickAddr()">${PROFILE.addresses.map((a,i)=>`<option value="${i}">${esc(a.label)} - ${esc(a.name)}, ${esc(a.address.slice(0,40))}</option>`).join('')}<option value="">+ Use a different address</option></select></div>`:''}
    <div class="form-group" style="margin-bottom:10px"><label for="co-name">Receiver Full Name *</label><input class="form-control" id="co-name" autocomplete="name" placeholder="Your full name"></div>
    <div class="form-group" style="margin-bottom:10px"><label for="co-phone">WhatsApp / Phone *</label><input class="form-control" id="co-phone" type="tel" autocomplete="tel" placeholder="10-digit mobile number"></div>
    ${addrFieldsHTML('co')}
    ${loggedIn&&PROFILE&&PROFILE.addresses.length<MAX_ADDR?`<div id="co-save-wrap" style="margin-bottom:10px;${PROFILE.addresses.length?'display:none':''}"><label style="display:flex;gap:8px;align-items:center;font-size:12.5px;cursor:pointer"><input type="checkbox" id="co-save"> Save this address to my account (${PROFILE.addresses.length}/${MAX_ADDR} used)</label></div>`:''}
    <div class="form-group" style="margin-bottom:10px"><label for="co-payment">Payment Method *</label><select class="form-control" id="co-payment"><option value="UPI">UPI (pay separately)</option><option value="COD">Cash on Delivery (confirm availability)</option></select></div>
    <div class="cart-tot"><span>Items subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="cart-tot"><span>Delivery</span><span>${delivery?fmt(delivery):'FREE'}</span></div>
    <div class="cart-tot" style="font-weight:700;border-top:1px solid var(--border);padding-top:10px"><span>Grand Total</span><span>${fmt(total)}</span></div>
    ${loggedIn?'':captchaBox('co-cap')}
    <div class="cart-acts" style="margin-top:12px">
      <button class="btn btn-primary btn-full" id="place-btn" onclick="submitFirestoreOrder()">Place Order Securely</button>
      <button class="btn btn-success btn-full" onclick="orderWA()">&#128172; Send Order on WhatsApp</button>
      <button class="btn btn-ghost btn-full" onclick="orderEmail()">&#128140; Prepare Order Email</button>
      <button class="btn btn-primary btn-full" id="upi-pay-btn" onclick="payUPI()">&#128179; Pay ${fmt(total)} via UPI</button></div>
    <p class="cart-note">UPI payment is not auto-verified. Please share payment confirmation on WhatsApp. COD is subject to confirmation.</p></div>`;
  keep.forEach(([i,v])=>{const e=document.getElementById(i);if(e&&v)e.value=v;});
  if(loggedIn&&PROFILE){
    const n=document.getElementById('co-name'),sel=document.getElementById('co-addr');
    if(n&&!n.value){ if(sel){sel.value='0';pickAddr();} else {n.value=PROFILE.name||currentUser.displayName||'';const ph=document.getElementById('co-phone');if(ph&&!ph.value)ph.value=PROFILE.phone||'';} }
  }
  const pay=document.getElementById('co-payment');
  const sync=()=>{const b=document.getElementById('upi-pay-btn');if(b)b.style.display=pay.value==='UPI'?'flex':'none';};
  pay.addEventListener('change',sync);sync();
}
function checkoutData(){
  const name=document.getElementById('co-name')?.value.trim(),phone=document.getElementById('co-phone')?.value.trim(),payment=document.getElementById('co-payment')?.value||'UPI';
  if(!name||!phone){toast('Please fill receiver name and phone','err');return null;}
  const parts=readAddr('co'),ae=addrError(parts);
  if(ae){toast(ae,'err');return null;}
  const address=composeAddr(parts);
  if(!/^[+\d][\d\s-]{7,16}$/.test(phone)){toast('Please enter a valid phone number','err');return null;}
  const t=totals();
  const lines=t.L.map(i=>`- ${dec(i.p.name)} x${i.qty} = ${fmt(i.price*i.qty)}`).join('\n');
  return {name,phone,address,parts,payment,subtotal:t.subtotal,delivery:t.delivery,total:t.total,lines,L:t.L};
}
function orderMessage(d){return `Hello ${dec(SS.name)}! I'd like to place an order.\n\nName: ${d.name}\nPhone: ${d.phone}\nDelivery address: ${d.address}\n\n${d.lines}\n\nItems subtotal: ${fmt(d.subtotal)}\nDelivery: ${fmt(d.delivery)}\nGrand total: ${fmt(d.total)}\nPayment method: ${d.payment}\nPayment status: ${d.payment==='COD'?'COD requested - awaiting confirmation':'Pending - UPI payment to be completed/verified'}\n\nPlease confirm my order. Thank you!`;}
function orderWA(){const d=checkoutData();if(!d)return;window.open(`https://wa.me/${String(SS.wa).replace(/\D/g,'')}?text=${encodeURIComponent(orderMessage(d))}`,'_blank');}
function orderEmail(){const d=checkoutData();if(!d)return;location.href=`mailto:${SS.email}?subject=${encodeURIComponent('New order - '+dec(SS.name))}&body=${encodeURIComponent(orderMessage(d))}`;}
function payUPI(){const d=checkoutData();if(!d)return;if(d.payment!=='UPI'){toast('Select UPI to use online payment','info');return;}
  location.href=`upi://pay?pa=${encodeURIComponent(SS.upi)}&pn=${encodeURIComponent(dec(SS.name))}&am=${d.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(dec(SS.name)+' order')}`;}
async function submitFirestoreOrder(){
  const d=checkoutData();if(!d)return;
  if(!loggedIn&&!captchaOk('co-cap'))return;
  const btn=document.getElementById('place-btn');if(btn){btn.disabled=true;btn.textContent='Placing order…';}
  try{
    let user=fbAuth.currentUser;
    if(!user){user=(await fbAuth.signInAnonymously()).user;}
    const items=d.L.map(i=>({productId:String(i.id),name:dec(i.p.name).slice(0,120),quantity:i.qty,unitPrice:i.price,lineTotal:i.price*i.qty}));
    const order={customerUid:user.uid,customerEmail:user.isAnonymous?null:(user.email||null),customerName:d.name.slice(0,100),phone:d.phone.slice(0,20),address:d.address.slice(0,500),paymentMethod:d.payment,items,subtotal:d.subtotal,delivery:d.delivery,total:d.total,status:'pending_confirmation',createdAt:firebase.firestore.FieldValue.serverTimestamp(),source:user.isAnonymous?'guest':'account'};
    // Order + rate-limit marker are written together; the security rules allow one order per minute per visitor.
    const ref=fbDb.collection('orders').doc();
    const b=fbDb.batch();
    b.set(fbDb.collection('orderLimits').doc(user.uid),{last:firebase.firestore.FieldValue.serverTimestamp()});
    b.set(ref,order);
    await b.commit();
    toast('Order placed! Reference: '+ref.id.slice(-8).toUpperCase(),'ok');
    if(document.getElementById('co-save')?.checked&&loggedIn&&PROFILE&&PROFILE.addresses.length<MAX_ADDR&&validPhone(d.phone)){
      PROFILE.addresses.push({label:'Saved',name:d.name,phone:d.phone,...d.parts,address:d.address.slice(0,300)});
      try{await saveProfile();}catch(e){PROFILE.addresses.pop();}
    }
    cart=[];saveCart();updBadge();renderProducts();closeCart();refreshCaptcha();
    if(confirm('Order saved ✔ (ref '+ref.id.slice(-8).toUpperCase()+').\nSend the details on WhatsApp too so we can confirm faster?')){
      window.open(`https://wa.me/${String(SS.wa).replace(/\D/g,'')}?text=${encodeURIComponent(orderMessage(d)+'\n\nOrder ref: '+ref.id.slice(-8).toUpperCase())}`,'_blank');
    }
  }catch(e){
    console.error('Order save failed',e);
    toast(e.code==='auth/operation-not-allowed'?'Guest checkout needs Anonymous sign-in enabled. Please log in or use WhatsApp.':e.code==='permission-denied'?'Please wait one minute between orders, then try again (or use WhatsApp).':'Order could not be saved. Please use WhatsApp or try again.','err');
    if(btn){btn.disabled=false;btn.textContent='Place Order Securely';}
  }
}

// ------------------------------------------------------------------ customer auth (users only)
function authMessage(e){
  return ({
    'auth/email-already-in-use':'This email is already registered.','auth/invalid-email':'Please check your email address.','auth/weak-password':'Choose a stronger password.',
    'auth/invalid-credential':'Email or password is incorrect.','auth/wrong-password':'Email or password is incorrect.','auth/user-not-found':'Email or password is incorrect.',
    'auth/too-many-requests':'Too many attempts. Please try again later.','auth/popup-closed-by-user':'Sign-in window was closed before finishing.',
    'auth/operation-not-allowed':'This sign-in method is not enabled in Firebase yet (Authentication → Sign-in method).',
    'auth/unauthorized-domain':'This website address is not authorised in Firebase yet (Authentication → Settings → Authorized domains).',
    'auth/popup-blocked':'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
    'auth/network-request-failed':'Network problem. Check your internet and try again.',
    'auth/account-exists-with-different-credential':'This email is already registered with a password. Log in with email and password instead.'
  })[e.code]||'Could not sign in. Please try again.';
}
async function doLogin(){
  const email=document.getElementById('login-email').value.trim(),password=document.getElementById('login-password').value;
  if(!email||!password){toast('Enter email and password','err');return;}
  try{await fbAuth.signInWithEmailAndPassword(email,password);showView('account');toast('Welcome back!','ok');}catch(e){toast(authMessage(e),'err');}
}
async function doSignup(){
  const name=document.getElementById('signup-name').value.trim(),phone=document.getElementById('signup-phone').value.trim(),email=document.getElementById('signup-email').value.trim(),password=document.getElementById('signup-password').value;
  if(!name||!phone||!email||!password){toast('Fill name, mobile, email and password','err');return;}
  if(!/^(\+?91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g,''))){toast('Enter a valid 10-digit mobile number','err');return;}
  if(password.length<6){toast('Password must be at least 6 characters','err');return;}
  if(!captchaOk('signup-cap'))return;
  if(Date.now()-PAGE_T0<4000){toast('Please take a moment to fill the form','info');return;}
  signingUp=true;
  try{
    const c=await fbAuth.createUserWithEmailAndPassword(email,password);
    await c.user.updateProfile({displayName:name});currentUser=fbAuth.currentUser;loggedIn=true;
    PROFILE={name,phone,addresses:[]};
    try{await saveProfile();}catch(e){console.warn('profile save',e);}
    try{await c.user.sendEmailVerification();}catch(e){console.warn('verify mail',e);}
    signingUp=false;refreshCaptcha();showView('account');toast('Account created! We sent a verification link to your email.','ok');
  }catch(e){signingUp=false;toast(authMessage(e),'err');}
}
async function doGoogleLogin(){
  if(location.protocol==='file:'){toast('Google sign-in only works on the live website (https), not from a file on your computer.','err');return;}
  const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
  try{
    await fbAuth.signInWithPopup(provider);showView('account');toast('Signed in with Google','ok');
  }catch(e){
    if(e.code==='auth/cancelled-popup-request')return;
    if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'){
      try{await fbAuth.signInWithRedirect(provider);return;}catch(e2){e=e2;}
    }
    console.error('Google sign-in failed',e);
    toast(authMessage(e)+' ['+(e.code||'error')+']','err');
  }
}
async function doReset(){
  const email=document.getElementById('login-email').value.trim();
  if(!email){toast('Enter your email above first','info');return;}
  try{await fbAuth.sendPasswordResetEmail(email);toast('Password reset email sent','ok');}catch(e){toast(authMessage(e),'err');}
}
async function doLogout(){try{await fbAuth.signOut();}catch(e){}showView('main');toast('Logged out');}
fbAuth.onAuthStateChanged(u=>{
  currentUser=u;loggedIn=!!u&&!u.isAnonymous;authReady=true;
  const dot=document.getElementById('acc-dot');if(dot)dot.style.display=loggedIn?'block':'none';const ml=document.getElementById('mob-logout');if(ml)ml.style.display=loggedIn?'block':'none';
  if(!loggedIn)PROFILE=null;
  if(view==='account'&&!loggedIn){showView('login');return;}
  if(!loggedIn)PROFILE=null;else if(!signingUp)loadProfile();
  if(view==='account')renderAccount();
  if(document.getElementById('modal-ov')?.classList.contains('open')&&curP){syncReviewForm();loadReviews(curP.id);}
});
// ------------------------------------------------------------------ customer profile + saved addresses (max 4)
const MAX_ADDR = 4;
function profileRef(){return fbDb.collection('users').doc(currentUser.uid);}
function validPhone(p){return /^(\+?91)?[6-9]\d{9}$/.test(String(p||'').replace(/[\s-]/g,''));}
async function saveProfile(){
  await profileRef().set({name:String(PROFILE.name||'').slice(0,100),phone:String(PROFILE.phone||'').slice(0,20),addresses:PROFILE.addresses.slice(0,MAX_ADDR),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
}
async function loadProfile(){
  if(!loggedIn)return;
  const u=currentUser;
  try{
    const sn=await profileRef().get();
    PROFILE=sn.exists?sn.data():{name:u.displayName||'',phone:'',addresses:[]};
  }catch(e){console.warn('profile',e);PROFILE={name:u.displayName||'',phone:'',addresses:[]};}
  PROFILE.addresses=Array.isArray(PROFILE.addresses)?PROFILE.addresses:[];
  if(!PROFILE.name)PROFILE.name=u.displayName||'';
  if(view==='account'){paneAddresses();paneSettings();}
  if(document.getElementById('cart-sb')?.classList.contains('open'))renderCart();
}
function paneSettings(){
  const el=document.getElementById('acc-settings');if(!el||!PROFILE)return;
  const lbl='font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:3px';
  el.innerHTML=`<div style="background:#fff;border-radius:var(--radius);border:1px solid var(--border);padding:26px;max-width:460px">
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:500;color:var(--plum);margin-bottom:18px">Account Settings</h3>
    <div class="form-group"><label>Full name</label><input class="form-control" id="pf-name" maxlength="100" value="${esc(PROFILE.name)}"/></div>
    <div class="form-group"><label>Mobile number</label><input class="form-control" id="pf-phone" type="tel" maxlength="20" value="${esc(PROFILE.phone)}" placeholder="10-digit mobile number"/></div>
    <div class="form-group"><label>Email</label><div style="font-size:14.5px;color:var(--plum)">${esc(currentUser.email||'-')}</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" onclick="saveSettingsPane()">Save details</button><button class="btn btn-danger btn-sm" onclick="doLogout()">Log Out</button></div></div>`;
}
async function saveSettingsPane(){
  const name=document.getElementById('pf-name').value.trim(),phone=document.getElementById('pf-phone').value.trim();
  if(!name){toast('Name is required','err');return;}
  if(phone&&!validPhone(phone)){toast('Enter a valid 10-digit mobile number','err');return;}
  PROFILE.name=name;PROFILE.phone=phone;
  try{await saveProfile();try{await currentUser.updateProfile({displayName:name});}catch(e){}toast('Details saved','ok');}catch(e){console.error(e);toast('Could not save. Please try again.','err');}
}
function paneAddresses(){
  const el=document.getElementById('acc-addresses');if(!el||!PROFILE)return;
  const list=PROFILE.addresses;
  const card=(a,i)=>`<div class="order-card" style="padding:16px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start"><div style="flex:1;min-width:200px"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--rose-deep);margin-bottom:4px">${esc(a.label||'Address')}</div><div style="font-size:14px;font-weight:500;color:var(--plum)">${esc(a.name)} · ${esc(a.phone)}</div><div style="font-size:13px;color:var(--muted);margin-top:3px;white-space:pre-wrap">${esc(a.address)}</div></div><div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" onclick="openAddrForm(${i})">Edit</button><button class="btn btn-danger btn-sm" onclick="delAddr(${i})">Delete</button></div></div></div>`;
  const e=addrEditing!==null?(addrEditing>=0?list[addrEditing]:{label:'Home',name:PROFILE.name||'',phone:PROFILE.phone||'',line:'',address:''}):null;
  el.innerHTML=`<p style="font-size:13px;color:var(--muted);margin-bottom:14px">Save up to ${MAX_ADDR} delivery addresses (${list.length}/${MAX_ADDR}) and pick any of them at checkout - for yourself or to send a gift to someone else.</p>
    ${list.map(card).join('')||'<p class="no-rev">No saved addresses yet.</p>'}
    ${e?`<div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:520px;margin-top:14px">
      <h4 style="font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;margin-bottom:12px;color:var(--plum)">${addrEditing>=0?'Edit address':'New address'}</h4>
      <div class="form-group"><label>Label</label><select class="form-control" id="ad-label">${['Home','Work','Gift for someone','Other'].map(l=>`<option ${l===e.label?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="form-group"><label>Receiver name *</label><input class="form-control" id="ad-name" maxlength="100" value="${esc(e.name)}"/></div>
      <div class="form-group"><label>Receiver mobile *</label><input class="form-control" id="ad-phone" type="tel" maxlength="20" value="${esc(e.phone)}"/></div>
      ${addrFieldsHTML('ad',e)}
      <div style="display:flex;gap:10px"><button class="btn btn-primary btn-sm" onclick="saveAddr()">Save address</button><button class="btn btn-ghost btn-sm" onclick="addrEditing=null;paneAddresses()">Cancel</button></div></div>`
      :`<div style="margin-top:14px">${list.length<MAX_ADDR?'<button class="btn btn-primary btn-sm" onclick="openAddrForm(-1)">+ Add new address</button>':`<p class="no-rev">You have reached the limit of ${MAX_ADDR} addresses. Delete one to add another.</p>`}</div>`}`;
}
function openAddrForm(i){addrEditing=i;paneAddresses();}
async function saveAddr(){
  const a={label:document.getElementById('ad-label').value,name:document.getElementById('ad-name').value.trim(),phone:document.getElementById('ad-phone').value.trim(),...readAddr('ad')};
  if(!a.name){toast('Fill receiver name','err');return;}
  if(!validPhone(a.phone)){toast('Enter a valid 10-digit mobile number','err');return;}
  const ae=addrError(a);if(ae){toast(ae,'err');return;}
  a.address=composeAddr(a).slice(0,300);
  const prev=JSON.parse(JSON.stringify(PROFILE.addresses));
  if(addrEditing>=0)PROFILE.addresses[addrEditing]=a;else{if(PROFILE.addresses.length>=MAX_ADDR){toast('Maximum 4 addresses','err');return;}PROFILE.addresses.push(a);}
  try{await saveProfile();addrEditing=null;paneAddresses();toast('Address saved','ok');}catch(e){console.error(e);PROFILE.addresses=prev;toast('Could not save address. Please try again.','err');}
}
async function delAddr(i){
  if(!confirm('Delete this address?'))return;
  const prev=JSON.parse(JSON.stringify(PROFILE.addresses));
  PROFILE.addresses.splice(i,1);
  try{await saveProfile();paneAddresses();toast('Address deleted');}catch(e){PROFILE.addresses=prev;toast('Could not delete','err');}
}
function pickAddr(){
  const sel=document.getElementById('co-addr');if(!sel)return;
  const a=PROFILE&&PROFILE.addresses[Number(sel.value)];
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v;};
  if(sel.value===''||!a){set('co-name',PROFILE?.name||'');set('co-phone',PROFILE?.phone||'');['line','city','district','state','pin'].forEach(k=>set('co-'+k,''));}
  else{set('co-name',a.name);set('co-phone',a.phone);const v=a.line!==undefined?a:{line:a.address};['line','city','district','state','pin'].forEach(k=>set('co-'+k,v[k]||''));}
  const sv=document.getElementById('co-save-wrap');if(sv)sv.style.display=sel.value===''&&PROFILE.addresses.length<MAX_ADDR?'block':'none';
}
async function resendVerify(){try{await currentUser.sendEmailVerification();toast('Verification email sent','ok');}catch(e){toast('Please wait a minute before requesting again','err');}}
async function checkVerified(){
  try{await currentUser.reload();await currentUser.getIdToken(true);currentUser=fbAuth.currentUser;renderAccount();toast(currentUser.emailVerified?'Email verified ✔':'Not verified yet - open the link in your email first',currentUser.emailVerified?'ok':'info');}catch(e){toast('Could not check right now','err');}
}
function goAccount(){showView(!authReady||loggedIn?'account':'login');}
function showView(v){
  view=v;
  const map={main:'page-main',login:'page-login',signup:'page-signup',account:'page-account'};
  if(v==='account'&&authReady&&!loggedIn){v='login';view='login';}
  Object.entries(map).forEach(([k,id])=>document.getElementById(id).classList.toggle('active',k===v));
  document.getElementById('site-footer').style.display='block';
  if(v==='account')renderAccount();
  history.replaceState(null,'',v==='main'?location.pathname+location.search:'#'+v);
  window.scrollTo(0,0);
}
async function renderAccount(){
  const el=document.getElementById('page-account');
  if(!loggedIn&&!authReady){el.innerHTML='<div class="acc-hero"><div class="container"><span class="eyebrow">My Account</span><h1 style="font-family:\'Cormorant Garamond\',serif;font-size:2.2rem;font-weight:400;color:var(--plum)">Loading…</h1></div></div>';return;}
  if(!loggedIn){el.innerHTML='<div class="acc-hero"><div class="container"><span class="eyebrow">My Account</span><h1 style="font-family:\'Cormorant Garamond\',serif;font-size:2.2rem;font-weight:400;color:var(--plum)">Please log in</h1></div></div>';return;}
  const u=currentUser,nm=u.displayName||(u.email||'').split('@')[0]||'there';
  el.innerHTML=`<div class="acc-hero"><div class="container"><span class="eyebrow">My Account</span><h1 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:400;color:var(--plum);margin:6px 0 7px">Hello, ${esc(nm)} 👋</h1><p style="font-size:13.5px;color:var(--muted)">${esc(u.email||'')}</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="doLogout()">&#10162; Log Out</button></div></div>
  <section class="section" style="padding-top:28px"><div class="container">
    ${u.emailVerified?'':`<div style="background:#fff8e1;border:1px solid #ffe082;border-radius:12px;padding:12px 16px;margin-bottom:18px;font-size:13px;color:#7a5b00;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:200px">&#9993; Please verify your email (check inbox/spam). Verification is needed to post reviews.</span><button class="btn btn-ghost btn-sm" onclick="resendVerify()">Resend email</button><button class="btn btn-primary btn-sm" onclick="checkVerified()">I have verified</button></div>`}
    <div class="tab-btns"><button class="tab-btn active" onclick="showAccTab('orders',this)" id="tb-orders">My Orders</button><button class="tab-btn" onclick="showAccTab('addresses',this)" id="tb-addresses">My Addresses</button><button class="tab-btn" onclick="showAccTab('reviews',this)" id="tb-reviews">My Reviews</button><button class="tab-btn" onclick="showAccTab('settings',this)">Settings</button></div>
    <div id="acc-orders"><p class="no-rev">Loading your orders…</p></div><div id="acc-reviews" style="display:none"></div>
    <div id="acc-addresses" style="display:none"><p class="no-rev">Loading…</p></div>
    <div id="acc-settings" style="display:none"></div>
  </div></section>`;
  const uid=u.uid;
  if(PROFILE){paneAddresses();paneSettings();}
  try{
    const os=await fbDb.collection('orders').where('customerUid','==',uid).get();
    const orders=os.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0));
    const cls={delivered:'badge-ok',shipped:'badge-new',cancelled:'badge-sold'};
    if(view!=='account')return;
    document.getElementById('tb-orders').textContent=`My Orders (${orders.length})`;
    document.getElementById('acc-orders').innerHTML=orders.length?orders.map(o=>`<div class="order-card"><div class="order-hd"><div><div style="font-size:11px;color:var(--muted);margin-bottom:1px">Order #${esc(o.id.slice(-8).toUpperCase())}</div><div style="font-size:12.5px;font-weight:500;color:var(--plum)">${o.createdAt?new Date(o.createdAt.seconds*1000).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}</div></div>
      <div style="display:flex;align-items:center;gap:11px"><span style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;color:var(--plum)">${fmt(o.total)}</span><span class="badge ${cls[o.status]||'badge-low'}">${esc(STATUS_LABEL[o.status]||o.status)}</span></div></div>
      ${(o.items||[]).map(i=>`<div class="order-body" style="font-size:12.5px;display:flex;align-items:center;gap:9px"><span style="flex:1;color:var(--plum)">${esc(i.name)}</span><span style="color:var(--muted)">x${esc(i.quantity)}</span><span style="font-weight:500">${fmt(i.lineTotal)}</span></div>`).join('')}${o.trackingNo||o.trackingUrl?`<div class="order-body" style="font-size:12.5px;background:var(--lav-light);border-radius:10px;margin-top:8px;padding:10px 12px">&#128230; <strong>${esc(o.courier||'Courier')}</strong>${o.trackingNo?' · Tracking no: <strong>'+esc(o.trackingNo)+'</strong>':''}${/^https?:\/\//.test(o.trackingUrl||'')?` · <a style="color:var(--rose-deep);font-weight:600" href="${esc(o.trackingUrl)}" target="_blank" rel="noopener">Track shipment &#8599;</a>`:''}</div>`:''}</div>`).join(''):'<p class="no-rev">No orders yet. <a style="color:var(--rose-deep)" href="shop.html">Start shopping</a></p>';
  }catch(e){console.warn(e);const o=document.getElementById('acc-orders');if(o)o.innerHTML='<p class="no-rev">Could not load orders right now.</p>';}
  try{
    const rs=await fbDb.collection('reviews').where('uid','==',uid).get();
    const revs=rs.docs.map(d=>({id:d.id,...d.data()}));
    if(view!=='account')return;
    document.getElementById('tb-reviews').textContent=`My Reviews (${revs.length})`;
    document.getElementById('acc-reviews').innerHTML=revs.length?revs.map(r=>{const p=PRODUCTS.find(x=>String(x.id)===r.productId);return `<div class="rev-card"><div style="font-size:11px;color:var(--rose-deep);font-weight:600;margin-bottom:3px">${p?txt(p.name):'Product'}</div><div class="rev-stars" style="margin-bottom:7px">${stars(r.rating)}</div><p class="rev-text">${esc(r.text)}</p></div>`;}).join(''):'<p class="no-rev">You have not reviewed anything yet.</p>';
  }catch(e){console.warn(e);}
}
function showAccTab(tab,btn){
  ['orders','addresses','reviews','settings'].forEach(t=>document.getElementById('acc-'+t).style.display=t===tab?'block':'none');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
}
function openMob(){const mi=document.getElementById('mob-install');if(mi){const sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;mi.style.display=sa?'none':'block';}document.getElementById('mob-nav').style.display='flex';document.getElementById('nav-ov').style.display='block';}
function closeMob(){document.getElementById('mob-nav').style.display='none';document.getElementById('nav-ov').style.display='none';}
function sendWA(){
  const v=id=>(document.getElementById(id)?.value||'').trim();
  const name=v('cf-name'),email=v('cf-email'),phone=v('cf-phone'),topic=v('cf-type'),msg=v('cf-msg');
  if(!name||!email||!phone||!topic||!msg){toast('Please complete all fields before sending','err');return;}
  const m=`Hello ${dec(SS.name)}!\n\nI’m reaching out regarding: ${topic}\n\nCustomer Details\nName: ${name}\nEmail: ${email}\nWhatsApp Number: ${phone}\n\nMessage\n${msg}\n\nPlease get back to me when convenient. Thank you!\n\nWarm regards,\n${name}`;
  window.open(`https://wa.me/${String(SS.wa).replace(/\D/g,'')}?text=${encodeURIComponent(m)}`,'_blank');
  toast('Your message is ready to send on WhatsApp','ok');
}

// ------------------------------------------------------------------ live data from Firestore
function normalizeProduct(d,id){
  const p={...d,id:Number(id)};
  p.images=Array.isArray(p.images)?p.images:[];p.includes=Array.isArray(p.includes)?p.includes:[];
  p.disc=p.disc&&typeof p.disc==='object'?p.disc:{on:false,type:'percent',val:0,label:''};
  p.price=Number(p.price)||0;p.stock=Number(p.stock);if(isNaN(p.stock))p.stock=0;p.lowAt=Number(p.lowAt)||5;
  return p;
}
function applySettings(d){
  if(typeof d.offersOn==='boolean')offersOn=d.offersOn;
  if(d.SS)SS={...DEFAULT_SS,...d.SS};
  if(d.TC)TC={...DEFAULT_TC,...d.TC};
  OCC=(d.occ&&typeof d.occ==='object')?d.occ:{mode:'off'};
  applyOccasion();
  try{localStorage.setItem('doe_theme',JSON.stringify({TC,radius:SS.radius,occ:OCC}));}catch(e){}
}
function startLive(){
  fbDb.collection('settings').doc('storefront').onSnapshot(s=>{
    if(s.exists)applySettings(s.data());
    renderChrome();renderMain();renderProducts();updateFlash();
  },e=>console.warn('settings',e));
  fbDb.collection('settings').doc('content').onSnapshot(s=>{
    CONTENT=s.exists?deepMerge(clone(DEFAULT_CONTENT),s.data().content||{}):clone(DEFAULT_CONTENT);
    renderChrome();renderMain();
  },e=>console.warn('content',e));
  fbDb.collection('products').onSnapshot(snap=>{
    PRODUCTS=snap.docs.map(d=>normalizeProduct(d.data(),d.id)).sort((a,b)=>a.id-b.id);
    productsReady=true;reconcileCart();updBadge();renderProducts();updateFlash();
    if(document.getElementById('cart-sb').classList.contains('open'))renderCart();
  },e=>{
    console.warn('products',e);
    if(!productsReady){PRODUCTS=clone(SEED_PRODUCTS).map(p=>normalizeProduct(p,p.id));productsReady=true;renderProducts();}
  });
}

// ------------------------------------------------------------------ boot
(function boot(){
  try{const t=JSON.parse(localStorage.getItem('doe_theme')||'null');if(t){TC={...DEFAULT_TC,...t.TC};if(t.radius)SS.radius=t.radius;if(t.occ)OCC=t.occ;}}catch(e){}
  loadCart();buildChrome();applyOccasion();
  const cat=new URLSearchParams(location.search).get('category');
  if(PAGE==='shop'&&cat&&CATEGORIES.includes(cat))shopFilter=cat;
  renderChrome();renderMain(true);updBadge();
  const h=location.hash.replace('#','');
  if(['login','signup','account'].includes(h))showView(h);
  try{fbAuth.getRedirectResult().then(r=>{if(r&&r.user)showView('account');}).catch(e=>{console.warn('redirect sign-in',e);if(e&&e.code&&e.code!=='auth/operation-not-supported-in-this-environment')toast(authMessage(e)+' ['+e.code+']','err');});}catch(e){}
  startLive();
})();
