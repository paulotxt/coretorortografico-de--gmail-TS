// Prebuilt for convenience when opening without build; prefer running `npm run dev` or `npm run build`.
import { correctEmail } from "./prebuilt-emailCorrector.js";

const input = document.getElementById("email");
const out = document.getElementById("out");
const btn = document.getElementById("btn-corrigir");

let hideTimeout = null;

function show(message, cls = "muted", duration = 10000000) {
  // Exibe a mensagem e a classe
  out.className = `result ${cls}`;
  out.innerHTML = message;

  // Se já havia um timeout pendente, cancela — evita desaparecer precoce
  if (hideTimeout !== null) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  // Se duration > 0, agenda limpeza
  if (duration > 200) {
    hideTimeout = setTimeout(() => {
      out.className = "result muted";
      out.innerHTML = "";
      hideTimeout = null;
    }, duration);
  }
}


async function saveEmail(originalEmail, correctedEmail) {
  const res = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalEmail, correctedEmail }),
  });
  if (!res.ok) throw new Error("Falha ao salvar.");
  return res.json();
}

async function handleCorrect() {
  const raw = input.value.trim();
  if (!raw) { show("Digite um e-mail para corrigir.", "warn",); return; }
  const result = correctEmail(raw);
  const corrected = result.correctedEmail;
  if (result.didCorrect) {
    show(`Sugerido: <strong>${corrected}</strong><br /><small>Motivo: ${result.reason}</small>`, "ok");
  } else if (result.isValid) {
    show(`Parece correto: <strong>${corrected}</strong>`, "ok");
  } else {
    show(`formato de email nao reconhecido. Tente revisar.`, "err");
    return;
  }
  try {
    const data = await saveEmail(raw, corrected);
    show(`corigido (#${data.id}): <strong>${corrected}</strong>`, "ok");
  } catch (e) {
    show(`Correção gerada, mas não conseguimos salvar. Verifique o servidor.`, "warn");
  }
}
btn.addEventListener("click", handleCorrect);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleCorrect(); });
