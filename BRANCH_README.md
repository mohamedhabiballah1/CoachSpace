# Branch: feat/pdf-report

## What this branch covers

Implements server-side PDF report generation for a client: a downloadable document
containing the client's profile, progress summary (baseline vs latest), BMI, and
measurement history table.

## Files to create or modify

### Backend
- `backend/controllers/client.controller.js` — add `generatePDFReport(req, res)`: uses `require('pdfkit')` to build a PDF in memory, sets response headers `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="<clientName>-report.pdf"`, pipes the PDFDocument to `res`; report includes: coach name, client name/email/phone, goal type, start date, progress summary per field (baseline → current, change, % change), BMI, full measurement history table
- `backend/routes/client.routes.js` — add `GET /clients/:clientId/report/pdf` protected by `authMiddleware`
- `backend/package.json` — add `pdfkit` dependency

### Frontend
- `frontend/src/components/ClientDetails.js` — add "Export PDF" button in the Overview tab header; clicking it calls `window.open('/api/client/clients/:clientId/report/pdf')` with the auth token as a query param OR triggers a `fetch` with the Authorization header and uses `URL.createObjectURL` to download the blob

## Dependencies to install

```bash
cd backend && npm install pdfkit
```

## What "done" looks like

- `GET /api/client/clients/:clientId/report/pdf` streams a valid PDF to the browser
- The PDF contains the client name, goal, progress table, and BMI section
- Clicking "Export PDF" in the ClientDetails Overview tab downloads `<FirstName>-<LastName>-report.pdf`
- If the client has no measurements, the PDF still generates with a "No measurement data" notice
- The endpoint is protected — a request without a valid JWT returns 401

## Dependencies (other branches)

- Depends on: `fix/bugs-and-foundations` (Client model, api.js)
- Depends on: `feat/client-management` (ClientDetails component where the button lives)
