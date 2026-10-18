// ───────────────────────────────────────────────
//  Edit this file to personalize the portfolio.
// ───────────────────────────────────────────────

export const profile = {
  name: 'Kenneth Eladistu',
  role: 'Robotics engineer · Full-stack developer',
  location: 'Olongapo City, Philippines',
  email: 'kennetheladistu@gmail.com',
  github: 'https://github.com/KEladistu',
  website: 'https://kennetheladistu.vercel.app',
  linkedin: '', // add your LinkedIn URL to show it on the Contact panel
  resume: '', // e.g. '/resume.pdf' after placing the file in public/
};

export const about = [
  'Hi, I’m Kenneth — a full-stack developer with 5 years of building production apps in Django, React, Node.js and Three.js.',
  'For the last 3 years I’ve also been a robotics engineer, integrating robotic arms with ROS2 and building the dashboards, data pipelines and cloud storage around them.',
  'I’m comfortable across the web layer, the hardware layer and the cloud. Pull up a chair and have a look around.',
];

// ── Inside the cabin ─────────────────────────────
export const learning = {
  intro: 'Where it started, and what I keep picking up along the way.',
  education: [{ title: 'BS Computer Engineering', place: 'Columban College, Olongapo City' }],
  now: ['ROS2 & MoveIt2', 'Computer vision (YOLOv8, OCR)', 'Azure cloud & security', 'Three.js & interactive 3D'],
};

export const journey = [
  {
    year: '2024 – now',
    title: 'Robotics Engineer (Full-stack) · Planate, SBFZ',
    text: 'Own the software around a dual-arm robotic cell, from ROS2 integration to the cloud.',
    points: [
      'Integrated a dual-arm Trossen cell with ROS2 — 12 hardware components incl. arms, vacuum, E-Stop, UPS and 4 camera streams.',
      'Built a real-time dashboard running Django as a native ROS2 node (rclpy), removing rosbridge and replaying the last 500 logs on reconnect.',
      'Engineered a 100 Hz joint-state heartbeat that surfaces arm failures in under 3 seconds.',
      'Architected the Azure Blob Storage layer for all robotics data, replacing every connection string and SAS token with Azure AD RBAC.',
      'Built an automated local-to-cloud data pipeline with systemd timers and SHA256 verification — no duplicates, no manual transfers.',
      'Wrote operator SOPs for all 12 components so non-technical operators can resolve common faults.',
    ],
  },
  {
    year: '2023 – 2024',
    title: 'Junior Robotics Engineer · Planate, SBFZ',
    text: 'Machine learning, dashboards and automation for pick-and-place robotics.',
    points: [
      'Integrated and fine-tuned YOLOv8 OBB object detection for a production pick-and-place setup.',
      'Built a Django dashboard surfacing detection and OCR results from PostgreSQL.',
      'Automated local-to-cloud data sync with Celery and Redis.',
      'Developed a Flutter app to control an xArm6 over sockets — no tethered workstation needed.',
    ],
  },
  {
    year: 'Before',
    title: 'BS Computer Engineering · Columban College',
    text: 'Where the hardware-meets-software path began.',
  },
];

export const outside = {
  intro: 'When I’m not at a terminal, I’m usually building something just for fun — or hanging out with Golliath, my apricot toy poodle (who now has his own video game).',
  hobbies: ['Golliath the poodle', 'Making small games', 'Building with 3D on the web', 'Tinkering with hardware'],
};

// ── Outside ──────────────────────────────────────
export const skillsIntro = 'The tools I use to build the product itself — interface, API, data and the robots behind it.';
export const skills = [
  { group: 'Languages', items: ['Python', 'JavaScript', 'Dart', 'SQL', 'Bash', 'HTML/CSS'] },
  { group: 'Frontend & mobile', items: ['React', 'Three.js', 'Flutter'] },
  { group: 'Backend', items: ['Django', 'Django Channels', 'Node.js', 'REST APIs', 'WebSockets', 'Celery', 'Redis'] },
  { group: 'Data', items: ['PostgreSQL', 'SQLite', 'MongoDB'] },
  { group: 'Robotics & vision', items: ['ROS2', 'rclpy', 'MoveIt2', 'YOLOv8', 'OCR', 'Jetson AGX Orin', 'Socket programming'] },
];

export const workshopIntro = 'Where things get packaged, shipped, stored and kept safe. I designed and run an automated pipeline that moves robotics data from local machines to Azure — verified, deduplicated and secured with RBAC.';
export const workshop = [
  { group: 'Cloud & security', items: ['Azure Blob Storage', 'Azure AD / RBAC'] },
  { group: 'Automation & pipelines', items: ['systemd timers', 'Celery + Redis', 'SHA256-verified sync', 'CI/CD'] },
  { group: 'Infrastructure', items: ['Docker', 'Linux', 'Bash'] },
  { group: 'Source control', items: ['Git', 'GitHub', 'GitLab'] },
];

export const projects = [
  {
    title: 'TindaPOS',
    tag: 'Offline-first PWA',
    desc: 'Tablet-friendly point of sale for Philippine small businesses — sari-sari, LPG and restaurant profiles. Runs fully in the browser on IndexedDB with reports, receipts (incl. Bluetooth printing), PIN login and backups.',
    stack: ['TypeScript', 'Vite', 'Tailwind', 'IndexedDB', 'PWA', 'Vitest'],
    link: 'https://github.com/KEladistu/tindapos',
  },
  {
    title: 'ShopSphere',
    tag: 'Full-stack e-commerce',
    desc: 'E-commerce template with a Django REST + JWT backend and a Next.js 14 storefront, full admin CRUD and a pytest test suite.',
    stack: ['Django REST', 'Next.js 14', 'TypeScript', 'PostgreSQL', 'pytest'],
    link: 'https://github.com/KEladistu/shopsphere',
  },
  {
    title: 'Golliath',
    tag: 'Browser game',
    desc: 'A tiny canvas game starring my real toy poodle. Two-player, mobile joystick, procedural pixel art, PWA install — no build step, no dependencies.',
    stack: ['Vanilla JS', 'HTML5 Canvas', 'PWA'],
    link: 'https://keladistu.github.io/Golliath/',
  },
];
