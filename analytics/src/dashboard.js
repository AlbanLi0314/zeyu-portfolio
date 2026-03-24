// src/dashboard.js
export function dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analytics — zeyuli.net</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;padding:1rem}
h1{font-size:1.5rem;margin-bottom:1rem}
.controls{display:flex;gap:.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
.controls button{padding:.4rem .8rem;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer;font-size:.85rem}
.controls button.active{background:#115e59;color:#fff;border-color:#115e59}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1rem}
.card{background:#fff;border-radius:8px;padding:1rem;border:1px solid #e2e8f0}
.card h2{font-size:.95rem;margin-bottom:.75rem;color:#334155}
canvas{width:100%!important;max-height:300px}
.stat{font-size:2rem;font-weight:700;color:#115e59}
.stat-label{font-size:.85rem;color:#64748b}
.summary{display:flex;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
@media(max-width:500px){.grid{grid-template-columns:1fr}}
</style></head><body>
<h1>Analytics — zeyuli.net</h1>
<div class="controls">
  <button onclick="load(7)" id="b7">7 days</button>
  <button onclick="load(30)" id="b30" class="active">30 days</button>
  <button onclick="load(90)" id="b90">90 days</button>
  <button onclick="load(0)" id="b0">All time</button>
</div>
<div class="summary" id="summary"></div>
<div class="grid">
  <div class="card"><h2>Daily Visits</h2><canvas id="c-daily"></canvas></div>
  <div class="card"><h2>Top Paths</h2><canvas id="c-paths"></canvas></div>
  <div class="card"><h2>Referrer Sources</h2><canvas id="c-ref"></canvas></div>
  <div class="card"><h2>Geography</h2><canvas id="c-geo"></canvas></div>
  <div class="card"><h2>Organizations</h2><canvas id="c-org"></canvas></div>
  <div class="card"><h2>Page Visits</h2><canvas id="c-pages"></canvas></div>
  <div class="card"><h2>Link Clicks</h2><canvas id="c-clicks"></canvas></div>
  <div class="card"><h2>Language</h2><canvas id="c-lang"></canvas></div>
</div>
<script>
const charts={};const teal='#115e59';const colors=['#115e59','#0d9488','#14b8a6','#2dd4bf','#5eead4','#99f6e4','#134e4a','#042f2e'];
function destroy(){Object.values(charts).forEach(c=>c.destroy&&c.destroy())}
function bar(id,labels,data,horizontal=true){
  charts[id]=new Chart(document.getElementById(id),{type:'bar',
    data:{labels,datasets:[{data,backgroundColor:teal}]},
    options:{indexAxis:horizontal?'y':'x',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});
}
function pie(id,labels,data){
  charts[id]=new Chart(document.getElementById(id),{type:'doughnut',
    data:{labels,datasets:[{data,backgroundColor:colors}]},
    options:{plugins:{legend:{position:'right'}}}});
}
async function load(range){
  destroy();
  document.querySelectorAll('.controls button').forEach(b=>b.classList.remove('active'));
  document.getElementById('b'+range).classList.add('active');
  const d=await(await fetch('/_a/stats?range='+range)).json();
  // Summary
  const totalPV=d.daily.reduce((s,r)=>s+r.pv,0);
  const totalUV=d.uv_total?.[0]?.uv||0;
  document.getElementById('summary').innerHTML=
    '<div><div class="stat">'+totalPV+'</div><div class="stat-label">Page Views</div></div>'+
    '<div><div class="stat">'+totalUV+'</div><div class="stat-label">Unique Visitors</div></div>';
  // Daily line
  charts['c-daily']=new Chart(document.getElementById('c-daily'),{type:'line',
    data:{labels:d.daily.map(r=>r.date),datasets:[
      {label:'PV',data:d.daily.map(r=>r.pv),borderColor:teal,tension:.3},
      {label:'UV',data:d.daily.map(r=>r.uv),borderColor:'#2dd4bf',tension:.3}
    ]},options:{plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true}}}});
  bar('c-paths',d.paths.map(r=>r.path),d.paths.map(r=>r.pv));
  pie('c-ref',d.referrer.map(r=>r.source),d.referrer.map(r=>r.count));
  bar('c-geo',d.geo.map(r=>r.region?r.country+'/'+r.region:r.country),d.geo.map(r=>r.count));
  bar('c-org',d.org.map(r=>r.org),d.org.map(r=>r.count));
  bar('c-pages',d.pages.map(r=>r.page),d.pages.map(r=>r.count));
  bar('c-clicks',d.clicks.map(r=>r.label||r.target_url),d.clicks.map(r=>r.count));
  pie('c-lang',d.lang.map(r=>r.lang),d.lang.map(r=>r.count));
}
load(30);
</script></body></html>`;
}
