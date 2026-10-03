---
title: Decisions and discoveries
description: Accepted project decisions, their consequences, and unresolved implementation details.
---

This log tracks what we have decided as the project moves from the PRD to running software. Accepted architecture decisions are distinct from implemented functionality.

## 001 — Local development in a pnpm monorepo

**Status:** Accepted · **Date:** 3 October 2026

Start with PWAs and extensions we own and run locally. Keep the demo PWA, global launcher extension, independent web-app provider extension, and shared TypeScript packages in [one pnpm monorepo](https://github.com/web-relay/web-relay).

This makes contracts, coordinated changes, and local testing easier. The browser still treats apps and extensions as separate origins and identities. Local ownership does not replace approval, permissions, validation, or lifecycle handling.

**Implementation:** A buildable scaffold exists. The PWA has an offline shell; the extensions have starter manifests and popups. Discovery and invocation are the next working slice.

**Open:** Which real PWA and web app should be the first integration targets? How should extension IDs and allowed origins be configured during development?

## 002 — Command aggregation before workflows

**Status:** Accepted for the MVP · **Date:** 3 October 2026

Initially, composition means showing commands from several providers in one launcher and routing each invocation to its owner. Application functions remain inside the owning app or extension. The launcher holds discoverable metadata and relevant context rather than copies of executable functions.

Chained workflows remain outside the initial release, consistent with the PRD.

**Open:** Discovery messages, context expiry, availability rechecks, timeout behavior, and execution errors need concrete contracts and tests.

## 003 — Documentation evolves with implementation

**Status:** Accepted · **Date:** 3 October 2026

Keep updating this site when implementation uncovers details or a decision is made. Preserve the original PRD as the source proposal, while maintaining current architecture and roadmap pages.

The documentation stays in the existing `web-relay.github.io` repository so publishing continues at the organization’s root URL. The runtime uses the `web-relay` monorepo. Changes spanning both repositories should link to each other when relevant.

Record accepted decisions here with their reasons and remaining questions. Continue marking unreleased API examples as proposals.

## Initial browser development target

**Status:** Working assumption · **Date:** 3 October 2026

Use Chromium and Manifest V3 for the starters. Headless Chromium is installed on the development machine, which supports UI smoke checks. Extension discovery and messaging need integration tests in full Chromium with both extensions installed; a headless screenshot alone is not sufficient validation.
