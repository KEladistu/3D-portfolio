// Procedural cozy ambience: soft fireplace, gentle crickets and a slow music-box melody — no audio files.
export function createAmbience() {
  let ctx, master, echo, timers = [];
  const LEVEL = 0.5;

  function noiseBuffer(seconds = 3) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; // brown noise
      d[i] = last * 3.5;
    }
    return buf;
  }

  // soft feedback delay so notes and pops sound like they're in a wooden room
  function makeEcho() {
    const input = ctx.createGain();
    const delay = ctx.createDelay();
    const fb = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    delay.delayTime.value = 0.32;
    fb.gain.value = 0.32;
    tone.type = 'lowpass';
    tone.frequency.value = 1800;
    input.connect(delay).connect(tone).connect(fb).connect(delay);
    tone.connect(master);
    return input;
  }

  function fireBed() {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 650;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    src.connect(lp).connect(g).connect(master);
    src.start();
  }

  function crackle() {
    const t = ctx.currentTime;
    const len = 0.012 + Math.random() * 0.025;
    const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700 + Math.random() * 1400;
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = 0.03 + Math.random() * 0.07;
    src.connect(bp).connect(g).connect(master);
    src.start(t);
    // mostly small ticks, occasionally a little cluster
    timers.push(setTimeout(crackle, Math.random() < 0.25 ? 60 + Math.random() * 120 : 250 + Math.random() * 900));
  }

  function cricket() {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 2900 + Math.random() * 300;
    g.gain.value = 0;
    for (let i = 0; i < 2; i++) {
      g.gain.setTargetAtTime(0.004, t + i * 0.09, 0.01);
      g.gain.setTargetAtTime(0, t + i * 0.09 + 0.04, 0.015);
    }
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.4);
    timers.push(setTimeout(cricket, 1500 + Math.random() * 3500));
  }

  // slow, warm music-box notes from a major pentatonic scale
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  let step = 0;
  function note() {
    const t = ctx.currentTime;
    const idx = Math.max(0, Math.min(SCALE.length - 1, step + Math.round((Math.random() - 0.5) * 3)));
    step = idx;
    [1, 2].forEach((mult, k) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = SCALE[idx] * mult;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(k ? 0.012 : 0.045, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      osc.connect(g);
      g.connect(master);
      g.connect(echo);
      osc.start(t);
      osc.stop(t + 2.7);
    });
    timers.push(setTimeout(note, Math.random() < 0.2 ? 2600 + Math.random() * 2000 : 750 + Math.random() * 500));
  }

  function start() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(LEVEL, ctx.currentTime + 3);
    echo = makeEcho();
    fireBed();
    crackle();
    cricket();
    timers.push(setTimeout(note, 1500));
  }

  return {
    on() {
      if (!ctx) return start();
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(LEVEL, ctx.currentTime + 1.5);
    },
    off() {
      if (!ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    },
  };
}
