/* ============================================================
   helpers
============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const img=(s,w,h)=>`demo-media/${encodeURIComponent(s)}.webp`;
function hash(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n}
const CAMS=['Sony A7 IV','Fujifilm X-T5','Nikon Zf','Canon R6 II','Ricoh GR III'];
function exif(seed){const n=hash(seed);return `f/${[1.4,1.8,2,2.8,4,5.6][n%6]} · ${['1/500','1/250','1/125','1/60','1/30'][Math.floor(n/7)%5]}s · ISO ${[100,200,400,800,1600][Math.floor(n/35)%5]} · ${['24mm','35mm','50mm','85mm'][Math.floor(n/210)%4]} · ${CAMS[Math.floor(n/840)%CAMS.length]}`}
const I={
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12.82 5.58-.82.822-.824-.824a5.375 5.375 0 1 0-7.601 7.602l7.895 7.895a.75.75 0 0 0 1.06 0l7.902-7.897a5.376 5.376 0 0 0-.001-7.599 5.38 5.38 0 0 0-7.611 0m6.548 6.54L12 19.485 4.635 12.12a3.875 3.875 0 1 1 5.48-5.48l1.358 1.357a.75.75 0 0 0 1.073-.012L13.88 6.64a3.88 3.88 0 0 1 5.487 5.48"/></svg>',
  heartf:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12.82 5.58-.82.822-.824-.824a5.375 5.375 0 1 0-7.601 7.602l7.895 7.895a.75.75 0 0 0 1.06 0l7.902-7.897a5.376 5.376 0 0 0-.001-7.599 5.38 5.38 0 0 0-7.611 0"/></svg>',
  image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5zm2.5 8 2.5-3 2.5 2.5 2-2 2.5 3"/><circle cx="15.25" cy="8.75" r="1.25" fill="currentColor" stroke="none"/></svg>',
  folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7.5A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.75v9.5m0 0 3.5-3.5M12 14.25l-3.5-3.5M5.75 16.75v1.5A1.75 1.75 0 0 0 7.5 20h9a1.75 1.75 0 0 0 1.75-1.75v-1.5"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5m0-5-7.5 7.5M10 7H7.5A2.5 2.5 0 0 0 5 9.5v7A2.5 2.5 0 0 0 7.5 19h7a2.5 2.5 0 0 0 2.5-2.5V14"/></svg>',
  bm:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.19 21.855a.75.75 0 0 1-1.187-.61V6.25A3.25 3.25 0 0 1 8.253 3h7.498a3.25 3.25 0 0 1 3.25 3.25v14.996a.75.75 0 0 1-1.188.609l-5.81-4.181zM17.502 6.25a1.75 1.75 0 0 0-1.75-1.75H8.253a1.75 1.75 0 0 0-1.75 1.75v13.532l5.061-3.641a.75.75 0 0 1 .876 0l5.061 3.641z"/></svg>',
  bmf:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.19 21.855a.75.75 0 0 1-1.187-.61V6.25A3.25 3.25 0 0 1 8.253 3h7.498a3.25 3.25 0 0 1 3.25 3.25v14.996a.75.75 0 0 1-1.188.609l-5.81-4.181z"/></svg>',
  kebab:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.4" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18.6" r="1.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5Z"/></svg>',
  playc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.6"/><path d="M10.2 8.6v6.8l5.6-3.4Z" fill="currentColor" stroke="none"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="3.5"/><rect x="8" y="8" width="3.4" height="3.4" rx="1" fill="currentColor" stroke="none"/><rect x="12.6" y="8" width="3.4" height="3.4" rx="1" fill="currentColor" stroke="none"/><rect x="8" y="12.6" width="3.4" height="3.4" rx="1" fill="currentColor" stroke="none"/><rect x="12.6" y="12.6" width="3.4" height="3.4" rx="1" fill="currentColor" stroke="none"/></svg>',
  mut:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5.5 6.5 9H3.5v6h3L11 18.5Z"/><path d="m16 9.5 5 5m0-5-5 5"/></svg>',
  snd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5.5 6.5 9H3.5v6h3L11 18.5Z"/><path d="M14.5 9a4.2 4.2 0 0 1 0 6M17 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 15 7-7 7 7"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 9 7 7 7-7"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.6"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
};
const badge=d=>`<span class="vbadge">${I.play}${d}</span>`;
const ring=(seed,size,cls='')=>`<span class="ring ${cls}" style="width:${size}px;height:${size}px"><img src="${img(seed,120,120)}" alt="" ${size>50?'loading="lazy"':''}></span>`;

/* ============================================================
   illustrative preview data; not connected to a real Foldergram instance
============================================================ */
const PROFILES=[
  {id:'animal',name:'Animal Planet',path:'AnimalPlanet',av:'animal-0',posts:76,reels:5,bio:'Wildlife up close, raw, real, and untamed 🐾'},
  {id:'urban',name:'Urban Planet',path:'UrbanPlanet',av:'urban-0',posts:27,reels:3,bio:'Streets, cities, and places worth remembering.'},
  {id:'nature',name:'Nature Planet',path:'NaturePlanet',av:'nature-0',posts:51,reels:3,bio:'Forests, rivers, and everything outdoors.'},
  {id:'season',name:'Season Planet',path:'SeasonPlanet',av:'season-0',posts:30,reels:3,bio:'The year in four acts.'},
  {id:'pottery',name:'Pottery Studio',path:'Ext-Pottery',av:'pottery-0',posts:7,reels:2,bio:'Small rituals at the pottery wheel.'},
  {id:'coffee',name:'Coffeehouse',path:'Ext-Coffeehouse',av:'coffee-0',posts:7,reels:2,bio:'Coffee breaks worth keeping.'}
];
const byP=id=>PROFILES.find(p=>p.id===id);
const STORIES=[
  {n:'Tigers',m:'Animal Planet · highlights',s:'st-tigers-0',items:['st-tigers-0','st-tigers-1','animal-1']},
  {n:'Lions',m:'Animal Planet · highlights',s:'st-lions-0',items:['st-lions-0','st-lions-1','st-lions-2']},
  {n:'Seasons',m:'Season Planet · moments',s:'st-season-0',items:['st-season-0','st-season-1','st-season-2']},
  {n:'Wildlife',m:'Animal Planet · mix',s:'st-mix-0',items:['st-mix-0','st-mix-1','animal-3']}
];
const FEED=[
  {p:'animal',s:'animal-1',w:750,h:850,cap:'tiger cub resting in the wild',date:'MAR 15, 2026'},
  {p:'urban',s:'urban-0',w:800,h:1000,cap:'Fisherman’s Bastion in Budapest',date:'MAR 15, 2026'},
  {p:'nature',s:'nature-0',w:800,h:640,cap:'the Katsura River in Japan',date:'APR 24, 2026'},
  {p:'season',s:'season-1',w:750,h:900,cap:'quiet snow-covered winter trees',date:'MAR 15, 2026'},
  {p:'pottery',s:'pottery-0',w:750,h:850,cap:'ceramic mugs in the workshop',date:'NOV 18, 2026'},
  {p:'coffee',s:'coffee-0',w:800,h:1000,cap:'coffee in afternoon light',date:'NOV 18, 2026'},
  {p:'animal',s:'animal-3',w:800,h:900,cap:'red panda in a green forest',date:'MAR 15, 2026'}
];
const REDISCOVER=[
  {p:'animal',s:'animal-2',w:800,h:650,cap:'a lynx among snowy trees',date:'MAR 15, 2026'},
  {p:'nature',s:'nature-1',w:800,h:950,cap:'the Milky Way on a clear night',date:'MAR 15, 2026'},
  {p:'urban',s:'urban-1',w:800,h:600,cap:'London Bridge',date:'APR 24, 2026'},
  {p:'season',s:'season-0',w:800,h:700,cap:'autumn forest colors',date:'MAR 15, 2026'}
];
let LIKES=['animal-2','nature-1','season-2','animal-7'].map(s=>({s,cap:s.split('-')[0]+' gallery'}));
let SAVED=['animal-1','animal-9','nature-0','coffee-0'].map(s=>({s,cap:s.split('-')[0]+' gallery'}));
const SEARCH=[
  {s:'urban-0',label:'Budapest city buildings',h:620},
  {s:'nature-6',label:'ocean waves on rocks',h:520},
  {s:'season-4',label:'purple flower',h:640},
  {s:'nature-0',label:'river forest green',h:560},
  {s:'nature-1',label:'night sky Milky Way',h:600},
  {s:'season-1',label:'winter snow trees',h:420},
  {s:'urban-1',label:'London bridge',h:560},
  {s:'animal-6',label:'giraffe wildlife',h:480},
  {s:'pottery-3',label:'handmade clay bowl',h:520},
  {s:'animal-2',label:'lynx wildcat',h:640},
  {s:'urban-4',label:'Jiufen Taiwan streets',h:600},
  {s:'coffee-4',label:'coffee croissant',h:540}
];
const LIBROWS=PROFILES.map(p=>p.id);
const PLACES=[
  {n:'Kyoto',r:'Kyoto, Japan',c:'Example place'},
  {n:'London',r:'London, United Kingdom',c:'Example place'},
  {n:'Budapest',r:'Budapest, Hungary',c:'Example place'}
];
const REELS=[
  {s:'reel-animal',p:'animal',path:'AnimalPlanet/11910005_1440_2732_30fps.mp4',cap:'wildlife in motion'},
  {s:'reel-nature',p:'nature',path:'NaturePlanet/18947596-hd_1080_1920_60fps.mp4',cap:'nature in motion'},
  {s:'reel-urban',p:'urban',path:'UrbanPlanet/19168247-hd_1080_1920_30fps.mp4',cap:'city footage'},
  {s:'reel-season',p:'season',path:'SeasonPlanet/20368892-uhd_2160_3840_29fps.mp4',cap:'the seasons in motion'}
];
const galleryPhotos=id=>{
  const counts={animal:16,nature:14,urban:13,season:13,pottery:5,coffee:5};
  return Array.from({length:counts[id]||0},(_,i)=>({s:id+'-'+i}));
};
const galleryVideos=id=>{
  const mapping={animal:['reel-animal'],nature:['reel-nature'],urban:['reel-urban'],season:['reel-season'],pottery:['reel-pottery'],coffee:['reel-coffee']};
  return (mapping[id]||[]).map(s=>({s,v:'VIDEO'}));
};
const storyForProfile=id=>id==='animal'?[0,1,3]:id==='season'?[2]:[];

