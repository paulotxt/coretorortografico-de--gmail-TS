

export type CorrectionResult = {
  originalEmail: string;
  correctedEmail: string;
  didCorrect: boolean;
  isValid: boolean;
  targetDomain: string | null;
  reason: string;
};

const COMMON_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"] as const;
type CommonDomain = typeof COMMON_DOMAINS[number];

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function normalizeDomain(domain: string): string {
  let d = domain.trim().toLowerCase();
  d = d.replace(/\s+/g, "");          // remove espaços
  d = d.replace(/^\.+/, "");          // remove ponto no início
  d = d.replace(/\.+/g, ".");         // colapsa pontos repetidos
  d = d.replace(/,/, ".");            // vírgula no lugar do ponto
  // Corrige extensões comuns
  d = d.replace(/\.c0m$/i, ".com");
  d = d.replace(/\.con$/i, ".com");
  d = d.replace(/\.cm$/i, ".com");
  d = d.replace(/\.co$/i, ".com");
  d = d.replace(/\.cpm$/i, ".com");
  // Se não tem ponto e parece provedor conhecido, adiciona .com
  if (!d.includes(".")) {
    const cand = ["gmail", "gmai", "gmial", "gmal", "gmil", "yah00", "yaho", "yah0o", "hotmai", "hotmal", "outlok", "outllok"];
    if (cand.some(c => d.includes(c))) d = d + ".com";
  }
  // Se termina em dominio sem TLD (ex: "hotmailcom" após remover ponto), tenta inserir
  for (const provider of ["gmail", "yahoo", "hotmail", "outlook"]) {
    if (d === provider + "com") d = provider + ".com";
  }
  d = d.replace(/^hotmail\.com\.?$/i, "hotmail.com");
  return d;
}

function pickClosestDomain(domain: string): CommonDomain | null {
  let best: {dom: CommonDomain, dist: number} | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(domain, d);
    if (!best || dist < best.dist) best = { dom: d, dist };
  }
  // Aceita correção se a distância estiver em um limiar razoável.
  return best && best.dist <= 3 ? best.dom : null;
}

function isBasicEmailFormat(email: string): boolean {
  // Valida formato básico: local@dominio
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return basic.test(email);
}

export function correctEmail(input: string): CorrectionResult {
  const trimmed = input.trim();
  const at = trimmed.indexOf("@");
  if (at === -1) {
    // sem @ não dá para inferir com segurança — retornar como inválido
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

  // Se já é exatamente um dos domínios comuns, só normaliza caixa
  if (COMMON_DOMAINS.includes(normalized as CommonDomain)) {
    const email = `${local}@${normalized}`;
    return {
      originalEmail: input,
      correctedEmail: email,
      didCorrect: normalized !== domain.toLowerCase(),
      isValid: isBasicEmailFormat(email),
      targetDomain: normalized as CommonDomain,
      reason: "Domínio válido reconhecido."
    };
  }

  // Escolhe o domínio mais próximo por distância
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

  // Tenta correções pontuais — por exemplo, falta de ponto antes do com
  const punct = normalized.replace(/(gmail|yahoo|hotmail|outlook)com$/, "$1.com");
  if (COMMON_DOMAINS.includes(punct as CommonDomain)) {
    const email = `${local}@${punct}`;
    return {
      originalEmail: input,
      correctedEmail: email,
      didCorrect: true,
      isValid: isBasicEmailFormat(email),
      targetDomain: punct as CommonDomain,
      reason: "Inserido ponto antes do TLD."
    };
  }

  // Se nada feito, retorna normalizado (pode continuar inválido)
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
