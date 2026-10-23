import { $, S, esc, rand, shuffle, later, shell, setStage, setActions, beep, showHukuman } from '../core/index.js';
import { HUNT_COLORS, START_LETTERS, END_LETTERS } from '../data/colors.js';
/* ---------- 15. Cari Benda ---------- */
export function gameColorHunt(){
  const p=S.players, ROUNDS=3, ROUND_SECONDS=45;
  let mode='campur', order=[], scores=[], round=0, timer=null, resolved=false, prompt=null;

  const scoreLine=()=>p.map((n,i)=>`${esc(n)} ${scores[i]}`).join(' · ');
  const promptVisual=p=>{
    if(p.color) return `<div class="ch-swatch" style="background:${p.color.hex}" role="img" aria-label="Warna ${esc(p.color.name)}"></div>`;
    if(p.letters) return `<div class="ch-letters">${p.letters.map(l=>`<div class="ch-letter" aria-hidden="true">${l}</div>`).join('')}</div>`;
    if(p.letter) return `<div class="ch-letter" aria-hidden="true">${p.letter}</div>`;
    return '';
  };
  const makePrompt=index=>{
    const color=rand(HUNT_COLORS);
    if(mode==='warna') return {color, key:`w${color.name}`, text:`Cari benda berwarna <b>${color.name.toLowerCase()}</b>.`};
    if(mode==='dua'){
      const [a,b]=shuffle(START_LETTERS).slice(0,2);
      return {color:null, letters:[a,b], key:`d${[a,b].sort().join('')}`, text:`Cari benda yang namanya mengandung huruf <b>${a}</b> dan <b>${b}</b>.`};
    }
    const pos=index%2===0?'awal':'akhir';
    const letter=rand(pos==='awal'?START_LETTERS:END_LETTERS);
    if(mode==='huruf') return {color:null, letter, key:`h${pos}${letter}`, text:`Cari benda yang namanya ber${pos==='awal'?'awalan':'akhiran'} huruf <b>${letter}</b>.`};
    return {color, key:`c${pos}${letter}${color.name}`, text:`Cari benda <b>${color.name.toLowerCase()}</b> yang namanya ber${pos==='awal'?'awalan':'akhiran'} huruf <b>${letter}</b>.`};
  };
  const buildPrompts=()=>{
    const out=[], keys=new Set(), colors=new Set();
    let guard=0;
    while(out.length<ROUNDS && guard++<100){
      const q=makePrompt(out.length);
      if(keys.has(q.key)) continue;
      if(q.color && colors.has(q.color.name)) continue;
      keys.add(q.key);
      if(q.color) colors.add(q.color.name);
      out.push(q);
    }
    return out;
  };
  const setup=()=>{
    clearTimeout(timer);
    setStage(`<p class="kicker">Cari di ruangan</p><h2 class="big">Cari Benda</h2>
      <p>HP di tangan hakim. Clue muncul setelah ronde dimulai. Pemain cari benda yang cocok, lalu hakim menekan nama penemu pertama.</p>
      <div class="namegrid">
        <button class="btn" data-mode="warna">Warna saja</button>
        <button class="btn" data-mode="huruf">Huruf saja</button>
        <button class="btn" data-mode="dua">2 huruf acak</button>
        <button class="btn ink" data-mode="campur">Campur warna + huruf</button>
      </div>
      <p class="hint">2 huruf = nama benda mengandung dua huruf sekaligus. Campur = warna plus awalan/akhiran. ${ROUNDS} ronde, ${ROUND_SECONDS} detik per ronde.</p>`);
    setActions('');
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{
      mode=b.dataset.mode;
      scores=Array(p.length).fill(0); round=0; order=buildPrompts();
      roundIntro();
    });
  };
  const roundIntro=()=>{
    clearTimeout(timer);
    setStage(`<p class="kicker">Ronde ${round+1}/${ROUNDS}</p><h2 class="big">Siap cari?</h2>
      <p>HP di tangan hakim. Clue baru muncul setelah ronde dimulai.</p>
      <p class="hint">${scoreLine()}</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai ronde</button>`);
    $('#go').onclick=startRound;
  };
  const startRound=()=>{
    prompt=order[round]; resolved=false;
    let left=ROUND_SECONDS;
    setStage(`<p class="kicker">Ronde ${round+1}/${ROUNDS}</p>
      <div class="card ch-card">
        ${promptVisual(prompt)}
        <div class="txt">${prompt.text}</div>
      </div>
      <div class="who" id="chClock" style="font-size:56px">${ROUND_SECONDS}</div>`);
    setActions(`<div class="ch-grid">${p.map((n,i)=>`<button class="btn" data-ch="${i}">${esc(n)}</button>`).join('')}</div>
      <button class="btn sm" id="none">Tidak ada yang cocok</button>`);
    beep(700,.08);
    const tick=()=>{
      if(resolved) return;
      left--; const el=$('#chClock'); if(el) el.textContent=left;
      if(left>0){ if(left<=5) beep(1200,.05); timer=later(tick,1000); }
      else timeUp();
    };
    timer=later(tick,1000);
    document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>award(+b.dataset.ch));
    $('#none').onclick=timeUp;
  };
  const award=i=>{
    if(resolved) return; resolved=true; clearTimeout(timer);
    scores[i]++; beep(1000,.15);
    setStage(`<p class="kicker">Ronde ${round+1}</p><h2 class="big">${esc(p[i])} dapat!</h2>
      <p>${prompt.text}</p><p class="hint">${scoreLine()}</p>`);
    setActions('');
    later(nextRound,1400);
  };
  const timeUp=()=>{
    if(resolved) return; resolved=true; clearTimeout(timer); beep(300,.2);
    setStage(`<p class="kicker">Waktu habis</p><h2 class="big">Tidak ada yang dapat</h2>
      <p>${prompt.text}</p><p class="hint">${scoreLine()}</p>`);
    setActions('');
    later(nextRound,1400);
  };
  const nextRound=()=>{
    round++;
    if(round<ROUNDS) return roundIntro();
    final();
  };
  const final=()=>{
    clearTimeout(timer);
    const min=Math.min(...scores), max=Math.max(...scores);
    const ranked=p.map((n,i)=>({n,s:scores[i]})).sort((a,b)=>b.s-a.s);
    setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">
      ${ranked.map(({n,s})=>`<div class="${s===min?'top':''}"><span>${esc(n)}</span><b>${s}</b></div>`).join('')}</div>
      <p class="hint">${max===0?'Tidak ada yang dapat poin. Coba clue yang lebih mudah.':min===max?'Semua seri, tidak ada yang dihukum.':'Poin terendah kena hukuman.'}</p>`);
    if(max===0 || min===max){
      setActions(`<button class="btn hot xl" id="again">Main lagi</button>`);
      $('#again').onclick=setup;
      return;
    }
    const losers=p.filter((_,i)=>scores[i]===min);
    setActions(`<button class="btn hot xl" id="h">Hukum poin terendah</button><button class="btn" id="again">Main lagi</button>`);
    $('#h').onclick=()=>showHukuman(losers,`Poin terendah di Cari Benda (${min})`,setup,'tekan');
    $('#again').onclick=setup;
  };

  shell('Cari Benda','');
  setup();
}