/* ============================================================
   theme
============================================================ */
const SUN='<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/>';
const MOON='<path d="M20.4 13.2A8.3 8.3 0 0 1 10.8 3.6 8.3 8.3 0 1 0 20.4 13.2Z"/>';
const themeBtn=$('#themeBtn'),thIcon=$('#thIcon');
function setTheme(t){
  document.documentElement.dataset.theme=t;
  thIcon.innerHTML=t==='dark'?MOON:SUN;
  try{localStorage.setItem('fg-theme',t)}catch(e){}
}
let stored='dark';try{stored=localStorage.getItem('fg-theme')||'dark'}catch(e){}
setTheme(stored);
themeBtn.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

/* ============================================================
   mini app
============================================================ */
const apMain=$('#apMain'),app=$('#app');
let nav='home',feedMode='Recent',profId='animal',profTab='grid',rlIdx=0,rlProg=null;
const liked=new Set(),savedSet=new Set();

function setSidebar(key){
  $$('.ap-ib[data-nav]').forEach(b=>b.classList.toggle('act',b.dataset.nav===key));
}
function screen(html){
  apMain.innerHTML=`<div class="ap-screen">${html}</div>`;
  apMain.scrollTop=0;
}
function navTo(key,opts={}){
  if(nav==='reels'&&key!=='reels')stopReel();
  nav=key;setSidebar(key);
  if(key==='home')rHome();
  else if(key==='reels')rReels(opts.idx||0);
  else if(key==='search')rSearch();
  else if(key==='library')rLibrary();
  else if(key==='places')rPlaces();
  else if(key==='likes')rGrid('LIKED POSTS','Posts liked in this interactive preview.',LIKES,'likes');
  else if(key==='saved')rCollections();
  else if(key==='profile')rProfile(opts.id||profId,opts.tab||'grid');
}

