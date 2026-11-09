import { esc } from './ui.js';

export const demoHtml = d => ({
  tekan: `<div class="demo demo-tekan" aria-hidden="true"><div class="dz"><span class="a">TAHAN</span><span class="b">TEKAN!</span></div></div>`,
  roulette: `<div class="demo demo-rou" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="boom">DUARR</span></div>`,
  kode: `<div class="demo demo-kode" aria-hidden="true">${['r','b','n','r','x','b','n','r','b'].map(c => `<i class="${c}">${c==='x'?'X':''}</i>`).join('')}</div>`
}[d] || '');

export const howtoBody = t => `${t.demo ? demoHtml(t.demo) : ''}
  <ol class="tsteps">${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  <div class="tend"><div class="win"><small>Aman / menang</small>${esc(t.win)}</div><div class="lose"><small>Kena hukuman</small>${esc(t.lose)}</div></div>`;
