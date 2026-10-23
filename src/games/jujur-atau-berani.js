import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 2. Jujur atau Berani ---------- */
export function gameTod(){
  const p = S.players; let i = Math.floor(Math.random()*p.length);
  const turn = () => {
    setStage(`<p class="kicker">Giliran</p><div class="who">${esc(p[i])}</div><p>Pilih satu. Nolak berarti kena hukuman.</p>`);
    setActions(`<div class="row"><button class="btn xl" id="j">Jujur</button><button class="btn hot xl" id="b">Berani</button></div>`);
    $('#j').onclick = () => card('Jujur', drawJujur);
    $('#b').onclick = () => card('Berani', drawTantangan);
  };
  const card = (type, draw) => {
    beep(700,.06);
    setStage(`<p class="kicker">${type} · ${esc(p[i])}</p><div class="card"><div class="txt" id="txt">${esc(draw())}</div></div>
      <button class="btn sm" id="other">Kartu lain (1x)</button>`);
    $('#other').onclick = e => { $('#txt').textContent = draw(); e.target.remove(); };
    setActions(`<button class="btn ink xl" id="ok">Udah, lanjut</button><button class="btn hot" id="no">Nggak berani → hukuman</button>`);
    $('#ok').onclick = next;
    $('#no').onclick = () => showHukuman([p[i]], `Nolak ${type.toLowerCase()}`, next, 'jujur');
  };
  const next = () => { i=(i+1)%p.length; turn(); };
  shell('Jujur atau Berani',''); turn();
}
