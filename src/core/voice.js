let ctx;
let currentSource=null;
const AudioCtor = window.AudioContext || window.webkitAudioContext;

export const canPlay = () => !!AudioCtor;
export const canRecord = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && AudioCtor);
export const getAudioContext = () => {
  if(!ctx) ctx = new AudioCtor();
  return ctx;
};

export function stopAudio(){
  if(currentSource){
    try{ currentSource.stop(); }catch(e){}
    currentSource=null;
  }
}

export async function loadBuffer(url){
  const res=await fetch(url);
  if(!res.ok) throw new Error('audio-fetch');
  return getAudioContext().decodeAudioData(await res.arrayBuffer());
}

export async function recordClip(ms=3000, onTick){
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const rec=new MediaRecorder(stream);
  const chunks=[];
  rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  const stopped=new Promise(resolve=>{ rec.onstop=resolve; });
  rec.start();
  const started=Date.now();
  const iv=setInterval(()=>{
    if(onTick) onTick(Math.max(0, ms-(Date.now()-started)));
  },150);
  await new Promise(resolve=>setTimeout(resolve,ms));
  clearInterval(iv);
  rec.stop();
  await stopped;
  stream.getTracks().forEach(t=>t.stop());
  const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});
  const buffer=await getAudioContext().decodeAudioData(await blob.arrayBuffer());
  if(onTick) onTick(0);
  return buffer;
}

export function reverseBuffer(buffer){
  const c=getAudioContext();
  const out=c.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for(let ch=0;ch<buffer.numberOfChannels;ch++){
    const src=buffer.getChannelData(ch);
    const dst=out.getChannelData(ch);
    for(let i=0;i<src.length;i++) dst[i]=src[src.length-1-i];
  }
  return out;
}

export async function playBuffer(buffer, {pitch=1, lowpass=false, vibrato=false}={}){
  const c=getAudioContext();
  if(c.state==='suspended') await c.resume();
  return new Promise(resolve=>{
    stopAudio();
    const src=c.createBufferSource();
    src.buffer=buffer;
    src.playbackRate.value=pitch;
    let tail=src;
    if(lowpass){
      const filter=c.createBiquadFilter();
      filter.type='lowpass';
      filter.frequency.value=1200;
      tail.connect(filter);
      tail=filter;
    }
    tail.connect(c.destination);
    let lfo=null;
    if(vibrato){
      lfo=c.createOscillator();
      lfo.frequency.value=5.5;
      const lfoGain=c.createGain();
      lfoGain.gain.value=0.08;
      lfo.connect(lfoGain);
      lfoGain.connect(src.playbackRate);
      lfo.start();
    }
    currentSource=src;
    src.onended=()=>{
      if(currentSource===src) currentSource=null;
      if(lfo){ try{ lfo.stop(); }catch(e){} }
      resolve();
    };
    src.start();
  });
}
