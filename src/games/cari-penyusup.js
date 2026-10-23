import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
/* ---------- 13. Cari Penyusup ---------- */
export function gameUndercover(){
  const p=S.players;
  let impostor=0, civilWord='', impWord='', k=0;
  const newRound=()=>{
    const pair=drawUndercover(), flip=Math.random()<.5;
    civilWord=flip?pair[1]:pair[0];
    impWord=flip?pair[0]:pair[1];
    impostor=Math.floor(Math.random()*p.length);
    k=0; reveal();
  };
  const reveal=()=>{
    if(k>=p.length) return debate();
    const name=p[k];
    setStage(`<p class="kicker">Lihat kata · ${k+1}/${p.length}</p><div class="who">${esc(name)}</div>
      <p>Ambil HP. Pastikan pemain lain tidak melihat. Tekan tombol untuk melihat kata rahasiamu.</p>`);
    setActions(`<button class="btn hot xl" id="peek">Lihat kata</button>`);
    $('#peek').onclick=()=>showWord(name,k===impostor?impWord:civilWord);
  };
  const showWord=(name,word)=>{
    setStage(`<p class="kicker">Kata rahasia ${esc(name)}</p><div class="card"><div class="txt" style="font-size:clamp(38px,12vw,64px)">${esc(word)}</div></div>
      <p class="hint">Hafalkan. Jangan tunjukkan ke pemain lain.</p>`);
    setActions(`<button class="btn ink xl" id="hide">Sembunyikan &amp; oper</button>`);
    $('#hide').onclick=()=>{ k++; reveal(); };
  };
  const debate=()=>{
    setStage(`<p class="kicker">Semua sudah lihat</p><h2 class="big">Mulai debat</h2>
      <p>Mulai dari <b>${esc(p[0])}</b>, searah jarum jam. Tiap orang sebut 1 kata petunjuk tentang kata rahasianya. Jangan sebut kata aslinya.</p>
      <p class="hint">Satu pemain mendapat kata yang berbeda dan tidak tahu. Temukan penyusupnya.</p>`);
    setActions(`<button class="btn hot xl" id="vote">Selesai debat, voting</button>`);
    $('#vote').onclick=voteScreen;
  };
  const voteScreen=()=>{
    setStage(`<p class="kicker">Voting</p><h2 class="big">Siapa penyusupnya?</h2>
      <p>Tekan nama yang paling dicurigai. Keputusan grup.</p>
      <div class="namegrid">${p.map((n,i)=>`<button class="btn" data-v="${i}">${esc(n)}</button>`).join('')}</div>`);
    setActions(`<button class="btn" id="backDebate">Kembali debat</button>`);
    $('#backDebate').onclick=debate;
    document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>confirmVote(+b.dataset.v));
  };
  const confirmVote=idx=>{
    setStage(`<p class="kicker">Konfirmasi</p><h2 class="big">Tuduh ${esc(p[idx])}?</h2>`);
    setActions(`<div class="row"><button class="btn" id="cancelVote">Batal</button><button class="btn hot" id="yesVote">Ya, tuduh</button></div>`);
    $('#cancelVote').onclick=voteScreen;
    $('#yesVote').onclick=()=>result(idx);
  };
  const result=idx=>{
    const caught=idx===impostor;
    const losers=caught?[p[impostor]]:p.filter((_,i)=>i!==impostor);
    setStage(`<p class="kicker">Hasil voting</p><h2 class="big">${caught?'Penyusup ketahuan!':'Salah tangkap!'}</h2>
      <div class="board" style="width:100%">
        <div><span>Kata warga</span><b>${esc(civilWord)}</b></div>
        <div><span>Kata penyusup</span><b>${esc(impWord)}</b></div>
        <div class="top"><span>Penyusup</span><b>${esc(p[impostor])}</b></div>
      </div>
      <p class="hint">${caught?'Hanya penyusup yang kena.':'Semua warga kena karena salah tangkap.'}</p>`);
    setActions(`<button class="btn hot xl" id="h">Hukum ${caught?'penyusup':'semua warga'}</button>`);
    $('#h').onclick=()=>showHukuman(losers, caught?'Penyusup ketahuan':'Warga salah tangkap', newRound, 'roda');
  };
  if(p.length<3){ shell('Cari Penyusup','<p>Butuh minimal 3 pemain.</p>'); return; }
  shell('Cari Penyusup',''); newRound();
}
