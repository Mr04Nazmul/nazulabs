# Nazorix Lycoris integration

The existing site is static HTML. The homepage now progressively enhances its hero with the supplied six-frame React specimen, while the other sections and HTML routes remain in place. The original hero is visible until React mounts, and remains available when JavaScript does not load.

## Paths and setup

- Reusable component: `components/ui/lycoris-specimen.tsx`.
- Uncustomized usage example: `components/demo.tsx`.
- Nazorix usage and mount: `src/nazorix-hero.tsx`.
- Tailwind and integration styles: `styles/lycoris.css`.
- Production assets: `assets/lycoris/nazorix-hero.js` and `nazorix-hero.css`.
- TypeScript alias: `@/*` maps to the project root, in both TypeScript and Vite.

`components/ui` is the configured shadcn UI directory. Keeping reusable UI there allows shadcn-generated imports and the supplied `@/components/ui/lycoris-specimen` import to resolve consistently. It is now created, and `components.json` points to it.

Node 22.12+ or Node 24 is recommended for the pinned build tools. Set up and build:

```sh
npm ci
npm run build
npm test
```

React, React DOM, TypeScript, Tailwind 4 and its Vite plugin are installed by this project. No manual shadcn initialization is needed because `components.json`, aliases and the `cn` utility are supplied. To add a future shadcn component:

```sh
npx shadcn@latest add button
```

Tailwind imports its theme and utilities without Preflight so existing HTML element styles are not reset. Future shadcn components may need their own theme tokens. Styles belong in `styles/lycoris.css`, scoped to the island when practical.

The committed production bundle makes the existing static host work without a Node process. Rebuild and commit `assets/lycoris/` whenever the React source or styles change. To develop locally, run `npm run dev` in one terminal (watch build), and `python3 -m http.server 4173` in another. Open the site root on port 4173.

## Component decisions

All supplied props remain supported. Nazorix passes its name, studio, description, participation specs, tagline and existing sign-up/network links. The accent is the established violet and the background is the existing navy. The original uncustomized red chrome specimen is retained in `Demo`.

State stays inside the component: active frame, hovered glyph, reduced-motion preference and ligature toggle. No context provider or application state store is required. The Google Federant font is loaded through the supplied stylesheet link; the component retains its serif fallback and accepts `fontHref={null}`. The flower and studio mark are procedural; there are no image placeholders requiring stock imagery, and no replacement icon library is needed.

The component retains portrait container queries, mobile frame positioning and reduced-motion handling. It stops the animation loop offscreen and when the document is hidden. Integration fixes include geometry regeneration for changed `seed`/`florets`, a separate 2D fallback canvas (a canvas cannot switch context types after WebGL allocation), unique grain IDs across instances, same-tab internal links, and clearing residual effects when reduced motion changes.

The six artistic type-specimen layouts, interactive glyphs, editable lines and ligature control remain part of the experience. No account, wallet, node, points or backend code is changed.

`npm test` executes the actual production bundle in a simulated DOM. It checks mounting and the static fallback, all six frames, reduced-motion navigation, ligature interaction, internal links, and both absent-WebGL and failed-shader fallback paths. This does not substitute for visual testing on a real browser/GPU.

Source component: Lycoris Specimen by Kedhareswer Naidu, supplied by the user; community listing: https://preview.21st.dev/@kedhareswer/components/lycoris-specimen (MIT).
