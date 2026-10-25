/* themes.js - 20 occasion themes + festive effects engine.
   Shared by the public pages (site.js) and the admin panel. No secrets, no privileged logic. */
(function(){
const C=(rose,roseDeep,lav,lavLight,cream,plum,plumMid)=>({rose,roseDeep,lav,lavLight,cream,plum,plumMid});
const E=(g,o)=>Object.assign({t:'emoji',g,n:18,dir:'down',min:16,max:30,sp:[.7,1.7]},o||{});
const CF=(pal,n)=>({t:'confetti',pal,n:n||46});

window.OCCASIONS=[
 {id:'newyear',name:'New Year',emoji:'🎆',when:'1 Jan',colors:C('#C9A24B','#8A6A1E','#9FA8DA','#ECEEF8','#FBF9F2','#161B3A','#2A3166'),
  pal:['#F5B700','#E8590C','#D6336C','#4263EB','#12B886'],fx:[{t:'fireworks'},CF(['#F5B700','#C9A24B','#4263EB','#D6336C'],30)],
  greet:'Happy New Year! ✨',sub:'Start the year with gifts that feel like a hug. Tap for fireworks!',glyphs:['✨','🎆','🥂']},
 {id:'sankranti',name:'Sankranti / Lohri / Pongal',emoji:'🪁',when:'13-15 Jan',colors:C('#F28C28','#B85C00','#81D4FA','#E1F5FE','#FFFBF3','#3B2A14','#6B4A1F'),
  pal:['#F28C28','#E64980','#228BE6','#40C057','#FAB005'],fx:[E(['🪁','🪁','☀️','🌾'],{dir:'up',n:12,min:24,max:38,sp:[.5,1.2]})],
  greet:'Happy Makar Sankranti · Lohri · Pongal 🪁',sub:'Sweet wishes and warm gifts for the harvest season.',glyphs:['🪁','☀️','🌾']},
 {id:'republic',name:'Republic Day',emoji:'🧡',when:'26 Jan',colors:C('#FF9933','#C26A00','#7BC47F','#E8F5E9','#FFFDF8','#0B2A6B','#1B3F94'),
  pal:['#FF9933','#FFFFFF','#138808','#0B2A6B'],fx:[CF(['#FF9933','#F1F3F5','#138808','#0B2A6B'],60)],
  greet:'Happy Republic Day! Jai Hind',sub:'Celebrating the spirit of India.',glyphs:['🧡','✨']},
 {id:'valentine',name:"Valentine's Day",emoji:'💖',when:'14 Feb',colors:C('#E0557A','#A8264C','#F4A6C0','#FDE7EE','#FFF7F9','#4A0F26','#7B1E44'),
  pal:['#E0557A','#FF8FAB','#C9184A'],fx:[E(['💖','💕','❤️','💗','💘'],{dir:'up',n:20,sp:[.6,1.4]})],
  greet:"Happy Valentine's Day 💖",sub:'Say it with a hamper made just for them.',glyphs:['💖','💕','❤️']},
 {id:'womens',name:"Women's Day",emoji:'🌸',when:'8 Mar',colors:C('#B05CC4','#7B2D8E','#E1BEE7','#F6E9F9','#FDF8FF','#32103F','#5B2470'),
  pal:['#B05CC4','#F06292','#FFD54F'],fx:[E(['🌸','🌷','💜','✨'],{n:20})],
  greet:"Happy Women's Day 🌸",sub:'Celebrate the women who make life beautiful.',glyphs:['🌸','💜','✨']},
 {id:'holi',name:'Holi',emoji:'🎨',when:'March',colors:C('#E91E8C','#9C1067','#7C4DFF','#F1EAFF','#FFFAF2','#2B1247','#512B86'),
  pal:['#E91E8C','#FFD600','#00C853','#2979FF','#FF6D00','#AA00FF'],fx:[{t:'gulal'}],
  greet:'Happy Holi! रंगों का त्योहार 🎨',sub:'Tap anywhere to throw gulal!',glyphs:['🎨','💦','🌈']},
 {id:'eid',name:'Eid-ul-Fitr',emoji:'🌙',when:'After Ramadan',colors:C('#2E9E7A','#146B50','#E6C766','#FFF6D9','#FAFDF9','#0E3B2E','#1D6A52'),
  pal:['#2E9E7A','#E6C766','#FFFFFF'],fx:[E(['⭐','✨','🌙','🏮'],{n:16,dir:'down',sp:[.4,1]})],
  greet:'Eid Mubarak! 🌙',sub:'Wishing you joy, peace and sweet gifting.',glyphs:['🌙','⭐','✨']},
 {id:'ramadan',name:'Ramadan',emoji:'🕌',when:'Holy month (moon-sighting)',colors:C('#4C6EF5','#2B3A8C','#F2C14E','#FFF3D0','#F9FAFF','#141B4D','#2A3580'),
  pal:['#4C6EF5','#F2C14E','#FFFFFF'],fx:[E(['🌙','⭐','✨','🏮'],{n:16,sp:[.35,.9]})],
  greet:'Ramadan Mubarak 🌙',sub:'Wishing you a blessed month of peace and gratitude.',glyphs:['🌙','⭐','🏮']},
 {id:'adha',name:'Eid-ul-Adha (Bakrid)',emoji:'🕌',when:'Dhul Hijjah (moon-sighting)',colors:C('#1F8A70','#0F5C49','#D9B77A','#FBF0DC','#FBFDFA','#0C3328','#1B5A47'),
  pal:['#1F8A70','#D9B77A','#FFFFFF'],fx:[E(['🌙','✨','⭐','🌹'],{n:16,sp:[.4,1]})],
  greet:'Eid-ul-Adha Mubarak 🕌',sub:'May your home be filled with blessings and togetherness.',glyphs:['🌙','🕌','✨']},
 {id:'milad',name:'Eid Milad-un-Nabi',emoji:'🌹',when:'12 Rabi al-Awwal (moon-sighting)',colors:C('#43A580','#1E7A5C','#F1D58A','#FFF8DF','#F8FDFB','#0F3A2C','#1F6650'),
  pal:['#43A580','#F1D58A','#FFFFFF'],fx:[E(['🌹','✨','🕌','⭐'],{n:16,sp:[.4,1]})],
  greet:'Eid Milad-un-Nabi Mubarak 🌹',sub:'Peace, kindness and blessings to you and your family.',glyphs:['🌹','🕌','✨']},
 {id:'shabebarat',name:'Shab-e-Barat',emoji:'🕯️',when:'15 Sha\'ban (moon-sighting)',colors:C('#7E57C2','#4527A0','#B0BEC5','#ECEFF1','#FAF9FF','#1F1546','#3C2B7A'),
  pal:['#7E57C2','#B0BEC5','#FFFFFF'],fx:[E(['🕯️','🌙','✨','⭐'],{n:14,sp:[.3,.8]})],
  greet:'Shab-e-Barat Mubarak 🕯️',sub:'A night of prayers, forgiveness and light.',glyphs:['🕯️','🌙','✨']},
 {id:'mothers',name:"Mother's Day",emoji:'🌷',when:'2nd Sun of May',colors:C('#E8808F','#B8485C','#F7C6B3','#FFEEE6','#FFF9F6','#4A1F2B','#7A3447'),
  pal:['#E8808F','#F7C6B3','#FFD6A5'],fx:[E(['🌷','🌸','💐','🌺'],{n:20})],
  greet:"Happy Mother's Day 🌷",sub:'Because she deserves more than a thank-you.',glyphs:['🌷','💐','💗']},
 {id:'fathers',name:"Father's Day",emoji:'👔',when:'3rd Sun of June',colors:C('#4F86C6','#1F4E8C','#9DB8D6','#E8EFF7','#F8FAFC','#10243F','#1E3F6B'),
  pal:['#4F86C6','#1F4E8C','#F5B700'],fx:[CF(['#4F86C6','#1F4E8C','#F5B700','#9DB8D6'],40),E(['⭐','🏆'],{n:8,sp:[.5,1]})],
  greet:"Happy Father's Day 👔",sub:'Gifts for the first hero of your life.',glyphs:['👔','⭐','🏆']},
 {id:'friendship',name:'Friendship Day',emoji:'🤝',when:'1st Sun of Aug',colors:C('#FF8A4C','#C75A1F','#6EC6FF','#E3F4FF','#FFFBF5','#2D2A4A','#4F4B80'),
  pal:['#FF8A4C','#6EC6FF','#FFD43B','#FF6FA5','#69DB7C'],fx:[CF(['#FF8A4C','#6EC6FF','#FFD43B','#FF6FA5','#69DB7C'],46),E(['💛','🧡','💙'],{n:8,dir:'up'})],
  greet:'Happy Friendship Day 🤝',sub:'For the one who gets you, no explanation needed.',glyphs:['💛','🤝','🌈']},
 {id:'rakhi',name:'Raksha Bandhan',emoji:'🎀',when:'Aug',colors:C('#D9455F','#9C1F3A','#F2C46B','#FFF2D6','#FFF8F2','#4A1220','#7C2336'),
  pal:['#D9455F','#F2C46B','#FFFFFF'],fx:[E(['🎀','🌼','✨','💛'],{n:18})],
  greet:'Happy Raksha Bandhan 🎀',sub:'Rakhi gifts for the bond that never breaks.',glyphs:['🎀','🌼','💛']},
 {id:'independence',name:'Independence Day',emoji:'🎇',when:'15 Aug',colors:C('#FF9933','#C26A00','#7BC47F','#E8F5E9','#FFFDF8','#0B2A6B','#1B3F94'),
  pal:['#FF9933','#FFFFFF','#138808','#0B2A6B'],fx:[{t:'fireworks',pal:['#FF9933','#138808','#0B2A6B','#FFFFFF']},CF(['#FF9933','#F1F3F5','#138808'],30)],
  greet:'Happy Independence Day! Jai Hind',sub:'Proudly Indian. Tap for fireworks!',glyphs:['🧡','✨']},
 {id:'ganesh',name:'Ganesh Chaturthi',emoji:'🙏',when:'Aug / Sep',colors:C('#F57C00','#B34700','#FFD54F','#FFF4D0','#FFFAF0','#3D1500','#7A2E00'),
  pal:['#F57C00','#FFD54F','#E53935'],fx:[E(['🌼','🌺','🌼','🪔','✨'],{n:22,sp:[.6,1.5]})],
  greet:'गणपति बप्पा मोरया! 🙏',sub:'Ganesh Chaturthi ki hardik shubhkamnayein.',glyphs:['🌼','🙏','🪔']},
 {id:'teachers',name:"Teachers' Day",emoji:'📚',when:'5 Sep',colors:C('#2E7D6B','#1B5247','#F2C14E','#FFF4D2','#FAFCF8','#17352E','#2B5A4E'),
  pal:['#2E7D6B','#F2C14E','#E8590C'],fx:[E(['📚','✏️','🍎','🎓','⭐'],{n:16})],
  greet:"Happy Teachers' Day 📚",sub:'A thank-you gift for the teacher who shaped you.',glyphs:['📚','🍎','🎓']},
 {id:'navratri',name:'Navratri / Durga Puja',emoji:'🪔',when:'Sep / Oct',colors:C('#D32F2F','#8E1B1B','#FFC107','#FFF3CC','#FFF9F0','#400D0D','#6E1A1A'),
  pal:['#D32F2F','#FFC107','#FF6F00','#2E7D32'],fx:[E(['🌺','🪔','✨','🌼'],{n:18}),CF(['#D32F2F','#FFC107','#FF6F00'],22)],
  greet:'Happy Navratri & Shubho Durga Puja 🪔',sub:'Nine nights of colour, joy and gifting.',glyphs:['🪔','🌺','✨']},
 {id:'karwa',name:'Karwa Chauth',emoji:'🌙',when:'Oct / Nov',colors:C('#C2185B','#880E4F','#FFD180','#FFF1D9','#FFF7F7','#3E0B24','#6A1A3F'),
  pal:['#C2185B','#FFD180','#FFFFFF'],fx:[E(['🌙','✨','❤️','💍'],{n:16,sp:[.4,1.1]})],
  greet:'Happy Karwa Chauth 🌙',sub:'Gifts for your forever love.',glyphs:['🌙','❤️','✨']},
 {id:'dhanteras',name:'Dhanteras',emoji:'🪙',when:'Diwali Day 1',colors:C('#E0A100','#9A6B00','#FFCC80','#FFF1D6','#FFFAEC','#3A2300','#6B4300'),
  pal:['#F5B700','#E0A100','#E8590C','#FFFFFF'],fx:[E(['🪙','💰','✨'],{n:16,sp:[.6,1.4]}),E(['🪔'],{dir:'up',n:8,min:22,max:30,sp:[.4,.9]})],
  greet:'Shubh Dhanteras! 🪙',sub:'Welcome prosperity with a gift they will treasure.',glyphs:['🪙','🪔','✨']},
 {id:'chotidiwali',name:'Choti Diwali',emoji:'🪔',when:'Diwali Day 2 (Naraka Chaturdashi)',colors:C('#EF6C00','#A64500','#CE93D8','#F6EAFB','#FFF8F0','#3B1030','#6A1E55'),
  pal:['#EF6C00','#E91E8C','#FFC107','#7048E8'],fx:[{t:'fireworks',rate:.6},E(['🪔','🪔','✨'],{dir:'up',n:12,min:22,max:30,sp:[.4,.9]})],
  greet:'Happy Choti Diwali! 🪔',sub:'Light the first diyas, share the first smiles.',glyphs:['🪔','✨','🎇']},
 {id:'diwali',name:'Diwali (Lakshmi Puja)',emoji:'🪔',when:'Diwali Day 3',colors:C('#F0A500','#A86A00','#B39DDB','#F3ECFF','#FFFAEF','#2A0F3D','#4B1F6E'),
  pal:['#F0A500','#E8590C','#D6336C','#7048E8','#12B886'],fx:[{t:'fireworks'},E(['🪔','✨','🪷'],{dir:'up',n:10,min:20,max:30,sp:[.4,.9]})],
  greet:'Shubh Deepawali! 🪔',sub:'Light up their day. Tap anywhere for fireworks!',glyphs:['🪔','✨','🪷']},
 {id:'govardhan',name:'Govardhan Puja / New Year',emoji:'🌾',when:'Diwali Day 4 (Annakut / Gujarati New Year)',colors:C('#43A047','#1B6E2E','#FFD54F','#FFF7D1','#FBFEF6','#1B3A12','#2F6120'),
  pal:['#43A047','#FFD54F','#E8590C'],fx:[E(['🌾','🌼','✨'],{n:18}),E(['🪔'],{dir:'up',n:8,min:22,max:30,sp:[.4,.9]})],
  greet:'Happy Govardhan Puja & Annakut 🌾',sub:'Saal Mubarak to everyone celebrating the new year!',glyphs:['🌾','🌼','🪔']},
 {id:'bhaidooj',name:'Bhai Dooj',emoji:'💛',when:'Diwali Day 5',colors:C('#D84A6B','#9B2347','#FFB74D','#FFF0DB','#FFF8F3','#4A1226','#7C2442'),
  pal:['#D84A6B','#FFB74D','#FFFFFF'],fx:[E(['💛','🎁','✨'],{n:16}),E(['🪔'],{dir:'up',n:8,min:22,max:30,sp:[.4,.9]})],
  greet:'Happy Bhai Dooj! 🪔',sub:'Tilak, sweets and a gift for the bond that lasts.',glyphs:['🪔','💛','🎁']},
 {id:'childrens',name:"Children's Day",emoji:'🎈',when:'14 Nov',colors:C('#29B6F6','#0277BD','#FFCA28','#FFF6D6','#FBFDFF','#1A2B4A','#2C4A7D'),
  pal:['#29B6F6','#FFCA28','#FF6FA5','#69DB7C'],fx:[E(['🎈','🎈','🧸','🌈','🎨'],{dir:'up',n:16,min:24,max:38,sp:[.6,1.3]})],
  greet:"Happy Children's Day 🎈",sub:'Little smiles deserve big surprises.',glyphs:['🎈','🧸','🌈']},
 {id:'christmas',name:'Christmas',emoji:'🎄',when:'25 Dec',colors:C('#C62828','#8E0000','#81C784','#E8F5E9','#FFFAFA','#0F3B24','#1E5E3A'),
  pal:['#C62828','#2E7D32','#FFFFFF'],fx:[{t:'snow',n:70},E(['🎄','⭐','🎁'],{n:6,sp:[.5,1],min:18,max:26})],
  greet:'Merry Christmas! 🎄',sub:'Wrap up joy this season.',glyphs:['🎄','❄️','🎁']},
 {id:'birthday',name:'Birthday / Anniversary',emoji:'🎂',when:'Any day',colors:C('#FF6FA5','#C2386F','#B39DDB','#F3EDFF','#FFF9FC','#3A1B4A','#5E3376'),
  pal:['#FF6FA5','#B39DDB','#FFD43B','#4DABF7','#69DB7C'],fx:[CF(['#FF6FA5','#B39DDB','#FFD43B','#4DABF7','#69DB7C'],50),E(['🎈','🎁','🎂'],{dir:'up',n:8})],
  greet:'Celebrate every special day 🎂',sub:'Birthday & anniversary hampers, made with love.',glyphs:['🎂','🎁','🎉']}
];
const GROUPS={diwali:['dhanteras','chotidiwali','diwali','govardhan','bhaidooj'],muslim:['ramadan','eid','adha','milad','shabebarat']};
OCCASIONS.forEach(o=>{o.group=GROUPS.diwali.includes(o.id)?'diwali':GROUPS.muslim.includes(o.id)?'muslim':'fest';});
window.OCC_BY_ID={};OCCASIONS.forEach(o=>OCC_BY_ID[o.id]=o);

// today in India (IST) as YYYY-MM-DD
window.todayIST=function(){return new Date(Date.now()+5.5*3600*1000).toISOString().slice(0,10);};

/* ---------------------------------------------------------------- 10 style variants for EVERY occasion */
const hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>{const x=hx(a),y=hx(b);return toHex(x[0]*(1-t)+y[0]*t,x[1]*(1-t)+y[1]*t,x[2]*(1-t)+y[2]*t);};
function sat(h,k){const [r,g,b]=hx(h),m=(r+g+b)/3;return toHex(m+(r-m)*k,m+(g-m)*k,m+(b-m)*k);}
const PAL={
  base:c=>c,
  soft:c=>({...c,rose:mixc(c.rose,'#ffffff',.28),lav:mixc(c.lav,'#ffffff',.3),lavLight:mixc(c.lavLight,'#ffffff',.5)}),
  vivid:c=>({...c,rose:sat(c.rose,1.3),roseDeep:sat(c.roseDeep,1.2),lav:sat(c.lav,1.25)}),
  gold:c=>({...c,rose:mixc(c.rose,'#E0A100',.3),lav:'#E6C766',lavLight:'#FFF6D9'}),
  blush:c=>({...c,cream:mixc(c.cream,c.rose,.1),lavLight:mixc(c.lavLight,c.rose,.12)})
};
const spec=(o,rate)=>(o.fx||[]).filter(l=>l.t==='fireworks'||l.t==='gulal'||l.t==='snow').map(l=>Object.assign({},l,rate===undefined?{}:{rate}));
const gl=o=>(o.glyphs&&o.glyphs.length?o.glyphs:[o.emoji]).filter(x=>x!=='🪔'&&x!=='🇮🇳');
const gg=o=>{const g=gl(o);return g.length?g:[o.emoji];};
window.OCC_VARIANTS=[
 {name:'Classic',pal:'base',b:1,fx:o=>o.fx},
 {name:'Soft Pastel',pal:'soft',b:2,fx:o=>[...spec(o,.6),E(gg(o),{n:14,sp:[.4,1]})]},
 {name:'Rich & Vivid',pal:'vivid',b:1,fx:o=>[...o.fx,CF(o.pal,24)]},
 {name:'Golden Glow',pal:'gold',b:3,fx:o=>[...spec(o,1),E(['✨','⭐','✨'],{n:18,sp:[.3,.9],min:14,max:24})]},
 {name:'Rising Wishes',pal:'base',b:2,fx:o=>[...spec(o,.7),E(gg(o),{dir:'up',n:16,sp:[.5,1.2]})]},
 {name:'Confetti Party',pal:'vivid',b:4,fx:o=>[CF(o.pal,70),...spec(o,.6)]},
 {name:'Gentle & Calm',pal:'soft',b:5,fx:o=>[E(gg(o),{n:8,sp:[.3,.7]})]},
 {name:'Blush & Cream',pal:'blush',b:3,fx:o=>[...spec(o,.5),E(gg(o),{n:20,sp:[.5,1.2]})]},
 {name:'Surprise on Tap',pal:'base',b:4,fx:o=>[...spec(o,0),E(gg(o),{n:0})]},
 {name:'Banner Only (quiet)',pal:'base',b:1,fx:()=>[]}
];
const SUBS=['','Thoughtful hampers for {n}','Make {n} extra special','Gift love this {n}','Wishes, wrapped with care','Celebrate {n} with a hamper','From our family to yours','Surprise someone this {n}','Tap anywhere for a little surprise ✨','Send {n} wishes with love'];
// Build the final occasion object for (id, variant 0-9)
window.buildOcc=function(id,v){
  const b=OCC_BY_ID[id];if(!b)return null;
  v=Math.max(0,Math.min(9,parseInt(v,10)||0));const R=OCC_VARIANTS[v];
  const o=Object.assign({},b);
  o.vi=v;o.vname=R.name;o.banner=R.b;
  o.colors=PAL[R.pal](b.colors);
  o.fx=R.fx(b);
  if(v>0)o.sub=SUBS[v].replace(/\{n\}/g,b.name.split(' / ')[0].replace(/\s*\(.*\)/,''));
  return o;
};

// Decide which occasion is live. cfg = {mode:'off'|'manual'|'auto', id, v, sched:[{id,v,from,to}], greet, sub}
window.resolveOccasion=function(cfg){
  let q=null,qv=0;try{const u=new URLSearchParams(location.search);q=u.get('occ');qv=u.get('v');}catch(e){}
  if(q&&OCC_BY_ID[q])return {o:buildOcc(q,qv),greet:'',sub:'',preview:true};
  if(!cfg||!cfg.mode||cfg.mode==='off')return null;
  if(cfg.mode==='manual'&&OCC_BY_ID[cfg.id])return {o:buildOcc(cfg.id,cfg.v),greet:cfg.greet||'',sub:cfg.sub||''};
  if(cfg.mode==='auto'){
    const t=todayIST();
    const s=(cfg.sched||[]).find(x=>x&&OCC_BY_ID[x.id]&&x.from&&x.to&&x.from<=t&&t<=x.to);
    if(s)return {o:buildOcc(s.id,s.v),greet:s.greet||'',sub:s.sub||''};
  }
  return null;
};

/* ---------------------------------------------------------------- effects engine */
window.FX=(function(){
  let cv=null,ctx=null,W=0,H=0,dpr=1,parts=[],layers=[],occ=null,raf=0,last=0,tGul=0,tFw=0,running=false,sig='';
  const UPRIGHT=['\u{1FA94}','\u{1F388}','\u{1F319}','\u{1F384}','\u{1F54C}','\u{1F56F}\uFE0F','\u{1F3EE}','\u{1F3C6}','\u{1FA99}'];
  const FONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const R=(a,b)=>a+Math.random()*(b-a);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const small=()=>innerWidth<700;
  const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}};
  const muted=()=>{try{return localStorage.getItem('doe_fx')==='0';}catch(e){return false;}};
  function resize(){if(!cv)return;dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
  function mk(){
    cv=document.createElement('canvas');cv.id='fx-canvas';cv.setAttribute('aria-hidden','true');
    cv.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:120';
    document.body.appendChild(cv);ctx=cv.getContext('2d');resize();
    addEventListener('resize',resize);
  }
  function spawnEmoji(L,fresh){
    const g=pick(L.g),fixed=UPRIGHT.indexOf(g)>=0;
    const up=L.dir==='up'||g==='\u{1FA94}';          // a diya always rises, like a lantern - never falls or tumbles
    return {k:'emoji',g,x:R(0,W),y:fresh?R(0,H):(up?H+40:-40),s:R(L.min,L.max),vy:R(L.sp[0],L.sp[1])*(up?-1:1)*(small()?.8:1),
      vx:R(-.25,.25),ph:R(0,6.28),sw:fixed?R(.2,.5):R(.4,1.2),rot:fixed?0:R(-.5,.5),vr:fixed?0:R(-.012,.012),a:R(.75,1),L};
  }
  function spawnConf(L,fresh){
    return {k:'conf',x:R(0,W),y:fresh?R(0,H):-12,w:R(6,11),h:R(4,8),c:pick(L.pal),vy:R(1,2.4),vx:R(-.4,.4),ph:R(0,6.28),rot:R(0,6.28),vr:R(-.1,.1),L};
  }
  function spawnSnow(L,fresh){return {k:'snow',x:R(0,W),y:fresh?R(0,H):-8,r:R(1.5,4),vy:R(.5,1.6),ph:R(0,6.28),L};}
  function gulalBurst(x,y,n,pal){
    pal=pal||occ.pal;
    for(let i=0;i<n;i++){const a=R(0,6.283),sp=R(.8,5.5);
      parts.push({k:'gul',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.2,r:R(8,24),gr:R(.35,.9),c:pick(pal),life:0,max:R(70,130)});}
    for(let i=0;i<n;i++){const a=R(0,6.283),sp=R(2,8);
      parts.push({k:'dot',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.5,r:R(1.5,3),c:pick(pal),life:0,max:R(60,110)});}
  }
  function sparkBurst(x,y,pal,n){
    pal=pal||occ.pal;const c1=pick(pal),c2=pick(pal);
    for(let i=0;i<n;i++){const a=R(0,6.283),sp=R(1.2,5.6);
      parts.push({k:'spark',x,y,px:x,py:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,c:Math.random()<.65?c1:c2,life:0,max:R(55,90)});}
  }
  function popBurst(x,y){
    const L=layers.find(l=>l.t==='emoji'),C=layers.find(l=>l.t==='confetti');
    const n=small()?7:11;
    for(let i=0;i<n;i++){const a=R(0,6.283),sp=R(2,6.5);
      if(L&&(i%2===0||!C))parts.push({k:'pop',g:pick(L.g),x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,s:R(16,28),life:0,max:R(55,85)});
      else if(C)parts.push({k:'cpop',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,w:R(6,10),h:R(4,7),c:pick(C.pal),rot:R(0,6.28),vr:R(-.2,.2),life:0,max:R(55,85)});}
  }
  function tap(x,y){
    if(!running)return;
    const first=layers[0]&&layers[0].t,has=t=>layers.some(l=>l.t===t);
    if(has('gulal'))gulalBurst(x,y,small()?10:16);
    else if(has('fireworks'))sparkBurst(x,y,(layers.find(l=>l.t==='fireworks')||{}).pal,small()?26:38);
    else popBurst(x,y);
    if(parts.length>700)parts.splice(0,parts.length-700);
  }
  function onTap(e){const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;tap(e.clientX,e.clientY);}
  function step(now){
    raf=0;if(!running)return;
    if(document.hidden){last=0;return;}
    const dt=last?Math.min(2.5,(now-last)/16.667):1;last=now;
    ctx.clearRect(0,0,W,H);
    // ambient bursts
    const gl=layers.find(l=>l.t==='gulal'),fw=layers.find(l=>l.t==='fireworks');
    if(gl&&gl.rate!==0){tGul-=dt;if(tGul<=0){tGul=(small()?95:70)/(gl.rate||1);gulalBurst(R(W*.1,W*.9),R(H*.4,H*.85),small()?12:18,gl.pal);}}
    if(fw&&fw.rate!==0){tFw-=dt;if(tFw<=0){tFw=(small()?110:75)/(fw.rate||1);parts.push({k:'rocket',x:R(W*.1,W*.9),y:H+10,vx:R(-.6,.6),vy:-R(6,9.5),ty:R(H*.12,H*.45),c:pick(fw.pal||occ.pal),pal:fw.pal});}}
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];
      switch(p.k){
      case 'emoji':{p.ph+=.02*dt;p.x+=(p.vx+Math.sin(p.ph)*p.sw)*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
        if(p.y<-60||p.y>H+60){parts[i]=spawnEmoji(p.L,false);break;}
        ctx.save();ctx.globalAlpha=p.a;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.font=p.s+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.g,0,0);ctx.restore();break;}
      case 'conf':{p.ph+=.06*dt;p.x+=(p.vx+Math.sin(p.ph)*.6)*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
        if(p.y>H+14){parts[i]=spawnConf(p.L,false);break;}
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,Math.cos(p.ph));ctx.fillStyle=p.c;ctx.globalAlpha=.92;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();break;}
      case 'snow':{p.ph+=.015*dt;p.x+=Math.sin(p.ph)*.5*dt;p.y+=p.vy*dt;if(p.y>H+8){parts[i]=spawnSnow(p.L,false);break;}
        ctx.beginPath();ctx.fillStyle='rgba(255,255,255,.95)';ctx.shadowColor='rgba(120,150,190,.55)';ctx.shadowBlur=3;ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();ctx.shadowBlur=0;break;}
      case 'gul':{p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.965;p.vy=p.vy*.965+.035*dt;p.r+=p.gr*dt;
        const t=p.life/p.max;if(t>=1){parts.splice(i,1);break;}
        const a=.62*(1-t)*(1-t*.3);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
        g.addColorStop(0,hexA(p.c,a));g.addColorStop(1,hexA(p.c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();break;}
      case 'dot':{p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy=p.vy*.96+.06*dt;const t=p.life/p.max;if(t>=1){parts.splice(i,1);break;}
        ctx.globalAlpha=1-t;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();ctx.globalAlpha=1;break;}
      case 'rocket':{p.px=p.x;p.py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy*=.985;
        ctx.strokeStyle=p.c;ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.globalAlpha=1;
        if(p.y<=p.ty||p.vy>-1.2){sparkBurst(p.x,p.y,p.pal,small()?30:44);parts.splice(i,1);}break;}
      case 'spark':{p.life+=dt;p.px=p.x;p.py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy=p.vy*.985+.045*dt;
        const t=p.life/p.max;if(t>=1){parts.splice(i,1);break;}
        ctx.globalAlpha=1-t*t;ctx.strokeStyle=p.c;ctx.lineWidth=3.2;ctx.lineCap='round';ctx.shadowColor=p.c;ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(p.x-p.vx*2.2,p.y-p.vy*2.2);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;break;}
      case 'pop':{p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy=p.vy*.97+.14*dt;const t=p.life/p.max;if(t>=1){parts.splice(i,1);break;}
        ctx.globalAlpha=1-t*t;ctx.font=p.s+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.g,p.x,p.y);ctx.globalAlpha=1;break;}
      case 'cpop':{p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy=p.vy*.97+.14*dt;p.rot+=p.vr*dt;const t=p.life/p.max;if(t>=1){parts.splice(i,1);break;}
        ctx.save();ctx.globalAlpha=1-t*t;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();break;}
      }
    }
    raf=requestAnimationFrame(step);
  }
  function hexA(h,a){const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a.toFixed(3)+')';}
  function kick(){if(running&&!raf){last=0;raf=requestAnimationFrame(step);}}
  function stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=0;parts=[];layers=[];if(cv){cv.remove();cv=null;ctx=null;}
    removeEventListener('pointerdown',onTap);}
  function start(o){
    const s=o?o.id+'|'+(o.vi||0)+'|'+muted():'';
    if(s===sig&&(!o||running))return;
    sig=s;stop();occ=o;
    if(!o||!o.fx||!o.fx.length||reduced()||muted())return;
    if(!document.body)return;
    mk();running=true;layers=o.fx.map(l=>typeof l==='string'?{t:l}:l).map(l=>Object.assign({pal:o.pal},l,l.pal?{}:{pal:o.pal}));
    const sc=small()?.55:1;
    layers.forEach(L=>{
      if(L.t==='emoji')for(let i=0;i<Math.round(L.n*sc);i++)parts.push(spawnEmoji(L,true));
      else if(L.t==='confetti')for(let i=0;i<Math.round(L.n*sc);i++)parts.push(spawnConf(L,true));
      else if(L.t==='snow')for(let i=0;i<Math.round(L.n*sc);i++)parts.push(spawnSnow(L,true));
    });
    tGul=20;tFw=30;
    addEventListener('pointerdown',onTap,{passive:true});
    kick();
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick();});
  return {start,stop,toggle(){try{localStorage.setItem('doe_fx',muted()?'1':'0');}catch(e){}const o=occ;sig='';start(o);return !muted();},isMuted:muted,hasMotion:()=>!reduced()};
})();
})();
