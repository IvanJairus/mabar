import { $, S, esc, later, shell, setStage, setActions, beep, buzz, showHukuman, drawGambar } from '../core/index.js';

const SIZE = 720;

export function gameGambar(){
  const p = S.players;
  let i = Math.floor(Math.random()*p.length), word, strokes, left, timer, active;

  const intro = () => {
    word = drawGambar();
    setStage(`<p class="kicker">Gambar Buta</p><h2 class="big">${esc(p[i])}</h2>
      <p>Pegang HP, lihat kata rahasianya, lalu gambar pakai jari. Gambarnya <b>nggak kelihatan</b> sampai waktu habis. Yang lain: jangan ngintip, siap-siap nebak.</p>`);
    setActions(`<button class="btn ink xl" id="see">Lihat kata</button>`);
    $('#see').onclick = peek;
  };

  const peek = () => {
    setStage(`<p class="kicker">Kata rahasia</p><div class="card"><div class="txt">${esc(word)}</div></div><p>Hafalin dulu. Setelah mulai, kamu punya 20 detik.</p>`);
    setActions(`<div class="row"><button class="btn" id="skip">Ganti kata</button><button class="btn hot" id="start">Mulai gambar</button></div>`);
    $('#skip').onclick = () => { word = drawGambar(); peek(); };
    $('#start').onclick = draw;
  };

  const draw = () => {
    active = true; strokes = []; left = 20;
    setStage(`<p class="kicker">Gambar: ${esc(word)}</p><div class="who" id="clock">${left}</div>
      <canvas class="blind" id="cv" width="${SIZE}" height="${SIZE}" aria-label="Kanvas gambar, hasilnya disembunyikan"></canvas>
      <p class="hint">Layarnya sengaja kosong. Percaya sama insting.</p>`);
    setActions(`<button class="btn ink xl" id="done">Selesai</button>`);
    const cv = $('#cv'); let cur = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX-r.left)*SIZE/r.width, (e.clientY-r.top)*SIZE/r.height]; };
    cv.onpointerdown = e => { cur = [pt(e)]; strokes.push(cur); cv.setPointerCapture(e.pointerId); buzz(8); };
    cv.onpointermove = e => { if(cur) cur.push(pt(e)); };
    cv.onpointerup = cv.onpointercancel = () => { cur = null; };
    $('#done').onclick = reveal;
    timer = later(tick, 1000);
  };

  const tick = () => {
    if(!active) return;
    left--; const el = $('#clock');
    if(el){ el.textContent = left; el.classList.toggle('urgent', left <= 5); }
    if(left <= 0) return reveal();
    if(left <= 3) beep(1100,.05);
    timer = later(tick, 1000);
  };

  const reveal = () => {
    if(!active) return; active = false; clearTimeout(timer); beep(700,.15);
    setStage(`<p class="kicker">Hasil gambar ${esc(p[i])}</p><canvas class="blind shown" id="cv" width="${SIZE}" height="${SIZE}"></canvas>
      <p>Semua tebak sekarang. Kata aslinya masih rahasia.</p>`);
    const ctx = $('#cv').getContext('2d');
    ctx.lineWidth = 12; ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = '#1B1A17';
    strokes.forEach(s => {
      ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]);
      if(s.length === 1) ctx.lineTo(s[0][0]+.1, s[0][1]);
      s.slice(1).forEach(q => ctx.lineTo(q[0], q[1])); ctx.stroke();
    });
    setActions(`<div class="row"><button class="btn hot" id="no">Nggak ada yang bener</button><button class="btn ink" id="yes">Ada yang bener</button></div>`);
    $('#yes').onclick = () => result(true); $('#no').onclick = () => result(false);
  };

  const result = ok => {
    beep(ok ? 1000 : 180, .2);
    setStage(`<p class="kicker">Jawabannya</p><h2 class="big">${esc(word)}</h2><p>${ok ? 'Ketebak. Gambar buta pun lolos, ' + esc(p[i]) + ' aman.' : 'Gambarmu terlalu abstrak, ' + esc(p[i]) + '.'}</p>`);
    if(ok){
      setActions(`<button class="btn ink xl" id="n">Giliran berikutnya</button>`); $('#n').onclick = next;
    }else{
      setActions('');
      later(() => showHukuman([p[i]], `Gambar "${word}" nggak ada yang bisa nebak`, next, 'gambar'), 700);
    }
  };

  const next = () => { i = (i+1) % p.length; intro(); };
  shell('Gambar Buta', ''); intro();
}
