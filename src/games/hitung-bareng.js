import { $, S, esc, shuffle, later, shell, setStage, setActions, beep, buzz, showHukuman } from '../core/index.js';
import { HITUNG_RULES } from '../data/hitung.js';

const matches = (r, n) => r.kind==='mult' ? n % r.n === 0 : r.kind==='has' ? String(n).includes(String(r.n)) : n % 10 === r.n;
const label = r => r.kind==='mult' ? `Kelipatan ${r.n}` : r.kind==='has' ? `Ada angka ${r.n}` : `Berakhiran ${r.n}`;
const answerFor = (rules, n) => { const hit = rules.filter(r => matches(r, n)); return hit.length ? hit.map(r => r.say).join(' ') : String(n); };

export function gameHitung(){
  const p = S.players;
  let i = Math.floor(Math.random()*p.length), n, rules, pool, timer, left, active;

  const ruleCard = () => `<div class="board" style="width:100%;text-align:left">${rules.map(r => `<div><span>${esc(label(r))}</span><b>${esc(r.say)}</b></div>`).join('')}</div>`;

  const newRound = () => {
    n = 1; pool = shuffle(HITUNG_RULES); rules = [pool.pop(), pool.pop()];
    while(rules[0].kind===rules[1].kind && rules[0].n===rules[1].n) rules[1] = pool.pop();
    setStage(`<p class="kicker">Aturan ronde ini</p><h2 class="big">Hitung Bareng</h2>${ruleCard()}
      <p>Mulai dari <b>${esc(p[i])}</b>. Hitung 1, 2, 3... gantian. Kalau angkanya kena aturan di atas, ganti dengan katanya. Tiap 8 angka bakal muncul aturan baru!</p>`);
    setActions(`<button class="btn hot xl" id="go">Mulai hitung</button>`);
    $('#go').onclick = turn;
  };

  const turn = () => {
    active = true; left = n > 24 ? 2 : 3;
    setStage(`<p class="kicker">Giliran · ${esc(p[i])}</p>
      <div class="sk-tile" style="width:104px;height:104px;font-size:52px">${n}</div>
      ${ruleCard()}<div class="who${left<=2?' urgent':''}" id="clock">${left}</div>`);
    setActions(`<div class="row"><button class="btn hot" id="salah">Salah!</button><button class="btn ink" id="ok">Udah ngomong →</button></div>`);
    $('#ok').onclick = ok; $('#salah').onclick = () => fail('Salah ngomong');
    clearTimeout(timer); timer = later(tick, 1000);
  };

  const tick = () => {
    if(!active) return;
    left--; const el = $('#clock');
    if(el){ el.textContent = left; el.classList.toggle('urgent', left <= 2); }
    if(left <= 0) return fail('Kelamaan mikir');
    beep(1000,.05); timer = later(tick, 1000);
  };

  const ok = () => {
    active = false; clearTimeout(timer); beep(900,.05); buzz(20);
    n++; i = (i+1) % p.length;
    if((n-1) % 8 === 0 && rules.length < 4){
      const fresh = pool.find(r => !rules.some(x => x.kind===r.kind && x.n===r.n));
      if(fresh){
        rules.push(fresh); pool = pool.filter(r => r !== fresh);
        setStage(`<p class="kicker">Aturan tambahan</p><h2 class="big">${esc(label(fresh))}</h2><p>Wajib ganti jadi <b>${esc(fresh.say)}</b>. Kalau kena dua aturan sekaligus, sebut dua-duanya berurutan.</p>${ruleCard()}`);
        setActions(`<button class="btn ink xl" id="lanjut">Lanjut hitung</button>`); $('#lanjut').onclick = turn;
        return;
      }
    }
    turn();
  };

  const fail = why => {
    active = false; clearTimeout(timer); beep(180,.25); buzz(200);
    const ans = answerFor(rules, n);
    setStage(`<p class="kicker">${esc(why)}</p><h2 class="big">${esc(p[i])}</h2><p>Di angka <b>${n}</b>, harusnya sebut <b>${esc(ans)}</b>.</p>`); setActions('');
    later(() => showHukuman([p[i]], `${why} di angka ${n} (harusnya: ${ans})`, () => { i = (i+1)%p.length; newRound(); }, 'hitung'), 1200);
  };

  shell('Hitung Bareng', ''); newRound();
}
