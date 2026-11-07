import './style.css';
import { profile } from './data.js';
import { pages, navItems } from './pages.js';
import { createScene } from './scene.js';
import { createAmbience } from './audio.js';
import { isTheme } from './themes.js';

const $ = (s) => document.querySelector(s);

$('#name').textContent = profile.name;
$('#role').textContent = profile.role;


const ambience = createAmbience();
const world = createScene($('#webgl'), {
  onPick: open,
  onDogs: (event) => event === 'spar-start' && ambience.growl(),
});

const areaOf = (key) => world.hotspots.find((h) => h.key === key)?.area;
let busy = false;

// Fade to black, move the camera between the clearing and the cabin, fade back in.
function goTo(area, then) {
  if (busy) return;
  if (world.area === area) return then?.();
  busy = true;
  if (area === 'inside') world.approach();
  document.body.classList.remove('reading');
  document.body.classList.add('fading');
  setTimeout(() => {
    world.setArea(area);
    document.body.classList.toggle('inside', area === 'inside');
    $('.hint').textContent = area === 'inside' ? 'Look around the cabin · click things to explore' : 'Drag to look around · click things to explore';
    document.body.classList.remove('fading');
    busy = false;
    setTimeout(() => then?.(), 350);
  }, 650);
}

function open(key) {
  if (key === 'golliath') ambience.bark();
  if (key === 'blk') ambience.bark(0.85);
  if (key === 'cabin') return goTo('inside');
  if (!pages[key]) return close();
  goTo(areaOf(key), () => {
    $('#panel-body').innerHTML = pages[key]();
    $('#panel').scrollTop = 0;
    document.body.classList.add('reading');
    world.focus(key);
  });
}
function close() {
  document.body.classList.remove('reading');
  world.focus(null);
}

// nav
$('#nav').innerHTML = navItems.map(([k, l]) => `<button data-go="${k}">${l}</button>`).join('');
document.addEventListener('click', (e) => {
  const go = /** @type {HTMLElement} */ (e.target).closest('[data-go]')?.getAttribute('data-go');
  if (go) go === 'home' ? goTo('outside', close) : open(go);
});
$('#close').onclick = close;
$('#exit').onclick = () => goTo('outside');
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.body.classList.contains('reading') || world.area === 'outside' ? close() : goTo('outside');
});

// in-world labels
const labelEls = {};
world.hotspots.forEach((h) => {
  const el = document.createElement('button');
  el.className = 'label';
  el.textContent = h.label;
  el.onclick = () => open(h.key);
  $('#labels').appendChild(el);
  labelEls[h.key] = el;
});
(function updateLabels() {
  for (const [k, p] of Object.entries(world.labelPositions)) {
    const el = labelEls[k];
    el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
    el.style.visibility = p.visible ? 'visible' : 'hidden';
    el.classList.toggle('hot', p.hot);
  }
  requestAnimationFrame(updateLabels);
})();

// day / night — night is the default; the visitor's choice is remembered
const storage = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
// ?theme=day / ?theme=night in the link wins for that visit (handy for sharing), without being saved
const linked = new URLSearchParams(location.search).get('theme');
let theme = isTheme(linked) ? linked : isTheme(storage.get('theme')) ? storage.get('theme') : 'night';
function applyThemeUI(instant) {
  const day = theme === 'day';
  document.body.classList.toggle('day', day);
  const btn = $('#theme');
  btn.textContent = day ? '☾' : '☀︎';
  btn.setAttribute('aria-label', day ? 'Switch to night' : 'Switch to morning');
  btn.setAttribute('title', day ? 'Switch to night' : 'Switch to morning');
  world.setTheme(/** @type {'night'|'day'} */ (theme), instant);
  ambience.setDaytime(day);
}
$('#theme').addEventListener('click', () => {
  theme = theme === 'day' ? 'night' : 'day';
  storage.set('theme', theme);
  applyThemeUI(false);
});
applyThemeUI(true);

// ambience
$('#sound').onclick = (e) => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', on);
  e.currentTarget.textContent = on ? '♪ sound on' : '♪ sound off';
  on ? ambience.on() : ambience.off();
};

// hide the loader once loaded, or after 3.5s at most (slow fonts/network shouldn't block the scene)
const hideLoader = () => $('#loader').classList.add('done');
addEventListener('load', () => setTimeout(hideLoader, 300));
setTimeout(hideLoader, 3500);
