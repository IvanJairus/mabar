import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 7. Roda Hukuman ---------- */
export function gameRoda(){
  const p = S.players;
  shell('Roda Hukuman', `<h2 class="big">Siapa yang kena?</h2><p>Buat main game lain di luar HP (kartu, ludo, apa aja). Pilih yang kalah, hukumannya diacak.</p>
    <div class="namegrid">${p.map((n,k)=>`<button class="btn" data-k="${k}">${esc(n)}</button>`).join('')}<button class="btn ink" id="acak">Acak orangnya juga</button></div>`);
  document.querySelectorAll('[data-k]').forEach(b => b.onclick = () => showHukuman([p[b.dataset.k]], '', null, 'roda'));
  $('#acak').onclick = () => showHukuman([rand(p)], 'Dipilih acak', null, 'roda');
}
