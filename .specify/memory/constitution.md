# JuegoIA Constitution
<!-- Governance for the self-contained 2D browser game -->

<!--
SYNC IMPACT REPORT
Version change: unversioned scaffold -> 1.0.0
Modified principles:
  - Unfilled template slot 1 -> I. Zero-Dependency Browser Stack (NON-NEGOTIABLE)
  - Unfilled template slot 2 -> II. Frame Budget Discipline (NON-NEGOTIABLE)
  - Unfilled template slot 3 -> III. Modular, Organized Code
  - Unfilled template slot 4 -> IV. Deterministic, Separated Game Logic
  - Unfilled template slot 5 -> V. Retro Neon Aesthetic Consistency
Added principles:
  - VI. Self-Contained Assets & Offline Operation
  - VII. Simplicity & Scope Discipline
Added sections:
  - Technical Constraints
  - Quality Gates
  - Governance (filled from scaffold)
Removed sections: none
Follow-up TODOs: none
-->

## Core Principles

### I. Zero-Dependency Browser Stack (NON-NEGOTIABLE)
The project MUST run as a static site using only HTML5 Canvas, CSS, and vanilla
JavaScript. Game engines, UI frameworks, runtime libraries, CDNs, bundlers, and
transpilers are forbidden. Opening `index.html` in a browser MUST be sufficient
to play the game.
Rationale: guarantees a self-contained deliverable that works without a
toolchain or network access.

### II. Frame Budget Discipline (NON-NEGOTIABLE)
The game MUST sustain 60 FPS in the reference environment, a ~16.67 ms frame
budget. The render loop MUST use `requestAnimationFrame`; simulation MUST use
delta time. Busy waits, synchronous polling, and unbounded per-frame allocation
are forbidden; expensive work MUST be precomputed or cached.
Rationale: fluid motion is an acceptance criterion that cannot be retrofitted
after the loop and asset strategy are chosen.

### III. Modular, Organized Code
Code MUST be separated by responsibility (core loop, input, entities, rendering,
audio, state, UI) with small modules and explicit interfaces. No source file
MUST exceed 300 lines without documented justification in review.
Rationale: separation keeps the codebase maintainable and isolates performance
hotspots.

### IV. Deterministic, Separated Game Logic
Simulation rules MUST be pure functions of state plus delta time, independent
of Canvas drawing and DOM events. Gameplay decisions MUST use a fixed
simulation step; rendering MAY interpolate. Rule changes MUST be covered by
deterministic tests that run in Node without a DOM.
Rationale: decoupling makes behavior reproducible and testable without a
browser harness.

### V. Retro Neon Aesthetic Consistency
All visuals MUST follow one documented style: dark high-contrast backgrounds,
neon glow via Canvas shadows and gradients, consistent typography, and optional
scanlines. Feature-local colors or effects that break the style guide are
forbidden.
Rationale: a shared palette and effect vocabulary prevents a patchwork look.

### VI. Self-Contained Assets & Offline Operation
The game MUST NOT issue runtime network requests. Images, audio, and fonts MUST
be generated procedurally, embedded, or committed as local files. All features
MUST work fully offline.
Rationale: offline operation is the practical consequence of the
zero-dependency constraint.

### VII. Simplicity & Scope Discipline
Implement only behavior required by the current specification. Speculative
abstractions and unrequested features are forbidden. Any added complexity MUST
be justified in review by a concrete need.
Rationale: YAGNI keeps a small game codebase readable and fast.

## Technical Constraints

- Reference environment: latest stable Chrome or Firefox on a desktop machine.
- Entry point: root `index.html`; no server, bundler, or package install needed.
- Source: plain ECMAScript modules in `.js` files; no transpilation.
- Layout: `src/core`, `src/input`, `src/entities`, `src/render`, `src/audio`,
  `src/ui`, plus `styles/` and `assets/` when needed.
- No runtime network requests, including analytics or remote fonts.
- Input: keyboard and pointer through standard DOM events, routed by one input
  module.

## Quality Gates

- Every change MUST be smoke-tested in a browser with no console errors and no
  failed network requests.
- Frame pacing MUST be measured and MUST NOT regress below 60 FPS in the
  reference environment.
- Changes to game rules MUST pass deterministic tests runnable without a DOM.
- Code review MUST verify every Core Principle; exceptions MUST be documented
  in the pull request before merge.
- If lint or typecheck scripts are added, they MUST pass before merge.

## Governance

This constitution is the highest-authority governance document for JuegoIA and
supersedes informal conventions. Amendments MUST be proposed with a written
rationale, approved by the project owner, and recorded here with an updated
Sync Impact Report. Versioning follows semantic versioning: MAJOR for removing
or redefining a principle, MINOR for adding a principle or materially expanding
guidance, PATCH for clarifications and typo fixes. Every pull request MUST be
reviewed against this constitution; violations MUST be corrected or justified
in writing before merge. The Sync Impact Report at the top of this file is
temporary scratch material and MUST be removed before committing an amended
constitution.

**Version**: 1.0.0 | **Ratified**: 2026-11-19 | **Last Amended**: 2026-11-19
