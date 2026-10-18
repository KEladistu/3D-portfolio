import './style.css';
import { profile, about, learning, journey, outside, golliath, skillsIntro, skills, workshopIntro, workshop, projects } from './data.js';
import { createScene } from './scene.js';
import { createAmbience } from './audio.js';

const $ = (s) => document.querySelector(s);

$('#name').textContent = profile.name;
$('#role').textContent = profile.role;

const tags = (items) => `<div class="tags">${items.map((i) => `<span>${i}</span>`).join('')}</div>`;
const groups = (list) => list.map((g) => `<h3>${g.group}</h3>${tags(g.items)}`).join('');

const pages = {
  chair: () => `
    <p class="kicker">The armchair</p>
    <h2>About me</h2>
    ${about.map((p) => `<p>${p}</p>`).join('')}
    <hr />
    <p><strong>${profile.role}</strong><br />${profile.location}</p>`,
  bookshelf: () => `
    <p class="kicker">The bookshelf</p>
    <h2>Always learning</h2>
    <p>${learning.intro}</p>
    <h3>Education</h3>
    ${learning.education.map((e) => `<p><strong>${e.title}</strong><br />${e.place}</p>`).join('')}
    <h3>Currently exploring</h3>${tags(learning.now)}`,
  fireplace: () => `
    <p class="kicker">By the fireplace</p>
    <h2>My journey</h2>
    ${journey.map((j) => `
      <div class="project">
        <p class="kicker">${j.year}</p><h3>${j.title}</h3><p>${j.text}</p>
        ${j.points ? `<ul class="points">${j.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : ''}
      </div>`).join('')}`,
  painting: () => `
    <p class="kicker">The deer painting</p>
    <h2>Life outside code</h2>
    <p>${outside.intro}</p>
    <h3>Things I love</h3>${tags(outside.hobbies)}`,
  golliath: () => `
    <p class="kicker">Woof</p>
    <h2>Golliath</h2>
    <p>${golliath.intro}</p>
    <h3>Quick facts</h3>${tags(golliath.facts)}
    <ul class="links"><li><a href="${golliath.game}" target="_blank" rel="noopener">Play the Golliath game <small>↗</small></a></li></ul>`,
  skills: () => `
    <p class="kicker">By the fire</p>
    <h2>What I build with</h2>
    <p>${skillsIntro}</p>
    ${groups(skills)}`,
  workshop: () => `
    <p class="kicker">The workshop</p>
    <h2>DevOps & cloud</h2>
    <p>${workshopIntro}</p>
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
    <p>Open to full-time roles, freelance work, and good conversations about robots, the web and the cloud.</p>
    <ul class="links">
      <li><a href="mailto:${profile.email}">Email <small>${profile.email}</small></a></li>
      ${[['GitHub', profile.github], ['Website', profile.website], ['LinkedIn', profile.linkedin], ['Résumé', profile.resume]]
        .filter(([, url]) => url)
        .map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${label} <small>↗</small></a></li>`).join('')}
    </ul>`,
};

const ambience = createAmbience();
const world = createScene($('#webgl'), { onPick: open });

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
const navItems = [['chair', 'About'], ['skills', 'Skills'], ['workshop', 'DevOps'], ['projects', 'Projects'], ['contact', 'Contact']];
$('#nav').innerHTML = navItems.map(([k, l]) => `<button data-go="${k}">${l}</button>`).join('');
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]')?.dataset.go;
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