/* ---------- home ---------- */
function rHome(){
  let list=FEED;
  if(feedMode==='Rediscover')list=REDISCOVER;
  if(feedMode==='Random'){list=[...FEED].sort(()=>Math.random()-.5)}
  const chips=['Recent','Rediscover','Random'].map(m=>`<button class="chip ${m===feedMode?'act':''}" data-mode="${m}">${m}</button>`).join('');
  const stats=`<div class="ap-stats" aria-label="Sample gallery counts: ${PROFILES.reduce((total,p)=>total+p.posts,0)} posts, ${PROFILES.reduce((total,p)=>total+p.reels,0)} reels, ${PROFILES.length} folders"><span title="Posts">${I.image}${PROFILES.reduce((total,p)=>total+p.posts,0)}</span><span title="Reels">${I.playc}${PROFILES.reduce((total,p)=>total+p.reels,0)}</span><span title="Folders">${I.folder}${PROFILES.length}</span></div>`;
  const stories=STORIES.map((st,i)=>`<button class="ap-story" data-story="${i}" aria-label="Open story: ${esc(st.n)}">${ring(st.s,64)}<span class="ap-sname">${esc(st.n)}</span></button>`).join('');
  const feed=list.map((v,i)=>{
    const p=byP(v.p);
    return `<article class="ap-post">
      <div class="ap-phead"><button class="ap-profile-link" data-act="goprofile" data-p="${p.id}" aria-label="Open ${esc(p.name)} folder">${ring(p.av,38)}<span class="ap-pn">${esc(p.name)}</span></button><button class="iconbtn" data-act="menu" aria-label="More options in the full demo">${I.kebab}</button></div>
      <div class="ap-photo" style="aspect-ratio:${v.w}/${v.h}">${v.vid?badge(v.vid):''}<img src="${img(v.s,Math.min(v.w,800),Math.round(v.h*(Math.min(v.w,800)/v.w)))}" alt="${esc(v.cap)}" loading="lazy"></div>
      <div class="ap-actions">
        <button class="iconbtn ${liked.has(v.s)?'likeon':''}" data-act="like" data-s="${v.s}" data-w="${v.w}" data-h="${v.h}" data-cap="${esc(v.cap)}" aria-label="Like" aria-pressed="${liked.has(v.s)}">${liked.has(v.s)?I.heartf:I.heart}</button>
        <button class="iconbtn" data-act="menu" aria-label="Open media in full demo">${I.image}</button>
        <button class="iconbtn" data-act="goprofile" data-p="${p.id}" aria-label="Open profile">${I.folder}</button>
        <span class="ap-agrow">
          <button class="iconbtn" data-act="toast" data-msg="Downloads use your browser in this preview. The real app serves files straight from disk." aria-label="Download">${I.dl}</button>
          <button class="iconbtn" data-act="menu" aria-label="Open original file in full demo">${I.share}</button>
          <button class="iconbtn ${savedSet.has(v.s)?'saveon':''}" data-act="save" data-s="${v.s}" data-w="${v.w}" data-h="${v.h}" data-cap="${esc(v.cap)}" aria-label="Save" aria-pressed="${savedSet.has(v.s)}">${savedSet.has(v.s)?I.bmf:I.bm}</button>
        </span>
      </div>
      <p class="ap-cap"><button class="ap-pn" data-act="goprofile" data-p="${p.id}">${esc(p.name)}</button> ${esc(v.cap)}</p>
      <p class="ap-date">${esc(v.date||"")}</p>
    </article>`;
  }).join('');
  const railRows=PROFILES.slice(1).map(p=>`
    <button class="ap-srow" data-act="goprofile" data-p="${p.id}">
      <img src="${img(p.av,80,80)}" alt=""><span><span class="sn">${esc(p.name)}</span><br><span class="ss">Top-level source folder</span></span>
      <span class="ap-open">Open</span>
    </button>`).join('');
  const rail=`<aside class="ap-rail">
    <button class="ap-srow" data-act="goprofile" data-p="${PROFILES[0].id}">
      <img src="${img(PROFILES[0].av,80,80)}" alt=""><span><span class="sn">${esc(PROFILES[0].name)}</span><br><span class="ss">Top-level source folder</span></span>
      <span class="ap-open">Open</span>
    </button>
    <div class="ap-vl"><button data-nav="likes">View likes</button></div>
    <h4>Suggested folders</h4>
    ${railRows}
    <p class="ap-oss">Foldergram is open source. <a href="https://github.com/foldergram/foldergram" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
  </aside>`;
  screen(`<div class="ap-home">
    <div class="ap-cols">
      <div class="ap-feedwrap">
        <div class="ap-stories">${stories}</div>
        <div class="ap-toolbar"><div class="ap-modes">${chips}</div>${stats}</div>
        ${feed}
      </div>
      ${rail}
    </div>
  </div>`);
}

/* ---------- reels ---------- */
let reelMuted=true,activeReelVideo=null;
function stopReel(){
  clearTimeout(rlProg);
  rlProg=null;
  if(activeReelVideo){
    activeReelVideo.pause();
    activeReelVideo.removeAttribute('src');
    activeReelVideo.load();
    activeReelVideo=null;
  }
}
function rReels(idx){
  stopReel();
  rlIdx=Math.max(0,Math.min(idx,REELS.length-1));
  const it=REELS[rlIdx],p=byP(it.p);
  screen(`<div class="ap-reels">
    <div class="rc-stage">
      <div class="rc-video-shell">
      <div class="reelcard">
        <video id="rcVideo" src="demo-media/${it.s}.mp4" poster="${img(it.s)}" autoplay muted playsinline preload="metadata" aria-label="${esc(it.cap)}"></video>
        <button class="rc-mute" id="rcMute" aria-label="${reelMuted?'Unmute reel':'Mute reel'}" title="${reelMuted?'Unmute':'Mute'}">${reelMuted?I.mut:I.snd}</button>
        <button class="rc-play" id="rcPlay" aria-label="Play reel" hidden>${I.play}</button>
        <div class="rc-error" id="rcError" hidden>Preview unavailable. <a href="https://demo.foldergram.app/" target="_blank" rel="noopener">Open the live demo</a></div>
        <input class="rc-seek" id="rcSeek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek through reel">
      </div>
      <div class="rc-meta">
        <button class="rc-folder" data-act="goprofile" data-p="${p.id}" aria-label="Open ${esc(p.name)} folder">${ring(p.av,34)}<strong class="rc-fn">${esc(p.name)}</strong></button>
        <p class="rc-caption">${esc(it.cap)}</p>
        <p class="rc-fp" title="${esc(it.path)}">${esc(it.path.split('/').pop())}</p>
      </div>
      </div>
      <div class="rc-rail" aria-label="Reel actions">
        <button class="iconbtn ${liked.has(it.s)?'likeon':''}" data-act="like" data-s="${it.s}" data-w="600" data-h="1066" data-cap="${esc(it.cap)}" aria-label="Like reel" aria-pressed="${liked.has(it.s)}" title="Like">${liked.has(it.s)?I.heartf:I.heart}</button>
        <button class="iconbtn ${savedSet.has(it.s)?'saveon':''}" data-act="save" data-s="${it.s}" data-w="600" data-h="1066" data-cap="${esc(it.cap)}" aria-label="Save reel" aria-pressed="${savedSet.has(it.s)}" title="Save">${savedSet.has(it.s)?I.bmf:I.bm}</button>
        <button class="iconbtn" data-act="menu" aria-label="Reel information in full demo" title="Info">${I.info}</button>
        <button class="iconbtn" data-act="menu" aria-label="Download original in full demo" title="Download">${I.dl}</button>
        <button class="iconbtn" data-act="goprofile" data-p="${p.id}" aria-label="Open ${esc(p.name)} folder" title="Open folder">${I.folder}</button>
      </div>
    </div>
    <div class="rc-navlane" aria-label="Reel navigation">
      <button class="rc-nav" data-rc="up" aria-label="Previous reel" ${rlIdx===0?'disabled':''}>${I.up}</button>
      <button class="rc-nav" data-rc="down" aria-label="Next reel" ${rlIdx===REELS.length-1?'disabled':''}>${I.down}</button>
    </div>
  </div>`);
  const video=$('#rcVideo'),seek=$('#rcSeek'),playButton=$('#rcPlay'),muteButton=$('#rcMute');
  activeReelVideo=video;
  video.muted=reelMuted;
  const sync=()=>{
    if(!Number.isFinite(video.duration)||video.duration<=0)return;
    const progress=Math.round(video.currentTime/video.duration*1000);
    seek.value=String(progress);
    seek.style.setProperty('--reel-progress',(progress/10)+'%');
  };
  const toggle=()=>{
    if(video.paused){video.play().catch(()=>{playButton.hidden=false})}
    else video.pause();
  };
  video.addEventListener('timeupdate',sync);
  video.addEventListener('loadedmetadata',sync);
  video.addEventListener('play',()=>{playButton.hidden=true});
  video.addEventListener('pause',()=>{if(!video.ended)playButton.hidden=false});
  video.addEventListener('ended',()=>{
    if(rlIdx<REELS.length-1)rReels(rlIdx+1);
    else playButton.hidden=false;
  });
  video.addEventListener('error',()=>{$('#rcError').hidden=false;playButton.hidden=true});
  video.addEventListener('click',toggle);
  playButton.addEventListener('click',toggle);
  muteButton.addEventListener('click',()=>{
    reelMuted=!reelMuted;
    video.muted=reelMuted;
    muteButton.innerHTML=reelMuted?I.mut:I.snd;
    muteButton.setAttribute('aria-label',reelMuted?'Unmute reel':'Mute reel');
    muteButton.title=reelMuted?'Unmute':'Mute';
  });
  seek.addEventListener('input',()=>{
    if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=video.duration*Number(seek.value)/1000;
    sync();
  });
  video.play().catch(()=>{playButton.hidden=false});
}

