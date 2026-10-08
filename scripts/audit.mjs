// Design + integrity audit for zan-blog. Run: npm run audit (after build).
// Fails (exit 1) on structural problems; fails on text-contrast < 4.5.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');
let errors = 0;
const fail = (m) => { errors++; console.error(`  FAIL ${m}`); };
const ok = (m) => console.log(`  ok   ${m}`);

// walk helper
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 1. required dist outputs
console.log('dist outputs:');
for (const f of ['index.html', 'blog/index.html', 'opinions/index.html', 'about/index.html', 'now/index.html', 'rss.xml', 'sitemap-index.xml', '.nojekyll']) {
  existsSync(join(dist, f)) ? ok(f) : fail(`missing dist/${f}`);
}

// 2. every dist html has a title
console.log('titles:');
for (const f of walk(dist).filter((p) => p.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8');
  /<title>[^<]+<\/title>/.test(html)
    ? ok(f.replace(dist, 'dist'))
    : fail(`no <title>: ${f.replace(dist, 'dist')}`);
}

// 3. internal links resolve
console.log('internal links:');
{
  const files = walk(dist).filter((p) => p.endsWith('.html'));
  const missing = new Set();
  for (const f of files) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/href="(\/zan-blog\/[^"#?]*?)"/g)) {
      let rel = decodeURIComponent(m[1].replace('/zan-blog/', ''));
      const cands = [join(dist, rel), join(dist, rel, 'index.html'), join(dist, rel + '.html')];
      if (!cands.some(existsSync)) missing.add(`${f.replace(dist, 'dist')} -> ${m[1]}`);
    }
  }
  missing.size === 0 ? ok('all internal links resolve') : [...missing].forEach(fail);
}

// 4. banned slop patterns in code (not placeholder prose)
console.log('code hygiene:');
{
  const banned = ['8B7CF6', 'rounded-xl', 'rounded-lg', 'built with astro'];
  const hits = [];
  for (const f of walk(src).filter((p) => /\.(astro|css|js)$/.test(p))) {
    const t = readFileSync(f, 'utf8');
    for (const b of banned) if (t.includes(b)) hits.push(`${f.replace(src, 'src')}: ${b}`);
  }
  // research route must be gone from code (content prose exempt)
  for (const f of walk(src).filter((p) => /\.(astro|css|js|ts)$/.test(p))) {
    const t = readFileSync(f, 'utf8');
    if (/research/i.test(t)) hits.push(`${f.replace(src, 'src')}: research`);
  }
  hits.length === 0 ? ok('no banned patterns') : hits.forEach(fail);
}

// 5. palette vars: every --p-* used in CSS must be defined
console.log('palette vars:');
{
  const css = readFileSync(join(src, 'styles/global.css'), 'utf8');
  const defined = new Set([...css.matchAll(/(--p-[a-z0-9]+)\s*:/g)].map((m) => m[1]));
  const used = new Set([...css.matchAll(/var\((--p-[a-z0-9]+)\)/g)].map((m) => m[1]));
  const undef = [...used].filter((v) => !defined.has(v));
  undef.length === 0 ? ok(`${defined.size} vars defined, all used resolve`) : undef.forEach((v) => fail(`undefined var ${v}`));
}

// 6. interactivity lifecycle: client scripts must survive view transitions,
//    and card markup must come from the PostCard component (no copies)
console.log('lifecycle:');
{
  const blog = readFileSync(join(src, 'pages/blog/index.astro'), 'utf8');
  blog.includes('astro:after-swap') ? ok('blog filter re-inits after swap') : fail('blog filter missing after-swap');
  blog.includes('<PostCard') ? ok('blog list uses PostCard') : fail('blog list must use PostCard');
  blog.includes('list.innerHTML') || blog.includes('.innerHTML = rows')
    ? fail('blog rebuilds cards via innerHTML')
    : ok('no innerHTML card copies');
  let fragile = 0;
  for (const f of walk(src).filter((p) => p.endsWith('.astro'))) {
    const t = readFileSync(f, 'utf8');
    if (/getElementById\('theme-btn'\)\?\.addEventListener/.test(t)) {
      fail(`${f.replace(src, 'src')}: direct theme-btn binding dies on swap`);
      fragile++;
    }
  }
  if (fragile === 0) ok('no direct swap-fragile bindings');
  // layout/background scripts must bind document listeners exactly once
  const once = [
    ['src/layouts/Base.astro', '__zanBase'],
    ['src/components/TetrisBackground.astro', '__tetriBg'],
    ['src/components/TetrominoDivider.astro', '__tetriSep'],
  ];
  for (const [f, flag] of once) {
    readFileSync(join(src, f.replace('src/', '')), 'utf8').includes(flag)
      ? ok(`${f} guarded (${flag})`)
      : fail(`${f} missing once-guard ${flag}`);
  }
}

// 7. contrast: palette text colors on their surfaces must be >= 4.5
console.log('contrast:');
{
  const lum = (hex) => {
    const c = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => {
      const v = parseInt(c.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  // [name, text, surface]
  const pairs = [
    ['royal acc/light', '#78256F', '#FAF9FF'], ['royal acc/dark', '#C084FC', '#0E0B16'],
    ['royal comp/light', '#0E7A5E', '#FAF9FF'], ['royal comp/dark', '#7DE8C0', '#0E0B16'],
    ['neon acc/light', '#B00D92', '#FAF9FF'], ['neon acc/dark', '#F471D1', '#0E0B16'],
    ['neon comp/light', '#2E7A33', '#FAF9FF'], ['neon comp/dark', '#53DA3F', '#0E0B16'],
    ['midnight acc/light', '#485DC5', '#FAF9FF'], ['midnight acc/dark', '#93A5FF', '#0E0B16'],
    ['midnight comp/light', '#0E7490', '#FAF9FF'], ['midnight comp/dark', '#01EDFA', '#0E0B16'],
    ['sunset acc/light', '#C43A0C', '#FAF9FF'], ['sunset acc/dark', '#FF8A5C', '#0E0B16'],
    ['sunset comp/light', '#0E7490', '#FAF9FF'], ['sunset comp/dark', '#01EDFA', '#0E0B16'],
  ];
  for (const [n, t, s] of pairs) {
    const r = ratio(t, s);
    r >= 4.5 ? ok(`${n} ${r.toFixed(2)}`) : fail(`${n} ${r.toFixed(2)} < 4.5`);
  }
}

console.log(errors === 0 ? '\naudit clean' : `\naudit: ${errors} problem(s)`);
process.exit(errors === 0 ? 0 : 1);
