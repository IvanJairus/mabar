import { clearGame, wait } from './timers.js';
import { beep } from './audio.js';

export const $ = s => document.querySelector(s);
export const app = $('#app');
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let toastTimer;
export function toast(msg){
  let el=$('#toast');
  if(!el){
    el=document.createElement('div');
    el.id='toast'; el.className='toast';
    el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
    document.body.appendChild(el);
  }
  el.textContent=msg;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
}

let homeHandler = () => {};
export const setHomeHandler = fn => { homeHandler = fn; };

export function shell(title, stage, actions=''){
  clearGame();
  const toastEl=$('#toast'); if(toastEl) toastEl.classList.remove('show');
  app.innerHTML = `<section class="game">
    <header class="bar"><button class="btn sm" id="back">← Daftar</button><h2>${title}</h2></header>
    <div class="stage" id="stage">${stage}</div>
    <div class="actions" id="actions">${actions}</div>
  </section>`;
  $('#back').onclick = () => homeHandler();
  keepAwake();
}
export const setStage = h => $('#stage').innerHTML = h;
export const setActions = h => $('#actions').innerHTML = h;

let wakeLock;
export async function keepAwake(){ try{ wakeLock = await navigator.wakeLock?.request('screen'); }catch(e){} }

export async function countdown(el){
  for(const n of [3,2,1]){ el.textContent = n; beep(500,.1); await wait(800); }
}
