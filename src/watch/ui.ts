export function buildUI(projectName: string): string {
  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${projectName} · half</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #1c1917;
  --surface:   #27251f;
  --surface2:  #302e28;
  --border:    #3d3a32;
  --text:      #f0ebe4;
  --text2:     #c8bfb0;
  --muted:     #7a7060;
  --orange:    #d97757;
  --orange-bg: #2c1f18;
  --pending:   #b8a060;
  --active:    #d97757;
  --done:      #5a9e72;
  --blocked:   #b85555;
  --font:      'Inter', system-ui, sans-serif;
  --mono:      ui-monospace, 'Cascadia Code', monospace;
  --radius:    10px;
}

html, body { height: 100%; background: var(--bg); color: var(--text);
  font-family: var(--font); font-size: 13px; line-height: 1.5; }

body { display: grid; grid-template-rows: 52px 1fr; height: 100vh; overflow: hidden; }

/* ── TOP BAR ── */
.topbar {
  display: flex; align-items: center; gap: 12px;
  padding: 0 20px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.logo { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: var(--text); }
.logo-sq {
  width: 24px; height: 24px; background: var(--orange); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.divider { width: 1px; height: 20px; background: var(--border); }
.proj-name { font-size: 13px; color: var(--text2); font-weight: 400; }
.topbar-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

.stat {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--muted);
  padding: 4px 8px; border-radius: 6px;
  background: var(--surface2); border: 1px solid var(--border);
}
.stat-n { font-weight: 600; font-variant-numeric: tabular-nums; }
.stat.active .stat-n { color: var(--active); }
.stat.done   .stat-n { color: var(--done); }

.live-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--muted);
  padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border);
}
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); flex-shrink: 0; }
.live-dot.on {
  background: var(--done);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--done) 25%, transparent);
  animation: pulse 2s ease-in-out infinite;
}
.live-dot.err { background: var(--blocked); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

/* ── MAIN LAYOUT ── */
main { display: grid; grid-template-columns: 1fr 300px; overflow: hidden; }

/* ── LEFT: kanban + file activity ── */
.left { display: grid; grid-template-rows: 1fr 180px; overflow: hidden; border-right: 1px solid var(--border); }

/* ── KANBAN ── */
.kanban { display: grid; grid-template-columns: repeat(4,1fr); overflow: hidden; border-bottom: 1px solid var(--border); }

.col { display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
.col:last-child { border-right: none; }

.col-head {
  padding: 11px 14px 10px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.col-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--muted);
}
.col-pip { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.col-count {
  font-size: 11px; color: var(--muted);
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; padding: 1px 7px; font-variant-numeric: tabular-nums;
}
.col-body {
  flex: 1; overflow-y: auto; padding: 8px;
  display: flex; flex-direction: column; gap: 5px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.col-body::-webkit-scrollbar { width: 3px; }
.col-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ── CARD ── */
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 9px 11px; cursor: default;
  transition: border-color .12s;
}
.card:hover { border-color: color-mix(in srgb, var(--border) 50%, var(--text)); }
.card.is-active {
  border-color: color-mix(in srgb, var(--active) 45%, transparent);
  background: color-mix(in srgb, var(--orange-bg) 55%, var(--surface));
}
.card-title {
  font-size: 12px; font-weight: 500; color: var(--text); line-height: 1.45;
  margin-bottom: 7px; display: flex; align-items: flex-start; gap: 6px;
}
.thinking { display: inline-flex; gap: 2px; align-items: center; flex-shrink: 0; margin-top: 3px; }
.thinking i {
  display: block; width: 3px; height: 3px; border-radius: 50%;
  background: var(--orange); animation: think 1.2s ease-in-out infinite; font-style: normal;
}
.thinking i:nth-child(2){animation-delay:.15s} .thinking i:nth-child(3){animation-delay:.3s}
@keyframes think { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
.card-meta { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }

/* ── PROGRESS BAR ── */
.prog-wrap {
  margin-top: 8px;
  display: flex; align-items: center; gap: 6px;
}
.prog-track {
  flex: 1; height: 3px; border-radius: 2px;
  background: var(--surface2); overflow: hidden;
}
.prog-fill {
  height: 100%; border-radius: 2px;
  background: var(--active);
  transition: width .4s ease;
}
.prog-fill.done { background: var(--done); }
.prog-label { font-size: 10px; font-family: var(--mono); color: var(--muted); flex-shrink: 0; min-width: 28px; text-align: right; }

.chip {
  font-size: 10px; padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--border); color: var(--muted); background: var(--surface2);
  font-family: var(--mono);
}
.chip.hi  { color: var(--blocked); border-color: color-mix(in srgb,var(--blocked) 30%,transparent); }
.chip.med { color: var(--pending); border-color: color-mix(in srgb,var(--pending) 30%,transparent); }
.chip-who { color: var(--orange);  border-color: color-mix(in srgb,var(--orange)  30%,transparent); }
.col-empty { font-size: 11px; color: var(--muted); text-align: center; padding: 20px 8px; opacity: .5; }

/* ── FILE ACTIVITY BAR ── */
.file-bar { display: flex; flex-direction: column; overflow: hidden; }
.file-bar-head {
  padding: 8px 14px 7px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.section-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .05em; color: var(--muted);
  display: flex; align-items: center; gap: 6px;
}
.writing-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--orange); opacity: 0;
  transition: opacity .3s;
}
.writing-dot.on { opacity: 1; animation: pulse 1s ease-in-out infinite; }

