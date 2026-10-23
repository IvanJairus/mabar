export const rand = a => a[Math.floor(Math.random()*a.length)];
export const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; };
export const deck = arr => { let d=[]; return () => { if(!d.length) d=shuffle(arr); return d.pop(); }; };
