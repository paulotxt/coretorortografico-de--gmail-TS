# Email Corrector (TypeScript + Express)

Projeto completo que corrige e-mails digitados incorretamente, com interface web simples e salvamento em CSV com ID autoincrementado.

## Recursos
- Correção automática para domínios mais comuns: `@gmail.com`, `@yahoo.com`, `@hotmail.com`, `@outlook.com`.
- Trata erros como letras trocadas/faltando, ponto ausente e extensão `.con` → `.com`.
- Tela simples (HTML + TypeScript) para digitar e visualizar a correção.
- API em Express para salvar os dados num `data/data.csv` (com ID autoincrementado).

## Requisitos
- Node.js 18+ e npm.

## Como rodar
```bash
npm install
npm run dev   # ambiente de desenvolvimento (hot-reload via tsx)
# ou
npm run build
npm start     # sobe o servidor em produção
```
Acesse: http://localhost:3000

## Estrutura
```
email-corrector/
├─ public/               # HTML/CSS/JS estáticos
├─ src/
│  ├─ lib/emailCorrector.ts
│  ├─ client/main.ts
│  └─ server/server.ts   # Express: serve front e salva CSV
├─ data/data.csv         # Criado automaticamente ao salvar
├─ package.json
├─ tsconfig.json
└─ README.md
```

## API
`POST /api/save`
```json
{
  "originalEmail": "joao@gmio.com",
  "correctedEmail": "joao@gmail.com"
}
```
Resposta:
```json
{ "id": 1, "saved": true }
```

## Observações
- Para Google Sheets, troque a camada de persistência do `server.ts` por integração com a API do Google (requer credenciais). Mantivemos CSV por simplicidade e execução imediata.
