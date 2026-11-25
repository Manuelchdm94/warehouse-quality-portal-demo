# Logistics Control · Demo

A mobile-first Progressive Web App (PWA) that supports quality checks in a warehouse: **receiving**, **picking**, **ERP vs WMS inventory validation**, **rework inspection** and **dashboards**. It runs entirely in the browser: no backend, no accounts, no data leaves the device.

> **This is a demo build with fictitious data.** Company names, logos, products, codes, lots and the 3D layout are invented. It is a prototype, not a production system.

## Look and feel

Palette: taupe (structure), porcelain grey (cards) and a muted plum accent. Fixed logo (pallet with check mark). A season label next to the greeting all year, plus a light snow effect in December and falling leaves in September and October (off when the device asks for reduced motion).

## Languages

English (default), Spanish, German, Portuguese and French. Use the 🌐 button in the header (also on the sign-in screen and in Profile). The choice is saved on the device. German, Portuguese and French are machine translations and should be reviewed by a native speaker.

## What it does

| Module | What you can try |
|---|---|
| **Receiving / Picking** | Load a WMS Excel export, build LPNs (pallets), draw an AQL General II sample, check each pallet against the file by photo (OCR + barcode) or typing, flag differences with a reason and photo, sign, export a PDF report and Excel. |
| **Validation** | Compare an ERP inventory file against a WMS file by SKU, lot, plant and storage location; map WMS statuses; get a list of differences (missing, quantity, status) and download the detail. |
| **Rework** | Inline inspection form: sample size and Ac/Re are calculated automatically from the lot quantity (ANSI Z1.4, AQL General II), defect criteria, disposition and a printable PDF. |
| **Dashboards** | Upload any Excel/CSV, build charts (bars, line, pie, table) with a visual builder or a SQL-like query, export PDF/Excel. |
| **3D layout** | Interactive WebGL walkthrough of a fictitious receiving and inspection area. |

Everything works offline after the first load (service worker).

## Try it in 30 seconds

1. Open the app (it signs you in automatically as a visitor).
2. On **Home**, scroll to **Try it with sample data** and tap **Receiving**, **Picking**, **Validation** or **Dashboards**: a fictitious Excel is loaded for you.
3. For the photo checks, open the **sample label photos** on the same card, save one, and use **Upload photo** (or point the camera at the photo on another screen).

Sample files live in the repository root (Excel + label photos) and can be used manually too.

## Tech

- Vanilla JavaScript (no framework, no build step), HTML, CSS
- Service worker (offline), Web App Manifest
- [SheetJS](https://sheetjs.com) for Excel, [Tesseract.js](https://tesseract.projectnaptha.com) for OCR, [jsPDF](https://github.com/parallax/jsPDF) for PDFs (loaded from CDN)
- Custom Code 128 barcode reader, custom WebGL renderer for the 3D layout
- Per-device `localStorage`; no server

## Access roles

- Visitor (default, no sign-in): can see everything except "Reset demo data".
- Administrator: sign in from Profile with the admin name and code (the code is not published here).

## Segurín

A friendly safety mascot: greets on the intro screen, asks a safety question, says safety phrases and has its own section ("With Segurín") with a daily question, streak and phrases. Voice is off by default (speaker toggle). Recorded neural voice in ES/EN/PT/FR/ZH (sgaudio-*.js, loaded on demand); German uses the device voice.

**Mini-scenes:** four short animated scenes (wet floor, forklift, phone while walking, lifting a load) where Segurín talks with a coworker, both wearing full PPE. Voices per line (sgscn-*.js, loaded on demand).

## Languages

English, Spanish, German, Portuguese, French and Mandarin Chinese (中文).

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or publish the folder with GitHub Pages (Settings → Pages → deploy from branch, root).

## Notes

- Built by a quality supervisor to solve a real warehouse workflow, with AI assistance (Claude) for development.
- No real company data, logos or brand names are included in this demo.

## Acceso (v12)
Entrada con nombre + código personal. Firebase (Auth anónima + Firestore con reglas) valida usuarios y limita dispositivos
(2 celulares + 1 computadora por usuario; el visitante sin límite). El administrador gestiona accesos en Perfil → Control de acceso.
`setup.html` es de un solo uso para crear los usuarios iniciales: elimínalo del repositorio después.

## Avatares (v13)
- **Trafisegurín** (cono con chaleco, casco, botas y lentes) reemplaza a Segurín en voz, preguntas, frases y mini-escenas. Se eliminó la tarjeta de manos / lengua de señas.
- **Patito Quality** (`patito.js`): asistente animado que flota en pantalla, cambia de accesorio según la pestaña, parpadea, mueve el ala, brinca y da consejos en 6 idiomas; "cuac" sintetizado. Se activa/desactiva (y su sonido) en Perfil.
