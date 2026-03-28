# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Joe's Splat Factory - a paint-flinging browser game inspired by Joe's Jackson Pollock-style street art in Thailand. Players swipe/tap to fling colorful paint onto a white canvas with procedural splatter physics, combos, and scoring.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + production build (`vue-tsc -b && vite build`)
- `npm run preview` — Serve production build locally (port 4173)
- `npm run test:e2e` — Run all Playwright E2E tests (chromium, single worker)
- `npx playwright test e2e/<file>.spec.ts --project=chromium --workers=1` — Run a single E2E spec
- `npx playwright test -g "test name" --project=chromium --workers=1` — Run a test by name

E2E tests require a build first (`npm run build`). The Playwright config auto-starts `npm run preview` as the web server. Game-over tests take ~30s each (waiting for the 60s game timer).

## Tech Stack

Vue 3 + TypeScript + Vite 8, Tailwind CSS 4 (using `@theme {}` in `src/assets/main.css`, not `tailwind.config.js`), vue-router 4. No external game engine — all rendering is hand-rolled HTML5 Canvas 2D. No backend; localStorage for persistence. Deployed as static site on Netlify.

## Architecture

### Rendering: Two-Layer Canvas

The game uses two stacked `<canvas>` elements managed by `SplatCanvas.vue`:
- **Persistent layer** (bottom): Finalized paint splats accumulate here. Never cleared during a game. Only drawn to, never re-rendered.
- **Animation layer** (top): Active particles and in-flight paint. Cleared and redrawn every frame via `requestAnimationFrame`.

This avoids re-rendering all historical splats each frame. Canvas dimensions are scaled by `devicePixelRatio` (capped at 2x).

### Splat Generation Pipeline

`InputHandler` (PointerEvent API) → classifies gesture (tap/fling/drag) → `useGameState.handleGesture()` → creates `SplatConfig` → `ParticleSystem.emit()` spawns flying particles AND calls `splatter-engine.generateSplat()` to procedurally build the final splat shape → after a short delay, the splat is committed to the persistent canvas via `canvas-renderer.drawSplat()`.

Splats are NOT physics-simulated. They are procedurally generated shapes (blobs via bezier curves + tendrils + satellite dots) driven by gesture velocity/direction.

### Game Mode System (Strategy Pattern)

All modes implement the `GameMode` interface (`src/types/modes.ts`): `onSplat()`, `update()`, `isComplete()`, `getEndTitle()`, `getEndSubtitle()`. The engine in `useGameState` is mode-agnostic.

**To add a new game mode:**
1. Create `src/modes/your-mode.ts` extending `BaseMode`
2. Register it in `src/modes/index.ts` modeRegistry map
3. The menu and game loop automatically pick it up

Current modes: `free-fling` (60s timed scoring), `zen` (no timer/score).

### State Management

Game state lives in `useGameState` composable (reactive Vue refs, not Pinia). The composable owns the `GameLoop`, `ParticleSystem`, canvas contexts, and delegates to the active `GameMode` for scoring/timing decisions.

### Audio

`AudioManager` generates all sounds procedurally via Web Audio API — no audio files. Splats, whooshes, combos, and game-over fanfare are synthesized on the fly.

## Deployment

- **Platform**: Netlify (static site)
- **GitHub repo**: dizid/game-colors-joe
