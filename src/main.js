import './style.css';
import { profile, about, skills, workshop, projects } from './data.js';
import { createScene } from './scene.js';
import { createAmbience } from './audio.js';

const $ = (s) => document.querySelector(s);

$('#name').textContent = profile.name;
$('#role').textContent = profile.role;

const tags = (items) => `<div class="tags">${items.map((i) => `<span>${i}</span>`).join('')}</div>`;
const groups = (list) => list.map((g) => `<h3>${g.group}</h3>${tags(g.items)}`).join('');

const pages = {
  about: () => `
    <p class="kicker">The cabin</p>
    <h2>About me</h2>
    ${about.map((p) => `<p>${p}</p>`).join('')}
    <hr />
    <p><strong>${profile.role}</strong><br />${profile.location}</p>`,
  skills: () => `
    <p class="kicker">By the fire</p>
    <h2>What I build with</h2>
    <p>The everyday tools for building the product itself — interface, API and data.</p>
    ${groups(skills)}`,
  workshop: () => `
    <p class="kicker">The workshop</p>
    <h2>DevOps & cloud</h2>
    <p>Where things get packaged, tested, shipped and watched. Yes, there’s a little server rack in the woodshed.</p>
    ${groups(workshop)}`,
  projects: () => `
    <p class="kicker">Down the trail</p>
    <h2>Projects</h2>
    ${projects.map((p) => `
      <div class="project"><a href="${p.link}" target="_blank" rel="noopener">
        <p class="kicker">${p.tag}</p>
        <h3>${p.title} <span>↗</span></h3>
        <p>${p.desc}</p>
        ${tags(p.stack)}
      </a></div>`).join('')}`,
  contact: () => `
    <p class="kicker">The mailbox</p>
    <h2>Say hello</h2>
    <p>Open to full-time roles, freelance work, and good conversations about infrastructure. I usually reply within a day.</p>
    <ul class="links">
      <li><a href="mailto:${profile.email}">Email <small>${profile.email}</small></a></li>
      <li><a href="${profile.github}" target="_blank" rel="noopener">GitHub <small>↗</small></a></li>
      <li><a href="${profile.linkedin}" target="_blank" rel="noopener">LinkedIn <small>↗</small></a></li>
      <li><a href="${profile.resume}" target="_blank" rel="noopener">Résumé <small>↗</small></a></li>
    </ul>`,
};

const world = createScene($('#webgl'), { onPick: open });

function open(key) {
  if (!pages[key]) return close();
  $('#panel-body').innerHTML = pages[key]();
  $('#panel').scrollTop = 0;
  document.body.classList.add('reading');
  world.focus(key);
}
function close() {
  document.body.classList.remove('reading');
  world.focus(null);
}

// nav
const navItems = [['about', 'About'], ['skills', 'Skills'], ['workshop', 'DevOps'], ['projects', 'Projects'], ['contact', 'Contact']];
$('#nav').innerHTML = navItems.map(([k, l]) => `<button data-go="${k}">${l}</button>`).join('');
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]')?.dataset.go;
  if (go) go === 'home' ? close() : open(go);
});
$('#close').onclick = close;
addEventListener('keydown', (e) => e.key === 'Escape' && close());

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

// ambience
const ambience = createAmbience();
$('#sound').onclick = (e) => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', on);
  e.currentTarget.textContent = on ? '♪ sound on' : '♪ sound off';
  on ? ambience.on() : ambience.off();
};

addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 300));
