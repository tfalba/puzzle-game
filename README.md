# PuzzleQuest Studio

Create a personal sliding puzzle from any Pixabay photo, play it directly in the browser, and celebrate when every tile clicks into place.

## TL;DR (Short Version)

- Search Pixabay through a slide-out control, pick an image, and it instantly becomes your puzzle board.
- Drag, drop, or simply click tiles adjacent to the empty slot to solve the 3×3 board.
- When everything lines up, the missing piece fades in and the finished image is revealed at full size.
- Built with React, TypeScript, Vite, and Tailwind CSS; just run `npm install` + `npm run dev`.

## Long Version

### What the App Does

PuzzleQuest Studio turns image-hunting and puzzle-solving into a single experience:

1. **Hero + Controls** – A hero banner sets the scene, and a floating “+” button opens the media drawer.
2. **Pixabay Drawer** – The slide-out panel lets you search Pixabay (via API) for safe, square-ish photos; selecting one updates the puzzle instantly and closes the drawer.
3. **Puzzle Board** – Tiles support drag-and-drop or single-click moves. A Shuffle button randomizes tiles, and a Solve button (next to Shuffle) restores the correct order for quick demos or resets.
4. **Win Celebration** – Once every tile returns home, the missing piece fades in, the board dissolves, and the full image appears so players can admire the completed photo.

### Key Features

- **Interactive Pixabay search** with debounced form, error states, and a scrollable results grid.
- **Puzzle mechanics** that include drag, drop, click-to-move, solve, and shuffle interactions.
- **Finish animations** that use timed fades to reveal the missing tile and final photo.
- **Responsive styling** powered by Tailwind custom colors, gradients, and glassmorphism accents.

### How It Was Built

- **Framework:** React 18 + Vite + TypeScript for fast DX and type safety.
- **Styling:** Tailwind CSS with a custom palette (nickBlack, nickRust, nickTeal, etc.).
- **State & Effects:** React hooks manage board state, Pixabay results, modal visibility, and celebration timers.
- **API Integration:** Fetches Pixabay via `VITE_PIXABAY_API_KEY`; results filtered to near-square images for puzzle parity.
- **Tooling:** ESLint config from Vite template plus TypeScript strictness; Vite handles bundling and HMR.

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Add environment variables** – Create `.env` (or `.env.local`) with:
   ```bash
   VITE_PIXABAY_API_KEY=your_api_key_here
   ```
   You can request a free key at [pixabay.com/api/docs](https://pixabay.com/api/docs/).
3. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit the provided URL (usually `http://localhost:5173`).

### Development Notes

- The Pixbay drawer clears its query/results every time it closes to keep things tidy.
- Puzzle solving logic checks each tile index; when solved it triggers a fade-in/out animation sequence.
- The codebase lives under `src/` with main components in `src/components`.

### Roadmap Ideas

- Difficulty selector (different grid sizes).
- Progress tracking / move counter / timers.
- Offline image uploads instead of Pixabay-only flow.

Enjoy crafting puzzles from your favorite Pixabay finds! If you extend the project, feel free to document new features here. 
