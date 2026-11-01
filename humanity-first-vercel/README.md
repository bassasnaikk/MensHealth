# Humanity First

A responsive, single-page React website based on your supplied design. Uses the exact palette `#0B1546`, `#F5EAEA`, `#3355E8`, with locally bundled Grift, Jersey 10, and IBM Plex Serif fonts.

## Open the website

Install Node.js if it is not already on your computer. Open this folder in a terminal, then run:

```powershell
npm install
npm run dev
```

Open the local address shown in the terminal (usually http://127.0.0.1:5173). Keep the terminal open while using the website. Press Ctrl+C to stop it.

You can also double-click `Start website.cmd` after the dependencies are installed.

## Production build

```powershell
npm run build
npm run preview
```

The finished website is generated in `dist`. The preview command lets you inspect that production build locally.

## Put it online

For Vercel, upload `humanity-first-vercel.zip` through the Vercel dashboard or unzip it and import the folder as a project. It includes `vercel.json`, which sets the Vite build command and `dist` output folder. No environment variables or backend are needed. The Grift font supplied by you is embedded in the site; use your appropriate webfont license when publishing. For a simple Netlify upload, run `npm run build` and upload the `dist` folder.

## Editing

- `src/content.js`: introduction, six expectations, ten checklist phrases, reflections, and six solutions.
- `src/main.jsx`: page structure and checklist state.
- `src/motion.js`: responsive GSAP scroll scenes and cleanup.
- `src/interactions.js`: pointer spring physics, magnetic links, title lenses, and panel depth.
- `src/styles.css`: typography, exact palette, responsive composition, reduced-motion support.
- `public/fonts`: bundled fonts, plus open-source font licenses.

Checkbox answers live only in React memory. They are never sent to a server and reset on reload. Desktop has six pinned scroll scenes: a splitting hero, oversized Effects opening, horizontal expectation panels with six distinct distortions, an assembling Awareness question, a stack of six solution panels, and a letter reconstruction finale with a blue wipe. Scroll backward to reverse the scenes. Mobile keeps expressive word reveals and displacement in a readable sequential layout without long pins. Short desktop windows also use this compact layout. All content remains readable when reduced motion is enabled. No WebGL is required.

## Pointer interactions

On a mouse or trackpad, move across the hero and closing statement to push individual letters. Hover rule words to split their upper and lower letterforms, and scan the large chapter headings to reveal a contrasting ink layer. Links respond magnetically, checklist rows sweep on hover and keyboard focus, and solution content tilts with a separate number parallax layer. These effects add no hidden content or required hover actions. They switch off for coarse pointers and reduced motion; the cursor and text selection remain native. Spring updates pause when settled, and all listeners and animation frames are cleaned up.
