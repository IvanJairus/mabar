import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 8. Roulette Jari ---------- */
export function gameRoulette(){
  const p = S.players;
  const intro = () => {
    shell('Roulette Jari', `<p class="kicker">Uji nyali</p><h2 class="big">Roulette Jari</h2>
      <p>Taruh HP di tengah. Tempel jari satu per satu sesuai urutan nama, lalu tahan sampai ledakan.</p>
      <p class="hint">Urutan: ${p.map(esc).join(' → ')}. Jangan angkat jari sebelum DUARR.</p>`,
      `<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick = start;
  };
  const start = () => {
    clearGame();
    const rt=document.createElement('div'); rt.className='rt';
    rt.innerHTML = `<button class="btn sm rt-exit" id="rtExit">Batal</button>
      <div class="rt-msg"><p class="kicker" style="color:#d9cfbf">Tempelkan jari</p>
      <h2 class="big">Semua jari di layar</h2><p id="rtHint">Butuh ${p.length} jari. Jangan angkat.</p></div>`;
    document.body.appendChild(rt);
    const hint=rt.querySelector('#rtHint');
    let phase='collect', nextIdx=0, startAt=0, total=0, tickTimer=null, endTimer=null;
    const dots=new Map();
    const stopTimers=()=>{ if(tickTimer) clearTimeout(tickTimer); if(endTimer) clearTimeout(endTimer); tickTimer=endTimer=null; };
    const resetCollect=()=>{
      if(phase!=='collect') return;
      stopTimers(); dots.forEach(d=>d.el.remove()); dots.clear(); nextIdx=0;
      hint.textContent=`Butuh ${p.length} jari. Jangan angkat.`;
    };
    const finish=(name,why)=>{
      if(phase==='done') return;
      phase='done'; stopTimers();
      const flash=document.createElement('div'); flash.className='rt-flash';
      flash.innerHTML=`<div>DUARR!</div><div style="font-size:.55em">${esc(name)} kena</div>`;
      document.body.appendChild(flash); buzz([300,80,300]);
      later(()=>showHukuman([name],why,()=>{ flash.remove(); rt.remove(); intro(); },'tekan'),650);
    };
    const explode=()=>{
      if(phase!=='count' || !dots.size) return;
      const ids=[...dots.keys()], chosen=dots.get(rand(ids));
      chosen.el.classList.add('hit');
      finish(chosen.name,'Roulette jari memilihmu');
    };
    const tick=()=>{
      if(phase!=='count') return;
      const elapsed=Date.now()-startAt;
      if(elapsed>=total) return explode();
      beep(elapsed>total*.7?1200:700,.04); buzz(15);
      tickTimer=later(tick,Math.max(90,90+(total-elapsed)*.08));
    };
    const begin=()=>{
      if(phase!=='collect' || dots.size!==p.length) return;
      phase='count'; startAt=Date.now(); total=3000+Math.random()*2000;
      hint.textContent='TAHAN... jangan angkat jari!';
      tick(); endTimer=later(explode,total);
    };
    const onDown=e=>{
      if(e.target.closest('button')) return;
      e.preventDefault();
      if(phase!=='collect' || dots.has(e.pointerId) || nextIdx>=p.length) return;
      const name=p[nextIdx++], el=document.createElement('div');
      el.className='rt-dot'; el.textContent=name;
      el.style.left=e.clientX+'px'; el.style.top=e.clientY+'px';
      rt.appendChild(el); dots.set(e.pointerId,{name,el});
      hint.textContent=nextIdx<p.length?`Butuh ${p.length-nextIdx} jari lagi.`:'Semua siap...';
      if(nextIdx===p.length) endTimer=later(begin,350);
    };
    const onUp=e=>{
      if(!dots.has(e.pointerId)) return;
      const d=dots.get(e.pointerId);
      if(phase==='count') return finish(d.name,'Angkat jari sebelum ledakan');
      if(phase==='collect') resetCollect();
    };
    rt.querySelector('#rtExit').onclick=e=>{ e.stopPropagation(); if(phase==='done') return; stopTimers(); rt.remove(); intro(); };
    rt.addEventListener('pointerdown',onDown);
    rt.addEventListener('pointerup',onUp);
    rt.addEventListener('pointercancel',onUp);
  };
  intro();
}
