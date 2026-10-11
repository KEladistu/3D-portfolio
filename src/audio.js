// Procedural forest ambience: wind, fire crackle and crickets — no audio files needed.
export function createAmbience() {
  let ctx, master, timers = [];

  function noiseBuffer(seconds = 2) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; // brown noise
      d[i] = last * 3.5;
    }
    return buf;
  }

  function start() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2);

    // wind / fire roar
    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer();
    wind.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    const wg = ctx.createGain();
    wg.gain.value = 0.35;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(lp.frequency);
    wind.connect(lp).connect(wg).connect(master);
    wind.start();
    lfo.start();

    // crackles
    const crackle = () => {
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1500 + Math.random() * 3000;
      const g = ctx.createGain();
      g.gain.value = 0.05 + Math.random() * 0.25;
      src.connect(hp).connect(g).connect(master);
      src.start(t);
      timers.push(setTimeout(crackle, 40 + Math.random() * (Math.random() > 0.8 ? 900 : 200)));
    };
    crackle();

    // crickets
    const cricket = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = 4200 + Math.random() * 400;
      g.gain.value = 0;
      for (let i = 0; i < 3; i++) {
        g.gain.setValueAtTime(0.012, t + i * 0.06);
        g.gain.setValueAtTime(0, t + i * 0.06 + 0.03);
      }
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 0.25);
      timers.push(setTimeout(cricket, 600 + Math.random() * 1800));
    };
    cricket();
  }

  return {
    on() { if (!ctx) start(); else { ctx.resume(); master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1); } },
    off() { if (ctx) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); },
  };
}
