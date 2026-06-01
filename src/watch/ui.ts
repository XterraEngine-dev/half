export function buildUI(projectName: string): string {
  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${projectName} · half</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:     #120f0d;
  --bg-1:   #181410;
  --bg-2:   #1d1814;
  --bg-3:   #231d18;
  --line:   rgba(233,227,216,.09);
  --line-2: rgba(233,227,216,.16);
  --bone:   #e9e3d8;
  --bone-2: #bdb6a8;
  --muted:  #7c7367;
  --faint:  #4f483f;
  --terra:  #d97455;
  --terra-2:#a8553d;
  --green:  #74b089;
  --red:    #c4604d;
  --serif:  'IBM Plex Serif', Georgia, serif;
  --mono:   'IBM Plex Mono', ui-monospace, monospace;
  --radius: 3px;
}

html,body{
  height:100%; background:var(--bg); color:var(--bone);
  font-family:var(--mono); font-size:12px; line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
body{ display:grid; grid-template-rows:52px 1fr; height:100vh; overflow:hidden; }

/* ── split-h logomark ── */
.hsplit{
  position:relative; display:inline-block; line-height:.78;
  font-family:var(--serif); font-weight:600;
  --seam:.022em; --stroke:.05em;
  color:transparent; letter-spacing:0;
}
.hsplit > span{ position:absolute; inset:0; display:block; line-height:.78; }
.hsplit .base{ position:relative; visibility:hidden; }
.hsplit .h-left{
  color:var(--bone);
  clip-path:inset(-2% calc(50% + var(--seam)) -2% -2%);
}
.hsplit .h-right{
  color:transparent;
  -webkit-text-stroke:var(--stroke) var(--bone);
  clip-path:inset(-2% -2% -2% calc(50% + var(--seam)));
}
.hsplit .h-fill{
  color:var(--terra);
  clip-path:inset(-2% 50% -2% calc(50% + var(--seam)));
  animation:hfill 4.4s cubic-bezier(.6,0,.2,1) infinite;
}
@keyframes hfill{
  0%,10%  {clip-path:inset(-2% 50% -2% calc(50% + var(--seam)))}
  42%,74% {clip-path:inset(-2% -2% -2% calc(50% + var(--seam)))}
  100%    {clip-path:inset(-2% 50% -2% calc(50% + var(--seam)))}
}
@media(prefers-reduced-motion:reduce){
  .hsplit .h-fill{animation:none;clip-path:inset(-2% 50% -2% calc(50% + var(--seam)))}
}

/* ── TOP BAR ── */
.topbar{
  display:flex; align-items:center; gap:14px; padding:0 20px;
  background:rgba(18,15,13,.9); border-bottom:1px solid var(--line);
  backdrop-filter:blur(8px); flex-shrink:0;
}
.logo-mark{ font-size:28px; }
.logo-word{
  font-family:var(--serif); font-weight:600; font-size:16px;
  letter-spacing:-.01em; color:var(--bone);
}
.logo-sep{ width:1px; height:18px; background:var(--line-2); }
.proj-chip{
  font-size:11px; letter-spacing:.04em; color:var(--muted);
}
.topbar-right{ display:flex; align-items:center; gap:8px; margin-left:auto; }

.stat-pill{
  display:flex; align-items:center; gap:5px;
  font-size:11px; color:var(--muted);
  padding:4px 9px; border:1px solid var(--line); border-radius:var(--radius);
  letter-spacing:.03em;
}
.stat-pill b{ font-weight:500; }
.stat-pill.active b{ color:var(--terra); }
.stat-pill.done   b{ color:var(--green); }

.live-badge{
  display:flex; align-items:center; gap:6px;
  font-size:11px; color:var(--muted); letter-spacing:.06em;
  padding:4px 10px; border:1px solid var(--line); border-radius:var(--radius);
}
.live-dot{ width:5px; height:5px; border-radius:50%; background:var(--faint); flex-shrink:0; }
.live-dot.on{
  background:var(--green);
  animation:blink 2.4s ease-in-out infinite;
}
.live-dot.err{ background:var(--red); animation:none; }
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}

/* ── MAIN ── */
main{ display:grid; grid-template-columns:1fr 290px; overflow:hidden; }

