import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const __dirnameResolved = path.resolve();
const PUBLIC_DIR = path.join(__dirnameResolved, "public");
const DATA_DIR = path.join(__dirnameResolved, "data");
const DATA_FILE = path.join(DATA_DIR, "data.csv");

// Garante pastas/arquivo
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "id,original_email,corrected_email,timestamp\n", "utf8");
}

let nextId = 1;
// tenta ler último id existente
try {
  const lines = fs.readFileSync(DATA_FILE, "utf8").trim().split("\n");
  const last = lines[lines.length - 1];
  const parts = last.split(",");
  const parsed = parseInt(parts[0], 10);
  if (!Number.isNaN(parsed)) nextId = parsed + 1;
} catch { /* ignore */ }

app.get("/", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// arquivo bundle simples: o main.ts compila para dist/client/main.js e copiamos para /public em build step.
// Para desenvolvimento sem build, servimos também um alias a partir de tsx/dev, mas aqui vamos servir /public/main.js.
app.use(express.static(PUBLIC_DIR));

app.post("/api/save", (req, res) => {
  const { originalEmail, correctedEmail } = req.body ?? {};
  if (typeof originalEmail !== "string" || typeof correctedEmail !== "string") {
    return res.status(400).json({ error: "Parâmetros inválidos." });
  }
  const ts = new Date().toISOString();
  const row = `${nextId},${escapeCsv(originalEmail)},${escapeCsv(correctedEmail)},${ts}\n`;
  fs.appendFileSync(DATA_FILE, row, "utf8");
  const assigned = nextId;
  nextId += 1;
  res.json({ id: assigned, saved: true });
});

function escapeCsv(val: string): string {
  if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

// Rota para baixar CSV
app.get("/api/export", (_req, res) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=data.csv");
  fs.createReadStream(DATA_FILE).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