/* ---------- search ---------- */
function rSearch(){
  const items=SEARCH.map(it=>`<div class="ap-mit" data-fb="${esc(it.label+' '+it.s)}">
    ${it.v?badge(it.v):''}<img src="${img(it.s,420,it.h)}" alt="${esc(it.label)}" loading="lazy"></div>`).join('');
  const folders=PROFILES.map(p=>`<button class="ap-explore-folder" data-act="goprofile" data-p="${p.id}" data-fb="${esc(p.name.toLowerCase()+' '+p.path.toLowerCase())}"><img src="${img(p.av)}" alt=""><span><b>${esc(p.name)}</b><small>${esc(p.path)} · ${p.posts} posts</small></span></button>`).join('');
  screen(`<div class="ap-scr">
    <header class="ap-explore-head">
      <button id="apQBack" class="ap-explore-back" aria-label="Back to Explore" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="m15 5-7 7 7 7"/></svg></button>
      <label class="ap-sinput"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="apQ" type="search" placeholder="Search" aria-label="Search photos, videos and folders" spellcheck="false"></label>
      <button id="apQClear" class="ap-explore-clear" aria-label="Clear search" hidden>×</button>
    </header>
    <div id="apQTabs" class="ap-explore-tabs" role="tablist" aria-label="Search result tabs" hidden>
      <button class="ap-explore-tab act" data-explore-tab="media" role="tab" aria-selected="true">Photos &amp; Videos</button>
      <button class="ap-explore-tab" data-explore-tab="folders" role="tab" aria-selected="false">App Folders</button>
    </div>
    <div class="ap-mason" id="apMason">${items}</div>
    <div class="ap-explore-folders" id="apQFolders" hidden>${folders}</div>
    <p class="ap-empty" id="apNoRes" hidden>No matching photos, videos or folders.</p>
  </div>`);
  let activeSearchTab='media';
  const applySearch=()=>{
    const q=$('#apQ').value.trim().toLowerCase(),searching=q.length>0;
    $('#apQBack').hidden=!searching;$('#apQClear').hidden=!searching;$('#apQTabs').hidden=!searching;
    $$('#apQTabs [data-explore-tab]').forEach(b=>{b.classList.toggle('act',b.dataset.exploreTab===activeSearchTab);b.setAttribute('aria-selected',String(b.dataset.exploreTab===activeSearchTab))});
    $('#apMason').hidden=searching&&activeSearchTab==='folders';
    $('#apQFolders').hidden=!searching||activeSearchTab!=='folders';
    let count=0;
    if(!$('#apMason').hidden){$$('#apMason .ap-mit').forEach(el=>{const hit=!searching||el.dataset.fb.includes(q);el.style.display=hit?'':'none';if(hit)count++})}
    else{$$('#apQFolders .ap-explore-folder').forEach(el=>{const hit=el.dataset.fb.includes(q);el.style.display=hit?'':'none';if(hit)count++})}
    $('#apNoRes').hidden=count>0;
  };
  $('#apQ').addEventListener('input',applySearch);
  $('#apQClear').addEventListener('click',()=>{$('#apQ').value='';activeSearchTab='media';applySearch();$('#apQ').focus()});
  $('#apQBack').addEventListener('click',()=>{$('#apQ').value='';activeSearchTab='media';applySearch();$('#apQ').blur()});
  $('#apQTabs').addEventListener('click',e=>{const b=e.target.closest('[data-explore-tab]');if(!b)return;activeSearchTab=b.dataset.exploreTab;applySearch()});
}

/* ---------- library ---------- */
function rLibrary(){
  const rows=LIBROWS.map(id=>{const p=byP(id);return `
    <div class="ap-lrow" data-name="${esc(p.name.toLowerCase())}" data-path="${esc(p.path.toLowerCase())}" data-posts="${p.posts}" data-fb="${esc((p.name+' '+p.path).toLowerCase())}">
      <button class="ap-lentry" data-act="goprofile" data-p="${p.id}" aria-label="Open ${esc(p.name)}">
        <img src="${img(p.av,92,92)}" alt="">
        <span class="ap-lin"><span class="ap-ln">${esc(p.name)}</span><span class="ap-ls">${esc(p.path)}</span><span class="ap-lp">Local gallery</span></span>
      </button>
      <span class="ap-lr"><span class="ap-lnum"><b>${p.posts} posts</b><span>${p.reels} reels</span></span><button class="ap-menu" data-act="menu" aria-label="More options for ${esc(p.name)}" title="Folder options in full demo">${I.kebab}</button></span>
    </div>`}).join('');
  screen(`<div class="ap-library">
    <div class="ap-pagehead">
      <div><span class="pill">Library</span><h2>All folders</h2><p class="psub">Browse and search every indexed app folder.</p></div>
      <div class="ap-bigstats"><div class="bs"><b>${PROFILES.length}</b><span>FOLDERS</span></div><div class="bs"><b>${PROFILES.reduce((n,p)=>n+p.posts,0)}</b><span>POSTS</span></div></div>
    </div>
    <div class="ap-searchrow">
      <label class="ap-sinput"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.8"/><path d="m16.3 16.3 4.2 4.2"/></svg><input id="libQ" type="search" placeholder="Search names or path segments..." aria-label="Search folders"></label>
      <label class="ap-sortbtn"><select id="libSort" aria-label="Sort folders"><option value="recent-desc">Recently updated</option><option value="images-desc">Most posts</option><option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="path-asc">Path A-Z</option></select>${I.chev}</label>
      <span class="ap-count">${LIBROWS.length} results</span>
    </div>
    <div class="ap-listcard" id="libList">${rows}</div>
  </div>`);
  const refresh=()=>{
    const q=$('#libQ').value.trim().toLowerCase(),sort=$('#libSort').value;
    const rows=$$('#libList .ap-lrow');
    rows.sort((a,b)=>{
      if(sort==='images-desc')return Number(b.dataset.posts)-Number(a.dataset.posts);
      if(sort==='name-asc')return a.dataset.name.localeCompare(b.dataset.name);
      if(sort==='name-desc')return b.dataset.name.localeCompare(a.dataset.name);
      if(sort==='path-asc')return a.dataset.path.localeCompare(b.dataset.path);
      return LIBROWS.indexOf(a.querySelector('[data-p]').dataset.p)-LIBROWS.indexOf(b.querySelector('[data-p]').dataset.p);
    });
    let n=0;
    for(const el of rows){$('#libList').appendChild(el);const hit=!q||el.dataset.fb.includes(q);el.style.display=hit?'':'none';if(hit)n++}
    $('.ap-library .ap-count').textContent=n+' result'+(n===1?'':'s');
  };
  $('#libQ').addEventListener('input',refresh);
  $('#libSort').addEventListener('change',refresh);
}

