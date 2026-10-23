import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
import { TEBAK } from '../data/tebak.js';
/* ---------- 3. Tebak Gaya ---------- */
export function gameTebak(){
  const p = S.players;
  let cat, words;
  let mode='individu', duration=60, customVal='', durValid=true;
  let teamCount=Math.min(2,p.length), teamOf={}, teamCursor=[];
  let i=0, scores={}, turnTeam=0, teamScores=[];

  const buildTeams = () => Array.from({length:teamCount}, (_,t) => p.filter(n => teamOf[n]===t));
  const balanced = () => { teamOf={}; p.forEach((n,k) => teamOf[n]=k%teamCount); };
  const resetCursors = () => { teamCursor=Array(teamCount).fill(0); };
  const teamsOk = () => mode==='individu' || buildTeams().every(t => t.length>0);
  const canStart = () => durValid && teamsOk();

  const renderSetup = () => {
    if(teamCursor.length !== teamCount) resetCursors();
    const stage = $('#stage'), keepScroll = stage ? stage.scrollTop : 0;
    const teams = buildTeams();
    const preset = [60,120,180].includes(duration);
    const customShown = customVal!=='' ? customVal : (preset ? '' : String(duration));
    setStage(`<p class="kicker">Atur permainan</p><h2 class="big">Tebak Gaya</h2>
      <p class="hint">Pilih mode, durasi, dan susunan tim sebelum mulai.</p>

      <div class="filters" role="group" aria-label="Mode permainan">
        <button data-mode="individu" aria-pressed="${mode==='individu'}">Individu</button>
        <button data-mode="tim" aria-pressed="${mode==='tim'}">Tim</button>
      </div>

      <p class="kicker" style="margin-top:16px">Durasi per giliran</p>
      <div class="filters" role="group" aria-label="Durasi permainan">
        <button data-dur="60" aria-pressed="${durValid && customVal==='' && duration===60}">1 menit</button>
        <button data-dur="120" aria-pressed="${durValid && customVal==='' && duration===120}">2 menit</button>
        <button data-dur="180" aria-pressed="${durValid && customVal==='' && duration===180}">3 menit</button>
      </div>
      <div class="add" style="width:100%;max-width:340px">
        <input class="durinput" id="durCustom" type="number" min="15" max="600" step="5" inputmode="numeric" placeholder="Atau isi detik" value="${customShown}" aria-label="Durasi custom dalam detik">
        <span class="hint" style="align-self:center;margin:0">detik</span>
      </div>
      <p class="hint" id="durHint">${durValid ? `${duration} detik per ${mode==='tim'?'giliran tim':'pemain'}` : 'Isi 15 sampai 600 detik.'}</p>

      ${mode==='tim' ? `
        <p class="kicker" style="margin-top:16px">Jumlah tim</p>
        <div class="filters" role="group" aria-label="Jumlah tim">
          ${[2,3].filter(n => n<=p.length).map(n => `<button data-teams="${n}" aria-pressed="${teamCount===n}">${n} tim</button>`).join('')}
        </div>
        <div class="teams">
          ${p.map((n,k) => `<div class="teamrow"><span>${esc(n)}</span><div class="picks">${Array.from({length:teamCount},(_,t) => `<button data-p="${k}" data-t="${t}" aria-pressed="${teamOf[n]===t}">Tim ${t+1}</button>`).join('')}</div></div>`).join('')}
        </div>
        <p class="hint">${teams.map((m,t) => `Tim ${t+1}: ${m.length} orang`).join(' · ')}. ${teams.some(t => !t.length) ? 'Ada tim kosong.' : 'Tim boleh tidak seimbang.'}</p>
      ` : ''}`);
    document.querySelector('.game')?.classList.add('fit');
    if(stage) stage.scrollTop = keepScroll;
    setActions(`<button class="btn ink xl" id="setupStart" ${canStart()?'':'disabled'}>Lanjut pilih kategori</button>`);
    $('#setupStart').onclick = () => { if(canStart()) pick(); };
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
      mode=b.dataset.mode;
      if(mode==='tim' && !Object.keys(teamOf).length) balanced();
      renderSetup();
    });
    document.querySelectorAll('[data-dur]').forEach(b => b.onclick = () => {
      duration=+b.dataset.dur; customVal=''; durValid=true; renderSetup();
    });
    document.querySelectorAll('[data-teams]').forEach(b => b.onclick = () => {
      teamCount=+b.dataset.teams; balanced(); resetCursors(); renderSetup();
    });
    document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
      teamOf[p[+b.dataset.p]]=+b.dataset.t; resetCursors(); renderSetup();
    });
    const durInput = $('#durCustom');
    durInput.oninput = () => {
      customVal=durInput.value.trim();
      const v=Number(customVal);
      durValid=customVal!=='' && Number.isInteger(v) && v>=15 && v<=600;
      if(durValid) duration=v;
      document.querySelectorAll('[data-dur]').forEach(b => b.setAttribute('aria-pressed', String(durValid && customVal==='' && +b.dataset.dur===duration)));
      $('#durHint').textContent = durValid ? `${duration} detik per ${mode==='tim'?'giliran tim':'pemain'}` : 'Isi 15 sampai 600 detik.';
      $('#setupStart').disabled = !canStart();
    };
  };

  const pick = () => {
    i=0; scores={}; turnTeam=0; teamScores=[];
    document.querySelector('.game')?.classList.remove('fit');
    const summary = mode==='tim' ? `${teamCount} tim · ${duration} detik per giliran` : `${p.length} pemain · ${duration} detik per pemain`;
    setStage(`<p class="kicker">Pilih kategori</p><h2 class="big">Tebak Gaya</h2>
      <p>Yang main taruh HP di jidat, layar ke teman. Teman kasih kode pakai gaya &amp; suara, <b>nggak boleh sebut kata</b>.
      Tap kanan = benar, tap kiri = lewat. ${duration} detik per ${mode==='tim'?'giliran tim':'orang'}. ${mode==='tim'?'Skor tim paling kecil kena hukuman.':'Skor paling kecil kena hukuman.'}</p>
      <p class="hint">${summary} · <button class="btn sm" id="setupBtn">Ubah</button></p>
      <div class="namegrid">${Object.keys(TEBAK).map(c=>`<button class="btn" data-c="${c}">${c}</button>`).join('')}<button class="btn ink" data-c="*">Campur</button></div>`);
    setActions('');
    $('#setupBtn').onclick = renderSetup;
    document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
      cat=b.dataset.c; words = deck(cat==='*' ? Object.values(TEBAK).flat() : TEBAK[cat]); ready();
    });
  };

  const ready = () => {
    if(mode==='tim'){
      const team=buildTeams()[turnTeam], guesser=team[teamCursor[turnTeam] % team.length];
      setStage(`<p class="kicker">Giliran tim · ${turnTeam+1}/${teamCount}</p><div class="who">Tim ${turnTeam+1}</div>
        <p>Yang nebak: <b>${esc(guesser)}</b><br>Anggota: ${team.map(esc).join(', ')}</p>
        <p>${duration} detik. Miringkan HP (landscape), tempel di jidat, layar menghadap teman.</p>`);
    } else {
      setStage(`<p class="kicker">Giliran nebak · ${i+1}/${p.length}</p><div class="who">${esc(p[i])}</div>
        <p>${duration} detik. Miringkan HP (landscape), tempel di jidat, layar menghadap teman.</p>`);
    }
    setActions(`<button class="btn hot xl" id="go">Mulai</button>`);
    $('#go').onclick = play;
  };

  const play = async () => {
    const fs = document.createElement('div'); fs.className='fs';
    fs.innerHTML = `<div class="tg-top"><span id="t">3</span><span id="sc">0</span></div>
      <div class="tg-halves"><button id="skip" aria-label="Lewat">← Lewat</button><button id="ok" aria-label="Benar">Benar →</button></div>
      <div class="tg-word" id="w" aria-live="assertive"></div>`;
    document.body.appendChild(fs);
    const w=fs.querySelector('#w'), t=fs.querySelector('#t'), sc=fs.querySelector('#sc');
    await countdown(w);
    let score=0, left=duration, lock=false, live=true; const log=[];
    let cur = words(); w.textContent = cur; t.textContent = left; beep(900,.2);
    const answer = ok => {
      if(lock || !live) return; lock=true;
      log.push([cur, ok]); if(ok){ score++; sc.textContent=score; beep(1000,.12,'triangle',.15); buzz(80); } else { beep(250,.15,'sawtooth'); }
      fs.className = 'fs ' + (ok ? 'ok' : 'skip'); w.textContent = ok ? 'BENAR!' : 'LEWAT';
      later(() => { fs.className='fs'; cur=words(); w.textContent=cur; lock=false; }, 650);
    };
    fs.querySelector('#ok').onpointerdown = () => answer(true);
    fs.querySelector('#skip').onpointerdown = () => answer(false);
    const key = e => { if(e.key==='ArrowRight') answer(true); if(e.key==='ArrowLeft') answer(false); };
    addEventListener('keydown', key);
    const clock = () => {
      left--; t.textContent = left; if(left<=5) beep(1200,.05);
      if(left>0) return later(clock, 1000);
      live=false; removeEventListener('keydown', key); boom(); fs.remove();
      result(score, log);
    };
    later(clock, 1000);
  };

  const result = (score, log) => {
    const logHtml = log.map(([w,ok]) => ok ? `<b>${esc(w)}</b>` : `<s>${esc(w)}</s>`).join(' · ') || 'Nggak ada yang ketebak.';
    if(mode==='tim'){
      const t=turnTeam, team=buildTeams()[t], guesser=team[teamCursor[t] % team.length];
      teamScores[t]=score; teamCursor[t]=(teamCursor[t]+1)%team.length;
      setStage(`<p class="kicker">Tim ${t+1} dapat</p><div class="who" style="font-size:72px">${score}</div>
        <p>Ditebak oleh ${esc(guesser)} · ${team.length} anggota</p><p>${logHtml}</p>`);
      turnTeam++;
      if(turnTeam < teamCount){
        const next=buildTeams()[turnTeam], nextGuesser=next[teamCursor[turnTeam] % next.length];
        setActions(`<button class="btn ink xl" id="n">Tim ${turnTeam+1} · ${esc(nextGuesser)}</button>`);
        $('#n').onclick = ready;
      } else {
        setActions(`<button class="btn hot xl" id="n">Lihat tim yang kalah</button>`);
        $('#n').onclick = final;
      }
      return;
    }
    scores[p[i]]=score;
    setStage(`<p class="kicker">${esc(p[i])} dapat</p><div class="who" style="font-size:72px">${score}</div><p>${logHtml}</p>`);
    i++;
    if(i < p.length){ setActions(`<button class="btn ink xl" id="n">Giliran ${esc(p[i])}</button>`); $('#n').onclick = ready; }
    else { setActions(`<button class="btn hot xl" id="n">Lihat siapa yang kalah</button>`); $('#n').onclick = final; }
  };

  const final = () => {
    if(mode==='tim'){
      const teams=buildTeams(), min=Math.min(...teamScores);
      const losers=teams.flatMap((m,t) => teamScores[t]===min ? m : []);
      setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">${teams.map((m,t)=>({m,s:teamScores[t],t})).sort((a,b)=>b.s-a.s)
        .map(({m,s,t})=>`<div class="${s===min?'top':''}"><span>Tim ${t+1} <small>(${m.length} orang)</small></span><b>${s}</b></div>`).join('')}</div>`);
      setActions(`<button class="btn hot xl" id="h">Hukum tim skor terkecil</button>`);
      $('#h').onclick = () => showHukuman(losers, `Skor tim paling kecil di Tebak Gaya (${min})`, pick, 'tebak');
      return;
    }
    const min = Math.min(...Object.values(scores));
    const losers = p.filter(n => scores[n]===min);
    setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">${[...p].sort((a,b)=>scores[b]-scores[a])
      .map(n=>`<div class="${scores[n]===min?'top':''}"><span>${esc(n)}</span><b>${scores[n]}</b></div>`).join('')}</div>`);
    setActions(`<button class="btn hot xl" id="h">Hukum skor terkecil</button>`);
    $('#h').onclick = () => showHukuman(losers, `Skor paling kecil di Tebak Gaya (${min})`, pick, 'tebak');
  };

  balanced(); resetCursors();
  shell('Tebak Gaya',''); renderSetup();
}
