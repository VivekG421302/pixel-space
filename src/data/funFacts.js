// Fun facts and jokes for the buddy. Fresh ones come from free public APIs; built-in lines are the offline fallback.
//   Jokes: https://v2.jokeapi.dev  (safe mode, no NSFW / religious / political / racist / sexist / explicit)
//   Facts: https://uselessfacts.jsph.pl
// Requests go straight from the browser, with no cookies or referrer, only when the user hovers/focuses the buddy.

const JOKE_URL = 'https://v2.jokeapi.dev/joke/Programming,Misc,Pun?safe-mode&blacklistFlags=nsfw,religious,political,racist,sexist,explicit';
const FACT_URL = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';
const MAX_CHARS = 210; // keeps the speech bubble readable
const TIMEOUT_MS = 4500;

const FACTS = [
  'Honey never spoils. Edible honey has been found in ancient Egyptian tombs.',
  'Octopuses have three hearts and blue blood.',
  'Bananas are berries, but strawberries are not.',
  'A day on Venus is longer than a year on Venus.',
  'Sea otters hold hands while they sleep so they do not drift apart.',
  'Wombat droppings are cube-shaped.',
  'Butterflies taste with their feet.',
  'The first computer bug was a real moth, found in a relay in 1947.',
  'Crows can recognise individual human faces.',
  'A group of flamingos is called a flamboyance.',
  'Crocodiles cannot stick their tongues out.',
  'Sharks are older than trees.',
  'Cows have best friends and get stressed when they are separated.',
  'The Eiffel Tower grows about 15 cm taller in summer because metal expands in the heat.',
  'The shortest war in history, between Britain and Zanzibar in 1896, lasted about 40 minutes.',
  'A bolt of lightning is about five times hotter than the surface of the Sun.',
];
const JOKES = [
  { text: 'Why do programmers prefer dark mode?', punch: 'Because light attracts bugs.' },
  { text: 'Why did the pixel go to therapy?', punch: 'It had too many unresolved layers.' },
  { text: 'How does a cat fix a computer?', punch: 'With a mouse.' },
  { text: 'There are 10 types of people in the world.', punch: 'Those who understand binary and those who do not.' },
  { text: 'Why did the developer go broke?', punch: 'He used up all his cache.' },
  { text: 'What do you call a fake noodle?', punch: 'An impasta.' },
  { text: 'Why did the scarecrow win an award?', punch: 'He was outstanding in his field.' },
  { text: 'Why do Java developers wear glasses?', punch: 'Because they do not C sharp.' },
  { text: 'What is a computer\'s favourite snack?', punch: 'Microchips.' },
  { text: 'Why was the timer so calm?', punch: 'It always took things one second at a time.' },
  { text: 'I would tell you a UDP joke, but you might not get it.' },
  { text: 'I used to hate facial hair, but then it grew on me.' },
  { text: 'Why did the cat sit on the keyboard?', punch: 'To keep an eye on the mouse.' },
  { text: 'How do you comfort a JavaScript bug?', punch: 'You console it.' },
];

const clean = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const recent = [];
const buffer = { fact: null, joke: null };

async function fetchJson(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' }, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function remote(kind) {
  if (kind === 'joke') {
    const d = await fetchJson(JOKE_URL);
    if (d.error) throw new Error('joke api error');
    return d.type === 'twopart' ? { kind, text: clean(d.setup), punch: clean(d.delivery) } : { kind, text: clean(d.joke) };
  }
  const d = await fetchJson(FACT_URL);
  return { kind: 'fact', text: clean(d.text) };
}

const length = (i) => i.text.length + (i.punch ? i.punch.length : 0);
const usable = (i) => i && i.text && length(i) <= MAX_CHARS && !recent.includes(i.text);

function local(kind) {
  const pool = (kind === 'joke' ? JOKES : FACTS.map((text) => ({ text }))).filter((i) => !recent.includes(i.text));
  const list = pool.length ? pool : kind === 'joke' ? JOKES : FACTS.map((text) => ({ text }));
  return { kind, ...list[Math.floor(Math.random() * list.length)], offline: true };
}

function remember(item) {
  recent.push(item.text);
  if (recent.length > 24) recent.shift();
}

function prefetch(kind) {
  if (buffer[kind] || navigator.onLine === false) return;
  setTimeout(() => {
    remote(kind).then((r) => {
      if (usable(r)) buffer[kind] = r;
    }, () => {});
  }, 1500);
}

/** mode: 'facts' | 'jokes' | 'both'. Always resolves with { kind, text, punch?, offline? }. */
export async function getTalk(mode) {
  const kind = mode === 'facts' ? 'fact' : mode === 'jokes' ? 'joke' : Math.random() < 0.5 ? 'fact' : 'joke';
  let item = buffer[kind];
  buffer[kind] = null;
  if (!usable(item)) item = null;
  if (!item && navigator.onLine !== false) {
    for (let i = 0; i < 3 && !item; i++) {
      try {
        const r = await remote(kind);
        if (usable(r)) item = r;
      } catch {
        break; // offline, blocked or rate limited: use the built-in lines
      }
    }
  }
  if (!item) item = local(kind);
  remember(item);
  if (!item.offline) prefetch(kind);
  return item;
}