/* ── LEFT: kanban + file bar ── */
.left{ display:grid; grid-template-rows:1fr 168px; overflow:hidden; border-right:1px solid var(--line); }

/* ── KANBAN ── */
.kanban{ display:grid; grid-template-columns:repeat(4,1fr); overflow:hidden; border-bottom:1px solid var(--line); }

.col{ display:flex; flex-direction:column; border-right:1px solid var(--line); overflow:hidden; }
.col:last-child{ border-right:none; }

.col-head{
  padding:10px 13px 9px; border-bottom:1px solid var(--line);
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  background:var(--bg-1);
}
.col-label{
  display:flex; align-items:center; gap:6px;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted);
}
.col-pip{ width:5px; height:5px; border-radius:50%; flex-shrink:0; }
.col-count{
  font-size:10px; color:var(--faint); letter-spacing:.06em;
  border:1px solid var(--line); border-radius:var(--radius); padding:1px 6px;
}

.col-body{
  flex:1; overflow-y:auto; padding:8px;
  display:flex; flex-direction:column; gap:5px; background:var(--bg);
  scrollbar-width:thin; scrollbar-color:var(--line) transparent;
}
.col-body::-webkit-scrollbar{ width:2px; }
.col-body::-webkit-scrollbar-thumb{ background:var(--faint); }

/* ── CARD ── */
.card{
  background:var(--bg-1); border:1px solid var(--line);
  border-radius:var(--radius); padding:9px 11px; cursor:default;
  transition:border-color .12s;
}
.card:hover{ border-color:var(--line-2); }
.card.is-active{
  border-color:rgba(217,116,85,.3);
  background:rgba(217,116,85,.05);
}

.card-title{
  font-size:12px; font-family:var(--serif); font-weight:500;
  color:var(--bone); line-height:1.4; margin-bottom:7px;
  display:flex; align-items:flex-start; gap:5px;
}
.thinking{ display:inline-flex; gap:2px; align-items:center; flex-shrink:0; margin-top:3px; }
.thinking i{
  display:block; width:3px; height:3px; border-radius:50%;
  background:var(--terra); animation:think 1.2s ease-in-out infinite; font-style:normal;
}
.thinking i:nth-child(2){animation-delay:.15s}
.thinking i:nth-child(3){animation-delay:.3s}
@keyframes think{0%,80%,100%{opacity:.2}40%{opacity:1}}

.card-meta{ display:flex; flex-wrap:wrap; gap:4px; align-items:center; }
.chip{
  font-size:10px; padding:1px 5px; border-radius:2px;
  border:1px solid var(--line); color:var(--muted);
  background:var(--bg-2); letter-spacing:.02em;
}
.chip.hi  { color:var(--red);   border-color:rgba(196,96,77,.25);  background:rgba(196,96,77,.06);  }
.chip.med { color:var(--terra); border-color:rgba(217,116,85,.25); background:rgba(217,116,85,.06); }
.chip-who { color:var(--terra); border-color:rgba(217,116,85,.25); background:transparent; }
.col-empty{ font-size:10px; color:var(--faint); text-align:center; padding:18px 8px; letter-spacing:.04em; }

/* progress bar */
.prog-wrap{ margin-top:8px; display:flex; align-items:center; gap:6px; }
.prog-track{ flex:1; height:2px; background:var(--bg-3); border-radius:1px; overflow:hidden; }
.prog-fill{ height:100%; background:var(--terra); border-radius:1px; transition:width .4s ease; }
.prog-fill.done{ background:var(--green); }
.prog-lbl{ font-size:9px; color:var(--faint); min-width:24px; text-align:right; letter-spacing:.04em; }

/* ── FILE ACTIVITY ── */
.file-bar{ display:flex; flex-direction:column; overflow:hidden; background:var(--bg); }
.file-bar-head{
  padding:7px 13px; border-bottom:1px solid var(--line);
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  background:var(--bg-1);
}
.section-lbl{
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted);
  display:flex; align-items:center; gap:6px;
}
.writing-dot{ width:5px; height:5px; border-radius:50%; background:var(--terra); opacity:0; transition:opacity .3s; }
.writing-dot.on{ opacity:1; animation:blink 1s ease-in-out infinite; }

