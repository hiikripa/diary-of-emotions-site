/* pwa.js - registers the service worker and shows a friendly "Install app" prompt. */
(function(){
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  }
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(standalone)return;
  const K='doe_pwa_hide';
  const hidden=()=>{try{return Date.now()-Number(localStorage.getItem(K)||0)<14*864e5;}catch(e){return false;}};
  const hide=()=>{try{localStorage.setItem(K,String(Date.now()));}catch(e){}};
  let ev=null,pill=null;
  function show(html,onGo){
    if(pill||hidden())return;
    pill=document.createElement('div');pill.className='pwa-pill';pill.setAttribute('role','dialog');
    pill.innerHTML='<span>'+html+'</span><button class="go" type="button">'+(onGo?'Install':'Got it')+'</button><button class="x" type="button" aria-label="Close">&#x2715;</button>';
    pill.querySelector('.go').onclick=()=>{if(onGo)onGo();hide();pill.remove();pill=null;};
    pill.querySelector('.x').onclick=()=>{hide();pill.remove();pill=null;};
    document.body.appendChild(pill);
  }
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();ev=e;
    setTimeout(()=>show('&#128242; Install our app for faster shopping',()=>{ev.prompt();}),12000);
  });
  window.addEventListener('appinstalled',()=>{if(pill){pill.remove();pill=null;}hide();});
  // iPhone / iPad Safari has no install event: show a one-time hint
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
  const safari=/safari/i.test(navigator.userAgent)&&!/crios|fxios|edgios/i.test(navigator.userAgent);
  if(ios&&safari)setTimeout(()=>show('Install: tap <b>Share</b> &#11014;&#65039; then <b>Add to Home Screen</b>',null),15000);
  window.installApp=function(){if(ev){ev.prompt();}else if(ios){hide();try{localStorage.removeItem(K);}catch(e){}show('Install: tap <b>Share</b> &#11014;&#65039; then <b>Add to Home Screen</b>',null);}};
})();
