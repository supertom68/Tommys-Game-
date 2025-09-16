const DATA_URL = 'https://johannesfriedrich.github.io/LottoNumberArchive/Lottonumbers_tidy_complete.json';
const NUM_PREDICTIONS = 14;
const NUMBERS_PER_ROW = 6;
let historicalDraws = [];

function pickWeighted(items, weights, k) {
  const picks = new Set();
  let w = weights.slice();
  for (let pick=0; pick<k; pick++) {
    const sum = w.reduce((a,b)=>a+b,0);
    if (sum <= 0) break;
    let r = Math.random() * sum;
    let i=0;
    while (r > w[i]) { r -= w[i]; i++; }
    picks.add(items[i]);
    w[i] = 0;
  }
  return Array.from(picks).sort((a,b)=>a-b);
}

async function loadData() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  historicalDraws = [];
  if (Array.isArray(data)) {
    let map = {};
    data.forEach(row => {
      if (row.variable && row.variable.toLowerCase().includes('lotto')) {
        let d = row.date || 'unknown';
        if (!map[d]) map[d] = [];
        map[d].push(Number(row.value));
      } else if (row.numbers) {
        historicalDraws.push(row.numbers);
      }
    });
    if (Object.keys(map).length>0) {
      Object.values(map).forEach(arr=>{ if (arr.length===6) historicalDraws.push(arr); });
    }
  }
  return data;
}

function computeFrequencies() {
  const freq = Array(50).fill(0);
  historicalDraws.forEach(draw => {
    draw.forEach(n => { if(n>=1 && n<=49) freq[n]++; });
  });
  return freq;
}

function generatePredictions(freq, N=NUM_PREDICTIONS) {
  const items = [], weights=[];
  for(let i=1;i<=49;i++){ items.push(i); weights.push(freq[i]+1); }
  const predictions=[]; const used=new Set();
  while(predictions.length<N){
    let row = pickWeighted(items,weights,NUMBERS_PER_ROW);

    // Heuristik: Summe 80..200
    let sum=row.reduce((a,b)=>a+b,0);
    if(sum<80||sum>200) continue;

    // Heuristik: gerade/ungerade 2-4 pro Reihe
    let even=row.filter(n=>n%2===0).length;
    if(even<2||even>4) continue;

    // Heuristik: Cluster vermeiden (max 4 Zahlen in einem 10er-Bereich)
    let clusterOK=true;
    for(let start=1;start<=41;start+=10){
      let count=row.filter(n=>n>=start && n<start+10).length;
      if(count>4){ clusterOK=false; break; }
    }
    if(!clusterOK) continue;

    // Heuristik: Vermeide exakte Duplikate von historischen Ziehungen
    if(historicalDraws.some(d=>d.sort((a,b)=>a-b).join(',')===row.join(','))) continue;

    let key=row.join(',');
    if(!used.has(key)){ used.add(key); predictions.push(row); }
  }
  return predictions;
}

async function renderPredictions() {
  const container=document.getElementById('predictions');
  container.innerHTML='Lade historische Daten…';
  try{
    await loadData();
    const freq=computeFrequencies();
    const preds=generatePredictions(freq);
    let html='<h3>14 prognostizierte Reihen</h3><ol>';
    preds.forEach(r=>{ html+=`<li>${r.map(n=>String(n).padStart(2,'0')).join(' - ')}</li>`; });
    html+='</ol><p style="font-size:0.8em;color:#555">Hinweis: Prognosen basieren auf Häufigkeiten/Heuristiken – keine Gewinngarantie!</p>';
    container.innerHTML=html;
    window.lastPredictions=preds;
  }catch(err){
    container.innerHTML='<p style="color:red">'+err.message+'</p>';
  }
}

function exportCSV(){
  if(!window.lastPredictions) return;
  let csv='Reihe\n';
  window.lastPredictions.forEach((r,i)=>{ csv+=`Reihe ${i+1};${r.join(';')}\n`; });
  let blob=new Blob([csv],{type:'text/csv'});
  let a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='tommys_game_tipps.csv';
  a.click();
}

function exportPDF(){
  if(!window.lastPredictions) return;
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF();
  doc.setFontSize(16);
  doc.text('Tommys Game - Lotto Prognose',20,20);
  doc.setFontSize(12);
  window.lastPredictions.forEach((r,i)=>{
    doc.text(`${i+1}. ${r.map(n=>String(n).padStart(2,'0')).join(' - ')}`,20,40+i*10);
  });
  doc.save('tommys_game_tipps.pdf');
}

document.addEventListener('DOMContentLoaded',renderPredictions);
