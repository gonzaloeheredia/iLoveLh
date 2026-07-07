# API Reference

Base URL: `http://localhost:3001/api`

All document-processing endpoints accept `multipart/form-data`. Max upload size defaults to 50 MB (10 MB for summarize and translate).

---

## Health

| Method | Route | Response |
|---|---|---|
| `GET` | `/health` | Service status and dependency availability |

Example response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-07T14:00:00.000Z",
  "services": {
    "libreOffice": {
      "available": true,
      "path": "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "usedFor": ["word-to-pdf"]
    },
    "pdfToDocx": {
      "available": true,
      "pythonPath": "python",
      "usedFor": ["pdf-to-word"]
    },
    "gemini": {
      "available": true,
      "model": "gemini-2.5-flash-lite",
      "usedFor": ["summarize", "translate"]
    }
  }
}
```

---

## Document processing

| Method | Route | Body (multipart) | Response |
|---|---|---|---|
| `POST` | `/merge` | `files[]` — min. 2 PDFs | Merged PDF (`merged.pdf`) |
| `POST` | `/split` | `file` (PDF), `ranges` (string) | ZIP with split PDFs |
| `POST` | `/pdf-to-word` | `file` (PDF) | Converted DOCX |
| `POST` | `/word-to-pdf` | `file` (DOCX) | Converted PDF |
| `POST` | `/upload` | `file` (PDF or DOCX) | Uploaded file metadata |

### Split ranges

- By range: `1-3,5,7-9`
- All pages: `all`

---

## AI — Summarize and Translate

Both endpoints require `GEMINI_API_KEY` on the server. They extract text with `pdf-parse`; scanned PDFs (image-only) return `400`.

| Method | Route | Body (multipart) | Response |
|---|---|---|---|
| `POST` | `/summarize` | `file` (PDF, max 10 MB) | PDF with structured AI summary |
| `POST` | `/translate` | `file` (PDF, max 10 MB), `targetLanguage` (ISO code) | PDF with translated text |

### Summarize

- Extracts text from the PDF and sends it to Gemini.
- Returns a formatted PDF with sections: general summary, key points, parties, dates, observations.
- Output filename: `{original-base}-resumen.pdf`
- Response headers: `Content-Type: application/pdf`, `Content-Disposition`, `X-Output-Dir`

### Translate

- Extracts text page by page; long documents are translated in batches and concatenated before PDF generation.
- `targetLanguage`: ISO 639-1 code, e.g. `en`, `pt`, `fr`, `de`, `it`, `es`
- Preserves paragraph structure in the output PDF (clean layout, not original visual formatting).
- Output filename: `{original-base}_{LANG}.pdf` (e.g. `CV_Gonzalo_Heredia_EN.pdf`)
- Response headers: same as summarize

Supported `targetLanguage` values used by the frontend:

| Label | Code |
|---|---|
| Español | `es` |
| English | `en` |
| Português | `pt` |
| Français | `fr` |
| Deutsch | `de` |
| Italiano | `it` |

---

## History and reports

| Method | Route | Description |
|---|---|---|
| `GET` | `/historial` | Operation list (real + demo data) |
| `POST` | `/processes` | Manually register an operation |
| `DELETE` | `/processes/:id` | Delete a process and its output files |
| `POST` | `/reports` | Save a bug report with screenshots |

Summarize and translate operations are registered in history with `toolId` `resumir-pdf` and `traducir-pdf` respectively.

---

## curl examples

```bash
# Merge PDFs
curl -X POST http://localhost:3001/api/merge \
  -F "files=@doc1.pdf" -F "files=@doc2.pdf" \
  -o merged.pdf

# Split PDF
curl -X POST http://localhost:3001/api/split \
  -F "file=@document.pdf" -F "ranges=1-3,5" \
  -o result.zip

# PDF to Word
curl -X POST http://localhost:3001/api/pdf-to-word \
  -F "file=@document.pdf" \
  -o document.docx

# Word to PDF
curl -X POST http://localhost:3001/api/word-to-pdf \
  -F "file=@document.docx" \
  -o document.pdf

# Summarize PDF
curl -X POST http://localhost:3001/api/summarize \
  -F "file=@document.pdf" \
  -o document-resumen.pdf

# Translate PDF
curl -X POST http://localhost:3001/api/translate \
  -F "file=@document.pdf" \
  -F "targetLanguage=en" \
  -o document_EN.pdf

# Health check
curl http://localhost:3001/api/health

# Delete a process
curl -X DELETE http://localhost:3001/api/processes/{id}
```

---

## HTTP errors

| Situation | HTTP code | Notes |
|---|---|---|
| File is not PDF/DOCX | `400` | Type validation |
| Fewer than 2 PDFs in merge | `400` | Minimum file count |
| Invalid ranges in split | `400` | Range parsing |
| PDF has no extractable text | `400` | Scanned / image-only PDF (summarize, translate) |
| Missing `targetLanguage` | `400` | Translate only |
| Invalid `targetLanguage` code | `400` | Must match ISO pattern (`en`, `pt`, …) |
| Simulated process delete | `400` | Demo records cannot be removed |
| Process not found | `404` | Invalid process ID |
| LibreOffice not installed | `503` | Word → PDF unavailable |
| Python / pdf2docx not available | `503` | PDF → Word unavailable |
| Gemini not configured | `503` | Summarize / translate unavailable |
| Gemini API failure | `502` | Upstream error wrapped in message |
| Conversion > 60 s | `504` | Timeout |
| File > 50 MB (general) | `400` | multer limit |
| File > 10 MB (AI endpoints) | `400` | `SUMMARIZE_MAX_FILE_SIZE` limit |

---

## Data storage

| Path | Contents | In Git |
|---|---|---|
| `server/uploads/` | Temporary upload files | No |
| `server/data/output/{uuid}/` | Result of each operation | No |
| `server/data/reports/` | Bug reports | No |
| `server/data/processes.json` | Real operation history | No |
| `server/data/historial.json` | Demo data for the history UI | Yes |
| `server/.env` | Secrets and local config | No |
