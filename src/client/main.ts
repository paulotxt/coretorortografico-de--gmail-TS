import { correctEmail } from "../lib/emailCorrector";

const input = document.getElementById("email") as HTMLInputElement;
const out = document.getElementById("out") as HTMLDivElement;
const btn = document.getElementById("btn-corrigir") as HTMLButtonElement;

function show(message: string, cls: string = "muted") {
  out.className = `result ${cls}`;
  out.innerHTML = message;
}

async function saveEmail(originalEmail: string, correctedEmail: string) {
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
  if (!raw) {
    show("Digite um e-mail para corrigir.", "warn");
    return;
  }

  const result = correctEmail(raw);
  const corrected = result.correctedEmail;

  if (result.didCorrect) {
    show(`Sugerido: <strong>${corrected}</strong><br /><small>Motivo: ${result.reason}</small>`, "ok");
  } else if (result.isValid) {
    show(`Parece correto: <strong>${corrected}</strong>`, "ok");
  } else {
    show(`Não foi possível corrigir automaticamente. Tente revisar.`, "err");
    return;
  }

  try {
    const data = await saveEmail(raw, corrected);
    show(`Salvo (#${data.id}): <strong>${corrected}</strong>`, "ok");
  } catch (e) {
    show(`Correção gerada, mas não conseguimos salvar. Verifique o servidor.`, "warn");
  }
}

btn.addEventListener("click", handleCorrect);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCorrect();
});