/* ---------- places ---------- */
function rPlaces(){
  const rows=PLACES.map(pl=>`
    <button class="ap-lrow" data-act="toast" data-msg="${esc(pl.n+': sample location; the real app groups GPS photos by nearby city after GeoNames setup')}" data-fb="${esc(pl.n+' '+pl.r+' '+pl.c)}">
      <span class="pin"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.5s-7.3-5.5-7.3-11.3a7.3 7.3 0 0 1 14.6 0C19.3 16 12 21.5 12 21.5Zm0-8.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z"/></svg></span>
      <span class="ap-lin"><span class="ap-ln">${esc(pl.n)}</span><span class="ap-ls">${esc(pl.r)}</span><span class="ap-coord">${esc(pl.c)}</span></span>
      <span class="ap-lr"><span class="ap-lnum"><b>1 post</b><span>Nearest city</span></span><span class="gdot"></span></span>
    </button>`).join('');
  screen(`<div>
    <div class="ap-pagehead">
      <div><span class="pill">Places</span><h2>All places</h2><p class="psub">Browse posts grouped from offline location data.</p></div>
      <div class="ap-bigstats"><div class="bs"><b>6</b><span>PLACES</span></div><div class="bs"><b>6</b><span>POSTS</span></div></div>
    </div>
    <div class="ap-searchrow">
      <label class="ap-sinput"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.8"/><path d="m16.3 16.3 4.2 4.2"/></svg><input id="plQ" type="search" placeholder="Search names, regions, or coordinates..." aria-label="Search places"></label>
      <button class="ap-sortbtn">Most posts ${I.chev}</button>
      <span class="ap-count">6 results</span>
    </div>
    <div class="ap-listcard" id="plList">${rows}</div>
  </div>`);
  $('#plQ').addEventListener('input',e=>{
    const q=e.target.value.trim().toLowerCase();let n=0;
    $$('#plList .ap-lrow').forEach(el=>{const hit=!q||el.dataset.fb.includes(q);el.style.display=hit?'':'none';if(hit)n++});
    $('.ap-count').textContent=n+' result'+(n===1?'':'s');
  });
}

/* ---------- likes / saved collections ---------- */
function rCollections(){
  const previews=SAVED.slice(0,4);
  const mosaic=Array.from({length:4},(_,i)=>previews.length?`<img src="${img(previews[i%previews.length].s)}" alt="" loading="lazy">`:'<span></span>').join('');
  screen(`<section class="ap-collections-overview"><h2>Collections</h2>
    <button class="ap-collection-tile" data-act="collection" aria-label="Open All Posts saved collection">
      <span class="ap-collection-mosaic">${mosaic}</span>
      <span class="ap-collection-label"><b>All Posts</b><small>${SAVED.length} saved ${SAVED.length===1?'post':'posts'}</small></span>
    </button>
    <p class="ap-gridsub" style="margin-top:18px;text-align:left">Saved posts in this interactive preview. Custom collections are available in the full demo.</p>
  </section>`);
}
function rGrid(title,sub,items,kind){
  const saved=kind==='saved';
  const body=items.length?`<div class="ap-grid3">${items.map(it=>`
    <div class="ap-gitem">
      ${it.vid?badge(it.vid):''}<img src="${img(it.s,480,480)}" alt="${esc(it.cap||'Post')}" loading="lazy"></div>`).join('')}</div>`
    :`<p class="ap-empty">${saved?'Nothing saved yet. Bookmark a post in the feed.':'Nothing liked yet. Heart a post in the Home feed.'}</p>`;
  screen(`<section class="ap-media-collection ${saved?'ap-media-collection--saved':''}">
    ${saved?'<button class="ap-collection-back" data-nav="saved">← Back to collections</button>':''}
    <div class="ap-grid-tab"><span>${title}</span></div>
    ${body}
    <p class="ap-gridsub" style="margin-top:16px">${sub}</p>
  </section>`);
}

/* ---------- profile ---------- */
function rProfile(id,tab){
  profId=id;profTab=tab||'grid';
  const p=byP(profId);
  const subs=storyForProfile(p.id).map(i=>{const st=STORIES[i];return `<button class="prof-sub" data-story="${i}" aria-label="Open ${esc(st.n)} story">${ring(st.s,74)}<span>${esc(st.n)}</span></button>`}).join('');
  const items=profTab==='grid'?galleryPhotos(p.id):galleryVideos(p.id);
  const grid=profTab==='grid'
    ?`<div class="ap-grid4">${items.map(it=>`<div class="ap-gitem"><img src="${img(it.s)}" alt="${esc(p.name)} gallery photo" loading="lazy"></div>`).join('')}</div>`
    :`<div class="ap-gridr">${items.map(it=>`<div class="ap-gitem">${badge('VIDEO')}<img src="${img(it.s)}" alt="${esc(p.name)} video preview" loading="lazy"></div>`).join('')}</div>`;
  screen(`<div class="ap-prof">
    <button class="ap-back" data-nav="home">← Back to feed</button>
    <div class="prof-head">
      ${ring(p.av,132)}
      <div class="prof-info">
        <div class="prof-titlerow"><h2>${esc(p.name)}</h2><button class="btn ghost mini" data-act="toast" data-msg="Editing is available in the full app. This preview is for browsing.">Edit App Folder</button></div>
        <div class="prof-stats"><span><b>${p.posts}</b> posts</span><span><b>${p.reels}</b> reels</span><span>Local gallery</span></div>
        <p class="prof-path">LIBRARY PATH</p>
        <p class="prof-pathv mono">${esc(p.path)}</p>
        <p class="prof-bio">${esc(p.bio)}</p>
      </div>
    </div>
    ${subs?`<div class="prof-subs">${subs}</div>`:''}
    <div class="ap-tabs" role="tablist" aria-label="Profile posts">
      <button class="apt ${profTab==='grid'?'act':''}" data-tab="grid" role="tab" aria-selected="${profTab==='grid'}" aria-label="Grid">${I.grid}</button>
      <button class="apt ${profTab==='reels'?'act':''}" data-tab="reels" role="tab" aria-selected="${profTab==='reels'}" aria-label="Reels">${I.playc}</button>
    </div>
    ${grid}
  </div>`);
}