.file-list {
  flex: 1; overflow-x: auto; overflow-y: hidden;
  display: flex; align-items: center; gap: 6px;
  padding: 0 14px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.file-list::-webkit-scrollbar { height: 3px; }
.file-list::-webkit-scrollbar-thumb { background: var(--border); }

.file-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 8px; border-radius: 6px;
  background: var(--surface2); border: 1px solid var(--border);
  white-space: nowrap; flex-shrink: 0;
  animation: chipin .25s ease;
}
@keyframes chipin { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:none} }
.file-chip.fresh { border-color: color-mix(in srgb,var(--orange) 45%,transparent); }
.file-icon { font-size: 11px; }
.file-name { font-size: 11px; font-family: var(--mono); color: var(--text2); }
.file-ext  { font-size: 10px; font-family: var(--mono); color: var(--muted); }
.file-empty { font-size: 11px; color: var(--muted); opacity: .5; white-space: nowrap; }

/* ── RIGHT: EVENT FEED ── */
.feed { display: flex; flex-direction: column; overflow: hidden; }
.feed-head {
  padding: 11px 16px 10px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.feed-count { font-size: 11px; color: var(--muted); }

.feed-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.feed-body::-webkit-scrollbar { width: 3px; }
.feed-body::-webkit-scrollbar-thumb { background: var(--border); }

.ev {
  display: grid; grid-template-columns: 14px 1fr auto;
  gap: 0 8px; align-items: baseline;
  padding: 7px 16px;
  border-bottom: 1px solid color-mix(in srgb,var(--border) 50%,transparent);
  border-left: 2px solid transparent;
  transition: background .1s;
}
.ev:last-child { border-bottom: none; }
.ev:hover { background: var(--surface); }

/* type accent colours */
.ev[data-t="task.added"]    { border-left-color: #5a80d9; }
.ev[data-t="task.picked"]   { border-left-color: var(--active); }
.ev[data-t="task.done"]     { border-left-color: var(--done); }
.ev[data-t="task.blocked"]  { border-left-color: var(--blocked); }
.ev[data-t="task.assigned"] { border-left-color: #a07ac8; }
.ev[data-t="agent.start"]   { border-left-color: #5a80d9; }
.ev[data-t="agent.log"]     { border-left-color: var(--border); }
.ev[data-t="file.changed"]   { border-left-color: var(--orange); }
.ev[data-t="file.created"]   { border-left-color: var(--done); }
.ev[data-t="task.progress"]  { border-left-color: var(--active); }

.ev-icon { font-size: 11px; text-align: center; }
.ev[data-t="task.added"]    .ev-icon { color: #6b94e8; }
.ev[data-t="task.picked"]   .ev-icon { color: var(--active); }
.ev[data-t="task.done"]     .ev-icon { color: var(--done); }
.ev[data-t="task.blocked"]  .ev-icon { color: var(--blocked); }
.ev[data-t="task.assigned"] .ev-icon { color: #b090d8; }
.ev[data-t="agent.start"]   .ev-icon { color: #6b94e8; }
.ev[data-t="agent.log"]     .ev-icon { color: var(--muted); }
.ev[data-t="file.changed"]  .ev-icon { color: var(--orange); }
.ev[data-t="file.created"]  .ev-icon { color: var(--done); }

.ev-body { min-width: 0; }
.ev-type { font-size: 10px; font-family: var(--mono); font-weight: 500; margin-bottom: 1px; }
.ev[data-t="task.added"]    .ev-type { color: #6b94e8; }
.ev[data-t="task.picked"]   .ev-type { color: var(--active); }
.ev[data-t="task.done"]     .ev-type { color: var(--done); }
.ev[data-t="task.blocked"]  .ev-type { color: var(--blocked); }
.ev[data-t="task.assigned"] .ev-type { color: #b090d8; }
.ev[data-t="agent.start"]   .ev-type { color: #6b94e8; }
.ev[data-t="agent.log"]     .ev-type { color: var(--muted); }
.ev[data-t="file.changed"]  .ev-type { color: var(--orange); }
.ev[data-t="file.created"]  .ev-type { color: var(--done); }

.ev-desc { font-size: 11px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ev-time { font-size: 10px; font-family: var(--mono); color: var(--muted); white-space: nowrap; align-self: start; padding-top: 1px; }
.feed-empty { font-size: 12px; color: var(--muted); text-align: center; padding: 32px 16px; opacity: .5; }
.ev-flash { animation: evflash .5s ease; }
@keyframes evflash { from{background:color-mix(in srgb,var(--orange) 10%,transparent)} to{background:transparent} }
</style>
</head>
<body>

<header class="topbar">
  <div class="logo">
    <div class="logo-sq">½</div>
    <span>half</span>
  </div>
  <div class="divider"></div>
  <span class="proj-name">${projectName}</span>
  <div class="topbar-right">
    <div class="stat active"><span class="stat-n" id="s-a">–</span><span>active</span></div>
    <div class="stat done">  <span class="stat-n" id="s-d">–</span><span>done</span></div>
    <div class="stat">       <span class="stat-n" id="s-t">–</span><span>total</span></div>
    <div class="live-badge">
      <div class="live-dot" id="ldot"></div>
      <span id="ltxt">connecting</span>
    </div>
  </div>
</header>

<main>
  <div class="left">
    <!-- kanban -->
    <div class="kanban">
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--pending)"></div>Pending</div>
          <span class="col-count" id="c-p">0</span>
        </div>
        <div class="col-body" id="b-p"></div>
      </div>
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--active)"></div>In Progress</div>
          <span class="col-count" id="c-a">0</span>
        </div>
        <div class="col-body" id="b-a"></div>
      </div>
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--done)"></div>Done</div>
          <span class="col-count" id="c-d">0</span>
        </div>
        <div class="col-body" id="b-d"></div>
      </div>
      <div class="col">
        <div class="col-head">
          <div class="col-label"><div class="col-pip" style="background:var(--blocked)"></div>Blocked</div>
          <span class="col-count" id="c-b">0</span>
        </div>
        <div class="col-body" id="b-b"></div>
      </div>
    </div>

    <!-- file activity -->
    <div class="file-bar">
      <div class="file-bar-head">
        <div class="section-label">
          <div class="writing-dot" id="wdot"></div>
          File activity
        </div>
        <span style="font-size:11px;color:var(--muted)" id="fcount">watching</span>
      </div>
      <div class="file-list" id="flist">
        <span class="file-empty">No changes yet — files modified by the agent appear here</span>
      </div>
    </div>
  </div>

  <!-- event feed -->
  <div class="feed">
    <div class="feed-head">
      <span class="section-label">Events</span>
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
  go:'🔵', ts:'🔷', tsx:'🔷', js:'🟡', jsx:'🟡',
  py:'🟢', html:'🟠', css:'🎨', json:'⚙', md:'📄',
  sql:'🗄', sh:'⬛', yaml:'⚙', yml:'⚙', rs:'🦀',
};

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;') }
function hms(iso){
  return new Date(iso).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
}

function cardHtml(t){
  const active = t.status==='in_progress';
  const pct    = t.progress ?? 0;
  const thinking = active ? '<span class="thinking"><i></i><i></i><i></i></span>' : '';
  const tags = (t.tags||[]).map(g=>\`<span class="chip">\${esc(g)}</span>\`).join('');
  const prio = t.priority==='high' ? '<span class="chip hi">high</span>'
             : t.priority==='medium' ? '<span class="chip med">med</span>' : '';
  const who = t.assignee ? \`<span class="chip chip-who">@\${esc(t.assignee)}</span>\` : '';
  const showProg = (active || t.status==='done') && pct > 0;
  const progHtml = showProg ? \`
    <div class="prog-wrap">
      <div class="prog-track"><div class="prog-fill\${pct===100?' done':''}" style="width:\${pct}%"></div></div>
      <span class="prog-label">\${pct}%</span>
    </div>\` : '';
  return \`<div class="card\${active?' is-active':''}">
    <div class="card-title">\${thinking}\${esc(t.title)}</div>
    <div class="card-meta"><span class="chip">\${t.id}</span>\${prio}\${tags}\${who}</div>
    \${progHtml}
  </div>\`;
}

function evHtml(ev, flash){
  const icon = ICONS[ev.type]||'·';
  const desc = ev.taskTitle||ev.message||'';
  return \`<div class="ev\${flash?' ev-flash':''}" data-t="\${ev.type}">
    <span class="ev-icon">\${icon}</span>
    <div class="ev-body">
      <div class="ev-type">\${ev.type}</div>
      \${desc?'<div class="ev-desc">'+esc(desc)+'</div>':''}
    </div>
    <span class="ev-time">\${hms(ev.ts)}</span>
  </div>\`;
}

/* file activity bar */
const fileMap = new Map(); // path → {el, timer}
let writingTimer = null;

function flashWritingDot(){
  const dot = document.getElementById('wdot');
  dot.classList.add('on');
  clearTimeout(writingTimer);
  writingTimer = setTimeout(()=>dot.classList.remove('on'), 2000);
}

function pushFile(path){
  const ext = (path.split('.').pop()||'').toLowerCase();
  const icon = EXT_ICON[ext]||'📄';
  const name = path.split('/').pop()||path;

  flashWritingDot();
  document.getElementById('fcount').textContent = fileMap.size + ' file' + (fileMap.size===1?'':'s');

  const flist = document.getElementById('flist');

  // remove empty state
  const empty = flist.querySelector('.file-empty');
  if(empty) empty.remove();

  if(fileMap.has(path)){
    // already shown — flash it
    const el = fileMap.get(path).el;
    el.classList.remove('fresh');
    void el.offsetWidth;
    el.classList.add('fresh');
    flist.prepend(el);
    return;
  }

  const chip = document.createElement('div');
  chip.className = 'file-chip fresh';
  chip.innerHTML = \`<span class="file-icon">\${icon}</span><span class="file-name">\${esc(name)}</span><span class="file-ext">.\${ext}</span>\`;
  flist.prepend(chip);

  // cap at 12 visible
  const chips = flist.querySelectorAll('.file-chip');
  if(chips.length > 12) chips[chips.length-1].remove();

  // after 3s remove 'fresh' highlight
  const t = setTimeout(()=>chip.classList.remove('fresh'), 3000);
  fileMap.set(path, {el:chip, timer:t});

  document.getElementById('fcount').textContent = Math.min(fileMap.size, 12) + ' file' + (fileMap.size===1?'':'s');
}

let prevEv = 0;

function render(tasks, evs){
  const groups = {pending:[],in_progress:[],done:[],blocked:[]};
  tasks.forEach(t=>(groups[t.status]||groups.pending).push(t));

  const map={pending:'p',in_progress:'a',done:'d',blocked:'b'};
  Object.entries(groups).forEach(([s,arr])=>{
    const k=map[s];
    document.getElementById('c-'+k).textContent=arr.length;
    document.getElementById('b-'+k).innerHTML=arr.length
      ? arr.map(cardHtml).join('')
      : '<div class="col-empty">—</div>';
  });

  document.getElementById('s-a').textContent=groups.in_progress.length;
  document.getElementById('s-d').textContent=groups.done.length;
  document.getElementById('s-t').textContent=tasks.length;

  const isNew = evs.length > prevEv;
  document.getElementById('ecount').textContent = evs.length+' event'+(evs.length===1?'':'s');

  // push new file events to bar
  if(isNew){
    evs.slice(prevEv).forEach(ev=>{
      if((ev.type==='file.changed'||ev.type==='file.created') && ev.message){
        pushFile(ev.message);
      }
    });
  }

  // event feed — show all except file events (they live in the bar)
  const feedEvs = evs.filter(e=>e.type!=='file.changed'&&e.type!=='file.created');
  document.getElementById('feed').innerHTML = feedEvs.length
    ? [...feedEvs].reverse().map((e,i)=>evHtml(e,isNew&&i===0)).join('')
    : '<div class="feed-empty">No events yet</div>';

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
  es.onopen=()=>{dot.className='live-dot on';txt.textContent='Live'};
  es.onmessage=e=>{if(e.data!=='ping')fetchAll()};
  es.onerror=()=>{dot.className='live-dot err';txt.textContent='Reconnecting';es.close();setTimeout(connect,3000)};
}

fetchAll();
connect();
setInterval(fetchAll,2000);
</script>
</body>
</html>`;
}
