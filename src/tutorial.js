import { $, app, esc, toast, clearGame, S } from './core/index.js';
import { GAMES } from './data/games.js';
import { BASICS, TUTORIAL } from './data/tutorial.js';
import { howtoBody } from './core/howto.js';

export function tutorial(goHome){
  clearGame();
  const list = GAMES.map((g, idx) => ({g, idx, t: TUTORIAL[g.name]})).filter(x => x.t);
  app.innerHTML = `<div class="wrap">
    <div class="home-top"><button class="btn sm" id="tBack">← Beranda</button></div>
    <header class="hero"><h1>Cara Main</h1><p>Tiga langkah dasar dulu, abis itu pilih game buat liat aturannya.</p></header>

    <section class="sec"><div class="basics">${BASICS.map((b,k) => `<div class="basic"><span class="bi" aria-hidden="true">0${k+1}</span><b>${esc(b.t)}</b><span>${esc(b.d)}</span></div>`).join('')}</div></section>

    <section class="sec" aria-labelledby="tj"><h2 id="tj">Skip ke game</h2>
      <div class="jump">${list.map(x => `<button data-j="${x.idx}" title="${esc(x.g.name)}" aria-label="${esc(x.g.name)}">${String(x.idx+1).padStart(2,'0')}</button>`).join('')}</div></section>

    <section class="sec"><div class="tcards">${list.map(x => {
      const g = x.g, t = x.t;
      return `<details class="tcard" id="t${x.idx}">
        <summary><span class="ti" aria-hidden="true">${String(x.idx+1).padStart(2,'0')}</span><span class="tn"><b>${esc(g.name)}</b><small>${g.min||2}–6 orang · ${g.loud?'Berisik':'Tenang'}${g.team?' · Ada Team':''}</small></span></summary>
        ${howtoBody(t)}
        <button class="btn sm ink" data-play="${x.idx}">Main sekarang</button>
      </details>`; }).join('')}</div></section>
  </div>`;

  $('#tBack').onclick = goHome;
  document.querySelectorAll('[data-j]').forEach(b => b.onclick = () => {
    const el = $('#t'+b.dataset.j); el.open = true; el.scrollIntoView({behavior:'smooth', block:'start'});
  });
  document.querySelectorAll('[data-play]').forEach(b => b.onclick = () => {
    const g = GAMES[+b.dataset.play];
    if(S.players.length < 2) return toast('Isi nama pemain dulu di beranda ya, minimal 2 orang.');
    if(g.min && S.players.length < g.min) return toast(`Game ini butuh minimal ${g.min} pemain.`);
    scrollTo(0,0); g.run();
  });
}