.file-list{
  flex:1; overflow-x:auto; overflow-y:hidden;
  display:flex; align-items:center; gap:5px; padding:0 12px;
  scrollbar-width:thin; scrollbar-color:var(--faint) transparent;
}
.file-list::-webkit-scrollbar{ height:2px; }
.file-list::-webkit-scrollbar-thumb{ background:var(--faint); }

.file-chip{
  display:flex; align-items:center; gap:4px;
  padding:3px 7px; border-radius:2px;
  background:var(--bg-2); border:1px solid var(--line);
  white-space:nowrap; flex-shrink:0; font-size:10px;
  animation:chipin .2s ease;
}
@keyframes chipin{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
.file-chip.fresh{ border-color:rgba(217,116,85,.35); }
.file-name{ color:var(--bone-2); letter-spacing:.02em; }
.file-ext { color:var(--faint); }
.file-empty{ font-size:10px; color:var(--faint); white-space:nowrap; letter-spacing:.04em; }

/* ── EVENT FEED ── */
.feed{ display:flex; flex-direction:column; overflow:hidden; background:var(--bg); }
.feed-head{
  padding:10px 14px 9px; border-bottom:1px solid var(--line); flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between;
  background:var(--bg-1);
}
.feed-count{ font-size:10px; color:var(--faint); letter-spacing:.04em; }

.feed-body{ flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:var(--faint) transparent; }
.feed-body::-webkit-scrollbar{ width:2px; }
.feed-body::-webkit-scrollbar-thumb{ background:var(--faint); }

.ev{
  display:grid; grid-template-columns:12px 1fr auto;
  gap:0 8px; align-items:baseline;
  padding:6px 14px;
  border-bottom:1px solid var(--line);
  border-left:2px solid transparent;
  transition:background .1s;
}
.ev:last-child{ border-bottom:none; }
.ev:hover{ background:var(--bg-1); }

.ev[data-t="task.added"]    { border-left-color:var(--bone-2); }
.ev[data-t="task.picked"]   { border-left-color:var(--terra); }
.ev[data-t="task.done"]     { border-left-color:var(--green); }
.ev[data-t="task.blocked"]  { border-left-color:var(--red); }
.ev[data-t="task.progress"] { border-left-color:var(--terra); }
.ev[data-t="task.assigned"] { border-left-color:var(--muted); }
.ev[data-t="agent.start"]   { border-left-color:var(--bone-2); }
.ev[data-t="agent.log"]     { border-left-color:var(--line-2); }
.ev[data-t="file.changed"]  { border-left-color:var(--faint); }

.ev-icon{ font-size:10px; text-align:center; }
.ev[data-t="task.added"]    .ev-icon{ color:var(--bone-2); }
.ev[data-t="task.picked"]   .ev-icon{ color:var(--terra); }
.ev[data-t="task.done"]     .ev-icon{ color:var(--green); }
.ev[data-t="task.blocked"]  .ev-icon{ color:var(--red); }
.ev[data-t="task.progress"] .ev-icon{ color:var(--terra); }
.ev[data-t="agent.start"]   .ev-icon{ color:var(--bone-2); }
.ev[data-t="agent.log"]     .ev-icon{ color:var(--faint); }
.ev[data-t="file.changed"]  .ev-icon{ color:var(--faint); }

.ev-body{ min-width:0; }
.ev-type{
  font-size:9px; letter-spacing:.08em; text-transform:uppercase;
  margin-bottom:1px; font-weight:500;
}
.ev[data-t="task.added"]    .ev-type{ color:var(--bone-2); }
.ev[data-t="task.picked"]   .ev-type{ color:var(--terra); }
.ev[data-t="task.done"]     .ev-type{ color:var(--green); }
.ev[data-t="task.blocked"]  .ev-type{ color:var(--red); }
.ev[data-t="task.progress"] .ev-type{ color:var(--terra); }
.ev[data-t="agent.start"]   .ev-type{ color:var(--bone-2); }
.ev[data-t="agent.log"]     .ev-type{ color:var(--muted); }
.ev[data-t="file.changed"]  .ev-type{ color:var(--faint); }

.ev-desc{
  font-size:11px; font-family:var(--serif); color:var(--bone-2);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.ev-time{ font-size:9px; color:var(--faint); white-space:nowrap; align-self:start; padding-top:1px; letter-spacing:.04em; }

.feed-empty{ font-size:11px; color:var(--faint); text-align:center; padding:28px 14px; letter-spacing:.04em; }
.ev-flash{ animation:evflash .45s ease; }
@keyframes evflash{ from{background:rgba(217,116,85,.1)} to{background:transparent} }
</style>
</head>
<body>

<header class="topbar">
  <div class="hsplit logo-mark" aria-label="half">
    <span class="base">h</span>
    <span class="h-left">h</span>
    <span class="h-right">h</span>
    <span class="h-fill">h</span>
  </div>
  <span class="logo-word">half</span>
  <div class="logo-sep"></div>
  <span class="proj-chip">${projectName}</span>

  <div class="topbar-right">
    <div class="stat-pill active"><b id="s-a">–</b> active</div>
    <div class="stat-pill done">  <b id="s-d">–</b> done</div>
    <div class="stat-pill">       <b id="s-t">–</b> total</div>
    <div class="live-badge">
      <div class="live-dot" id="ldot"></div>
      <span id="ltxt">connecting</span>
    </div>
  </div>
</header>

<main>
  <div class="left">
    <div class="kanban">
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--terra)"></div>Pending</div>
          <span class="col-count" id="c-p">0</span>
        </div>
        <div class="col-body" id="b-p"></div>
      </div>
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--terra);animation:blink 1s ease-in-out infinite"></div>In Progress</div>
          <span class="col-count" id="c-a">0</span>
        </div>
        <div class="col-body" id="b-a"></div>
      </div>
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--green)"></div>Done</div>
          <span class="col-count" id="c-d">0</span>
        </div>
        <div class="col-body" id="b-d"></div>
      </div>
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--red)"></div>Blocked</div>
          <span class="col-count" id="c-b">0</span>
        </div>
        <div class="col-body" id="b-b"></div>
      </div>
    </div>

    <div class="file-bar">
      <div class="file-bar-head">
        <div class="section-lbl">
          <div class="writing-dot" id="wdot"></div>
          File activity
        </div>
        <span style="font-size:10px;color:var(--faint)" id="fcount">watching</span>
      </div>
      <div class="file-list" id="flist">
        <span class="file-empty">No changes yet — modified files appear here</span>
      </div>
    </div>
  </div>

  <div class="feed">
    <div class="feed-head">
      <span class="section-lbl">Events</span>
      <span class="feed-count" id="ecount">—</span>
    </div>
    <div class="feed-body" id="feed"></div>
  </div>
