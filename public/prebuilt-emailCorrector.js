// Minimal JS port of emailCorrector for static usage

const COMMON_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function normalizeDomain(domain) {
  let d = domain.trim().toLowerCase();
  d = d.replace(/\s+/g, "");
  d = d.replace(/^\.+/, "");
  d = d.replace(/\.+/g, ".");
  d = d.replace(/,/, ".");
  d = d.replace(/\.c0m$/i, ".com");
  d = d.replace(/\.con$/i, ".com");
  d = d.replace(/\.cm$/i, ".com");
  d = d.replace(/\.co$/i, ".com");
  d = d.replace(/\.cpm$/i, ".com");

  if (!d.includes(".")) {
    const cand = [
      "gmail", "gmai", "gmial", "gmal", "gmil",
      "yah00", "yaho", "yah0o",
      "hotmai", "hotmal",
      "outlok", "outllok"
    ];
    if (cand.some(c => d.includes(c))) d += ".com";
  }

  for (const provider of ["gmail", "yahoo", "hotmail", "outlook"]) {
    if (d === provider + "com") d = provider + ".com";
  }

  d = d.replace(/^hotmail\.com\.?$/i, "hotmail.com");

  return d;
}

function pickClosestDomain(domain) {
  let best = null;

  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(domain, d);
    if (!best || dist < best.dist) {
      best = { dom: d, dist };
    }
  }

  return best && best.dist <= 3 ? best.dom : null;
}

function isBasicEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);
}

export function correctEmail(input) {
  const trimmed = input.trim();
  const at = trimmed.indexOf("@");

  if (at === -1) {
    return {
      originalEmail: input,
      correctedEmail: input,
      didCorrect: false,
      isValid: false,
      targetDomain: null,
      reason: "Formato inválido: ausente '@'."
    };
  }

  const local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);
  const normalized = normalizeDomain(domain);

  if (COMMON_DOMAINS.includes(normalized)) {
    const email = `${local}@${normalized}`;
    return {
      originalEmail: input,
      correctedEmail: email,
      didCorrect: normalized !== domain.toLowerCase(),
      isValid: isBasicEmailFormat(email),
      targetDomain: normalized,
      reason: "Domínio válido reconhecido."
    };
  }

  const closest = pickClosestDomain(normalized);
  if (closest) {
    const email = `${local}@${closest}`;
    return {
      originalEmail: input,
      correctedEmail: email,
      didCorrect: true,
      isValid: isBasicEmailFormat(email),
      targetDomain: closest,
      reason: `Ajuste por similaridade ao domínio '${closest}'.`
    };
  }

  const punct = normalized.replace(/(gmail|yahoo|hotmail|outlook)com$/, "$1.com");
  if (COMMON_DOMAINS.includes(punct)) {
    const email = `${local}@${punct}`;
    return {
      originalEmail: input,
      correctedEmail: email,
      didCorrect: true,
      isValid: isBasicEmailFormat(email),
      targetDomain: punct,
      reason: "Inserido ponto antes do TLD."
    };
  }

  const fallback = `${local}@${normalized}`;
  return {
    originalEmail: input,
    correctedEmail: fallback,
    didCorrect: normalized !== domain.toLowerCase(),
    isValid: isBasicEmailFormat(fallback),
    targetDomain: null,
    reason: "Não foi possível mapear para um domínio conhecido."
  };
}
