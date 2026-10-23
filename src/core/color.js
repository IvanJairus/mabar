export const hexToRgb = hex => {
  const h=hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};

export const rgbToHex = rgb => '#'+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');

const linear = c => { c/=255; return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4; };

export const rgbToLab = rgb => {
  const [r,g,b]=rgb.map(linear);
  const x=(r*0.4124+g*0.3576+b*0.1805)/0.95047;
  const y=r*0.2126+g*0.7152+b*0.0722;
  const z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
  const f=t=>t>0.008856 ? Math.cbrt(t) : 7.787*t+16/116;
  const fx=f(x), fy=f(y), fz=f(z);
  return [116*fy-16, 500*(fx-fy), 200*(fy-fz)];
};

export const labDistance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

export function matchScore(targetHex, rgb){
  const d=labDistance(rgbToLab(hexToRgb(targetHex)), rgbToLab(rgb));
  return Math.max(0, Math.min(100, Math.round(100-d*1.3)));
}
