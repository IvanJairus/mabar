let timers = [];
export const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
export const wait = ms => new Promise(r => later(r, ms));
export const clearGame = () => {
  timers.forEach(clearTimeout);
  timers = [];
  document.querySelectorAll('.fs,.rt,.buzz,.rt-flash').forEach(e => e.remove());
};
