// utils/contentSafety.js

/**
 * Content Safety Utility (dynamic rules + neutral routing)
 * Categories:
 *  - abuse           → WARN (empathetic response; notify staff; DO NOT block)
 *  - warning         → WARN (self-harm / harm to others; supportive + resources)
 *  - sexual          → BLOCK (explicit sexual content requests)
 *  - religion_taboo  → BLOCK (defer; not equipped; suggest trusted adult/faith figure)
 *
 * Exports:
 *  - screenText(text, policy?) => { flags, matches, severity, category, confidence }
 *  - buildStudentMessage(screen, opts?) => string|null
 *  - shouldNotifyStaff(flags) => boolean
 *  - computeSafeguardRouting(text, screen) => { routing, mentionedRoles, roleEvidence, roleConfidence }
 *  - postSafetyFlag({...}) => Promise<void>
 *  - redactText(text, categories) => string  (logs only; do not use for user-visible text)
 */

//////////////////////////////
// Normalization & helpers  //
//////////////////////////////

function normalize(text = "") {
  return (
    text
      .toLowerCase()
      // normalize apostrophes, strip punctuation except word-separating spaces
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^a-z0-9\s'_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// very light stemming for coverage (not a full stemmer)
function stemToken(t) {
  return t
    .replace(/(ing|ed|ers?|ly|ment|ness|ful|less|able|ible|tion|s)$/i, "")
    .replace(/'+$/g, "");
}

function tokenize(text) {
  return normalize(text).split(/\s+/).map(stemToken).filter(Boolean);
}

function windowedCooccur(tokens, aSet, bSet, maxDist = 5) {
  const aIdx = [];
  const bIdx = [];
  for (let i = 0; i < tokens.length; i++) {
    if (aSet.has(tokens[i])) aIdx.push(i);
    if (bSet.has(tokens[i])) bIdx.push(i);
  }
  for (const i of aIdx) {
    for (const j of bIdx) {
      if (Math.abs(i - j) <= maxDist) return true;
    }
  }
  return false;
}

function reFromWords(words) {
  const esc = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("\\b(" + esc.join("|") + ")\\b", "i");
}

//////////////////////////////
// Dictionaries / terms     //
//////////////////////////////

// Sexual (explicit) — keyworded
const SEXUAL_TERMS = [
  "porn","porno","pornography","nsfw","sex","sexual","sext","nude","nudes",
  "fetish","erotic","incest","bestiality","rape","handjob","blowjob","bj",
  "boob","boobs","breasts","nipple","strip","masturbat","orgasm","cum",
  "ejaculat","anal","onlyfans"
];

const RELIGION_TERMS = [
  "religion","religious","atheis","christ","christian","jesus","muslim","islam",
  "quran","koran","jew","jewish","judaism","torah","buddh","hindu","sikh",
  "catholic","orthodox","evangelical","convert","proselytiz","blasphem","heresy",
  "heretic","cult","pastor","priest","imam","rabbi","church","mosque","synagogue",
  "temple","scripture","faith","doctrine","denomination"
];

// Self-harm / danger
const WARNING_TERMS = [
  "suicide","suicidal","kill myself","kms","end my life","take my life","self-harm",
  "self harm","cutting","cut myself","overdose","od","depression","depressed",
  "i want to die","want to die","murder","kill him","kill her","kill them","shoot",
  "shoot up","violent","violence","assault","hurt others","bomb","school shooting"
];

// Abuse — dynamic approach (stems + patterns + co-occurrence)
const ABUSE_HARM_STEMS = [
  "abuse","abuser","hurt","hit","beat","assault","molest","groom","harass","touch"
].map(stemToken);

const ABUSE_CONTEXT_STEMS = [
  "me","my","home","house","safe","unsafe","danger","coach","teacher","parent",
  "stepdad","stepmom","stepfather","stepmother","boyfriend","girlfriend","partner",
  "family","uncle","aunt","neighbor"
].map(stemToken);

const FIRST_PERSON_STEMS = ["i","im","i'm","ive","i've","me","my","mine"].map(stemToken);

const DIRECT_OBJECT_ME = /\b(me|my)\b/i;

//////////////////////////////
// Policies                 //
//////////////////////////////

export const defaultPolicy = {
  abuse: "warn",            // never hard-block disclosures
  warning: "warn",
  sexual: "block",
  religion_taboo: "block",
};

//////////////////////////////
// Detectors (scored)       //
//////////////////////////////

function detectSexual(text) {
  const r = reFromWords(SEXUAL_TERMS);
  const m = text.match(r);
  return m ? { hit: true, matches: [m[0]], score: 1.0 } : { hit: false, matches: [], score: 0 };
}

function detectReligion(text) {
  const r = reFromWords(RELIGION_TERMS);
  const m = text.match(r);
  return m ? { hit: true, matches: [m[0]], score: 1.0 } : { hit: false, matches: [], score: 0 };
}

function detectWarning(text) {
  const hits = [];
  for (const term of WARNING_TERMS) {
    const rx = new RegExp("\\b" + term.replace(/\s+/g, "\\s+") + "\\b", "i");
    if (rx.test(text)) hits.push(term);
  }
  const score = Math.min(1, hits.length * 0.5);
  return { hit: hits.length > 0, matches: hits, score };
}

function detectAbuseDynamic(text) {
  const norm = normalize(text);
  const tokens = tokenize(norm);

  // 1) Passive first-person patterns: "I was/am/have been ... (hurt/abused/assaulted)"
  const passivePattern =
    /\bi\b\s+(?:was|am|were|have been|had been|got|getting|being)\s+(?:really\s+)?(?:abused?|hurt|hit|beaten|assaulted|molested|harassed|touched)\b/i;

  // 2) Direct-object patterns: "he/she/they/my X ... me"
  const subjectRel = /\b(he|she|they|someone|anyone|everyone|my\s+(?:coach|teacher|parent|mom|dad|step(?:dad|mom|father|mother)|boyfriend|girlfriend|partner|uncle|aunt|neighbor|family))\b/i;
  const harmVerb = /\b(hurt|hit|beat|abused?|assault(?:ed)?|molest(?:ed)?|harass(?:ed)?|touch(?:ed)?(?:\s+me)?|groom(?:ed)?)\b/i;
  const directObjectPattern = new RegExp(subjectRel.source + "[^\\n]{0,60}" + harmVerb.source + "[^\\n]{0,15}\\bme\\b", "i");

  // 3) Co-occurrence windows: first-person + harm near me/my/home/unsafe
  const fpSet = new Set(FIRST_PERSON_STEMS);
  const harmSet = new Set(ABUSE_HARM_STEMS);
  const ctxSet = new Set(ABUSE_CONTEXT_STEMS);

  const cooccurFP_Harm = windowedCooccur(tokens, fpSet, harmSet, 5);
  const cooccurHarm_Ctx = windowedCooccur(tokens, harmSet, ctxSet, 6);

  // 4) Generic safety statements: "i am not safe", "i don't feel safe at home"
  const notSafePattern = /\bi\s+(?:am|feel|dont|don't)\s+(?:not\s+)?safe(?:\s+at\s+home)?\b/i;

  let score = 0;
  const matches = [];

  if (passivePattern.test(norm)) { score += 1.0; matches.push("passive_disclosure"); }
  if (directObjectPattern.test(norm)) { score += 1.0; matches.push("direct_object_harm"); }
  if (cooccurFP_Harm) { score += 0.6; matches.push("fp_harm_window"); }
  if (cooccurHarm_Ctx) { score += 0.6; matches.push("harm_context_window"); }
  if (notSafePattern.test(norm)) { score += 0.6; matches.push("not_safe_statement"); }
  if (/\babuse(?:d|r|s)?\b/i.test(norm) && DIRECT_OBJECT_ME.test(norm)) {
    score += 0.6; matches.push("abuse_term_near_me");
  }

  const hit = score >= 0.8; // threshold; tune as needed
  return { hit, matches, score: Math.min(score, 1.5) };
}

//////////////////////////////
// Screening entrypoint     //
//////////////////////////////

export function screenText(text = "", policy = defaultPolicy) {
  const sexual = detectSexual(text);
  const religion = detectReligion(text);
  const warning = detectWarning(text);
  const abuse = detectAbuseDynamic(text);

  const flags = {
    abuse: abuse.hit,
    sexual: sexual.hit,
    religion_taboo: religion.hit,
    warning: warning.hit,
  };

  const matches = {
    abuse: abuse.matches,
    sexual: sexual.matches,
    religion_taboo: religion.matches,
    warning: warning.matches,
  };

  // Priority: abuse (safeguard) → sexual/religion (hard limits) → warning
  let category = "none";
  let confidence = 0;

  if (flags.abuse) { category = "abuse"; confidence = Math.min(1, abuse.score); }
  else if (flags.sexual) { category = "sexual"; confidence = sexual.score; }
  else if (flags.religion_taboo) { category = "religion_taboo"; confidence = religion.score; }
  else if (flags.warning) { category = "warning"; confidence = warning.score; }

  // Resolve severity per policy (but never block abuse)
  const actions = [];
  if (flags.abuse) actions.push(policy.abuse);
  if (flags.sexual) actions.push(policy.sexual);
  if (flags.religion_taboo) actions.push(policy.religion_taboo);
  if (flags.warning) actions.push(policy.warning);

  let severity = actions.includes("block") ? "block" : actions.includes("warn") ? "warn" : "allow";
  if (flags.abuse && severity === "block") severity = "warn";

  return { flags, matches, severity, category, confidence };
}

//////////////////////////////
// Student-facing guidance  //
//////////////////////////////

export function buildStudentMessage({ category, flags }, opts = {}) {
  const { includeUSLines = true } = opts;

  if (category === "abuse" && flags.abuse) {
    return [
      "I’m really sorry you’re dealing with this. Your safety matters.",
      "Please reach out to a trusted adult right away (a teacher, school counselor, or a parent/guardian).",
      "If you feel in immediate danger, contact your local emergency number" + (includeUSLines ? " (U.S.: 911)." : "."),
      "You’re not alone—there are people who want to help."
    ].join(" ");
  }

  if (category === "warning" && flags.warning) {
    return [
      "Thanks for sharing—your well-being is important.",
      "Please talk with a trusted adult (teacher, school counselor, or parent/guardian).",
      includeUSLines ? "You can also call or text **988** in the U.S. (Suicide & Crisis Lifeline)." : "",
      "We can continue at a pace that feels comfortable."
    ].filter(Boolean).join(" ");
  }

  if (category === "sexual") {
    return "I can’t help with explicit sexual content. If your question is about health or personal safety, please speak with a trusted adult such as a teacher, school counselor, or a parent/guardian.";
  }

  if (category === "religion_taboo") {
    return "That’s a religious topic, and I’m not equipped to give guidance there. It may help to speak with a parent/guardian or an appropriate religious figure in your community.";
  }

  return null;
}

//////////////////////////////
// Notify staff?            //
//////////////////////////////

export function shouldNotifyStaff(flags) {
  return !!(flags.abuse || flags.warning || flags.sexual);
}

// Back-compat shim (prefer shouldNotifyStaff)
export function shouldNotifyTeachers(flags) {
  return shouldNotifyStaff(flags);
}

//////////////////////////////
// Role mention detection   //
//////////////////////////////

// Neutral language — “mentioned roles” (not blame/accusation)
const MENTIONED_ROLE_TERMS = {
  teacher: ["teacher","professor","instructor","tutor","coach","principal","staff","school staff"],
  parent:  ["parent","mom","mother","dad","father","stepdad","stepfather","stepmom","stepmother","guardian","caregiver"],
  peer:    ["boyfriend","girlfriend","partner","classmate","friend","neighbor","roommate"],
};

function reAny(words) {
  const esc = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("\\b(" + esc.join("|") + ")\\b", "i");
}

const ROLE_REGEX = {
  teacher: reAny(MENTIONED_ROLE_TERMS.teacher),
  parent:  reAny(MENTIONED_ROLE_TERMS.parent),
  peer:    reAny(MENTIONED_ROLE_TERMS.peer),
};

// Mentioned role occurs near harm or “me/my”
function detectMentionedRoles(text) {
  const norm = (text || "").toLowerCase();
  const harm = /(abuse(?:d|r)?|hurt|hit|beat|assault(?:ed)?|molest(?:ed)?|harass(?:ed)?|touch(?:ed)?|groom(?:ed)?)/i;
  const me   = /\b(me|my|i)\b/i;

  const spans = [];
  const addSpan = (m, role) => { if (m) spans.push({ role, index: m.index }); };

  addSpan(norm.match(ROLE_REGEX.teacher), "teacher");
  addSpan(norm.match(ROLE_REGEX.parent),  "parent");
  addSpan(norm.match(ROLE_REGEX.peer),    "peer");

  const roles = new Set();
  const evidence = [];

  for (const s of spans) {
    const win = norm.slice(Math.max(0, s.index - 60), s.index + 60);
    if (harm.test(win) || me.test(win)) {
      roles.add(s.role);
      evidence.push(s.role);
    }
  }

  const confidence = Math.min(1, (roles.size + evidence.length) * 0.35);
  return { roles, evidence, confidence };
}

/**
 * Compute safe routing for staff notifications.
 * - If abuse is detected AND a teacher is mentioned near harm → do NOT route to teachers.
 * - Never route to parents from the client; counselor/admin only.
 */
export function computeSafeguardRouting(text, screen) {
  const { roles, evidence, confidence } = detectMentionedRoles(text);
  const isAbuse = screen?.category === "abuse";

  const routing = {
    teachers: !(isAbuse && roles.has("teacher")),
    parents: false,     // never auto-notify parents from client
    counselor: true,
    admin: true,
  };

  return {
    routing,
    mentionedRoles: Array.from(roles),
    roleEvidence: evidence,
    roleConfidence: confidence,
  };
}

//////////////////////////////
// Backend flag stub        //
//////////////////////////////

export async function postSafetyFlag({
  apiBase = "/api/safety",
  studentEmail,
  subject,
  threadId,
  message,
  screen,
  routing,          // { teachers, parents, counselor, admin }
  mentionedRoles,   // e.g., ["teacher"]
  roleEvidence,     // e.g., ["teacher"]
  roleConfidence,   // 0..1
  when = new Date().toISOString(),
}) {
  const payload = {
    kind: "content_flag",
    when,
    studentEmail,
    subject,
    threadId,
    category: screen.category,
    severity: screen.severity,
    confidence: screen.confidence,
    flags: screen.flags,
    matches: screen.matches,
    safeguarding: !!(screen.flags.abuse || screen.flags.warning),
    excerpt: (message || "").slice(0, 300),

    // neutral routing hints
    routing,
    mentionedRoles,
    roleEvidence,
    roleConfidence,
  };

  try {
    await fetch(`${apiBase}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn("Safety flag submit failed:", e);
  }
}

//////////////////////////////
// Optional redaction       //
//////////////////////////////

export function redactText(text, categories = { abuse: true, warning: true, sexual: true, religion_taboo: true }) {
  // NOTE: for logs only; not for user-visible text.
  const rAll = reFromWords([
    ...SEXUAL_TERMS,
    ...RELIGION_TERMS,
    ...WARNING_TERMS.map(t => t.split(/\s+/)[0]),
    ...ABUSE_HARM_STEMS,
  ]);
  return text.replace(rAll, (m) => m[0] + "*".repeat(Math.max(1, m.length - 2)) + (m[m.length - 1] || ""));
}
