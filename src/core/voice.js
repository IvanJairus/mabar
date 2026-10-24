let ctx;
const AudioCtor = window.AudioContext || window.webkitAudioContext;

export const canSpeak = () => typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
export const canRecord = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && AudioCtor);
export const getAudioContext = () => {
  if(!ctx) ctx = new AudioCtor();
  return ctx;
};
export function stopSpeech(){
  if(canSpeak()) speechSynthesis.cancel();
}
export async function speakWord(text, {pitch=1, rate=1}={}){
  if(!canSpeak()) throw new Error('speak-unsupported');
  return new Promise((resolve,reject)=>{
    const u=new SpeechSynthesisUtterance(text);
    u.lang='id-ID';
    u.pitch=pitch;
    u.rate=rate;
    const voice=speechSynthesis.getVoices().find(v=>(v.lang||'').toLowerCase().startsWith('id'));
    if(voice) u.voice=voice;
    u.onend=()=>resolve();
    u.onerror=e=>reject(e);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
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

export async function speakVibrato(text, {rate=1}={}){
  const chunks=text.match(/.{1,2}/g) || [text];
  for(let i=0;i<chunks.length;i++){
    await speakWord(chunks[i], {pitch:i%2?1.5:0.6, rate});
  }
}

export async function playBuffer(buffer, {pitch=1, lowpass=false, vibrato=false}={}){
  const c=getAudioContext();
  if(c.state==='suspended') await c.resume();
  return new Promise(resolve=>{
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
    let lfo=null, lfoGain=null;
    if(vibrato){
      lfo=c.createOscillator();
      lfo.frequency.value=5.5;
      lfoGain=c.createGain();
      lfoGain.gain.value=0.08;
      lfo.connect(lfoGain);
      lfoGain.connect(src.playbackRate);
      lfo.start();
    }
    src.onended=()=>{
      if(lfo){ try{ lfo.stop(); }catch(e){} }
      resolve();
    };
    src.start();
  });
}
