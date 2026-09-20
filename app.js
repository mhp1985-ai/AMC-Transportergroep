const LOCATIONS = ["AH","PK","BUS","PW","WZ","MDW","ST","TOTAL"];
const TIMES = [
  "06:00 / 14:00",
  "07:00 / 14:00",
  "07:00 / 17:30",
  "07:00 / 18:00",
  "13:00 / 22:00",
  "17:00 / 06:00 (volgende dag)",
  "22:00 / 06:00 (volgende dag)"
];
const CAPACITY = 8;

const locationEl = document.querySelector("#location");
const timeEl = document.querySelector("#time");
const form = document.querySelector("#requestForm");
const requestsEl = document.querySelector("#requests");
const busesEl = document.querySelector("#buses");
const messageEl = document.querySelector("#formMessage");

LOCATIONS.forEach(x => locationEl.insertAdjacentHTML("beforeend", `<option>${x}</option>`));
TIMES.forEach(x => timeEl.insertAdjacentHTML("beforeend", `<option>${x}</option>`));

let requests = JSON.parse(localStorage.getItem("amc_requests") || "[]");
let buses = JSON.parse(localStorage.getItem("amc_buses") || "null") || [
  {id:1,name:"Bus 1",members:[]},
  {id:2,name:"Bus 2",members:[]}
];

function save(){ localStorage.setItem("amc_requests", JSON.stringify(requests)); localStorage.setItem("amc_buses", JSON.stringify(buses)); }

form.addEventListener("submit", e => {
  e.preventDefault();
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: document.querySelector("#name").value.trim(),
    date: document.querySelector("#date").value,
    location: locationEl.value,
    time: timeEl.value,
    status: "pending",
    busId: null,
    createdAt: new Date().toISOString()
  };
  requests.push(item); save(); render();
  form.reset();
  messageEl.textContent = "Aanvraag opgeslagen.";
});

document.querySelector("#clearAll").onclick = () => {
  if(confirm("Alleen de lokale demo-aanvragen wissen?")) { requests=[]; buses.forEach(b=>b.members=[]); save(); render(); }
};
document.querySelector("#addBus").onclick = () => {
  const next = buses.length ? Math.max(...buses.map(b=>b.id))+1 : 1;
  buses.push({id:next,name:`Bus ${next}`,members:[]}); save(); render();
};

function accept(id){ const r=requests.find(x=>x.id===id); if(r) r.status="accepted"; save(); render(); }
function reject(id){ const r=requests.find(x=>x.id===id); if(r){ r.status="rejected"; r.busId=null; } buses.forEach(b=>b.members=b.members.filter(x=>x!==id)); save(); render(); }
function assign(id,busId){
  const r=requests.find(x=>x.id===id); if(!r || r.status!=="accepted") return;
  buses.forEach(b=>b.members=b.members.filter(x=>x!==id));
  const b=buses.find(x=>x.id===Number(busId));
  if(b && b.members.length<CAPACITY){ b.members.push(id); r.busId=b.id; }
  save(); render();
}
function removeBus(id){
  const b=buses.find(x=>x.id===id); if(!b) return;
  if(b.members.length){ alert("Deze bus bevat nog personen. Wijs hen eerst een andere bus toe."); return; }
  buses=buses.filter(x=>x.id!==id); save(); render();
}

function render(){
  requestsEl.innerHTML = requests.length ? requests.map(r => {
    const options = buses.map(b => `<option value="${b.id}" ${r.busId===b.id?"selected":""} ${b.members.length>=CAPACITY && r.busId!==b.id?"disabled":""}>${b.name} (${b.members.length}/${CAPACITY})</option>`).join("");
    return `<div class="request">
      <div class="request-grid">
        <div><b>Naam</b><br>${esc(r.name)}</div>
        <div><b>Datum</b><br>${esc(r.date)}</div>
        <div><b>Locatie</b><br>${esc(r.location)}</div>
        <div><b>Tijd</b><br>${esc(r.time)}</div>
        <div><b>Status</b><br><span class="status ${r.status}">${r.status==="pending"?"In afwachting":r.status==="accepted"?"Geaccepteerd":"Geweigerd"}</span></div>
      </div>
      <div class="toolbar">
        ${r.status==="pending"?`<button onclick="accept('${r.id}')">Accepteren</button><button class="danger" onclick="reject('${r.id}')">Weigeren</button>`:""}
        ${r.status==="accepted"?`<label class="small">Bus
          <select onchange="assign('${r.id}',this.value)"><option value="">Kies bus</option>${options}</select>
        </label>`:""}
      </div>
    </div>`;
  }).join("") : "<p class='muted'>Nog geen aanvragen.</p>";

  busesEl.innerHTML = buses.map(b => {
    const members=b.members.map(id=>requests.find(r=>r.id===id)).filter(Boolean);
    return `<div class="bus">
      <div class="bus-head"><div><strong>${esc(b.name)}</strong> — ${members.length}/${CAPACITY} plaatsen bezet, ${CAPACITY-members.length} vrij</div><button class="danger" onclick="removeBus(${b.id})">Bus verwijderen</button></div>
      <div class="bus-members">${members.length?members.map(r=>`<div class="member"><span>${esc(r.name)} — ${esc(r.date)} — ${esc(r.location)}</span><button type="button" onclick="assign('${r.id}','')">Uit bus</button></div>`).join(""):"<span class='muted'>Nog niemand toegewezen.</span>"}</div>
    </div>`;
  }).join("");
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
render();
