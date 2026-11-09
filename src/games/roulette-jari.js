import { $, S, esc, later, clearGame, shell, beep, buzz, boom, showHukuman } from '../core/index.js';
const SPIN_MS = 6500;
/* ---------- 8. Roulette Jari ---------- */
export function gameRoulette(){
  const p = S.players;
  const intro = () => {
    shell('Roulette Jari', `<p class="kicker">Uji nyali</p><h2 class="big">Roulette Jari</h2>
      <p>Taruh HP di tengah. Tiap orang tempel <b>satu jari</b> di layar, urutan bebas. Kalau semua jari udah nempel, roulette muter di tiap jari dan berhenti di satu jari.</p>
      <p class="hint">Butuh ${p.length} jari. Jangan angkat jari sebelum roulette berhenti.</p>`,
      `<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick = start;
  };
  const start = () => {
    clearGame();
    const rt = document.createElement('div'); rt.className = 'rt';
    rt.innerHTML = `<button class="btn sm rt-exit" id="rtExit">Batal</button>
      <div class="rt-msg"><p class="kicker" style="color:#d9cfbf">Tempelkan jari</p>
      <h2 class="big">Satu orang, satu jari</h2><p id="rtHint">Butuh ${p.length} jari.</p></div>`;
    document.body.appendChild(rt);
    const hint = rt.querySelector('#rtHint');
    let phase = 'collect', readyTimer = null;
    const dots = new Map();
    const stopTimers = () => { if(readyTimer) clearTimeout(readyTimer); readyTimer = null; };
    const leave = () => { rt.remove(); intro(); };

    // Jari milik siapa nggak diketahui layar, jadi pemain yang kena menyebut namanya sendiri
    const finish = (why, hitEl) => {
      if(phase === 'done') return;
      phase = 'done'; stopTimers();
      // Jari yang kena dibiarkan terlihat jelas (lingkaran merah membesar, yang lain redup) sebelum layar pilih nama
      rt.classList.add('done');
      if(hitEl) hitEl.classList.add('hit');
      const banner = document.createElement('div'); banner.className = 'rt-banner';
      banner.innerHTML = `<b>DUARR!</b><span>Jari merah ini yang kena</span>`;
      rt.appendChild(banner); boom();
      later(() => {
        const flash = document.createElement('div'); flash.className = 'rt-flash';
        flash.innerHTML = `<div style="font-size:.55em">Jari siapa?</div>
          <div class="rt-pick">${p.map((n,k) => `<button class="btn" data-k="${k}">${esc(n)}</button>`).join('')}</div>`;
        document.body.appendChild(flash);
        flash.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
          showHukuman([p[+b.dataset.k]], why, () => { flash.remove(); leave(); }, 'tekan');
        });
      }, 3000);
    };

    const spin = () => {
      phase = 'spin';
      const els = [...dots.values()].map(d => d.el), n = els.length;
      const target = Math.floor(Math.random()*n);
      let at = Math.floor(Math.random()*n);
      // Jumlah langkah dihitung dari target supaya berhenti tepat di jari terpilih
      const steps = Math.max(3, Math.ceil(24/n))*n + ((target - at) % n + n) % n;
      const final = target;
      // Total putaran ~6,5 detik, awalnya cepat lalu melambat pelan-pelan
      const w = Array.from({length: steps}, (_, i) => .05 + Math.pow((i+1)/steps, 3));
      const sum = w.reduce((a,b) => a + b, 0), delays = w.map(x => x/sum*SPIN_MS);
      let k = 0;
      hint.textContent = 'Tahan jarimu...';
      const step = () => {
        if(phase !== 'spin') return;
        els.forEach(e => e.classList.remove('lit')); els[at].classList.add('lit');
        beep(500 + (k/steps)*700, .04, 'triangle', .08); buzz(10);
        if(k >= steps) return finish('Roulette berhenti di jarimu', els[final]);
        later(step, delays[k]);
        k++; at = (at + 1) % n;
      };
      step();
    };

    const onDown = e => {
      if(e.target.closest('button')) return;
      e.preventDefault();
      if(phase !== 'collect' || dots.has(e.pointerId) || dots.size >= p.length) return;
      const el = document.createElement('div'); el.className = 'rt-dot';
      el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px';
      rt.appendChild(el); dots.set(e.pointerId, {el}); buzz(15);
      const left = p.length - dots.size;
      hint.textContent = left ? `Butuh ${left} jari lagi.` : 'Semua siap, tahan...';
      if(!left) readyTimer = later(() => { if(dots.size === p.length) spin(); }, 700);
    };
    const onUp = e => {
      const d = dots.get(e.pointerId);
      if(!d) return;
      if(phase === 'spin') return finish('Angkat jari sebelum roulette berhenti', d.el);
      if(phase === 'collect'){
        stopTimers(); d.el.remove(); dots.delete(e.pointerId);
        hint.textContent = `Butuh ${p.length - dots.size} jari lagi.`;
      }
    };
    rt.querySelector('#rtExit').onclick = e => { e.stopPropagation(); if(phase === 'done') return; phase = 'done'; stopTimers(); leave(); };
    rt.addEventListener('pointerdown', onDown);
    rt.addEventListener('pointerup', onUp);
    rt.addEventListener('pointercancel', onUp);
  };
  intro();
}
