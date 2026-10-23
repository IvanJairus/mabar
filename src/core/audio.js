let ac;
export function beep(freq=600, dur=.08, type='square', vol=.08){
  try{
    ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const o=ac.createOscillator(), g=ac.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=vol;
    o.connect(g); g.connect(ac.destination);
    g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime+dur);
    o.start(); o.stop(ac.currentTime+dur);
  }catch(e){}
}
export const buzz = p => navigator.vibrate && navigator.vibrate(p);
export function boom(){ beep(90,.7,'sawtooth',.25); beep(60,.9,'square',.2); buzz([400,80,400]); }
