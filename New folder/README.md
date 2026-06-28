# Resume & Cover Letter Builder

A polished, static-first web app for collecting resume details and generating a document-style resume and cover letter. The experience works without a server-side dependency and supports PDF download, TXT download, copy-to-clipboard, local storage, and optional email delivery via EmailJS.

## Files

- `index.html` — Step-by-step wizard UI plus export and email controls
- `styles.css` — Modern responsive styling for the form and preview area
- `app.js` — State management, conditional questionnaire logic, rendering, export actions, and EmailJS integration

## How it works

1. Users answer guided questions in five steps.
2. The app stores their responses in local storage so progress is preserved.
3. A style-specific template converts responses into a polished resume + cover letter document.
4. The output can be previewed, copied, downloaded as TXT/PDF, or emailed when EmailJS is configured.

## Static hosting setup

This project is designed to work on static hosts such as GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

To enable email delivery:

1. Create an EmailJS account.
2. Create an email service and template.
3. Replace the placeholder values in `index.html` for the public key, service ID, and template ID.

## Customize

- Add new resume styles in `app.js` under the `templates` object.
- Extend work history sections by adding additional fields in `createWorkEntry()`.
- Update the export format or email message content as needed.

# resume-creation
