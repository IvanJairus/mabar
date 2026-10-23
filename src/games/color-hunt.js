import { $, S, esc, rand, shuffle, later, shell, setStage, setActions, beep, showHukuman, matchScore, rgbToHex } from '../core/index.js';
import { HUNT_COLORS, START_LETTERS, END_LETTERS } from '../data/colors.js';
/* ---------- 15. Cari Benda ---------- */
export function gameColorHunt(){
  const p=S.players, SEARCH_SECONDS=45;
  let mode='campur', order=[], scores=[], round=0, timer=null, phase='setup', prompt=null, arrivals=[], wordRank=0;
  let camOverlay=null, camStream=null, camVideo=null, scanQueue=[], scanIndex=0, scanResults=[], pendingScan=null;

  const scoreLine=()=>p.map((n,i)=>`${esc(n)} ${scores[i]}`).join(' · ');
  const kindLabel={warna:'Warna',kata:'Kata',gabungan:'Gabungan'};
  const promptVisual=p=>{
    if(p.color) return `<div class="ch-swatch" style="background:${p.color.hex}" role="img" aria-label="Warna ${esc(p.color.name)}"></div>`;
    if(p.letters) return `<div class="ch-letters">${p.letters.map(l=>`<div class="ch-letter" aria-hidden="true">${l}</div>`).join('')}</div>`;
    if(p.letter) return `<div class="ch-letter" aria-hidden="true">${p.letter}</div>`;
    return '';
  };
  const colorPrompt=used=>{
    let color;
    do{ color=rand(HUNT_COLORS); }while(used.colors.has(color.name));
    used.colors.add(color.name);
    return {kind:'warna', color, key:`w${color.name}`, text:`Cari benda berwarna <b>${color.name.toLowerCase()}</b>.`};
  };
  const wordPrompt=(pos,used)=>{
    let letter, key;
    do{ letter=rand(pos==='awal'?START_LETTERS:END_LETTERS); key=`h${pos}${letter}`; }while(used.keys.has(key));
    used.keys.add(key);
    return {kind:'kata', color:null, letter, key, text:`Cari benda yang namanya ber${pos==='awal'?'awalan':'akhiran'} huruf <b>${letter}</b>.`};
  };
  const duaPrompt=used=>{
    let a, b, key;
    do{ [a,b]=shuffle(START_LETTERS).slice(0,2); key=`d${[a,b].sort().join('')}`; }while(used.keys.has(key));
    used.keys.add(key);
    return {kind:'gabungan', color:null, letters:[a,b], key, text:`Cari benda yang namanya mengandung huruf <b>${a}</b> dan <b>${b}</b>.`};
  };
  const buildPrompts=()=>{
    const used={colors:new Set(),keys:new Set()};
    if(mode==='campur') return [colorPrompt(used),wordPrompt('awal',used),colorPrompt(used),wordPrompt('akhir',used),duaPrompt(used)];
    if(mode==='warna') return [colorPrompt(used),colorPrompt(used),colorPrompt(used)];
    if(mode==='dua') return [duaPrompt(used),duaPrompt(used),duaPrompt(used)];
    return [wordPrompt('awal',used),wordPrompt('akhir',used),wordPrompt('awal',used)];
  };

  const closeCamera=()=>{
    if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; }
    if(camOverlay){ camOverlay.remove(); camOverlay=null; }
    camVideo=null; pendingScan=null;
  };
  const manualColorJudge=()=>{
    closeCamera(); phase='judge';
    setStage(`<p class="kicker">Scan tidak tersedia</p><h2 class="big">Pilih yang paling dekat</h2>
      <p>Hakim memilih manual dari pemain yang sudah kembali.</p>
      <p class="hint">${arrivals.map((i,k)=>`${k+1}. ${esc(p[i])}`).join(' · ')}</p>`);
    setActions(`<div class="ch-grid">${arrivals.map(i=>`<button class="btn" data-manual="${i}">${esc(p[i])}</button>`).join('')}</div>
      <button class="btn" id="manualNone">Tidak ada</button>`);
    document.querySelectorAll('[data-manual]').forEach(b=>b.onclick=()=>finishRound(+b.dataset.manual, `<p>${prompt.text}</p>`));
    $('#manualNone').onclick=()=>finishRound(null, `<p>${prompt.text}</p>`);
  };
  const camError=msg=>{
    if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; }
    if(!camOverlay) return;
    camOverlay.innerHTML=`<div class="cam-error"><div class="cam-card">
      <p class="kicker">Kamera tidak tersedia</p>
      <h2 class="big">${esc(msg)}</h2>
      <p class="hint">Scan bisa diganti dengan penilaian manual.</p>
      <div class="row"><button class="btn" id="camCloseErr">Tutup</button><button class="btn ink" id="camManual">Nilai manual</button></div>
    </div></div>`;
    camOverlay.querySelector('#camCloseErr').onclick=()=>{ closeCamera(); scanPanel('all'); };
    camOverlay.querySelector('#camManual').onclick=manualColorJudge;
  };
  const openCamera=async()=>{
    if(!prompt?.color || phase!=='scan' || camOverlay) return;
    const cur=scanQueue[scanIndex];
    if(cur==null) return;
    camOverlay=document.createElement('div');
    camOverlay.className='cam';
    camOverlay.innerHTML=`<video id="camVideo" autoplay playsinline muted></video>
      <div class="cam-hud">
        <div class="cam-target"><i style="background:${prompt.color.hex}"></i><span>${esc(prompt.color.name)} · ${esc(p[cur])}</span></div>
        <div class="cam-frame" aria-hidden="true"></div>
        <p class="cam-hint">Item ${scanIndex+1}/${scanQueue.length} · taruh benda di kotak tengah.</p>
      </div>
      <div class="cam-actions"><button class="btn" id="camCancel">Batal</button><button class="btn hot" id="camShoot" disabled>Scan sekarang</button></div>`;
    document.body.appendChild(camOverlay);
    camVideo=camOverlay.querySelector('#camVideo');
    camOverlay.querySelector('#camCancel').onclick=()=>{ closeCamera(); scanPanel('all'); };
    if(!navigator.mediaDevices?.getUserMedia){ camError('Browser ini tidak mendukung kamera.'); return; }
    if(!window.isSecureContext){ camError('Kamera butuh HTTPS. Buka lewat link Vercel atau localhost.'); return; }
    try{
      camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      if(!camOverlay){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; return; }
      camVideo.srcObject=camStream;
      await camVideo.play();
      const shoot=camOverlay.querySelector('#camShoot');
      if(shoot){ shoot.disabled=false; shoot.onclick=scanFrame; }
    }catch(e){
      camError(e?.name==='NotAllowedError'?'Izin kamera ditolak. Aktifkan izin kamera di browser.'
        :e?.name==='NotFoundError'?'Kamera tidak ditemukan.'
        :e?.name==='NotReadableError'?'Kamera sedang dipakai aplikasi lain.'
        :'Kamera gagal dibuka.');
    }
  };
  const scanFrame=()=>{
    if(!camOverlay || !camVideo || !prompt?.color || phase!=='scan' || !camVideo.videoWidth) return;
    const cur=scanQueue[scanIndex];
    if(cur==null) return;
    const vw=camVideo.videoWidth, vh=camVideo.videoHeight, side=Math.min(vw,vh)*0.4;
    const canvas=document.createElement('canvas'); canvas.width=48; canvas.height=48;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx) return;
    ctx.drawImage(camVideo,(vw-side)/2,(vh-side)/2,side,side,0,0,48,48);
    const data=ctx.getImageData(0,0,48,48).data;
    let r=0,g=0,b=0,n=0;
    for(let i=0;i<data.length;i+=4){ r+=data[i]; g+=data[i+1]; b+=data[i+2]; n++; }
    const rgb=[r/n,g/n,b/n], score=matchScore(prompt.color.hex,rgb), seen=rgbToHex(rgb);
    const verdict=score>=80?'Sangat dekat':score>=55?'Cukup dekat':'Masih jauh';
    pendingScan={i:cur,score,hex:seen};
    camVideo.pause();
    const result=document.createElement('div');
    result.className='cam-result';
    result.innerHTML=`<div class="cam-card">
      <p class="kicker">Item ${scanIndex+1}/${scanQueue.length} · ${esc(p[cur])}</p>
      <div class="cam-pair">
        <div><i style="background:${prompt.color.hex}"></i><span>Target ${esc(prompt.color.name)}</span></div>
        <div><i style="background:${seen}"></i><span>Terbaca</span></div>
      </div>
      <h2 class="big">${score}% cocok</h2>
      <p>${verdict}.</p>
      <div class="row"><button class="btn" id="camAgain">Scan lagi</button><button class="btn ink" id="camNext">${scanIndex+1<scanQueue.length?'Lanjut':'Selesai'}</button></div>
    </div>`;
    camOverlay.appendChild(result);
    camOverlay.classList.add('has-result');
    result.querySelector('#camAgain').onclick=()=>{
      pendingScan=null;
      camOverlay.classList.remove('has-result');
      result.remove();
      camVideo.play().catch(()=>{});
    };
    result.querySelector('#camNext').onclick=()=>{
      if(pendingScan){ scanResults.push(pendingScan); pendingScan=null; }
      camOverlay.classList.remove('has-result');
      result.remove();
      scanIndex++;
      if(scanIndex<scanQueue.length){
        const next=scanQueue[scanIndex];
        camOverlay.querySelector('.cam-target span').textContent=`${prompt.color.name} · ${p[next]}`;
        camOverlay.querySelector('.cam-hint').textContent=`Item ${scanIndex+1}/${scanQueue.length} · taruh benda di kotak tengah.`;
        camVideo.play().catch(()=>{});
      } else {
        closeCamera();
        colorSummary();
      }
    };
  };
  const scanPanel=(reason='time')=>{
    phase='ending';
    setStage(`<p class="kicker">Ronde ${round+1} · ${reason==='time'?'Waktu habis':'Semua kembali'}</p>
      <h2 class="big">Scan semua item</h2>
      <p>${arrivals.map((i,k)=>`${k+1}. ${esc(p[i])}`).join(' · ')}</p>
      <p class="hint">Scan satu per satu. Yang paling dekat menang.</p>`);
    setActions(`<div class="row"><button class="btn ink" id="startScan">Mulai scan</button><button class="btn" id="noScan">Tidak ada</button></div>`);
    $('#startScan').onclick=startScanQueue;
    $('#noScan').onclick=()=>finishRound(null, `<p>${prompt.text}</p>`);
  };
  const startScanQueue=()=>{
    scanQueue=arrivals.slice(); scanIndex=0; scanResults=[]; pendingScan=null; phase='scan';
    openCamera();
  };
  const colorSummary=()=>{
    const sorted=[...scanResults].sort((a,b)=>b.score-a.score);
    const winner=sorted.length?sorted[0].i:null;
    const detail=`<p>${prompt.text}</p><div class="board" style="width:100%">${sorted.map((r,k)=>`<div><span>${esc(p[r.i])}${k===0?' · terdekat':''}</span><b>${r.score}%</b></div>`).join('')}</div>`;
    finishRound(winner, detail);
  };
  const renderWordJudge=(reason='time')=>{
    phase='judge';
    if(wordRank>=arrivals.length) return finishRound(null, `<p>${prompt.text}</p><p class="hint">Tidak ada jawaban yang disetujui.</p>`);
    const i=arrivals[wordRank];
    setStage(`<p class="kicker">Ronde ${round+1} · keputusan hakim</p><h2 class="big">${esc(p[i])} benar?</h2>
      <p>Peringkat ${wordRank+1} dari ${arrivals.length}.${reason==='time'?' Waktu habis.':''}</p>
      <p class="hint">${arrivals.map((x,k)=>`${k+1}. ${esc(p[x])}`).join(' · ')}</p>`);
    setActions(`<div class="row"><button class="btn ink" id="wordOk">Benar</button><button class="btn" id="wordNext">Salah, lanjut</button></div>`);
    $('#wordOk').onclick=()=>finishRound(i, `<p>${prompt.text}</p>`);
    $('#wordNext').onclick=()=>{ wordRank++; renderWordJudge(reason); };
  };
  const finishRound=(winner, detail='')=>{
    phase='done'; clearTimeout(timer); closeCamera();
    if(winner!==null) scores[winner]++;
    setStage(`<p class="kicker">Ronde ${round+1}/${order.length}</p><h2 class="big">${winner!==null?`${esc(p[winner])} dapat!`:'Tidak ada yang dapat'}</h2>
      ${detail}<p class="hint">${scoreLine()}</p>`);
    setActions(`<button class="btn ink xl" id="next">${round<order.length-1?'Ronde berikutnya':'Lihat hasil'}</button>`);
    $('#next').onclick=nextRound;
  };
  const endSearch=reason=>{
    if(phase!=='search') return;
    clearTimeout(timer); phase='ending';
    if(reason==='none' || !arrivals.length){
      return finishRound(null, `<p>${prompt.text}</p><p class="hint">Tidak ada yang kembali.</p>`);
    }
    if(prompt.color) return scanPanel(reason);
    wordRank=0; renderWordJudge(reason);
  };
  const arrive=(i,btn)=>{
    if(phase!=='search' || arrivals.includes(i)) return;
    arrivals.push(i);
    btn.textContent=`${arrivals.length}. ${p[i]}`;
    btn.classList.add('ink');
    beep(900,.05);
    const line=$('#arrivalLine');
    if(line) line.textContent=`Urutan kembali: ${arrivals.map((x,k)=>`${k+1}. ${p[x]}`).join(' · ')}`;
  };
  const startRound=()=>{
    prompt=order[round]; arrivals=[]; wordRank=0; phase='search';
    let left=SEARCH_SECONDS;
    const isColor=prompt.kind==='warna';
    setStage(`<p class="kicker">Ronde ${round+1}/${order.length} · ${kindLabel[prompt.kind]}</p>
      <div class="card ch-card">${promptVisual(prompt)}<div class="txt">${prompt.text}</div></div>
      <div class="who" id="chClock" style="font-size:56px">${SEARCH_SECONDS}</div>
      <p class="hint" id="arrivalLine">Belum ada yang kembali.</p>`);
    setActions(`<div class="ch-grid">${p.map((n,i)=>`<button class="btn" data-arrive="${i}">${esc(n)}</button>`).join('')}</div>
      <div class="row"><button class="btn ink" id="allBack">Semua kembali</button><button class="btn" id="none">Tidak ada</button></div>`);
    beep(700,.08);
    const tick=()=>{
      if(phase!=='search') return;
      left--; const el=$('#chClock'); if(el) el.textContent=left;
      if(left>0){ if(left<=5) beep(1200,.05); timer=later(tick,1000); }
      else endSearch('time');
    };
    timer=later(tick,1000);
    document.querySelectorAll('[data-arrive]').forEach(b=>b.onclick=()=>arrive(+b.dataset.arrive,b));
    $('#allBack').onclick=()=>endSearch('all');
    $('#none').onclick=()=>endSearch('none');
  };
  const roundIntro=()=>{
    clearTimeout(timer); closeCamera(); phase='setup';
    const isColor=order[round].kind==='warna';
    setStage(`<p class="kicker">Ronde ${round+1}/${order.length} · ${kindLabel[order[round].kind]}</p><h2 class="big">Siap cari?</h2>
      <p>${isColor?'Cari benda sesuai warna. Setelah selesai, semua item discan; yang paling dekat menang.':'Tap namamu saat kembali. Yang pertama dan benar menang; kalau salah, lanjut peringkat berikutnya.'}</p>
      <p class="hint">${scoreLine()}</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai ronde</button>`);
    $('#go').onclick=startRound;
  };
  const nextRound=()=>{
    round++;
    if(round<order.length) return roundIntro();
    final();
  };
  const final=()=>{
    clearTimeout(timer); closeCamera(); phase='done';
    const min=Math.min(...scores), max=Math.max(...scores);
    const ranked=p.map((n,i)=>({n,s:scores[i]})).sort((a,b)=>b.s-a.s);
    setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">
      ${ranked.map(({n,s})=>`<div class="${s===min?'top':''}"><span>${esc(n)}</span><b>${s}</b></div>`).join('')}</div>
      <p class="hint">${max===0?'Tidak ada yang dapat poin. Coba clue yang lebih mudah.':min===max?'Semua seri, tidak ada yang dihukum.':'Poin terendah kena hukuman.'}</p>`);
    if(max===0 || min===max){
      setActions(`<button class="btn hot xl" id="again">Main lagi</button>`);
      $('#again').onclick=setup;
      return;
    }
    const losers=p.filter((_,i)=>scores[i]===min);
    setActions(`<button class="btn hot xl" id="h">Hukum poin terendah</button><button class="btn" id="again">Main lagi</button>`);
    $('#h').onclick=()=>showHukuman(losers,`Poin terendah di Cari Benda (${min})`,setup,'tekan');
    $('#again').onclick=setup;
  };
  const setup=()=>{
    clearTimeout(timer); closeCamera(); phase='setup'; round=0;
    setStage(`<p class="kicker">Cari di ruangan</p><h2 class="big">Cari Benda</h2>
      <p>HP di tangan hakim. Ronde warna discan semua di akhir; ronde kata memakai tap tercepat yang benar.</p>
      <div class="namegrid">
        <button class="btn ink" data-mode="campur" style="grid-column:span 2">Campur · 5 ronde</button>
        <button class="btn" data-mode="warna">Warna + scan</button>
        <button class="btn" data-mode="huruf">Huruf saja</button>
        <button class="btn" data-mode="dua" style="grid-column:span 2">2 huruf acak</button>
      </div>
      <p class="hint">Campur: 2 warna, 2 kata, 1 gabungan. Mode lain 3 ronde. Warna ${HUNT_COLORS.length} kartu.</p>`);
    setActions('');
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{
      mode=b.dataset.mode;
      scores=Array(p.length).fill(0); round=0; order=buildPrompts();
      roundIntro();
    });
  };

  shell('Cari Benda','');
  setup();
}
