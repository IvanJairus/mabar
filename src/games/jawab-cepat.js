import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 9. Jawab Cepat ---------- */
export function gameCepat(){
  const p=S.players;
  let i=0, timer=null, left=5, active=false;
  const turn=()=>{
    active=false;
    setStage(`<p class="kicker">Giliran</p><div class="who">${esc(p[i])}</div>
      <p>Sebutkan 3 hal sesuai prompt dalam 5 detik. Pemain lain menilai jawabannya.</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick=play;
  };
  const play=()=>{
    active=true; left=5;
    const prompt=drawCepat();
    setStage(`<p class="kicker">Jawab sekarang</p><div class="card"><div class="txt">${esc(prompt)}</div></div>
      <div class="who" id="clock" style="font-size:64px">5</div>`);
    setActions(`<div class="row"><button class="btn ink" id="ok">Benar</button><button class="btn hot" id="no">Gagal</button></div>`);
    beep(700,.08);
    const tick=()=>{
      if(!active) return;
      left--; const el=$('#clock'); if(el) el.textContent=left;
      if(left>0){ if(left<=2) beep(1200,.06); timer=later(tick,1000); }
      else fail('Waktu habis');
    };
    timer=later(tick,1000);
    $('#ok').onclick=()=>{ if(!active) return; active=false; clearTimeout(timer); beep(1000,.15);
      setStage(`<p class="kicker">Selamat</p><h2 class="big">Lolos!</h2><p>${esc(p[i])} berhasil jawab.</p>`);
      setActions(`<button class="btn ink xl" id="n">Giliran berikutnya</button>`); $('#n').onclick=next; };
    $('#no').onclick=()=>fail('Jawaban ditolak');
  };
  const fail=why=>{
    if(!active) return; active=false; clearTimeout(timer); beep(180,.2);
    setStage(`<p class="kicker">Gagal</p><h2 class="big">${esc(why)}</h2>`); setActions('');
    later(()=>showHukuman([p[i]],`Gagal Jawab Cepat: ${why}`,next,'tekan'),500);
  };
  const next=()=>{ i=(i+1)%p.length; turn(); };
  shell('Jawab Cepat',''); turn();
}
