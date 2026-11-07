// Panel content for every clickable object. Pure functions of data.js, so they can be unit-tested.
import { profile, about, learning, journey, outside, golliath, skillsIntro, skills, workshopIntro, workshop, projects } from './data.js';

const tags = (items) => `<div class="tags">${items.map((i) => `<span>${i}</span>`).join('')}</div>`;
const groups = (list) => list.map((g) => `<h3>${g.group}</h3>${tags(g.items)}`).join('');

export const pages = {
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

// Header navigation: [section key, label]
export const navItems = [['chair', 'About'], ['skills', 'Skills'], ['workshop', 'DevOps'], ['projects', 'Projects'], ['contact', 'Contact']];
