export const S = JSON.parse(localStorage.getItem('mainrame') || 'null') || { players: [], kena: {} };
export const save = () => localStorage.setItem('mainrame', JSON.stringify(S));
