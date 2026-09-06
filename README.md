# QubitX — Quantum Computing, Made Understandable

An interactive, visual, beginner-friendly Quantum Computing learning platform built for the Smart India Hackathon (SIH).

**Live demo:** https://qubitx-demo.example *(configure after pushing — see below)*

---

## What it is

QubitX turns abstract quantum concepts — qubits, superposition, entanglement, quantum gates, measurement, and quantum algorithms — into hands-on interactive experiences. It combines:

- Structured lessons with interactive visualizations
- A drag-and-drop **Quantum Lab** circuit builder backed by a real state-vector simulator
- A 3D interactive **Bloch sphere**
- An **AI Tutor** (built-in knowledge base, no external API key required)
- Quizzes, XP/achievements, daily challenges, and progress analytics
- A guided **Demo Mode** so judges can explore the whole flow in seconds

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts (progress charts)
- Three.js (3D Bloch sphere, lazy-loaded)
- LocalStorage-based persistence (no backend required for the SIH prototype)

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Build for sharing / deployment

```bash
npm run build
```

The output folder `dist/` is a self-contained static site. You can deploy it to any static host — Vercel, Netlify, GitHub Pages, etc.

## Deployment quick-start (Vercel)

1. Push this repo to GitHub.
2. Connect the repo to a Vercel project.
3. Set:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. Vercel gives you a public URL.

## Deployment quick-start (Netlify)

1. Push to GitHub.
2. In Netlify, import the repo (or drag-and-drop the `dist` folder).
3. Set build command `npm run build` and publish directory `dist`.
4. Deploy.

## Deployment quick-start (GitHub Pages)

Push the built `dist/` contents to a `gh-pages` branch (or into `/docs`) and enable GitHub Pages in repo Settings → Pages.

## License

Prototype for the Smart India Hackathon. Adjust the license to your team's choice before publishing.

---

*Built with Codebuff.*