</main>

<script>
const ICONS = {
  'task.added':'+','task.picked':'▶','task.done':'✓','task.blocked':'✗',
  'task.assigned':'@','agent.start':'⬡','agent.log':'·',
  'file.changed':'◈','file.created':'◆','task.progress':'◐',
};
const EXT_ICON = {
  go:'go',ts:'ts',tsx:'tsx',js:'js',jsx:'jsx',
  py:'py',html:'html',css:'css',json:'{}',md:'md',
  sql:'sql',sh:'sh',yaml:'yml',yml:'yml',
};

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;') }
function hms(iso){
  return new Date(iso).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
}

function cardHtml(t){
  const active = t.status==='in_progress';
  const pct    = t.progress ?? 0;
  const thinking = active ? '<span class="thinking"><i></i><i></i><i></i></span>' : '';
  const tags  = (t.tags||[]).map(g=>\`<span class="chip">\${esc(g)}</span>\`).join('');
  const prio  = t.priority==='high'   ? '<span class="chip hi">high</span>'
              : t.priority==='medium' ? '<span class="chip med">med</span>' : '';
  const who   = t.assignee ? \`<span class="chip chip-who">@\${esc(t.assignee)}</span>\` : '';
  const prog  = (active||t.status==='done') && pct > 0 ? \`
    <div class="prog-wrap">
      <div class="prog-track"><div class="prog-fill\${pct===100?' done':''}" style="width:\${pct}%"></div></div>
      <span class="prog-lbl">\${pct}%</span>
    </div>\` : '';
  return \`<div class="card\${active?' is-active':''}">
    <div class="card-title">\${thinking}\${esc(t.title)}</div>
    <div class="card-meta"><span class="chip">\${t.id}</span>\${prio}\${tags}\${who}</div>
    \${prog}
  </div>\`;
}

function evHtml(ev, flash){
  const icon = ICONS[ev.type]||'·';
  const desc = ev.taskTitle||ev.message||'';
  const pctSuffix = ev.progress != null ? \` \${ev.progress}%\` : '';
  return \`<div class="ev\${flash?' ev-flash':''}" data-t="\${ev.type}">
    <span class="ev-icon">\${icon}</span>
    <div class="ev-body">
      <div class="ev-type">\${ev.type}</div>
      \${desc ? \`<div class="ev-desc">\${esc(desc)}\${pctSuffix}</div>\` : ''}
    </div>
    <span class="ev-time">\${hms(ev.ts)}</span>
  </div>\`;
}

/* file activity */
const fileMap = new Map();
let writingTimer = null;

function flashWritingDot(){
  const dot = document.getElementById('wdot');
  dot.classList.add('on');
  clearTimeout(writingTimer);
  writingTimer = setTimeout(()=>dot.classList.remove('on'), 2000);
}

function pushFile(path){
  const ext  = (path.split('.').pop()||'').toLowerCase();
  const icon = EXT_ICON[ext] || '·';
  const name = path.split('/').pop()||path;
  flashWritingDot();

  const flist = document.getElementById('flist');
  const empty = flist.querySelector('.file-empty');
  if(empty) empty.remove();

  if(fileMap.has(path)){
    const el = fileMap.get(path).el;
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
    flist.prepend(el); return;
  }
  const chip = document.createElement('div');
  chip.className = 'file-chip fresh';
  chip.innerHTML = \`<span class="file-name">\${esc(name)}</span><span class="file-ext">.\${icon}</span>\`;
  flist.prepend(chip);
  const chips = flist.querySelectorAll('.file-chip');
  if(chips.length>12) chips[chips.length-1].remove();
  const t = setTimeout(()=>chip.classList.remove('fresh'), 3000);
  fileMap.set(path, {el:chip, timer:t});
  document.getElementById('fcount').textContent = Math.min(fileMap.size,12)+' file'+(fileMap.size===1?'':'s');
}

let prevEv = 0;

function render(tasks, evs){
  const g = {pending:[],in_progress:[],done:[],blocked:[]};
  tasks.forEach(t=>(g[t.status]||g.pending).push(t));

  const m={pending:'p',in_progress:'a',done:'d',blocked:'b'};
  Object.entries(g).forEach(([s,arr])=>{
    const k=m[s];
    document.getElementById('c-'+k).textContent=arr.length;
    document.getElementById('b-'+k).innerHTML=arr.length
      ? arr.map(cardHtml).join('')
      : '<div class="col-empty">—</div>';
  });
  document.getElementById('s-a').textContent=g.in_progress.length;
  document.getElementById('s-d').textContent=g.done.length;
  document.getElementById('s-t').textContent=tasks.length;

  const isNew = evs.length > prevEv;
  document.getElementById('ecount').textContent=evs.length+' event'+(evs.length===1?'':'s');

  if(isNew) evs.slice(prevEv).forEach(ev=>{
    if((ev.type==='file.changed'||ev.type==='file.created')&&ev.message) pushFile(ev.message);
  });

  const feedEvs = evs.filter(e=>e.type!=='file.changed'&&e.type!=='file.created');
  document.getElementById('feed').innerHTML = feedEvs.length
    ? [...feedEvs].reverse().map((e,i)=>evHtml(e,isNew&&i===0)).join('')
    : '<div class="feed-empty">no events yet</div>';

  prevEv = evs.length;
}

async function fetchAll(){
  try{
    const [tr,er]=await Promise.all([fetch('/api/tasks'),fetch('/api/events')]);
    render(await tr.json(), await er.json());
  }catch(e){console.warn(e)}
}

function connect(){
  const es=new EventSource('/events');
  const dot=document.getElementById('ldot'), txt=document.getElementById('ltxt');
  es.onopen=()=>{dot.className='live-dot on';txt.textContent='live'};
  es.onmessage=e=>{if(e.data!=='ping')fetchAll()};
  es.onerror=()=>{dot.className='live-dot err';txt.textContent='reconnecting';es.close();setTimeout(connect,3000)};
}

fetchAll(); connect(); setInterval(fetchAll,2000);
</script>
</body>
</html>`;
}
