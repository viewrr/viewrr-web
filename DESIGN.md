# viewrr — Design System (Apple-TV language)

The visual contract for viewrr clients. Web/TV implements it in Vue + Tailwind Plus;
mobile (Compose Multiplatform) mirrors the same tokens. Decisions of record:
[ADR-0005](https://github.com/viewrr/viewrr/blob/main/docs/adr/0005-client-stack.md).

**Living reference:** open [`design/index.html`](design/index.html) in a browser — the
canonical mock. Tokens extracted to [`design/tokens.css`](design/tokens.css) /
[`design/tokens.json`](design/tokens.json).

## Principles
- **Content is the UI.** Real poster/backdrop art fills cards; chrome stays out of the way.
- **Dark, calm surfaces.** Page `#0b0b0d`, app `#1c1c1e`, translucent (blurred) nav.
- **Focus is physical.** Hover/focus = `scale(1.06)` + white ring on the *rounded poster
  itself* (ring inherits the radius), `cubic-bezier(.2,.7,.2,1)` over `.25s`. Maps to
  D-pad/remote focus on TV.
- **One accent** (`#ff5470`), used sparingly (active nav, scrubber fill).
- **System type** (SF stack), big confident row headers, oversized Top-10 numerals.

## Tokens
See `tokens.css` / `tokens.json`. Groups: color, radius (card 12 / large 16 / pill),
type scale (numeral 110 → sub 13), spacing (content 40×32, row gaps), media aspects
(poster 2:3 @150w, landscape 16:9 @460w), motion (focus scale, ease, duration, shadow).

## Component inventory (build order for #103/#105)
| Component | Notes |
|---|---|
| **TopNav** | translucent glass bar; wordmark · Home/Movies/Shows/Music · search · avatar |
| **Shelf** | section: bold header + `›` chevron, horizontal scroll row (scrollbar hidden) |
| **PosterCard** | 2:3 art, rounded-xl, focus ring; title + sub; optional corner badge |
| **Top10Card** | oversized numeral + PosterCard + genre label |
| **LandscapeCard** | 16:9 backdrop, bottom gradient, status badge + title overlay |
| **Player / Chrome** | back + title (top); scrubber (accent fill) + transport + CC/volume/AirPlay (bottom); icons are clean SVG, never emoji |

## Open / next
- Genres are placeholder labels in the mock — wire real genre data.
- Hero header optional (Apple's home variant also leads with Top-10).
- Map tokens → Tailwind theme config when the Vue app is scaffolded (#103).