/* ============================================================
   delegation
============================================================ */
// The sidebar is a sibling of apMain, so it needs its own navigation handler.
$('.ap-side').addEventListener('click',e=>{
  const button=e.target.closest('.ap-ib[data-nav]');
  if(button)navTo(button.dataset.nav);
});
apMain.addEventListener('click',e=>{
  const navBtn=e.target.closest('[data-nav]');
  if(navBtn){navTo(navBtn.dataset.nav);return}
  const rc=e.target.closest('[data-rc]');
  if(rc){rReels(rlIdx+(rc.dataset.rc==='down'?1:-1));return}
  const chip=e.target.closest('[data-mode]');
  if(chip){feedMode=chip.dataset.mode;rHome();return}
  const tab=e.target.closest('[data-tab]');
  if(tab){rProfile(profId,tab.dataset.tab);return}
  const story=e.target.closest('[data-story]');
  if(story){openStory(+story.dataset.story);return}
  const t=e.target.closest('[data-act]');
  if(!t)return;
  const a=t.dataset.act;
  if(a==='goprofile'){navTo('profile',{id:t.dataset.p});return}
  if(a==='collection'){rGrid('All Posts','Saved posts in this interactive preview.',SAVED,'saved');return}
  if(a==='menu'){showDemoNotice();return}
  if(a==='sub'){showToast('Folder highlights come from child folders in AppFolder/stories/');return}
  if(a==='toast'){showToast(t.dataset.msg);return}
  if(a==='like'){
    const s=t.dataset.s;
    if(liked.has(s)){liked.delete(s);const ix=LIKES.findIndex(x=>x.s===s);if(ix>-1)LIKES.splice(ix,1);
      t.classList.remove('likeon');t.innerHTML=I.heart;t.setAttribute('aria-pressed','false')}
    else{liked.add(s);LIKES.unshift({s,cap:t.dataset.cap,w:t.dataset.w,h:t.dataset.h});
      t.classList.add('likeon');t.innerHTML=I.heartf;t.setAttribute('aria-pressed','true');pop(t)}
    return;
  }
  if(a==='save'){
    const s=t.dataset.s;
    if(savedSet.has(s)){savedSet.delete(s);const ix=SAVED.findIndex(x=>x.s===s);if(ix>-1)SAVED.splice(ix,1);
      t.classList.remove('saveon');t.innerHTML=I.bm;t.setAttribute('aria-pressed','false')}
    else{savedSet.add(s);SAVED.unshift({s,cap:t.dataset.cap,w:t.dataset.w,h:t.dataset.h});
      t.classList.add('saveon');t.innerHTML=I.bmf;t.setAttribute('aria-pressed','true');pop(t)}
    return;
  }
});
function pop(el){el.style.transform='scale(1.35)';setTimeout(()=>el.style.transform='',180)}

/* burger */
 $('#apBurger').addEventListener('click',showDemoNotice);

/* ============================================================
   story viewer
============================================================ */
const sv=$('#sv'),svBars=$('#svBars'),svImg=$('#svImg'),svAv=$('#svAv'),svName=$('#svName'),
      svMeta=$('#svMeta'),svCount=$('#svCount'),svCap=$('#svCap'),svDate=$('#svDate'),svSide=$('#svSide'),
      svPauseBtn=$('#svPause'),svPauseIc=$('#svPauseIc');
const DUR=4200;
let stIdx=0,seg=0,svOpen=false,playing=true,svT=null,svElapsed=0,svStarted=0,svOpener=null;
const svVideo=$('#svVideo');
const storyVideo=key=>key.startsWith('st-mix-');
function svSetBars(){
  svBars.innerHTML=Array.from({length:STORIES[stIdx].items.length},(_,i)=>`<span class="sbar ${i<seg?'done':i===seg?'cur':''}"><i class="f"></i></span>`).join('');
  const cur=$('.sbar.cur .f',svBars);
  if(cur&&playing&&!storyVideo(STORIES[stIdx].items[seg])){
    const remaining=Math.max(0,DUR-svElapsed);
    svStarted=performance.now();
    cur.style.transition='none';cur.style.width=(svElapsed/DUR*100)+'%';void cur.offsetWidth;
    cur.style.transition='width '+remaining+'ms linear';cur.style.width='100%';
    clearTimeout(svT);svT=setTimeout(svNextSeg,remaining);
  }
}
function svLoad(){
  clearTimeout(svT);svElapsed=0;svVideo.pause();svVideo.removeAttribute('src');
  const st=STORIES[stIdx],item=st.items[seg],video=storyVideo(item);
  svImg.style.display=video?'none':'block';svVideo.style.display=video?'block':'none';
  if(video){svVideo.src='demo-media/'+item+'.mp4';svVideo.currentTime=0;}
  else{svImg.src=img(item);svImg.alt=st.n+' gallery photo';}
  svAv.src=img(st.s);svName.textContent=st.n;svMeta.textContent=st.m;
  svCount.textContent=(seg+1)+'/'+st.items.length;
  svCap.textContent=st.n;svDate.textContent='From the gallery';
  svSide.innerHTML=STORIES.slice(stIdx+1,stIdx+3).map((s,i)=>`<button class="sv-next" data-svjump="${stIdx+i+1}"><img src="${img(s.s)}" alt=""><span class="nlab"><b>${esc(s.n)}</b><span>${s.items.length} items</span></span></button>`).join('');
  $('#svPrev').disabled=stIdx===0&&seg===0;$('#svNext').disabled=stIdx===STORIES.length-1&&seg===st.items.length-1;
  $('#svTapPrev').disabled=$('#svPrev').disabled;$('#svTapNext').disabled=$('#svNext').disabled;
  svSetBars();
  if(video&&playing)svVideo.play().catch(()=>{playing=false;svPauseIc.innerHTML='<path d="M8.5 5.5v13l10-6.5Z"/>';});
}
function openStory(i){
  if(i<0||i>=STORIES.length)return;
  svOpener=document.activeElement;stIdx=i;seg=0;svOpen=true;playing=true;
  svPauseIc.innerHTML='<rect x="7" y="5" width="3.4" height="14" rx="1"/><rect x="13.6" y="5" width="3.4" height="14" rx="1"/>';
  sv.classList.add('show');document.body.style.overflow='hidden';svLoad();$('#svClose').focus();
}
function closeStory(){
  svOpen=false;clearTimeout(svT);svVideo.pause();sv.classList.remove('show');document.body.style.overflow='';
  if(svOpener?.isConnected)svOpener.focus();
}
function svNextSeg(){
  if(!svOpen)return;
  if(seg<STORIES[stIdx].items.length-1){seg++;svLoad()}
  else if(stIdx<STORIES.length-1){stIdx++;seg=0;svLoad()}
  else closeStory();
}
function svPrevSeg(){
  if(!svOpen)return;
  if(seg>0){seg--;svLoad()}
  else if(stIdx>0){stIdx--;seg=STORIES[stIdx].items.length-1;svLoad()}
}
function svPauseToggle(){
  const cur=$('.sbar.cur .f',svBars),video=storyVideo(STORIES[stIdx].items[seg]);
  if(playing){
    playing=false;clearTimeout(svT);
    if(video)svVideo.pause();
    else if(cur){svElapsed=Math.min(DUR,svElapsed+performance.now()-svStarted);
      cur.style.transition='none';cur.style.width=(svElapsed/DUR*100)+'%'}
    svPauseIc.innerHTML='<path d="M8.5 5.5v13l10-6.5Z"/>';svPauseBtn.setAttribute('aria-label','Resume story');
  }else{
    playing=true;
    if(video)svVideo.play().catch(()=>{playing=false;svPauseBtn.setAttribute('aria-label','Resume story')});
    else svSetBars();
    svPauseIc.innerHTML='<rect x="7" y="5" width="3.4" height="14" rx="1"/><rect x="13.6" y="5" width="3.4" height="14" rx="1"/>';
    svPauseBtn.setAttribute('aria-label','Pause story');
  }
}
$('#svClose').addEventListener('click',closeStory);
$('#svNext').addEventListener('click',svNextSeg);
$('#svPrev').addEventListener('click',svPrevSeg);
$('#svTapNext').addEventListener('click',svNextSeg);
$('#svTapPrev').addEventListener('click',svPrevSeg);
svPauseBtn.addEventListener('click',svPauseToggle);
$('#svDl').addEventListener('click',showDemoNotice);
svVideo.addEventListener('ended',()=>{if(svOpen&&playing)svNextSeg()});
svVideo.addEventListener('timeupdate',()=>{
  if(!svOpen||!storyVideo(STORIES[stIdx].items[seg]))return;
  const bar=$('.sbar.cur .f',svBars);
  if(bar&&Number.isFinite(svVideo.duration)&&svVideo.duration>0){bar.style.transition='none';bar.style.width=(svVideo.currentTime/svVideo.duration*100)+'%'}
});
svSide.addEventListener('click',e=>{const b=e.target.closest('[data-svjump]');if(b){stIdx=+b.dataset.svjump;seg=0;playing=true;svLoad()}});

