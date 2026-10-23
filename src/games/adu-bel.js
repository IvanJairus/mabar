import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 12. Adu Bel ---------- */
export function gameBuzzer(){
  const p=S.players, target=5;
  let overlay=null, timer=null;
  const makeQuestion=()=>{ const c=drawBuzzerKategori(); return `Sebutkan 3 ${c.charAt(0).toLowerCase()}${c.slice(1)}!`; };

  const chooseMode=()=>{
    shell('Adu Bel', `<p class="kicker">Pilih mode</p><h2 class="big">Adu Bel</h2>
      <p>HP di tengah meja. Yang paling cepat menekan bel, dia yang menjawab.</p>
      <div class="namegrid">
        <button class="btn" data-bm="team">Team</button>
        <button class="btn" data-bm="solo">Solo</button>
      </div>
      <p class="hint">Team: 2 tim, salah memberi poin ke lawan. Solo: semua pemain berebut, salah bisa dicuri.</p>`);
    setActions('');
    document.querySelectorAll('[data-bm]').forEach(b=>b.onclick=()=>b.dataset.bm==='team'?setupTeam():setupSolo());
  };

  // Mode team
  let teams=[], scores=[0,0], locked=false, resolved=false, active=0, q='';
  const teamName=t=>t===0?'Tim Merah':'Tim Biru';
  const setupTeam=()=>{
    teams=twoTeams();
    teamIntro('Adu Bel', teams, ['Tim Merah','Tim Biru'],
      'HP di tengah meja. Tim yang menekan bel duluan punya 6 detik untuk menjawab. Benar dapat 1 poin, salah poin untuk lawan. Pertama ke 5 poin menang.',
      startTeamGame, setupTeam);
    const acts=$('#actions');
    if(acts) acts.insertAdjacentHTML('beforeend','<button class="btn" id="modeSwitch">Ganti mode</button>');
    const sw=$('#modeSwitch'); if(sw) sw.onclick=chooseMode;
  };
  const startTeamGame=()=>{ scores=[0,0]; openTeam(); };
  const teamTop=()=>`<div class="buzz-top"><span>${teamName(0)} ${scores[0]} : ${scores[1]} ${teamName(1)}</span>
    <div style="display:flex;gap:6px"><button class="btn sm" id="skipQ">Ganti</button><button class="btn sm" id="exitBuzz">Keluar</button></div></div>`;
  const bindTeamTop=()=>{
    overlay.querySelector('#exitBuzz').onclick=()=>{ clearTimeout(timer); overlay.remove(); };
    overlay.querySelector('#skipQ').onclick=()=>{ if(!locked) teamRound(); };
  };
  const teamRound=()=>{
    if(!overlay || !overlay.isConnected) return;
    clearTimeout(timer); locked=false; resolved=false; active=0; q=makeQuestion();
    overlay.innerHTML=`${teamTop()}<div class="buzz-q">${esc(q)}</div>
      <div class="buzzers">
        <button class="buzzer red" data-team="0">Tim Merah<small>${teams[0].map(esc).join(', ')}</small></button>
        <button class="buzzer blue" data-team="1">Tim Biru<small>${teams[1].map(esc).join(', ')}</small></button>
      </div>
      <p class="hint" style="text-align:center;margin:4px 0 0">Pertama ke ${target} poin menang.</p>`;
    bindTeamTop();
    overlay.querySelectorAll('[data-team]').forEach(b=>b.onclick=()=>teamBuzz(+b.dataset.team));
  };
  const teamBuzz=team=>{
    if(locked) return; locked=true; resolved=false; active=team;
    let left=6;
    overlay.innerHTML=`${teamTop()}<div class="buzz-wait">
      <p class="kicker">${teamName(team)} menekan bel</p>
      <div class="who" id="left">6</div>
      <p>Jawab lantang bareng tim. Hakim bisa menekan Benar/Salah kapan saja.</p>
      <div class="buzz-actions"><button class="btn ink" id="benar">Benar</button><button class="btn hot" id="salah">Salah</button></div>
    </div>`;
    bindTeamTop();
    overlay.querySelector('#benar').onclick=()=>teamResolve(true);
    overlay.querySelector('#salah').onclick=()=>teamResolve(false,'Jawaban salah');
    const tick=()=>{
      if(!overlay || !overlay.isConnected || resolved) return;
      left--;
      if(left>0){ const el=overlay.querySelector('#left'); if(el) el.textContent=left; beep(900,.05); timer=later(tick,1000); }
      else teamJudge(team);
    };
    timer=later(tick,1000);
  };
  const teamJudge=team=>{
    if(!overlay || !overlay.isConnected || resolved) return;
    clearTimeout(timer);
    overlay.innerHTML=`${teamTop()}<div class="buzz-wait">
      <p class="kicker">${teamName(team)} · waktu habis</p>
      <h2 class="big">Jawaban benar?</h2>
      <p>Hakim memutuskan sekarang.</p>
      <div class="buzz-actions"><button class="btn ink" id="benar">Benar</button><button class="btn hot" id="salah">Salah</button></div>
    </div>`;
    bindTeamTop();
    overlay.querySelector('#benar').onclick=()=>teamResolve(true);
    overlay.querySelector('#salah').onclick=()=>teamResolve(false,'Jawaban salah');
  };
  const teamResolve=(ok,why='')=>{
    if(!overlay || !overlay.isConnected || resolved) return;
    resolved=true; locked=true; clearTimeout(timer);
    const scorer=ok?active:1-active;
    scores[scorer]++;
    const msg=ok?`+1 untuk ${teamName(active)}`:`Poin untuk ${teamName(1-active)}`;
    overlay.innerHTML=`${teamTop()}<div class="buzz-wait">
      <p class="kicker">${ok?'Benar':'Salah'}</p>
      <h2 class="big">${msg}</h2>
      <p>${why?esc(why)+'. ':''}Skor ${scores[0]} : ${scores[1]}</p>
    </div>`;
    bindTeamTop();
    const done=scores[0]>=target || scores[1]>=target;
    later(()=>{ if(!overlay || !overlay.isConnected) return; if(done) finalTeam(); else teamRound(); }, 1200);
  };
  const finalTeam=()=>{
    clearTimeout(timer);
    if(overlay) overlay.remove();
    const winner=scores[0]>=target?0:1, loser=1-winner, losers=teams[loser];
    setStage(`<p class="kicker">Hasil Team</p><div class="board" style="width:100%">
      <div class="${loser===0?'top':''}"><span>Tim Merah <small>(${teams[0].length} orang)</small></span><b>${scores[0]}</b></div>
      <div class="${loser===1?'top':''}"><span>Tim Biru <small>(${teams[1].length} orang)</small></span><b>${scores[1]}</b></div></div>
      <p class="hint">${teamName(winner)} menang. ${teamName(loser)} kena hukuman.</p>`);
    setActions(`<button class="btn hot xl" id="h">Hukum tim kalah</button>`);
    $('#h').onclick=()=>showHukuman(losers, `Kalah ${scores[loser]} - ${scores[winner]} di Adu Bel Team`, setupTeam, 'roda');
  };
  const openTeam=()=>{
    if(overlay) overlay.remove();
    overlay=document.createElement('div'); overlay.className='buzz';
    document.body.appendChild(overlay);
    teamRound();
  };

  // Mode solo free-for-all dengan steal
  let soloOverlay=null, soloTimer=null, soloScores=[], soloFirst=null, soloSteal=null, soloPhase='', soloResolved=false, soloJudging=false, soloLeft=6, soloQ='';
  const setupSolo=()=>{
    setStage(`<p class="kicker">Mode Solo</p><h2 class="big">Free-for-all</h2>
      <p>Semua pemain berebut menekan zona masing-masing. Yang pertama benar dapat 1 poin. Kalau salah atau waktu habis, pemain tercepat kedua boleh mencuri.</p>
      <div class="teams">${p.map(n=>`<div class="teamrow"><span>${esc(n)}</span><span class="teamnames">0 poin</span></div>`).join('')}</div>
      <p class="hint">Pertama ke ${target} poin menang. Poin terendah kena hukuman.</p>`);
    setActions(`<div class="row"><button class="btn" id="modeSwitch">Ganti mode</button><button class="btn ink" id="startSolo">Mulai</button></div>`);
    $('#modeSwitch').onclick=chooseMode;
    $('#startSolo').onclick=startSoloGame;
  };
  const startSoloGame=()=>{
    soloScores=Array(p.length).fill(0);
    if(soloOverlay) soloOverlay.remove();
    soloOverlay=document.createElement('div'); soloOverlay.className='buzz';
    document.body.appendChild(soloOverlay);
    soloQuestion();
  };
  const soloTop=withSkip=>`<div class="buzz-top"><span>Solo · pertama ke ${target}</span>
    <div style="display:flex;gap:6px">${withSkip?'<button class="btn sm" id="skipSolo">Ganti</button>':''}<button class="btn sm" id="exitSolo">Keluar</button></div></div>`;
  const bindSoloTop=()=>{
    const x=soloOverlay.querySelector('#exitSolo');
    if(x) x.onclick=()=>{ clearTimeout(soloTimer); soloOverlay.remove(); setupSolo(); };
    const s=soloOverlay.querySelector('#skipSolo');
    if(s) s.onclick=()=>{ clearTimeout(soloTimer); soloQuestion(); };
  };
  const soloZoneStyle=i=>((p.length===3||p.length===5)&&i===p.length-1)?'grid-column:span 2':'';
  const soloZones=()=>p.map((n,i)=>{
    const isFirst=i===soloFirst, isSteal=i===soloSteal;
    const cls='buzzer solo'+(isFirst?' first':'')+(isSteal?' steal':'');
    const dis=soloJudging || soloPhase==='steal' || (soloPhase==='first' && (i===soloFirst || soloSteal!==null));
    return `<button class="${cls}" data-sp="${i}" ${dis?'disabled':''} style="${soloZoneStyle(i)}"><span>${esc(n)}</span><small>${soloScores[i]} poin</small></button>`;
  }).join('');
  const soloGrid=()=>`<div class="buzzers" style="grid-template:repeat(${Math.ceil(p.length/2)},1fr)/repeat(2,1fr)">${soloZones()}</div>`;
  const soloJudgeButtons=`<div class="buzz-actions"><button class="btn ink" id="benarSolo">Benar</button><button class="btn hot" id="salahSolo">Salah</button></div>`;
  const bindSoloJudge=kind=>{
    soloOverlay.querySelector('#benarSolo').onclick=()=>kind==='first'?resolveSoloFirst(true):resolveSoloSteal(true);
    soloOverlay.querySelector('#salahSolo').onclick=()=>kind==='first'?resolveSoloFirst(false,'Jawaban salah'):resolveSoloSteal(false,'Jawaban salah');
  };
  const soloQuestion=()=>{
    clearTimeout(soloTimer);
    soloPhase='question'; soloFirst=null; soloSteal=null; soloResolved=false; soloJudging=false; soloLeft=6; soloQ=makeQuestion();
    soloOverlay.classList.remove('answering');
    soloOverlay.innerHTML=`${soloTop(true)}<div class="buzz-q">${esc(soloQ)}</div>
      ${soloGrid()}
      <p class="hint" style="text-align:center;margin:4px 0 0">Tekan zonamu kalau tahu jawabannya.</p>`;
    bindSoloTop();
    soloOverlay.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>soloFirstTap(+b.dataset.sp));
  };
  const startSoloClock=kind=>{
    clearTimeout(soloTimer);
    const tick=()=>{
      if(!soloOverlay || !soloOverlay.isConnected || soloResolved || soloPhase!==kind) return;
      soloLeft--;
      const el=soloOverlay.querySelector('#left'); if(el) el.textContent=soloLeft;
      if(soloLeft>0){ beep(900,.05); soloTimer=later(tick,1000); }
      else soloJudge(kind);
    };
    soloTimer=later(tick,1000);
  };
  const soloFirstTap=i=>{
    if(soloPhase!=='question') return;
    soloFirst=i; soloSteal=null; soloResolved=false; soloJudging=false; soloLeft=6; soloPhase='first';
    soloFirstView();
    startSoloClock('first');
  };
  const soloFirstView=()=>{
    soloPhase='first';
    soloOverlay.classList.add('answering');
    soloOverlay.innerHTML=`${soloTop(false)}<div class="buzz-q">${esc(soloQ)}</div>
      ${soloGrid()}
      <div class="buzz-answer">
        <p class="kicker">Menjawab · ${esc(p[soloFirst])}</p>
        <div class="who" id="left">${soloLeft}</div>
        ${soloJudgeButtons}
        <p class="hint">${soloSteal!==null?`Steal siap: ${esc(p[soloSteal])}`:'Pemain lain boleh menekan zona untuk steal.'}</p>
        <p class="hint">Hakim bisa menekan Benar/Salah kapan saja, atau tunggu waktu habis.</p>
      </div>`;
    bindSoloTop();
    bindSoloJudge('first');
    if(soloSteal===null){
      soloOverlay.querySelectorAll('[data-sp]').forEach(b=>{
        const i=+b.dataset.sp;
        if(i!==soloFirst) b.onclick=()=>soloStealTap(i);
      });
    }
  };
  const soloStealTap=i=>{
    if(soloPhase!=='first' || soloSteal!==null || i===soloFirst) return;
    soloSteal=i; soloFirstView();
  };
  const soloJudge=kind=>{
    if(!soloOverlay || !soloOverlay.isConnected || soloResolved) return;
    clearTimeout(soloTimer);
    soloJudging=true;
    const name=kind==='first'?p[soloFirst]:p[soloSteal];
    soloOverlay.classList.add('answering');
    soloOverlay.innerHTML=`${soloTop(false)}<div class="buzz-q">${esc(soloQ)}</div>
      ${soloGrid()}
      <div class="buzz-answer">
        <p class="kicker">Waktu habis · ${esc(name)}</p>
        <h2 class="big">Jawaban benar?</h2>
        <p class="hint">Hakim memutuskan sekarang.</p>
        ${soloJudgeButtons}
      </div>`;
    bindSoloTop();
    bindSoloJudge(kind);
  };
  const soloStealStart=()=>{
    soloPhase='steal'; soloResolved=false; soloJudging=false; soloLeft=6;
    soloOverlay.classList.add('answering');
    soloOverlay.innerHTML=`${soloTop(false)}<div class="buzz-q">${esc(soloQ)}</div>
      ${soloGrid()}
      <div class="buzz-answer">
        <p class="kicker">Steal · ${esc(p[soloSteal])}</p>
        <div class="who" id="left">${soloLeft}</div>
        ${soloJudgeButtons}
        <p class="hint">Jawab dalam 6 detik. Hakim bisa menekan Benar/Salah kapan saja.</p>
      </div>`;
    bindSoloTop();
    bindSoloJudge('steal');
    startSoloClock('steal');
  };
  const resolveSoloFirst=(ok,why='')=>{
    if(soloPhase!=='first' || soloResolved) return;
    soloResolved=true; clearTimeout(soloTimer);
    if(ok){
      soloScores[soloFirst]++;
      soloFeedback(`+1 untuk ${esc(p[soloFirst])}`, soloScores[soloFirst]>=target?soloFirst:null);
    } else if(soloSteal!==null){
      soloStealStart();
    } else {
      soloFeedback(`${why}. Tidak ada poin.`, null);
    }
  };
  const resolveSoloSteal=(ok,why='')=>{
    if(soloPhase!=='steal' || soloResolved) return;
    soloResolved=true; clearTimeout(soloTimer);
    if(ok){
      soloScores[soloSteal]++;
      soloFeedback(`Steal berhasil. +1 untuk ${esc(p[soloSteal])}`, soloScores[soloSteal]>=target?soloSteal:null);
    } else {
      soloFeedback(`${why}. Tidak ada poin.`, null);
    }
  };
  const soloFeedback=(msg,win)=>{
    soloPhase='feedback';
    soloOverlay.classList.remove('answering');
    soloOverlay.innerHTML=`${soloTop(false)}<div class="buzz-wait">
      <p class="kicker">${win!==null?'Poin':'Hasil'}</p>
      <h2 class="big">${msg}</h2>
      <p>${p.map((n,i)=>`${esc(n)} ${soloScores[i]}`).join(' · ')}</p>
    </div>`;
    bindSoloTop();
    later(()=>{ if(!soloOverlay || !soloOverlay.isConnected) return; if(win!==null) finalSolo(win); else soloQuestion(); },1200);
  };
  const finalSolo=winner=>{
    clearTimeout(soloTimer);
    if(soloOverlay) soloOverlay.remove();
    const min=Math.min(...soloScores);
    const losers=p.filter((_,i)=>soloScores[i]===min);
    setStage(`<p class="kicker">Hasil Solo</p><div class="board" style="width:100%">${p.map((n,i)=>({n,s:soloScores[i]})).sort((a,b)=>b.s-a.s)
      .map(({n,s})=>`<div class="${s===min?'top':''}"><span>${esc(n)}</span><b>${s}</b></div>`).join('')}</div>
      <p class="hint">${esc(p[winner])} menang. Poin terendah kena${losers.length>1?' (seri)':''}.</p>`);
    setActions(`<button class="btn hot xl" id="h">Hukum pemain terendah</button>`);
    $('#h').onclick=()=>showHukuman(losers, `Poin terendah di Adu Bel Solo (${min})`, setupSolo, 'roda');
  };

  chooseMode();
}
