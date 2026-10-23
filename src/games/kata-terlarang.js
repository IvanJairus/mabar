import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 10. Kata Terlarang ---------- */
export function gameTaboo(){
  const p=S.players;
  let i=0, timer=null, left=30, active=false, card=null;
  const turn=()=>{
    active=false;
    setStage(`<p class="kicker">Giliran</p><div class="who">${esc(p[i])}</div>
      <p>Polisi sensor: <b>${esc(p[(i+1)%p.length])}</b> (pemain di kananmu).</p>
      <p>Pegang HP menghadapmu. Jelaskan kata rahasia tanpa menyebut 3 kata terlarang. 30 detik.</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick=play;
  };
  const play=()=>{
    card=drawTaboo(); active=true; left=30;
    setStage(`<p class="kicker">Kata rahasia</p>
      <div class="card"><div class="taboo-label">Jelaskan tanpa menyebut</div>
        <div class="taboo-word">${esc(card.w)}</div>
        <div class="taboo-no">${card.no.map(w=>`<span>${esc(w)}</span>`).join('')}</div></div>
      <p class="hint">Polisi sensor: <b>${esc(p[(i+1)%p.length])}</b> · <span id="clock">30</span> detik</p>`);
    setActions(`<div class="row"><button class="btn ink" id="ok">Tebak!</button><button class="btn hot" id="no">Keceplosan</button></div>`);
    beep(900,.2);
    const tick=()=>{
      if(!active) return;
      left--; const el=$('#clock'); if(el) el.textContent=left;
      if(left>0){ if(left<=5) beep(1200,.05); timer=later(tick,1000); }
      else fail('Waktu habis');
    };
    timer=later(tick,1000);
    $('#ok').onclick=success;
    $('#no').onclick=()=>fail('Keceplosan menyebut kata terlarang');
  };
  const success=()=>{
    if(!active) return; active=false; clearTimeout(timer); beep(1000,.15);
    setStage(`<p class="kicker">Berhasil</p><h2 class="big">Tebak!</h2><p>${esc(p[i])} berhasil menjelaskan <b>${esc(card.w)}</b>.</p>`);
    setActions(`<button class="btn ink xl" id="n">Giliran berikutnya</button>`); $('#n').onclick=next;
  };
  const fail=why=>{
    if(!active) return; active=false; clearTimeout(timer); beep(180,.2);
    setStage(`<p class="kicker">Gagal</p><h2 class="big">${esc(why)}</h2>`); setActions('');
    later(()=>showHukuman([p[i]],why,next,'tebak'),500);
  };
  const next=()=>{ i=(i+1)%p.length; turn(); };
  shell('Kata Terlarang',''); turn();
}