/* ============================================================
   lightbox
============================================================ */
const lb=$('#lb'),lbImg=$('#lbImg'),lbPath=$('#lbPath'),lbCount=$('#lbCount'),lbCap=$('#lbCap'),lbEx=$('#lbEx');
let lbList=[],lbIdx=0,lbOpen=false,lbOpener=null;
function lbShow(i){
  lbIdx=(i+lbList.length)%lbList.length;
  const it=lbList[lbIdx];
  lbImg.style.opacity=0;
  lbImg.onload=()=>lbImg.style.opacity=1;
  lbImg.src=img(it.s,1100,Math.round(it.h*(1100/it.w)));
  lbImg.alt=it.cap||'Photo';
  lbPath.textContent=it.path||'/library/'+it.s+'.jpg';
  lbCount.textContent=(lbIdx+1)+' / '+lbList.length;
  lbCap.textContent=it.cap||'';
  lbEx.textContent=exif(it.s);
  [lbIdx-1,lbIdx+1].forEach(k=>{const n=lbList[(k+lbList.length)%lbList.length];if(n)new Image().src=img(n.s,1100,Math.round(n.h*(1100/n.w)))});
}
function openLB(list,i,opener){
  lbList=list;lbIdx=i;lbOpen=true;lbOpener=opener||document.activeElement;
  lb.classList.add('show');document.body.style.overflow='hidden';lbShow();$('#lbClose').focus();
}
function closeLB(){
  lbOpen=false;lb.classList.remove('show');document.body.style.overflow='';
  if(lbOpener&&lbOpener.focus)lbOpener.focus();
}
 $('#lbClose').addEventListener('click',closeLB);
 $('#lbPrev').addEventListener('click',()=>lbShow(lbIdx-1));
 $('#lbNext').addEventListener('click',()=>lbShow(lbIdx+1));
 $('#lbStage').addEventListener('click',e=>{if(e.target===$('#lbStage'))closeLB()});

/* ============================================================
   keyboard
============================================================ */
document.addEventListener('keydown',e=>{
  if(lbOpen){
    if(e.key==='Escape')closeLB();
    else if(e.key==='ArrowLeft')lbShow(lbIdx-1);
    else if(e.key==='ArrowRight')lbShow(lbIdx+1);
    return;
  }
  if(svOpen){
    if(e.key==='Escape')closeStory();
    else if(e.key==='ArrowLeft')svPrevSeg();
    else if(e.key==='ArrowRight'){clearTimeout(svT);svNextSeg()}
    else if(e.key===' '){e.preventDefault();svPauseToggle()}
    return;
  }
  if(nav==='reels'&&!e.target.closest('input,textarea')){
    if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();if(rlIdx>0)rReels(rlIdx-1)}
    else if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();if(rlIdx<REELS.length-1)rReels(rlIdx+1)}
    else if(e.key===' '){e.preventDefault();const video=activeReelVideo;if(video){if(video.paused)video.play().catch(()=>{});else video.pause()}}
    return;
  }
  if(e.key==='Escape'){$('#mnav').classList.remove('open');$('#mbtn').setAttribute('aria-expanded','false')}
});

