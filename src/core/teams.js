import { S } from './state.js';
import { shuffle } from './random.js';
import { $, esc, shell, setStage, setActions } from './ui.js';

export const twoTeams = () => {
  const order=shuffle(S.players), mid=Math.ceil(order.length/2);
  return [order.slice(0,mid), order.slice(mid)];
};

export function teamIntro(title, teams, labels, note, onStart, onShuffle){
  shell(title, `<p class="kicker">Bagi tim</p><h2 class="big">${esc(title)}</h2>
    <p>${note}</p>
    <div class="teams">${teams.map((m,i)=>`<div class="teamrow"><span>${labels[i]}</span><span class="teamnames">${m.map(esc).join(', ')}</span></div>`).join('')}</div>`);
  setActions(`<div class="row"><button class="btn" id="shuffleTeams">Acak tim</button><button class="btn ink" id="startTeams">Mulai</button></div>`);
  $('#shuffleTeams').onclick = onShuffle;
  $('#startTeams').onclick = onStart;
}
