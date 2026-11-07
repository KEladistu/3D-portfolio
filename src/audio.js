// Procedural cozy ambience: soft fireplace, gentle crickets and a slow music-box melody — no audio files.
export function createAmbience() {
  let ctx, master, echo, enabled = false, daytime = false;
  const timers = [];
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
    if (daytime) return void timers.push(setTimeout(cricket, 2000));
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

  // morning: a few soft songbird phrases (quick sine sweeps), spaced out so it stays calm
  function bird() {
    if (!daytime) return void timers.push(setTimeout(bird, 2000));
    const t0 = ctx.currentTime;
    const base = 2200 + Math.random() * 1400;
    const notes = 2 + Math.floor(Math.random() * 4);
    for (let n = 0; n < notes; n++) {
      const t = t0 + n * (0.11 + Math.random() * 0.05);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.25), t);
      osc.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.3), t + 0.07);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.012, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(g);
      g.connect(master);
      g.connect(echo);
      osc.start(t);
      osc.stop(t + 0.1);
    }
    timers.push(setTimeout(bird, 1800 + Math.random() * 4500));
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
    bird();
    timers.push(setTimeout(note, 1500));
  }

  // a small, friendly toy-poodle "arf"
  function bark(pitch = 1) {
    const t = ctx.currentTime;
    [0, 0.17].forEach((at) => {
      const osc = ctx.createOscillator();
      const bp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(720 * pitch, t + at);
      osc.frequency.exponentialRampToValueAtTime(430 * pitch, t + at + 0.1);
      bp.type = 'bandpass';
      bp.frequency.value = 1100;
      bp.Q.value = 1.2;
      g.gain.setValueAtTime(0, t + at);
      g.gain.linearRampToValueAtTime(0.12, t + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.12);
      osc.connect(bp).connect(g);
      g.connect(master);
      g.connect(echo);
      osc.start(t + at);
      osc.stop(t + at + 0.14);
    });
  }

  // two small dogs grumbling at each other: low buzzy growls with a rumbling tremolo,
  // plus a couple of little snaps. Kept quiet and short so it stays funny, not scary.
  function growl(seconds = 3.2) {
    const t = ctx.currentTime;
    [[105, 0], [132, 0.25]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      const trem = ctx.createOscillator();
      const tremDepth = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.linearRampToValueAtTime(freq * 1.15, t + delay + seconds * 0.5);
      osc.frequency.linearRampToValueAtTime(freq * 0.95, t + seconds);
      lp.type = 'lowpass';
      lp.frequency.value = 520;
      trem.frequency.value = 22 + Math.random() * 6;
      tremDepth.gain.value = 0.025;
      trem.connect(tremDepth).connect(g.gain);
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.045, t + delay + 0.25);
      g.gain.setValueAtTime(0.045, t + seconds - 0.4);
      g.gain.linearRampToValueAtTime(0, t + seconds);
      osc.connect(lp).connect(g).connect(master);
      osc.start(t + delay);
      trem.start(t + delay);
      osc.stop(t + seconds + 0.05);
      trem.stop(t + seconds + 0.05);
    });
    timers.push(setTimeout(() => bark(1.25), seconds * 350), setTimeout(() => bark(0.85), seconds * 700));
  }

  return {
    setDaytime(isDay) { daytime = isDay; },
    bark(pitch) { if (enabled) bark(pitch); },
    growl(seconds) { if (enabled) growl(seconds); },
    on() {
      enabled = true;
      if (!ctx) return start();
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(LEVEL, ctx.currentTime + 1.5);
    },
    off() {
      enabled = false;
      if (!ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    },
  };
}
