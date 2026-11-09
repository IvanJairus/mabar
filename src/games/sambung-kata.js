import { $, S, esc, later, shell, setStage, setActions, beep, buzz, showHukuman, drawSambung } from '../core/index.js';

const norm = w => w.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');

export function gameSambung(){
  const p = S.players;
  let i = Math.floor(Math.random()*p.length), cat, used, last, letter, lastBy, turns, left, timer, active;

  const newRound = () => {
    cat = drawSambung(); used = new Set(); last = ''; letter = ''; lastBy = -1; turns = 0;
    setStage(`<p class="kicker">Kategori ronde ini</p><h2 class="big">${esc(cat)}</h2>
      <p>Mulai dari <b>${esc(p[i])}</b>. Ketik kata sesuai kategori, lalu kata berikutnya wajib diawali <b>huruf terakhir</b> kata sebelumnya. Dilarang ngulang kata.</p>`);
    setActions(`<div class="row"><button class="btn" id="cat">Ganti kategori</button><button class="btn hot" id="go">Gas mulai</button></div>`);
    $('#cat').onclick = newRound; $('#go').onclick = turn;
  };

  const turn = () => {
    active = true; left = Math.max(4, 10 - Math.floor(turns/3));
    const need = letter
      ? `<div><p class="kicker" style="margin-bottom:6px">Wajib diawali huruf</p><div class="sk-tile">${letter.toUpperCase()}</div></div>`
      : `<p style="margin:0"><span class="who">Bebas</span><br><span class="hint">Kata pertama boleh huruf apa aja</span></p>`;
    setStage(`<p class="kicker">${esc(cat)}</p><div class="who">${esc(p[i])}</div>
      ${need}
      ${last ? `<p class="hint">Kata sebelumnya: <b>${esc(last)}</b> (${used.size} kata)</p>` : ''}
      <form class="add" id="f" style="width:100%"><input id="w" autocomplete="off" autocapitalize="none" placeholder="Ketik kata di sini" aria-label="Kata"><button class="btn ink">Sip</button></form>
      <div class="who" id="clock" aria-live="off">${left}</div>`);
    setActions(`<div class="row">${lastBy>=0?'<button class="btn" id="gugat">Gugat kata tadi</button>':''}<button class="btn hot" id="nyerah">Nyerah</button></div>`);
    const w = $('#w'); w.focus();
    $('#f').onsubmit = e => { e.preventDefault(); submit(w.value); };
    $('#nyerah').onclick = () => fail('Nyerah, kehabisan kata');
    if($('#gugat')) $('#gugat').onclick = gugat;
    clearTimeout(timer); timer = later(tick, 1000);
  };

  const tick = () => {
    if(!active) return;
    left--; const el = $('#clock');
    if(el){ el.textContent = left; el.classList.toggle('urgent', left <= 3); }
    if(left <= 0) return fail('Waktu habis, mikirnya kelamaan');
    if(left <= 3) beep(1100,.05);
    timer = later(tick, 1000);
  };

  const submit = raw => {
    const w = norm(raw);
    if(w.length < 2) return toast0('Minimal 2 huruf ya');
    if(letter && w[0] !== letter) return toast0(`Wajib diawali huruf ${letter.toUpperCase()}`);
    if(used.has(w)) return toast0('Kata itu udah dipakai di ronde ini');
    active = false; clearTimeout(timer);
    used.add(w); last = w; letter = w[w.length-1]; lastBy = i; turns++;
    beep(900,.06); buzz(20);
    i = (i+1) % p.length; turn();
  };

  const toast0 = msg => { beep(220,.1); let h = $('#err'); if(!h){ h = document.createElement('p'); h.id = 'err'; h.className = 'hint'; h.style.color = 'var(--red)'; $('#f').after(h); } h.textContent = msg; };

  const gugat = () => {
    active = false; clearTimeout(timer);
    setStage(`<p class="kicker">Gugatan</p><h2 class="big">${esc(last)}</h2><p>Semua pemain sepakat kata ini <b>nggak masuk</b> kategori <b>${esc(cat)}</b>?</p>`);
    setActions(`<div class="row"><button class="btn" id="no">Sah, lanjut</button><button class="btn hot" id="yes">Nggak sah, hukum</button></div>`);
    $('#no').onclick = () => { active = true; turn(); };
    $('#yes').onclick = () => { i = lastBy; fail(`Kata "${last}" ditolak untuk kategori ${cat}`); };
  };

  const fail = why => {
    active = false; clearTimeout(timer); beep(180,.25); buzz(200);
    setStage(`<p class="kicker">Gugur</p><h2 class="big">${esc(p[i])}</h2><p>${esc(why)}</p>`); setActions('');
    later(() => showHukuman([p[i]], why, () => { i = (i+1)%p.length; newRound(); }, 'sambung'), 500);
  };

  shell('Sambung Kata', ''); newRound();
}