/* ============================================================
   site-wide: reveals, terminals, install typing, copy, stars, menu
============================================================ */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('on');io.unobserve(en.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
$$('.rv').forEach(el=>io.observe(el));
const tio=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('ok');tio.unobserve(en.target)}}),{threshold:.3});
$$('.term').forEach(el=>tio.observe(el));
$$('.feat-head').forEach(btn=>btn.addEventListener('click',()=>{
  const item=btn.closest('.feat'),wasOpen=item.classList.contains('open');
  $$('.feat.open').forEach(f=>{f.classList.remove('open');$('.feat-head',f).setAttribute('aria-expanded','false')});
  if(!wasOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
}));
(function(){
  const el=$('#instCmd');
  const CMD=el.dataset.command||'';
  const code=el.closest('code');
  if(reduceMotion){el.textContent=CMD;return}
  let i=0;
  setTimeout(function tick(){
    el.textContent=CMD.slice(0,++i);
    code.scrollLeft=code.scrollWidth;
    if(i<CMD.length)setTimeout(tick,20+Math.random()*24);
  },600);
})();
const toastEl=$('#toast');let toastT=null;
function showDemoNotice(){
  toastEl.innerHTML='<span>This is a limited interactive preview. <a href="https://demo.foldergram.app/" target="_blank" rel="noopener" style="color:var(--acc);text-decoration:underline">Open the full demo</a> to try menus and more features.</span>';
  toastEl.classList.add('show');clearTimeout(toastT);
  toastT=setTimeout(()=>toastEl.classList.remove('show'),5200);
}
function showToast(msg){
  toastEl.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg>${esc(msg)}`;
  toastEl.classList.add('show');clearTimeout(toastT);
  toastT=setTimeout(()=>toastEl.classList.remove('show'),2600);
}
$$('.copy').forEach(b=>b.addEventListener('click',()=>{
  const txt=b.dataset.copy||'';
  const done=()=>showToast('Copied to clipboard');
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done).catch(()=>fb(txt,done));
  else fb(txt,done);
  function fb(t,cb){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');cb()}catch(e){}ta.remove()}
}));
(async()=>{
  const key='foldergram-github-stars',ttl=60*60*1000;
  const show=n=>{
    if(typeof n!=='number'||!Number.isFinite(n))return;
    const s=n>=1000?(n/1000).toFixed(1).replace(/\.0$/,'')+'k':String(n);
    $$('.js-stars').forEach(el=>el.textContent=s);
    const stat=$('.gh-stars');
    if(stat)stat.hidden=false;
    const headerLink=$('.gh-btn');
    if(headerLink)headerLink.setAttribute('aria-label',`View Foldergram on GitHub, ${n.toLocaleString('en-US')} stars`);
  };
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
  if(cached&&typeof cached.count==='number'){
    show(cached.count);
    if(typeof cached.at==='number'&&Date.now()-cached.at<ttl)return;
  }
  try{
    const r=await fetch('https://api.github.com/repos/foldergram/foldergram',{headers:{Accept:'application/vnd.github+json'}});
    if(!r.ok)return;
    const data=await r.json(),count=data.stargazers_count;
    if(typeof count!=='number')return;
    show(count);
    try{localStorage.setItem(key,JSON.stringify({count,at:Date.now()}))}catch(e){}
  }catch(e){}
})();
const mbtn=$('#mbtn'),mnav=$('#mnav');
mbtn.addEventListener('click',()=>{const o=mnav.classList.toggle('open');mbtn.setAttribute('aria-expanded',o)});
mnav.addEventListener('click',e=>{if(e.target.closest('a')){mnav.classList.remove('open');mbtn.setAttribute('aria-expanded','false')}});
$$('.js-demo').forEach(a=>a.addEventListener('click',()=>{setTimeout(()=>{app.classList.remove('flash');void app.offsetWidth;app.classList.add('flash')},550)}));

/* Match Foldergram's SidebarNav icons: same regular/filled variants and active semantics. */
const previewNavIcons={"home":["<path d=\"M2 11.2a2.5 2.5 0 0 1 .8-1.83l7.5-6.97a2.5 2.5 0 0 1 3.4 0l7.5 6.97a2.5 2.5 0 0 1 .8 1.83V19a3 3 0 0 1-3 3h-4v-5a3 3 0 0 0-6 0v5H5a3 3 0 0 1-3-3z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/>","<path d=\"M2 11.2a2.5 2.5 0 0 1 .8-1.83l7.5-6.97a2.5 2.5 0 0 1 3.4 0l7.5 6.97a2.5 2.5 0 0 1 .8 1.83V19a3 3 0 0 1-3 3h-4v-5a3 3 0 0 0-6 0v5H5a3 3 0 0 1-3-3z\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/>"],"reels":["<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\"/><path d=\"M9.5 8.25 16.5 12l-7 3.75z\" stroke-linejoin=\"round\"/></g>","<path d=\"M7 1h10a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H7a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6ZM10 7.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1.5.87l6-3.5a1 1 0 0 0 0-1.74l-6-3.5A1 1 0 0 0 10 7.5Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/>"],"search":["<path fill=\"currentColor\" d=\"M16.102 17.162a8 8 0 1 1 1.06-1.06l4.618 4.618a.75.75 0 1 1-1.06 1.06zM17.5 11a6.5 6.5 0 1 0-13 0a6.5 6.5 0 0 0 13 0\"/>","<path fill=\"currentColor\" d=\"M15.843 17.368a8 8 0 1 1 1.428-1.4l4.427 4.316a1 1 0 1 1-1.396 1.432zM17 11a6 6 0 1 0-12 0a6 6 0 0 0 12 0\"/>"],"library":["<path fill=\"currentColor\" d=\"M3.5 6.25V8h4.629a.75.75 0 0 0 .53-.22l1.53-1.53l-1.53-1.53a.75.75 0 0 0-.53-.22H5.25A1.75 1.75 0 0 0 3.5 6.25m-1.5 0A3.25 3.25 0 0 1 5.25 3h2.879a2.25 2.25 0 0 1 1.59.659L11.562 5.5h7.189A3.25 3.25 0 0 1 22 8.75v9A3.25 3.25 0 0 1 18.75 21H5.25A3.25 3.25 0 0 1 2 17.75zM3.5 9.5v8.25c0 .966.784 1.75 1.75 1.75h13.5a1.75 1.75 0 0 0 1.75-1.75v-9A1.75 1.75 0 0 0 18.75 7h-7.19L9.72 8.841a2.25 2.25 0 0 1-1.591.659z\"/>","<path fill=\"currentColor\" d=\"M2 8V6.25A3.25 3.25 0 0 1 5.25 3h2.879a2.25 2.25 0 0 1 1.59.659l1.531 1.53L8.659 7.78a.75.75 0 0 1-.53.22zm0 1.5v8.25A3.25 3.25 0 0 0 5.25 21h13.5A3.25 3.25 0 0 0 22 17.75v-9a3.25 3.25 0 0 0-3.25-3.25h-5.69L9.72 8.841a2.25 2.25 0 0 1-1.591.659z\"/>"],"places":["<path fill=\"currentColor\" d=\"M5.843 4.568a8.708 8.708 0 0 1 12.315 12.314l-1.188 1.174q-1.312 1.288-3.406 3.313a2.25 2.25 0 0 1-3.128-.001l-3.491-3.396q-.658-.646-1.102-1.09a8.71 8.71 0 0 1 0-12.314M17.096 5.63A7.207 7.207 0 1 0 6.904 15.822l1.487 1.467a748 748 0 0 0 3.088 3a.75.75 0 0 0 1.043 0l3.394-3.3q.705-.69 1.18-1.167a7.207 7.207 0 0 0 0-10.192M12.001 7.5a3.5 3.5 0 1 1-.002 7.001a3.5 3.5 0 0 1 .002-7.001M12 9a2 2 0 1 0 0 4a2 2 0 0 0 0-4\"/>","<path fill=\"currentColor\" d=\"M5.843 4.57c3.4-3.401 8.913-3.401 12.314 0s3.4 8.912 0 12.313l-1.187 1.173a657 657 0 0 1-3.406 3.313a2.25 2.25 0 0 1-3.128 0l-3.491-3.397q-.658-.646-1.102-1.09a8.707 8.707 0 0 1 0-12.313M12 8a3 3 0 1 0 0 6a3 3 0 0 0 0-6\"/>"],"likes":["<path fill=\"currentColor\" d=\"m12.82 5.58l-.82.822l-.824-.824a5.375 5.375 0 1 0-7.601 7.602l7.895 7.895a.75.75 0 0 0 1.06 0l7.902-7.897a5.376 5.376 0 0 0-.001-7.599a5.38 5.38 0 0 0-7.611 0m6.548 6.54L12 19.485L4.635 12.12a3.875 3.875 0 1 1 5.48-5.48l1.358 1.357a.75.75 0 0 0 1.073-.012L13.88 6.64a3.88 3.88 0 0 1 5.487 5.48\"/>","<path fill=\"currentColor\" d=\"m12.82 5.58l-.82.822l-.824-.824a5.375 5.375 0 1 0-7.601 7.602l7.895 7.895a.75.75 0 0 0 1.06 0l7.902-7.897a5.376 5.376 0 0 0-.001-7.599a5.38 5.38 0 0 0-7.611 0\"/>"],"saved":["<path fill=\"currentColor\" d=\"M6.19 21.855a.75.75 0 0 1-1.187-.61V6.25A3.25 3.25 0 0 1 8.253 3h7.498a3.25 3.25 0 0 1 3.25 3.25v14.996a.75.75 0 0 1-1.188.609l-5.81-4.181zM17.502 6.25a1.75 1.75 0 0 0-1.75-1.75H8.253a1.75 1.75 0 0 0-1.75 1.75v13.532l5.061-3.641a.75.75 0 0 1 .876 0l5.061 3.641z\"/>","<path fill=\"currentColor\" d=\"M6.19 21.855a.75.75 0 0 1-1.187-.61V6.25A3.25 3.25 0 0 1 8.253 3h7.498a3.25 3.25 0 0 1 3.25 3.25v14.996a.75.75 0 0 1-1.188.609l-5.81-4.181z\"/>"]};
$$('.ap-ib[data-nav]').forEach(button=>{
  const variants=previewNavIcons[button.dataset.nav];
  if(!variants)return;
  button.innerHTML=variants.map((body,index)=>`<svg class="${index?'active-icon':'regular-icon'}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`).join('');
});

/* init */
navTo('home');
