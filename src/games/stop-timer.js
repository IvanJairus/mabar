import { $, S, esc, shell, setStage, setActions, beep, showHukuman } from '../core/index.js';
/* ---------- 14. Stop the Timer ---------- */
export function gameStopTimer(){
  const p=S.players;
  const ROUNDS=[
    {type:'bulat', min:3, max:6, label:'bulat acak 3–6 detik'},
    {type:'bulat', min:7, max:10, label:'bulat acak 7–10 detik'},
    {type:'desimal', label:'desimal acak 3,1–7,9 detik'},
  ];
  let round=0, turn=0, scores=[], roundErrors=[], target=0, startAt=0, running=false;
  const fmt=(n,d=2)=>n.toFixed(d).replace('.',',');
  const targetText=()=>Number.isInteger(target)?String(target):fmt(target,1);
  const totalLine=()=>p.map((n,i)=>`${esc(n)} ${fmt(scores[i])}`).join(' · ');
  const rollTarget=()=>{
    const r=ROUNDS[round];
    if(r.type==='desimal') return 3+Math.floor(Math.random()*5)+(1+Math.floor(Math.random()*9))/10;
    return r.min+Math.floor(Math.random()*(r.max-r.min+1));
  };

  const turnIntro=()=>{
    running=false;
    setStage(`<p class="kicker">Ronde ${round+1}/${ROUNDS.length} · ${esc(p[turn])}</p>
      <h2 class="big">Target ${targetText()} detik</h2>
      <p>${round===0?'Angka bulat acak.':round===1?'Angka bulat acak, lebih panjang.':'Desimal acak.'} Tekan Mulai, lalu Stop tanpa melihat angka.</p>
      ${round>0?`<p class="hint">Total sementara: ${totalLine()}</p>`:''}`);
    setActions(`<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick=startRun;
  };
  const startRun=()=>{
    running=true; startAt=performance.now();
    setStage(`<p class="kicker">Jangan lihat angka</p>
      <div class="st-run"><div class="st-pulse" aria-hidden="true"></div>
        <p class="st-target">${targetText()} detik</p></div>
      <p class="hint">Timer berjalan diam-diam. Tekan Stop saat kamu rasa sudah pas.</p>`);
    setActions(`<button class="btn ink xl" id="stop">Stop</button>`);
    beep(700,.08);
    $('#stop').onclick=stopRun;
  };
  const stopRun=()=>{
    if(!running) return; running=false;
    const elapsed=(performance.now()-startAt)/1000, err=Math.round(Math.abs(elapsed-target)*100)/100;
    roundErrors[turn]=err; scores[turn]+=err;
    beep(1000,.15);
    setStage(`<p class="kicker">Ronde ${round+1} · ${esc(p[turn])}</p><div class="who">${fmt(elapsed)} detik</div>
      <p>Target ${targetText()} detik · meleset <b>${fmt(err)} detik</b></p>
      <p class="hint">Total ${esc(p[turn])}: ${fmt(scores[turn])} detik.</p>`);
    setActions(`<button class="btn ink xl" id="n">${turn<p.length-1?'Pemain berikutnya':'Lihat ronde'}</button>`);
    $('#n').onclick=advance;
  };
  const advance=()=>{
    turn++;
    if(turn<p.length) return turnIntro();
    roundSummary();
  };
  const roundSummary=()=>{
    setStage(`<p class="kicker">Ronde ${round+1} selesai · target ${targetText()} detik</p>
      <div class="board" style="width:100%">${p.map((n,i)=>`<div><span>${esc(n)}</span><b>${fmt(roundErrors[i])} dtk</b></div>`).join('')}</div>
      <p class="hint">${round<ROUNDS.length-1?'Semua sudah mencoba. Lanjut ke target berikutnya.':'Semua ronde selesai. Lihat total.'}</p>`);
    setActions(`<button class="btn hot xl" id="n">${round<ROUNDS.length-1?'Ronde berikutnya':'Lihat hasil'}</button>`);
    $('#n').onclick=nextRound;
  };
  const nextRound=()=>{
    round++;
    if(round<ROUNDS.length) return startRound();
    final();
  };
  const startRound=()=>{
    target=rollTarget(); turn=0; roundErrors=Array(p.length).fill(null); running=false;
    turnIntro();
  };
  const final=()=>{
    const min=Math.min(...scores), max=Math.max(...scores);
    const ranked=p.map((n,i)=>({n,s:scores[i]})).sort((a,b)=>a.s-b.s);
    setStage(`<p class="kicker">Hasil · total ${ROUNDS.length} ronde</p><div class="board" style="width:100%">
      ${ranked.map(({n,s})=>`<div class="${s===max?'top':''}"><span>${esc(n)}</span><b>${fmt(s)} dtk</b></div>`).join('')}</div>
      <p class="hint">${min===max?'Semua sama, tidak ada yang dihukum.':'Paling kecil meleset menang. Paling besar kena hukuman.'}</p>`);
    if(min===max){
      setActions(`<button class="btn hot xl" id="again">Main lagi</button>`);
      $('#again').onclick=intro;
      return;
    }
    const losers=p.filter((_,i)=>scores[i]===max);
    setActions(`<button class="btn hot xl" id="h">Hukum paling meleset</button><button class="btn" id="again">Main lagi</button>`);
    $('#h').onclick=()=>showHukuman(losers,`Paling meleset di Stop the Timer (${fmt(max)} detik)`,intro,'tekan');
    $('#again').onclick=intro;
  };
  const intro=()=>{
    round=0; turn=0; scores=Array(p.length).fill(0); running=false;
    shell('Stop the Timer', `<p class="kicker">Uji feeling</p><h2 class="big">Stop the Timer</h2>
      <p>Semua pemain memakai target yang sama di tiap ronde. Lihat target, tekan Mulai, lalu Stop tanpa melihat angka.</p>
      <p class="hint">Ronde 1: ${ROUNDS[0].label} · Ronde 2: ${ROUNDS[1].label} · Ronde 3: ${ROUNDS[2].label}. Target diacak tiap ronde, sama untuk semua pemain. Total selisih terkecil menang.</p>`,
      `<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick=startRound;
  };
  intro();
}
