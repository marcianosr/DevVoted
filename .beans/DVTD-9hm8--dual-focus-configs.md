---
# DVTD-9hm8
title: Dual-focus configs
status: todo
type: feature
created_at: 2026-08-13T20:51:48Z
updated_at: 2026-08-13T20:51:48Z
parent: DVTD-d0fw
---

One slot focusing two categories, both appearance checks live. Split out of DVTD-72d9 Phase 3 (2026-08-13) so the rest of that roster work can ship without waiting on the model change.

Design is documented in wiki §4.3 ("Dual focus"), including the decision to prefer duals **over** a hidden synergy table (§4.7).

## Why it is not just another focus config

`focusCategory` is a single `CategoryCode` today (`src/modules/run/config/domain/config.model.ts`). A dual needs it plural, which touches `isUpgradable`, `describeConfig`, `givesOf`, `needsOf`, the focus-demand clamp, and every consumer that reads a single category. Precedent for the plural shape: ESLint's `eliminatesWrongOptionsFor` is already a readonly array.

## Scope

- [ ] Plural focus categories in the model + all derived copy
- [ ] `.tsx` (TypeScript + React)
- [ ] `Node.js` (JavaScript + General Backend) — this is the literal fix for the missing General Backend focus config. Note: DVTD-72d9 Phase 1 claims a `.be` focus was added, but the roster has none; `.be` is not a real extension, `Node.js` is the real name for "JS but backend".
- [ ] Decide: does `.jsx` become the JS+React dual? If so, solo React needs a new label — `useState` is the leading candidate (React has no config file of its own).

## Pool (do not ship all of these — nine configs for one mechanic is waste)

`.tsx` (TS+React), `.jsx` (JS+React), `styled-components` (CSS+React), `JSDoc` (JS+TS), `<script>` (HTML+JS), `<style>` (HTML+CSS), `Tailwind` (CSS+HTML), `.erb` (Ruby+HTML), `.jsp` (Java+HTML), `Jinja` (Python+HTML), and the runtime family pairing a language with General Backend: `Node.js` (JS), `Deno` (TS), `Rails` (Ruby), `Django` (Python), `Spring` (Java), `Next.js` (React), `Nuxt` (Vue).

Git has no natural intersection and stays solo. `.vue` is secretly the quad (SFC = template + script + style) and is an upgrade candidate, not a dual.

## Open questions

- Upgrade path: does a dual level up both categories at once, and does the coverage gate read the lower of the two?
- Draft cost: uncommon at 64 KB, or priced above two commons (2 × 32) since it saves a slot?
