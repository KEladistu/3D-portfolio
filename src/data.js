// ───────────────────────────────────────────────
//  Edit this file to personalize the portfolio.
// ───────────────────────────────────────────────

export const profile = {
  name: 'Kenneth Eladistu',
  role: 'Full-stack developer · DevOps & Cloud',
  location: 'Philippines · working remotely',
  email: 'kennetheladistu@gmail.com',
  github: 'https://github.com/',
  linkedin: 'https://linkedin.com/',
  resume: '#',
};

export const about = [
  'Hi, I’m Kenneth. I build web products from the first line of UI to the servers they run on.',
  'Most days I’m writing TypeScript and Node, designing APIs and databases, and then automating the boring parts — pipelines, containers, and cloud infrastructure — so shipping feels calm instead of scary.',
  'Pull up a log by the fire and have a look around.',
];

// ── Inside the cabin ─────────────────────────────
export const learning = {
  intro: 'A few books and courses that shaped how I work — and what I’m reading now.',
  reading: ['The Phoenix Project', 'Designing Data-Intensive Applications', 'Site Reliability Engineering'],
  certs: ['AWS Certified Cloud Practitioner (in progress)', 'Certified Kubernetes Administrator (goal)'],
  now: ['Platform engineering', 'eBPF & observability', 'Rust for CLI tools'],
};

export const journey = [
  { year: '2026', title: 'Full-stack & DevOps engineer', text: 'Shipping products end-to-end and automating the path to production.' },
  { year: '2025', title: 'Into the cloud', text: 'Containers, Kubernetes and Terraform — infrastructure as code clicked.' },
  { year: '2023', title: 'First full-stack apps', text: 'React frontends, Node APIs, Postgres. Learned by building.' },
  { year: '2021', title: 'Hello, world', text: 'Wrote my first lines of code and never really stopped.' },
];

export const outside = {
  intro: 'When I’m not at a terminal, you’ll probably find me somewhere like this painting.',
  hobbies: ['Hiking & camping', 'Photography', 'Coffee brewing', 'Video games', 'Reading by the fire'],
};

export const skills = [
  { group: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Three.js'] },
  { group: 'Backend', items: ['Node.js', 'NestJS', 'Express', 'Python', 'GraphQL', 'REST'] },
  { group: 'Data', items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'] },
];

export const workshop = [
  { group: 'Containers', items: ['Docker', 'Kubernetes', 'Helm', 'Nginx'] },
  { group: 'CI / CD', items: ['GitHub Actions', 'GitLab CI', 'ArgoCD', 'Jenkins'] },
  { group: 'Cloud & IaC', items: ['AWS', 'Azure', 'GCP', 'Terraform'] },
  { group: 'Observability', items: ['Prometheus', 'Grafana', 'Loki'] },
];

export const projects = [
  {
    title: 'CloudDeploy Platform',
    tag: 'DevOps',
    desc: 'Preview environments for every pull request on Kubernetes, provisioned with Terraform and synced by ArgoCD.',
    stack: ['Terraform', 'EKS', 'ArgoCD', 'GitHub Actions'],
    link: '#',
  },
  {
    title: 'Realtime Commerce',
    tag: 'Full-stack',
    desc: 'Storefront with live inventory, Stripe payments and a Redis-backed event bus.',
    stack: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis'],
    link: '#',
  },
  {
    title: 'Observability Stack',
    tag: 'SRE',
    desc: 'A drop-in Helm chart bundling Prometheus, Loki and Grafana with ready-made SLO dashboards.',
    stack: ['Helm', 'Prometheus', 'Grafana'],
    link: '#',
  },
];
