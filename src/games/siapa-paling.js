import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 4. Siapa Paling...? ---------- */
export function gameSiapa(){
  const p = S.players;
  const q = () => {
    setStage(`<p class="kicker">Siapa paling mungkin...</p><div class="card"><div class="txt">${esc(drawSiapa())}?</div></div>
      <p>Bacain keras-keras. Pas hitungan habis, semua langsung nunjuk satu orang. Nggak boleh nunjuk diri sendiri.</p>`);
    setActions(`<button class="btn hot xl" id="go">Hitung 3, 2, 1</button><button class="btn" id="skip">Pertanyaan lain</button>`);
    $('#skip').onclick = q;
    $('#go').onclick = async () => {
      setActions(''); const big = document.createElement('div'); big.className='who'; big.style.fontSize='120px';
      $('#stage').prepend(big); await countdown(big); big.textContent='TUNJUK!'; beep(1100,.3); buzz(200);
      await wait(900); vote();
    };
  };
  const vote = () => {
    setStage(`<p class="kicker">Siapa paling banyak ditunjuk?</p>
      <div class="namegrid">${p.map((n,k)=>`<button class="btn" data-k="${k}">${esc(n)}</button>`).join('')}</div>`);
    setActions(`<button class="btn" id="tie">Seri, semua yang seri kena</button><button class="btn" id="none">Lewati</button>`);
    document.querySelectorAll('[data-k]').forEach(b => b.onclick = () => showHukuman([p[b.dataset.k]], 'Paling banyak ditunjuk', q, 'siapa'));
    $('#none').onclick = q;
    $('#tie').onclick = () => {
      setStage(`<p class="kicker">Pilih semua yang seri</p>
        <div class="namegrid">${p.map((n,k)=>`<button class="btn" data-t="${k}" aria-pressed="false">${esc(n)}</button>`).join('')}</div>`);
      document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
        const on = b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed', on); b.classList.toggle('ink', on);
      });
      setActions(`<button class="btn hot xl" id="h">Hukum mereka</button>`);
      $('#h').onclick = () => {
        const sel = [...document.querySelectorAll('[data-t][aria-pressed=true]')].map(b => p[b.dataset.t]);
        if(sel.length) showHukuman(sel, 'Seri paling banyak ditunjuk', q, 'siapa');
      };
    };
  };
  shell('Siapa Paling...?',''); q();
}
