import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
import { TEBAK } from '../data/tebak.js';
/* ---------- 14. Kode Rahasia ---------- */
export function gameCodenames(){
  const p=S.players;
  let teams=[], spymasters=[], words=[], key=[], revealed=[], turn=0;
  const label=t=>t===0?'Tim Merah':'Tim Biru';
  const scoreOf=t=>key.reduce((n,c,i)=>n+(c===(t===0?'r':'b')&&revealed[i]?1:0),0);
  const setup=()=>{
    if(p.length<4){ shell('Kode Rahasia','<p>Butuh minimal 4 pemain: 2 pemberi petunjuk dan minimal 1 penebak per tim.</p>'); return; }
    teams=twoTeams();
    spymasters=[teams[0][0],teams[1][0]];
    teamIntro('Kode Rahasia', teams, ['Tim Merah','Tim Biru'],
      `Pemberi petunjuk: <b>${esc(spymasters[0])}</b> (Merah) dan <b>${esc(spymasters[1])}</b> (Biru). Tiap tim punya 3 kata, 2 netral, dan 1 bom. Satu tebakan per giliran. Setelah benar, tim boleh lanjut atau berhenti.`,
      newBoard, setup);
  };
  const newBoard=()=>{
    words=shuffle(Object.values(TEBAK).flat()).slice(0,9);
    key=shuffle(['r','r','r','b','b','b','n','n','x']);
    revealed=Array(9).fill(false);
    turn=Math.random()<.5?0:1;
    keyScreen();
  };
  const keyScreen=()=>{
    setStage(`<p class="kicker">Giliran ${label(turn)}</p><h2 class="big">Kunci rahasia</h2>
      <p>Serahkan HP ke <b>${esc(spymasters[turn])}</b>. Hanya pemberi petunjuk yang boleh melihat kunci.</p>
      <p class="hint">Skor: Merah ${scoreOf(0)}/3 · Biru ${scoreOf(1)}/3</p>`);
    setActions(`<button class="btn hot xl" id="seeKey">Lihat kunci</button>`);
    $('#seeKey').onclick=showKey;
  };
  const showKey=()=>{
    setStage(`<p class="kicker">${esc(spymasters[turn])} · ${label(turn)}</p><h2 class="big">Kunci</h2>
      <div class="cn">${key.map((c,i)=>`<button disabled class="${c}">${esc(words[i])}${c==='x'?'<small>BOM</small>':''}</button>`).join('')}</div>
      <div class="cn-legend"><span>Merah 3</span><span>Biru 3</span><span>Netral 2</span><span>Bom 1</span></div>`);
    setActions(`<button class="btn ink xl" id="hideKey">Sembunyikan &amp; mulai tebak</button>`);
    $('#hideKey').onclick=guessScreen;
  };
  const guessScreen=()=>{
    setStage(`<p class="kicker">Giliran ${label(turn)}</p><h2 class="big">Pilih 1 kata</h2>
      <p>${esc(spymasters[turn])} sudah melihat kunci. Diskusikan, lalu tekan satu kata.</p>
      <div class="cn">${words.map((w,i)=>`<button data-i="${i}" class="${revealed[i]?key[i]:''}" ${revealed[i]?'disabled':''}>${esc(w)}</button>`).join('')}</div>
      <p class="hint">Merah ${scoreOf(0)}/3 · Biru ${scoreOf(1)}/3</p>`);
    setActions('');
    document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>guess(+b.dataset.i));
  };
  const guess=i=>{
    if(revealed[i]) return;
    revealed[i]=true;
    const c=key[i];
    if(c==='x'){
      setStage(`<p class="kicker">Bom tengkorak</p><h2 class="big">${label(turn)} gugur!</h2>
        <p>Kata <b>${esc(words[i])}</b> adalah bom. ${label(1-turn)} menang.</p>`);
      setActions(`<button class="btn hot xl" id="h">Lihat hasil</button>`);
      $('#h').onclick=()=>final(1-turn, `Bom tengkorak di ${esc(words[i])}`);
      return;
    }
    const rs=scoreOf(0), bs=scoreOf(1);
    if(rs===3){ return win(0,`${label(0)} menghabiskan 3 kata duluan`); }
    if(bs===3){ return win(1,`${label(1)} menghabiskan 3 kata duluan`); }
    const own=(turn===0&&c==='r')||(turn===1&&c==='b');
    const other=1-turn;
    if(own){
      setStage(`<p class="kicker">Benar</p><h2 class="big">${esc(words[i])} milik ${label(turn)}</h2>
        <p>Skor: Merah ${rs}/3 · Biru ${bs}/3</p>`);
      setActions(`<div class="row"><button class="btn ink" id="again">Tebak lagi</button><button class="btn" id="endTurn">Akhiri giliran</button></div>`);
      $('#again').onclick=guessScreen;
      $('#endTurn').onclick=passTurn;
    } else {
      setStage(`<p class="kicker">${c==='n'?'Netral':'Salah'}</p><h2 class="big">${esc(words[i])} ${c==='n'?'netral':`milik ${label(other)}`}</h2>
        <p>Skor: Merah ${rs}/3 · Biru ${bs}/3</p>`);
      setActions(`<button class="btn ink xl" id="pass">Giliran ${label(other)}</button>`);
      $('#pass').onclick=passTurn;
    }
  };
  const passTurn=()=>{ turn=1-turn; keyScreen(); };
  const win=(winner,why)=>{
    setStage(`<p class="kicker">Selesai</p><h2 class="big">${label(winner)} menang!</h2>
      <p>${why}</p><p class="hint">Skor: Merah ${scoreOf(0)}/3 · Biru ${scoreOf(1)}/3</p>`);
    setActions(`<button class="btn hot xl" id="h">Lihat hasil</button>`);
    $('#h').onclick=()=>final(winner,why);
  };
  const final=(winner,why)=>{
    const loser=1-winner, losers=teams[loser];
    setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">
      <div class="${loser===0?'top':''}"><span>Tim Merah <small>(${teams[0].length} orang)</small></span><b>${scoreOf(0)}/3</b></div>
      <div class="${loser===1?'top':''}"><span>Tim Biru <small>(${teams[1].length} orang)</small></span><b>${scoreOf(1)}/3</b></div></div>
      <p class="hint">${why}. ${label(loser)} kena hukuman.</p>`);
    setActions(`<button class="btn hot xl" id="h">Hukum tim kalah</button>`);
    $('#h').onclick=()=>showHukuman(losers, why, setup, 'roda');
  };
  if(p.length<4){ shell('Kode Rahasia','<p>Butuh minimal 4 pemain.</p>'); return; }
  shell('Kode Rahasia',''); setup();
}
