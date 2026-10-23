import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 1. Bom Waktu ---------- */
export function gameBom(){
  const p = S.players;
  let holder, running=false, start, total, cat;
  const reset = () => {
    running=false; holder=Math.floor(Math.random()*p.length); cat=drawKategori();
    setStage(`<p class="kicker">Kategori</p><h2 class="big">${esc(cat)}</h2>
      <p>Mulai dari <b>${esc(p[holder])}</b>. Jawab satu, lalu tekan OPER dan kasih HP ke kanan.<br>Jawaban nggak boleh diulang!</p>
      <div class="bomb" id="bomb" aria-hidden="true"></div>`);
    setActions(`<button class="btn hot xl" id="go">Nyalain bom</button><button class="btn" id="cat">Ganti kategori</button>`);
    $('#go').onclick = startBom; $('#cat').onclick = reset;
  };
  const startBom = () => {
    running=true; start=Date.now(); total=12000 + Math.random()*33000; buzz(60);
    setStage(`<p class="kicker">${esc(cat)}</p><p style="margin:0">Pegang HP</p><div class="who" id="who">${esc(p[holder])}</div>
      <div class="bomb" id="bomb" aria-hidden="true"></div>`);
    setActions(`<button class="btn ink xl" id="pass" style="padding:34px">OPER →</button>`);
    $('#pass').onclick = () => { holder=(holder+1)%p.length; $('#who').textContent=p[holder]; beep(1000,.05); buzz(30); };
    tick();
  };
  const tick = () => {
    if(!running) return;
    const el = Date.now()-start;
    if(el >= total){ return explode(); }
    const b=$('#bomb'); b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick');
    beep(el > total*.7 ? 1200 : 800, .04);
    // Detak makin cepat seiring waktu, bukan sisa waktu, jadi nggak bisa ditebak kapan meledak
    later(tick, Math.max(140, 800 - el*0.022));
  };
  const explode = () => {
    running=false; $('#bomb').classList.add('boom');
    setActions(''); later(() => showHukuman([p[holder]], 'Bomnya meledak di tangannya', reset, 'bom'), 500);
  };
  shell('Bom Waktu',''); reset();
}
