import { $, S, esc, rand, shuffle, deck, later, wait, clearGame, shell, setStage, setActions, countdown, beep, buzz, boom, showHukuman, twoTeams, teamIntro, drawKategori, drawTantangan, drawJujur, drawSiapa, drawCepat, drawTaboo, drawUndercover, drawBuzzerKategori } from '../core/index.js';
import { TEBAK } from '../data/tebak.js';
/* ---------- 11. Estafet Tebak Gaya ---------- */
export function gameCharades(){
  const p=S.players;
  let teams=[], scores=[0,0], actorCursor=[0,0], turn=0;
  const setup=()=>{
    teams=twoTeams();
    teamIntro('Estafet Tebak Gaya', teams, ['Tim A','Tim B'],
      'Satu perwakilan melihat kata lalu memperagakan. Rekan setim menebak. Tim lawan mengawasi dan tidak boleh ada suara. 60 detik per tim.',
      startGame, setup);
  };
  const startGame=()=>{
    scores=[0,0]; actorCursor=[0,0]; turn=0; runTeam();
  };
  const runTeam=()=>{
    const team=teams[turn], actor=team[actorCursor[turn]%team.length], opp=teams[1-turn];
    setStage(`<p class="kicker">Giliran ${turn===0?'Tim A':'Tim B'}</p><div class="who">${esc(actor)}</div>
      <p>Perwakilan melihat kata dan memperagakan. Rekan setim menebak. Tim pengawas: ${opp.map(esc).join(', ')}.</p>
      <p class="hint">Skor sementara: Tim A ${scores[0]} · Tim B ${scores[1]}</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai 60 detik</button>`);
    $('#go').onclick=playTeam;
  };
  const playTeam=()=>{
    const words=deck(Object.values(TEBAK).flat());
    const fs=document.createElement('div'); fs.className='fs';
    fs.innerHTML=`<div class="tg-top"><span id="t">60</span><span id="sc">0</span></div>
      <div class="char-word" id="w"></div>
      <div class="fs-actions"><button class="btn" id="skip">Lewat</button><button class="btn hot" id="ok">Benar</button></div>`;
    document.body.appendChild(fs);
    const w=fs.querySelector('#w'), t=fs.querySelector('#t'), sc=fs.querySelector('#sc');
    let score=0, left=60, live=true, lock=false, cur=words();
    w.textContent=cur;
    const answer=ok=>{
      if(!live || lock) return; lock=true;
      if(ok){ score++; sc.textContent=score; beep(1000,.1,'triangle',.15); buzz(60); } else beep(250,.1,'sawtooth');
      later(()=>{ if(!live) return; cur=words(); w.textContent=cur; lock=false; },450);
    };
    fs.querySelector('#ok').onpointerdown=()=>answer(true);
    fs.querySelector('#skip').onpointerdown=()=>answer(false);
    const clock=()=>{
      left--; t.textContent=left; if(left<=5) beep(1200,.05);
      if(left>0) return later(clock,1000);
      live=false; boom(); fs.remove(); scores[turn]=score; teamResult(score);
    };
    later(clock,1000);
  };
  const teamResult=score=>{
    const label=turn===0?'Tim A':'Tim B';
    setStage(`<p class="kicker">${label} dapat</p><div class="who" style="font-size:72px">${score}</div>
      <p>Skor sementara: Tim A ${scores[0]} · Tim B ${scores[1]}</p>`);
    actorCursor[turn]=(actorCursor[turn]+1)%teams[turn].length;
    if(turn===0){ turn=1; setActions(`<button class="btn ink xl" id="n">Giliran Tim B</button>`); $('#n').onclick=runTeam; }
    else { setActions(`<button class="btn hot xl" id="n">Lihat hasil</button>`); $('#n').onclick=final; }
  };
  const final=()=>{
    const min=Math.min(...scores);
    const loserTurns=scores.map((s,t)=>s===min?t:-1).filter(t=>t>=0);
    const losers=loserTurns.flatMap(t=>teams[t]);
    setStage(`<p class="kicker">Hasil</p><div class="board" style="width:100%">
      <div class="${scores[0]===min?'top':''}"><span>Tim A <small>(${teams[0].length} orang)</small></span><b>${scores[0]}</b></div>
      <div class="${scores[1]===min?'top':''}"><span>Tim B <small>(${teams[1].length} orang)</small></span><b>${scores[1]}</b></div></div>
      <p class="hint">${scores[0]===scores[1]?'Seri, kedua tim kena.':'Tim dengan skor terendah kena.'}</p>`);
    setActions(`<button class="btn hot xl" id="h">Hukum tim kalah</button>`);
    $('#h').onclick=()=>showHukuman(losers, scores[0]===scores[1]?'Seri di Estafet Tebak Gaya':`Skor terendah di Estafet Tebak Gaya (${min})`, setup, 'roda');
  };
  shell('Estafet Tebak Gaya',''); setup();
}
