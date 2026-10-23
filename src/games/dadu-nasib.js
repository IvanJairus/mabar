import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 5. Dadu Nasib ---------- */
export function gameDadu(){
  const p = S.players; let i = Math.floor(Math.random()*p.length);
  const PIPS = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  const face = v => [...Array(9)].map((_,k)=>`<i class="${PIPS[v].includes(k)?'on':''}"></i>`).join('');
  const RULES = {1:'Aman, lolos',2:'Tantangan buat kamu',3:'Hukuman buat kamu',4:'Pilih satu korban',5:'Kamu & pemain di kananmu kena',6:'Kamu bebas, semua yang lain kena'};
  const turn = () => {
    setStage(`<p class="kicker">Giliran</p><div class="who">${esc(p[i])}</div><div class="die" id="die">${face(6)}</div>
      <div class="board" style="width:100%;font-size:14px;text-align:left">${Object.entries(RULES).map(([k,v])=>`<div><span>${v}</span><b style="font-size:16px">${k}</b></div>`).join('')}</div>`);
    setActions(`<button class="btn hot xl" id="roll">Kocok dadu</button>`);
    $('#roll').onclick = roll;
  };
  const roll = async () => {
    setActions(''); const die=$('#die'); die.classList.add('roll');
    let v; for(let k=0;k<10;k++){ v=1+Math.floor(Math.random()*6); die.innerHTML=face(v); beep(400+k*40,.03,'triangle'); await wait(60+k*12); }
    die.classList.remove('roll'); buzz(100); outcome(v);
  };
  const next = () => { i=(i+1)%p.length; turn(); };
  const outcome = v => {
    const me=p[i], right=p[(i+1)%p.length], others=p.filter(n=>n!==me);
    const head = `<p class="kicker">${esc(me)} dapat ${v}</p><h2 class="big">${RULES[v]}</h2>`;
    if(v===1){ setStage(head + `<p>Santai dulu.</p>`); setActions(`<button class="btn ink xl" id="n">Lanjut</button>`); $('#n').onclick=next; }
    if(v===2){
      setStage(head + `<div class="card"><div class="txt">${esc(drawTantangan())}</div></div>`);
      setActions(`<button class="btn ink xl" id="n">Udah, lanjut</button><button class="btn hot" id="no">Nggak berani → hukuman</button>`);
      $('#n').onclick=next; $('#no').onclick=()=>showHukuman([me],'Nolak tantangan dadu',next,'dadu');
    }
    if(v===3){ setStage(head); setActions(`<button class="btn hot xl" id="n">Terima nasib</button>`); $('#n').onclick=()=>showHukuman([me],'Dadu bilang begitu',next,'dadu'); }
    if(v===4){
      setStage(head + `<div class="namegrid">${others.map(n=>`<button class="btn" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>`);
      setActions(''); document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>showHukuman([b.dataset.n],`Dikorbanin ${me}`,next,'dadu'));
    }
    if(v===5){ setStage(head); setActions(`<button class="btn hot xl" id="n">Gas berdua</button>`); $('#n').onclick=()=>showHukuman([me,right],'Dadu 5: kena bareng',next,'dadu'); }
    if(v===6){ setStage(head); setActions(`<button class="btn hot xl" id="n">Hukum semua</button>`); $('#n').onclick=()=>showHukuman(others,`${me} dapat 6`,next,'dadu'); }
  };
  shell('Dadu Nasib',''); turn();
}
