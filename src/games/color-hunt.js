import { $, S, esc, rand, shuffle, later, shell, setStage, setActions, beep, showHukuman, matchScore, rgbToHex } from '../core/index.js';
import { HUNT_COLORS, START_LETTERS, END_LETTERS } from '../data/colors.js';
/* ---------- 15. Cari Benda ---------- */
export function gameColorHunt(){
  const p=S.players, ROUNDS=3, ROUND_SECONDS=45;
  let mode='warna', order=[], scores=[], round=0, timer=null, resolved=false, paused=false, prompt=null;
  let camOverlay=null, camStream=null, camVideo=null;

  const scoreLine=()=>p.map((n,i)=>`${esc(n)} ${scores[i]}`).join(' · ');
  const promptVisual=p=>{
    if(p.color) return `<div class="ch-swatch" style="background:${p.color.hex}" role="img" aria-label="Warna ${esc(p.color.name)}"></div>`;
    if(p.letters) return `<div class="ch-letters">${p.letters.map(l=>`<div class="ch-letter" aria-hidden="true">${l}</div>`).join('')}</div>`;
    if(p.letter) return `<div class="ch-letter" aria-hidden="true">${p.letter}</div>`;
    return '';
  };
  const makePrompt=index=>{
    if(mode==='warna'){
      const color=rand(HUNT_COLORS);
      return {color, key:`w${color.name}`, text:`Cari benda berwarna <b>${color.name.toLowerCase()}</b>.`};
    }
    if(mode==='dua'){
      const [a,b]=shuffle(START_LETTERS).slice(0,2);
      return {color:null, letters:[a,b], key:`d${[a,b].sort().join('')}`, text:`Cari benda yang namanya mengandung huruf <b>${a}</b> dan <b>${b}</b>.`};
    }
    const pos=index%2===0?'awal':'akhir';
    const letter=rand(pos==='awal'?START_LETTERS:END_LETTERS);
    return {color:null, letter, key:`h${pos}${letter}`, text:`Cari benda yang namanya ber${pos==='awal'?'awalan':'akhiran'} huruf <b>${letter}</b>.`};
  };
  const buildPrompts=()=>{
    const out=[], keys=new Set(), colors=new Set();
    let guard=0;
    while(out.length<ROUNDS && guard++<100){
      const q=makePrompt(out.length);
      if(keys.has(q.key)) continue;
      if(q.color && colors.has(q.color.name)) continue;
      keys.add(q.key);
      if(q.color) colors.add(q.color.name);
      out.push(q);
    }
    return out;
  };

  const closeCamera=()=>{
    if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; }
    if(camOverlay){ camOverlay.remove(); camOverlay=null; }
    camVideo=null; paused=false;
  };
  const camError=msg=>{
    if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; }
    if(!camOverlay) return;
    camOverlay.innerHTML=`<div class="cam-error"><div class="cam-card">
      <p class="kicker">Kamera tidak tersedia</p>
      <h2 class="big">${esc(msg)}</h2>
      <p class="hint">Kamu tetap bisa menilai manual lewat tombol nama pemain.</p>
      <button class="btn ink" id="camCloseErr">Tutup</button>
    </div></div>`;
    camOverlay.querySelector('#camCloseErr').onclick=closeCamera;
  };
  const openCamera=async()=>{
    if(!prompt?.color || resolved || camOverlay) return;
    paused=true;
    camOverlay=document.createElement('div');
    camOverlay.className='cam';
    camOverlay.innerHTML=`<video id="camVideo" autoplay playsinline muted></video>
      <div class="cam-hud">
        <div class="cam-target"><i style="background:${prompt.color.hex}"></i><span>${esc(prompt.color.name)}</span></div>
        <div class="cam-frame" aria-hidden="true"></div>
        <p class="cam-hint">Taruh benda di kotak tengah, lalu scan.</p>
      </div>
      <div class="cam-actions"><button class="btn" id="camCancel">Batal</button><button class="btn hot" id="camShoot" disabled>Scan sekarang</button></div>`;
    document.body.appendChild(camOverlay);
    camVideo=camOverlay.querySelector('#camVideo');
    camOverlay.querySelector('#camCancel').onclick=closeCamera;
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
    if(!camOverlay || !camVideo || !prompt?.color || !camVideo.videoWidth) return;
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
    camVideo.pause();
    const result=document.createElement('div');
    result.className='cam-result';
    result.innerHTML=`<div class="cam-card">
      <p class="kicker">Hasil scan</p>
      <div class="cam-pair">
        <div><i style="background:${prompt.color.hex}"></i><span>Target ${esc(prompt.color.name)}</span></div>
        <div><i style="background:${seen}"></i><span>Terbaca</span></div>
      </div>
      <h2 class="big">${score}% cocok</h2>
      <p>${verdict}. Pilih pemain yang menemukan benda ini, atau scan lagi.</p>
      <p class="kicker">Pilih pemain</p>
      <div class="ch-grid">${p.map((n,i)=>`<button class="btn" data-cam-ch="${i}">${esc(n)}</button>`).join('')}</div>
      <div class="row"><button class="btn" id="camAgain">Scan lagi</button><button class="btn" id="camClose">Tutup</button></div>
    </div>`;
    camOverlay.appendChild(result);
    camOverlay.classList.add('has-result');
    result.querySelectorAll('[data-cam-ch]').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.camCh;
      closeCamera();
      award(i);
    });
    result.querySelector('#camAgain').onclick=()=>{
      camOverlay.classList.remove('has-result');
      result.remove();
      camVideo.play().catch(()=>{});
    };
    result.querySelector('#camClose').onclick=closeCamera;
  };

  const setup=()=>{
    clearTimeout(timer); closeCamera(); resolved=false;
    setStage(`<p class="kicker">Cari di ruangan</p><h2 class="big">Cari Benda</h2>
      <p>HP di tangan hakim. Mode warna memakai scan kamera untuk cek kecocokan. Mode huruf dinilai manual.</p>
      <div class="namegrid">
        <button class="btn" data-mode="warna">Warna + scan</button>
        <button class="btn" data-mode="huruf">Huruf saja</button>
        <button class="btn ink" data-mode="dua" style="grid-column:span 2">2 huruf acak</button>
      </div>
      <p class="hint">${HUNT_COLORS.length} kartu warna. Huruf dan 2 huruf tanpa scan. ${ROUNDS} ronde, ${ROUND_SECONDS} detik per ronde.</p>`);
    setActions('');
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{
      mode=b.dataset.mode;
      scores=Array(p.length).fill(0); round=0; order=buildPrompts();
      roundIntro();
    });
  };
  const roundIntro=()=>{
    clearTimeout(timer); closeCamera(); resolved=false;
    setStage(`<p class="kicker">Ronde ${round+1}/${ROUNDS}</p><h2 class="big">Siap cari?</h2>
      <p>HP di tangan hakim.${mode==='warna'?' Saat ronde berjalan, tombol Scan warna membuka kamera.':' Penilaian manual oleh hakim.'}</p>
      <p class="hint">${scoreLine()}</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai ronde</button>`);
    $('#go').onclick=startRound;
  };
  const startRound=()=>{
    prompt=order[round]; resolved=false; paused=false;
    let left=ROUND_SECONDS;
    setStage(`<p class="kicker">Ronde ${round+1}/${ROUNDS}</p>
      <div class="card ch-card">
        ${promptVisual(prompt)}
        <div class="txt">${prompt.text}</div>
      </div>
      <div class="who" id="chClock" style="font-size:56px">${ROUND_SECONDS}</div>`);
    const scan=prompt.color
      ? `<div class="row"><button class="btn ink" id="scanWarna">Scan warna</button><button class="btn" id="none">Tidak ada</button></div>`
      : `<button class="btn sm" id="none">Tidak ada yang cocok</button>`;
    setActions(`<div class="ch-grid">${p.map((n,i)=>`<button class="btn" data-ch="${i}">${esc(n)}</button>`).join('')}</div>${scan}`);
    beep(700,.08);
    const tick=()=>{
      if(resolved) return;
      if(paused){ timer=later(tick,250); return; }
      left--; const el=$('#chClock'); if(el) el.textContent=left;
      if(left>0){ if(left<=5) beep(1200,.05); timer=later(tick,1000); }
      else timeUp();
    };
    timer=later(tick,1000);
    document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>award(+b.dataset.ch));
    $('#scanWarna')?.addEventListener('click',openCamera);
    $('#none').onclick=timeUp;
  };
  const award=i=>{
    if(resolved) return;
    closeCamera(); resolved=true; clearTimeout(timer);
    scores[i]++; beep(1000,.15);
    setStage(`<p class="kicker">Ronde ${round+1}</p><h2 class="big">${esc(p[i])} dapat!</h2>
      <p>${prompt.text}</p><p class="hint">${scoreLine()}</p>`);
    setActions('');
    later(nextRound,1400);
  };
  const timeUp=()=>{
    if(resolved) return;
    closeCamera(); resolved=true; clearTimeout(timer); beep(300,.2);
    setStage(`<p class="kicker">Waktu habis</p><h2 class="big">Tidak ada yang dapat</h2>
      <p>${prompt.text}</p><p class="hint">${scoreLine()}</p>`);
    setActions('');
    later(nextRound,1400);
  };
  const nextRound=()=>{
    round++;
    if(round<ROUNDS) return roundIntro();
    final();
  };
  const final=()=>{
    clearTimeout(timer); closeCamera();
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

  shell('Cari Benda','');
  setup();
}
