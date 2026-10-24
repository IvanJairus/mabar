import { $, S, esc, rand, shuffle, shell, setStage, setActions, showHukuman, canSpeak, canRecord, recordClip, reverseBuffer, playBuffer, speakWord, speakVibrato, stopSpeech } from '../core/index.js';
import { VOICE_WORDS, VOICE_SENTENCE } from '../data/voice.js';
/* ---------- 16. Flip My Voice ---------- */
export function gameFlipVoice(){
  const p=S.players;
  const EFFECTS=['chipmunk','monster','vibrato'];
  const EFFECT_LABEL={chipmunk:'Chipmunk',monster:'Monster',vibrato:'Vibrato'};
  const effectParams=(effect,inverse=false)=>{
    if(effect==='chipmunk') return {pitch: inverse?1/1.45:1.45};
    if(effect==='monster') return {pitch: inverse?1/0.7:0.7, lowpass:!inverse};
    if(effect==='vibrato') return {pitch:1, vibrato:true};
    return {pitch:1};
  };
  let mode='', scores=[], round=0, total=0, deck=[], word='', phase='setup', roundEffect='chipmunk';
  let speaker=0, guesser=0, speakerAudio=null, guessAudio=null;
  let buffers=[], effects=[], order=[], voiceSpeaker=-1, voiceGuesser=-1, voiceReplays=0;

  const scoreLine=()=>p.map((n,i)=>`${esc(n)} ${scores[i]}`).join(' · ');
  const stopAll=()=>stopSpeech();
  const showError=(msg,retry)=>{
    stopAll(); phase='error';
    setStage(`<p class="kicker">Audio tidak tersedia</p><h2 class="big">${esc(msg)}</h2>
      <p class="hint">Audio hanya diproses di HP ini, tidak diunggah.</p>`);
    setActions(`<div class="row">${retry?'<button class="btn ink" id="retry">Coba lagi</button>':''}<button class="btn" id="errBack">Kembali</button></div>`);
    if(retry) $('#retry').onclick=retry;
    $('#errBack').onclick=setup;
  };
  const finish=(winner,detail='')=>{
    stopAll(); phase='done';
    if(winner!==null) scores[winner]++;
    setStage(`<p class="kicker">Ronde ${round+1}/${total}</p><h2 class="big">${winner!==null?`${esc(p[winner])} dapat!`:'Tidak ada yang dapat'}</h2>
      ${detail}<p class="hint">${scoreLine()}</p>`);
    setActions(`<button class="btn ink xl" id="next">${round<total-1?'Ronde berikutnya':'Lihat hasil'}</button>`);
    $('#next').onclick=nextRound;
  };
  const nextRound=()=>{
    round++;
    if(round<total) return mode==='kata'?introKata():mode==='flip'?intro2():intro3();
    final();
  };
  const final=()=>{
    stopAll(); phase='done';
    const min=Math.min(...scores), max=Math.max(...scores);
    const ranked=p.map((n,i)=>({n,s:scores[i]})).sort((a,b)=>b.s-a.s);
    setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">
      ${ranked.map(({n,s})=>`<div class="${s===min?'top':''}"><span>${esc(n)}</span><b>${s}</b></div>`).join('')}</div>
      <p class="hint">${max===0?'Tidak ada yang dapat poin. Coba mode lain.':min===max?'Semua seri, tidak ada yang dihukum.':'Poin terendah kena hukuman.'}</p>`);
    if(max===0 || min===max){
      setActions(`<button class="btn hot xl" id="again">Main lagi</button>`);
      $('#again').onclick=setup;
      return;
    }
    const losers=p.filter((_,i)=>scores[i]===min);
    setActions(`<button class="btn hot xl" id="h">Hukum poin terendah</button><button class="btn" id="again">Main lagi</button>`);
    $('#h').onclick=()=>showHukuman(losers,`Poin terendah di Flip My Voice (${min})`,setup,'tekan');
    $('#again').onclick=setup;
  };
  const gateStart=m=>{
    if(m==='kata'){
      if(!canSpeak()) return showError('Browser ini belum mendukung suara otomatis. Buka di Chrome atau Safari terbaru.');
    } else {
      if(!window.isSecureContext) return showError('Mikrofon butuh HTTPS. Buka lewat link Vercel atau localhost.');
      if(!canRecord()) return showError('Browser ini belum mendukung rekaman audio. Buka di Chrome Android atau Safari iOS terbaru.');
    }
    mode=m; scores=Array(p.length).fill(0); round=0; deck=shuffle(VOICE_WORDS);
    speakerAudio=null; guessAudio=null; buffers=[]; effects=[]; order=[];
    if(m==='kata'){ total=5; introKata(); }
    else if(m==='flip'){ total=p.length; intro2(); }
    else { total=p.length; recordIntro3(0); }
  };

  const introKata=()=>{
    stopAll(); phase='setup'; roundEffect=rand(EFFECTS);
    setStage(`<p class="kicker">Tebak Kata · ${round+1}/${total}</p><h2 class="big">Siap dengar?</h2>
      <p>Aplikasi membalik kata lalu membacanya dengan efek suara. Semua pemain menebak kata aslinya. Tidak ada pemain yang memberi clue.</p>
      <p class="hint">Efek suara: <b>${EFFECT_LABEL[roundEffect]}</b>. ${scoreLine()}</p>`);
    setActions(`<button class="btn hot xl" id="playK">Putar kata</button>`);
    $('#playK').onclick=playKata;
  };
  const speakKata=()=>{
    const hint=$('#voiceHint'); if(hint) hint.textContent='Memutar kata...';
    const reversed=[...word].reverse().join('');
    const pfx=roundEffect==='chipmunk'?speakWord(reversed,{pitch:1.65,rate:1.15})
      :roundEffect==='monster'?speakWord(reversed,{pitch:0.45,rate:0.85})
      :speakVibrato(reversed,{rate:1.05});
    pfx.then(()=>{ const h=$('#voiceHint'); if(h) h.textContent='Sudah diputar. Tap nama pemain yang pertama benar.'; })
      .catch(()=>showError('Suara otomatis gagal diputar.', ()=>playKata()));
  };
  const renderPlayKata=()=>{
    setStage(`<p class="kicker">Dengarkan · ${EFFECT_LABEL[roundEffect]}</p><h2 class="big">Kata apa itu?</h2>
      <div class="voice-wave" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
      <p class="hint" id="voiceHint">Kata sudah dibalik dan diputar. Tap nama pemain yang pertama benar.</p>
      <details class="voice-answer"><summary>Lihat jawaban (hakim)</summary><b>${esc(word)}</b></details>`);
    setActions(`<div class="ch-grid">${p.map((n,i)=>`<button class="btn" data-guess="${i}">${esc(n)}</button>`).join('')}</div>
      <div class="row"><button class="btn" id="replayK">Putar ulang (2)</button><button class="btn" id="noneK">Tidak ada</button></div>`);
    let replays=0;
    document.querySelectorAll('[data-guess]').forEach(b=>b.onclick=()=>finish(+b.dataset.guess, `<p>Kata: <b>${esc(word)}</b></p>`));
    $('#replayK').onclick=()=>{
      if(replays>=2) return;
      replays++;
      const leftReplays=2-replays;
      $('#replayK').textContent=`Putar ulang (${leftReplays})`;
      if(leftReplays===0) $('#replayK').disabled=true;
      speakKata();
    };
    $('#noneK').onclick=()=>finish(null, `<p>Kata: <b>${esc(word)}</b></p>`);
  };
  const playKata=()=>{
    word=deck[round];
    renderPlayKata();
    speakKata();
  };

  const intro2=()=>{
    stopAll(); phase='setup'; roundEffect=rand(EFFECTS);
    guesser=round; speaker=(round+p.length-1)%p.length; word=deck[round];
    setStage(`<p class="kicker">Flip Chain · ${round+1}/${total}</p><h2 class="big">Giliran ${esc(p[guesser])}</h2>
      <p><b>${esc(p[speaker])}</b> merekam kata rahasia. Suaranya dibalik dan diberi efek, lalu <b>${esc(p[guesser])}</b> menirunya. Setelah dibalik lagi, hakim menilai.</p>
      <p class="hint">Efek suara: <b>${EFFECT_LABEL[roundEffect]}</b>. ${scoreLine()}</p>`);
    setActions(`<button class="btn hot xl" id="start2">Mulai</button>`);
    $('#start2').onclick=speakerReveal2;
  };
  const speakerReveal2=()=>{
    setStage(`<p class="kicker">Kata untuk ${esc(p[speaker])}</p><div class="card"><div class="txt">${esc(word)}</div></div>
      <p class="hint">Efek: <b>${EFFECT_LABEL[roundEffect]}</b>. Oper HP ke ${esc(p[speaker])}. Jangan tunjukkan kata ini ke ${esc(p[guesser])}.</p>`);
    setActions(`<button class="btn hot xl" id="rec2">Rekam 3 detik</button>`);
    $('#rec2').onclick=recordSpeaker2;
  };
  const recordStep=(label,ms,onDone,retry)=>{
    stopAll();
    setStage(`<p class="kicker">${esc(label)}</p><h2 class="big" id="recLeft">${Math.ceil(ms/1000)}</h2>
      <div class="voice-rec" aria-hidden="true"></div><p class="hint">Merekam... jangan tutup halaman.</p>`);
    setActions('');
    recordClip(ms,left=>{ const el=$('#recLeft'); if(el) el.textContent=Math.ceil(left/1000); })
      .then(onDone)
      .catch(e=>showError(e?.name==='NotAllowedError'?'Izin mikrofon ditolak. Aktifkan izin mikrofon di browser.'
        :e?.name==='NotFoundError'?'Mikrofon tidak ditemukan.'
        :'Rekaman gagal diproses. Coba lagi.', retry));
  };
  const recordSpeaker2=()=>{
    recordStep('Rekam kata', 3000, buf=>{
      speakerAudio=buf;
      setStage(`<p class="kicker">Rekaman siap</p><h2 class="big">Oper ke ${esc(p[guesser])}</h2>
        <p>Putar suara terbalik. ${esc(p[guesser])} harus menirunya.</p>`);
      setActions(`<button class="btn hot xl" id="playFlip">Putar suara terbalik</button>`);
      $('#playFlip').onclick=playFlipped2;
    }, recordSpeaker2);
  };
  const playFlipped2=async()=>{
    setActions('');
    setStage(`<p class="kicker">Suara terbalik</p><h2 class="big">Dengarkan...</h2>
      <div class="voice-wave" aria-hidden="true">${'<i></i>'.repeat(7)}</div>`);
    try{ await playBuffer(reverseBuffer(speakerAudio), effectParams(roundEffect)); }catch{}
    setStage(`<p class="kicker">Giliran ${esc(p[guesser])}</p><h2 class="big">Tirukan suaranya</h2>
      <p>Efek: <b>${EFFECT_LABEL[roundEffect]}</b>. Rekam tiruanmu, lalu suaranya dibalik kembali.</p>`);
    setActions(`<button class="btn hot xl" id="recGuess">Rekam tiruan 3 detik</button>`);
    $('#recGuess').onclick=recordGuess2;
  };
  const recordGuess2=()=>{
    recordStep('Rekam tiruan', 3000, buf=>{
      guessAudio=buf;
      setStage(`<p class="kicker">Hasil</p><h2 class="big">Putar hasil flip balik</h2>
        <p>Hakim mendengarkan apakah hasilnya mirip <b>${esc(word)}</b>.</p>`);
      setActions(`<button class="btn hot xl" id="playBack">Putar hasil</button>`);
      $('#playBack').onclick=judge2;
    }, recordGuess2);
  };
  const judge2=async()=>{
    setActions('');
    setStage(`<p class="kicker">Kata asli: ${esc(word)}</p><h2 class="big">Dengarkan...</h2>
      <div class="voice-wave" aria-hidden="true">${'<i></i>'.repeat(7)}</div>`);
    try{ await playBuffer(reverseBuffer(guessAudio), effectParams(roundEffect,true)); }catch{}
    setStage(`<p class="kicker">Keputusan hakim · efek dibalik</p><h2 class="big">Apakah mirip ${esc(word)}?</h2>
      <p>Benar jika hasil flip balik tadi terdengar mendekati kata asli.</p>`);
    setActions(`<div class="row"><button class="btn ink" id="ok2">Benar</button><button class="btn" id="no2">Salah</button></div>`);
    $('#ok2').onclick=()=>finish(guesser, `<p>Kata: <b>${esc(word)}</b> · ${esc(p[guesser])} berhasil menirunya.</p>`);
    $('#no2').onclick=()=>finish(null, `<p>Kata: <b>${esc(word)}</b> · belum mirip.</p>`);
  };

  const recordIntro3=i=>{
    stopAll(); phase='record';
    if(i>=p.length) return startGuess3();
    setStage(`<p class="kicker">Rekaman ${i+1}/${p.length}</p><h2 class="big">${esc(p[i])}</h2>
      <p>Baca dengan suara lucu:</p><div class="card"><div class="txt">${esc(VOICE_SENTENCE)}</div></div>
      <p class="hint">Oper HP ke ${esc(p[i])}.</p>`);
    setActions(`<button class="btn hot xl" id="rec3">Rekam 3 detik</button>`);
    $('#rec3').onclick=()=>recordVoice3(i);
  };
  const recordVoice3=i=>{
    recordStep(`Rekam ${p[i]}`, 3000, buf=>{
      buffers[i]=buf; effects[i]=rand(EFFECTS);
      setStage(`<p class="kicker">Rekaman ${i+1}/${p.length} selesai</p><h2 class="big">${esc(p[i])} siap</h2>
        <p class="hint">${i+1<p.length?'Oper HP ke pemain berikutnya.':'Semua rekaman siap. Oper HP ke penebak.'}</p>`);
      setActions(`<button class="btn ink xl" id="nextRec">${i+1<p.length?'Pemain berikutnya':'Mulai menebak'}</button>`);
      $('#nextRec').onclick=()=>recordIntro3(i+1);
    }, ()=>recordVoice3(i));
  };
  const startGuess3=()=>{
    order=shuffle([...Array(p.length).keys()]); round=0; total=p.length; intro3();
  };
  const intro3=()=>{
    stopAll(); phase='guess';
    voiceSpeaker=order[round];
    voiceGuesser=order[(round+1)%p.length];
    setStage(`<p class="kicker">Tebak Siapa · ${round+1}/${total}</p><h2 class="big">Giliran ${esc(p[voiceGuesser])}</h2>
      <p>Dengarkan suara dengan pitch berbeda, lalu tap nama pemiliknya. Pemilik suara tidak menebak suaranya sendiri.</p>
      <p class="hint">${scoreLine()}</p>`);
    setActions(`<button class="btn hot xl" id="play3">Putar suara</button>`);
    $('#play3').onclick=play3;
  };
  const renderGuess3=()=>{
    setStage(`<p class="kicker">Giliran ${esc(p[voiceGuesser])}</p><h2 class="big">Tap pemilik suara</h2>
      <p class="hint">Dengarkan lagi kalau perlu, lalu pilih satu nama.</p>`);
    setActions(`<div class="ch-grid">${p.map((n,i)=>`<button class="btn" data-vg="${i}">${esc(n)}</button>`).join('')}</div>
      <button class="btn" id="replay3">Putar ulang (${2-voiceReplays})</button>`);
    document.querySelectorAll('[data-vg]').forEach(b=>b.onclick=()=>guess3(+b.dataset.vg));
    $('#replay3').onclick=async()=>{
      if(voiceReplays>=2) return;
      voiceReplays++;
      try{ await playBuffer(buffers[voiceSpeaker],effectParams(effects[voiceSpeaker])); }catch{}
      renderGuess3();
    };
    if(voiceReplays>=2) $('#replay3').disabled=true;
  };
  const play3=async()=>{
    voiceReplays=0;
    setActions('');
    setStage(`<p class="kicker">Dengarkan</p><h2 class="big">Suara siapa?</h2>
      <div class="voice-wave" aria-hidden="true">${'<i></i>'.repeat(7)}</div>`);
    try{ await playBuffer(buffers[voiceSpeaker],effectParams(effects[voiceSpeaker])); }catch{}
    renderGuess3();
  };
  const guess3=i=>{
    if(phase!=='guess') return;
    const ok=i===voiceSpeaker;
    finish(ok?voiceGuesser:null, `<p>Itu suara <b>${esc(p[voiceSpeaker])}</b> dengan efek <b>${EFFECT_LABEL[effects[voiceSpeaker]]}</b>. ${ok?`${esc(p[voiceGuesser])} benar.`:`${esc(p[voiceGuesser])} belum tepat.`}</p>`);
  };

  const setup=()=>{
    stopAll(); phase='setup'; mode=''; round=0; scores=[]; total=0; deck=[];
    speakerAudio=null; guessAudio=null; buffers=[]; effects=[]; order=[];
    setStage(`<p class="kicker">Suara & tebakan</p><h2 class="big">Flip My Voice</h2>
      <p>Tiga mode. Tebak Kata tanpa mikrofon. Flip Chain dan Tebak Siapa merekam suara. Efek acak: chipmunk, monster, vibrato.</p>
      <div class="namegrid">
        <button class="btn ink" data-vm="kata" style="grid-column:span 2">Tebak Kata</button>
        <button class="btn" data-vm="flip">Flip Chain</button>
        <button class="btn" data-vm="siapa">Tebak Siapa</button>
      </div>
      <p class="hint">Butuh 2–6 pemain. Mikrofon hanya aktif saat merekam.</p>`);
    setActions('');
    document.querySelectorAll('[data-vm]').forEach(b=>b.onclick=()=>gateStart(b.dataset.vm));
  };

  shell('Flip My Voice',''); setup();
}
