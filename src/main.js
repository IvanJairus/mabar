import { $, app, esc, toast, clearGame, S, save, setHomeHandler } from './core/index.js';
import { GAMES, FILTERS, TAG_LABELS } from './data/games.js';

let filter = 'semua';

function home(){
  clearGame();
  const p = S.players, ok = p.length >= 2;
  const list = GAMES.filter(g => filter==='semua' || (filter==='solo' ? g.solo : g.team));
  const ranked = [...p].sort((a,b)=>(S.kena[b]||0)-(S.kena[a]||0));
  const maxK = Math.max(0, ...p.map(n=>S.kena[n]||0));
  app.innerHTML = `<div class="wrap">
    <div class="home-top">
      <a class="btn sm home-back" href="https://www.ivanjairus.xyz/" aria-label="Kembali ke ivanjairus.xyz">← ivanjairus.xyz</a>
    </div>
    <header class="hero"><h1>Mabar</h1><p>Satu HP, 2–6 orang, oper-operan. Semua game ada hukumannya.</p></header>

    <section class="sec" aria-labelledby="hp">
      <h2 id="hp">Pemain <small>${p.length}/6</small></h2>
      <div class="players">${p.map((n,k)=>`<span class="chip">${esc(n)}<button data-del="${k}" aria-label="Hapus ${esc(n)}">×</button></span>`).join('')}</div>
      ${p.length < 6 ? `<form class="add" id="add"><input id="nm" maxlength="14" placeholder="Nama pemain" autocomplete="off" aria-label="Nama pemain"><button class="btn ink">Tambah</button></form>` : ''}
      <p class="hint">${ok ? 'Urutan nama = urutan duduk searah jarum jam.' : `Tambah ${2-p.length} pemain lagi biar bisa mulai.`}</p>
    </section>

    <section class="sec" aria-labelledby="hg">
      <h2 id="hg">Pilih game <small>${list.length} game</small></h2>
      <div class="filters" role="group" aria-label="Filter game">${Object.entries(FILTERS).map(([k,v])=>`<button data-f="${k}" aria-pressed="${k===filter}">${v}</button>`).join('')}</div>
      <ul class="games">${list.map(g => {
        const need = g.min && p.length < g.min;
        return `<li><button class="g" data-g="${GAMES.indexOf(g)}" aria-disabled="${!ok||need}">
          <span class="no">${String(GAMES.indexOf(g)+1).padStart(2,'0')}</span>
          <h3>${g.name}</h3><p>${g.how}</p>
          <span class="tags"><span class="tag">${g.min||2}–6 orang</span>${g.loud?'<span class="tag loud">Berisik</span>':''}<span class="tag">${g.solo&&g.team?'Solo &amp; Team':g.team?'Team':'Solo'}</span>${g.tags.map(t=>`<span class="tag">${TAG_LABELS[t]||t}</span>`).join('')}<span class="tag">Hukuman</span>${need?`<span class="tag">Butuh ${g.min} pemain</span>`:''}</span>
        </button></li>`; }).join('')}</ul>
    </section>

    ${p.length ? `<section class="sec" aria-labelledby="hk2">
      <h2 id="hk2">Klasemen hukuman <small><button class="btn sm" id="rst">Reset</button></small></h2>
      <div class="board">${ranked.map(n=>`<div class="${maxK && (S.kena[n]||0)===maxK?'top':''}"><span>${esc(n)}</span><b>${S.kena[n]||0}×</b></div>`).join('')}</div>
      <p class="hint">${maxK ? 'Merah = paling sering kena.' : 'Belum ada yang kena. Belum.'}</p>
    </section>` : ''}
  </div>`;

  $('#add')?.addEventListener('submit', e => {
    e.preventDefault(); const v = $('#nm').value.trim();
    if(!v) return;
    if(p.includes(v)){ $('#nm').value=''; $('#nm').placeholder='Nama itu sudah ada'; return; }
    p.push(v); save(); home(); $('#nm')?.focus();
  });
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const n=p.splice(+b.dataset.del,1)[0]; delete S.kena[n]; save(); home(); });
  document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter=b.dataset.f; home(); });
  document.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
    const g=GAMES[+b.dataset.g];
    if(p.length < 2){ toast('Isi nama pemain dulu ya, minimal 2 orang.'); return; }
    if(g.min && p.length < g.min){ toast(`Game ini butuh minimal ${g.min} pemain.`); return; }
    scrollTo(0,0); g.run();
  });
  $('#rst')?.addEventListener('click', () => { if(confirm('Reset semua hitungan hukuman?')){ S.kena={}; save(); home(); } });
}

setHomeHandler(home);
home();
