import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 6. Tekan Duluan ---------- */
export function gameTekan(){
  const p = S.players, n = p.length;
  shell('Tekan Duluan', `<h2 class="big">Tekan Duluan</h2>
    <p>Taruh HP di tengah meja. Tiap orang pegang kotaknya masing-masing.
    Kotak hitam = <b>tahan</b>. Kotak merah = <b>tekan secepatnya</b>.<br>Curi start atau paling lambat: kena hukuman.</p>`,
    `<button class="btn hot xl" id="go">Mulai</button>`);
  $('#go').onclick = open;
  function open(){
    const cols = n===2 ? 1 : 2, rows = Math.ceil(n/cols);
    const fs = document.createElement('div'); fs.className='fs';
    fs.innerHTML = `<div class="zones" style="grid-template:repeat(${rows},1fr)/repeat(${cols},1fr)">
      ${p.map((name,k)=>`<button class="zone ${k < Math.ceil(rows/2)*cols && rows>1 ? 'flip':''}" data-k="${k}"><span>${esc(name)}<br><small></small></span></button>`).join('')}
      </div><div class="signal" id="sig" aria-live="assertive">Siap?</div>
      <div class="fs-actions"><button class="btn" id="x">Keluar</button><button class="btn ink" id="r">Ronde baru</button></div>`;
    document.body.appendChild(fs);
    const sig = fs.querySelector('#sig'), zones=[...fs.querySelectorAll('.zone')];
    let phase='idle', order=[], goAt=0, t;
    fs.querySelector('#x').onclick = () => { clearGame(); };
    fs.querySelector('#r').onclick = round;
    const finish = (losers, why) => {
      phase='result'; clearTimeout(t);
      losers.forEach(k => zones[k].classList.add('loser'));
      later(() => showHukuman(losers.map(k=>p[k]), why, () => { fs.className='fs'; sig.textContent='Siap ronde berikutnya?'; }, 'tekan'), 700);
    };
    zones.forEach(z => z.onpointerdown = e => {
      e.preventDefault(); const k=+z.dataset.k;
      if(phase==='wait'){ boom(); sig.textContent=`${p[k]} CURI START!`; z.classList.add('done'); return finish([k], 'Curi start, nekan sebelum merah'); }
      if(phase!=='go' || order.includes(k)) return;
      order.push(k); const ms = Date.now()-goAt;
      z.classList.add('done'); z.querySelector('small').textContent = `#${order.length} · ${ms} ms`; beep(600+order.length*120,.06);
      if(order.length===n) finish([order[n-1]], 'Paling lambat nekan');
    });
    function round(){
      if(phase==='wait' || phase==='go') return;
      order=[]; zones.forEach(z=>{ z.classList.remove('done','loser'); z.querySelector('small').textContent=''; });
      phase='wait'; fs.className='fs wait'; sig.textContent='TAHAN... jangan dipencet';
      t = later(() => {
        phase='go'; goAt=Date.now(); fs.className='fs go'; sig.textContent='TEKAN!'; beep(1300,.2,'square',.15); buzz(150);
        // Yang belum nekan dalam 3 detik dianggap kalah
        t = later(() => { if(phase==='go'){ const slow=p.map((_,k)=>k).filter(k=>!order.includes(k)); finish(slow,'Nggak nekan sama sekali'); } }, 3000);
      }, 1500 + Math.random()*4000);
    }
    round();
  }
}
