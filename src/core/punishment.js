import { HUKUMAN } from '../data/hukuman.js';
import { drawHukuman } from './decks.js';
import { S, save } from './state.js';
import { $, esc } from './ui.js';
import { rand } from './random.js';
import { beep, boom } from './audio.js';

const dlg = $('#hk');
dlg.addEventListener('cancel', e => e.preventDefault());

export function showHukuman(names, reason, done, jenis='roda'){
  const pool = HUKUMAN[jenis] || HUKUMAN.roda, draw = drawHukuman[jenis] || drawHukuman.roda;
  const title = names.length ? names.map(esc).join(' & ') : 'Yang kalah';
  dlg.innerHTML = `<div class="hk">
    <p class="kicker" style="color:#fff">Kena hukuman</p>
    <div class="mid">
      <div class="names" id="hkNames">${title}</div>
      ${reason ? `<p class="reason">${esc(reason)}</p>` : ''}
      <div class="pun" id="pun" aria-live="polite"></div>
    </div>
    <div class="row"><button class="btn" id="hkAgain">Ganti hukuman</button><button class="btn ink" id="hkDone">Udah dijalanin</button></div>
  </div>`;
  dlg.showModal(); boom();
  const pun = $('#pun');
  const spin = () => {
    $('#hkAgain').disabled = $('#hkDone').disabled = true;
    let n = 0;
    const iv = setInterval(() => {
      pun.textContent = rand(pool); beep(300 + n*25, .03, 'triangle', .05);
      if(++n > 14){ clearInterval(iv); pun.textContent = draw(); beep(880,.15,'square',.1);
        $('#hkAgain').disabled = $('#hkDone').disabled = false; $('#hkDone').focus(); }
    }, 70);
  };
  spin();
  $('#hkAgain').onclick = spin;
  $('#hkDone').onclick = () => {
    names.forEach(n => S.kena[n] = (S.kena[n]||0) + 1); save();
    dlg.close(); done && done();
  };
}
