# API Reference

Base URL: `http://localhost:3001/api`

All document-processing endpoints accept `multipart/form-data`. Max upload size defaults to 50 MB.

---

## Health

| Method | Route | Response |
|---|---|---|
| `GET` | `/health` | `{ status: "ok", timestamp: "..." }` |

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

## History and reports

| Method | Route | Description |
|---|---|---|
| `GET` | `/historial` | Operation list (real + demo data) |
| `POST` | `/processes` | Manually register an operation |
| `DELETE` | `/processes/:id` | Delete a process and its output files |
| `POST` | `/reports` | Save a bug report with screenshots |

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
| Simulated process delete | `400` | Demo records cannot be removed |
| Process not found | `404` | Invalid process ID |
| LibreOffice not installed | `503` | Conversion unavailable |
| Conversion > 60 s | `504` | Timeout |
| File > 50 MB | `400` | multer limit |

---

## Data storage

| Path | Contents | In Git |
|---|---|---|
| `server/uploads/` | Temporary upload files | No |
| `server/data/output/{uuid}/` | Result of each operation | No |
| `server/data/reports/` | Bug reports | No |
| `server/data/processes.json` | Real operation history | No |
| `server/data/historial.json` | Demo data for the history UI | Yes |
