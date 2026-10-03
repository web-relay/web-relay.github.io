---
title: MVP and roadmap
description: The smallest useful proof, its acceptance criteria, and deliberately deferred work.
---

The project is currently a **working local showcase**. A notes PWA, launcher extension, independent GitHub provider, and browser actions share discovery and invocation contracts. The phases below remain a proposed sequence, not committed delivery dates.

## Implemented showcase

- Provider-owned registry with registration, unregister, and fresh availability checks.
- Async extension registration from saved configuration.
- Settings-based extension pairing, connection checks, explicit approval, optional tab-URL sharing, and disable/removal.
- Notes PWA using the SDK and a local palette, with persisted notes and an offline shell.
- Injected launcher dialog, search and keyboard navigation, active-tab discovery, source labels, and errors.
- Independent GitHub.com extension for repository navigation.
- Browser URL copy, new tab, downloads, and tab duplication.
- Copy-and-open question handoff to ChatGPT and current-link handoff to Gemini.
- Optional action results, visible errors, focus-loss dismissal, and bounded text input.
- Versioned requests, validated responses, timeouts, and stale-context rejection.
- Unit tests and full Chromium integration checks with both extensions installed.

GitHub tests use intercepted URL fixtures. They exercise real cross-extension messaging and tab navigation without performing GitHub account actions. The injected-UI suite triggers the actual toolbar action and tests the launcher on the host page. The diagnostic-document suite still covers core routing. AI destinations use fixtures; no prompts are submitted.

## Remaining before a broader MVP release

Development launcher 0.0.3 adds PWA enrollment UI, optional host permission onboarding, shared-origin path routing and Chromium lifecycle checks. General input schemas, invocation deduplication, navigation acknowledgement and search ranking still need work. Search currently matches substrings rather than implementing fuzzy scoring. Discovery refreshes on open, refresh, and after invocation; provider updates do not continuously push into an open launcher.

## Phase 1 — prove the local loop

Build five pieces:

1. **Launcher extension:** shortcut, fuzzy search, registry, active-tab context, and browser commands.
2. **PWA SDK:** registration, removal, execution, and availability.
3. **PWA bridge:** discovery and invocation of app-owned commands.
4. **Local command palette:** reuse the registrations without the extension.
5. **Extension provider SDK:** connect one independent extension.

## The dogfood scenario

| Source | Example actions |
| --- | --- |
| Notes demo PWA | Create note, pin selected note |
| GitHub provider extension | Open project repository, current repository, issues, pull requests |
| Browser | Copy current URL, open downloads, new tab, duplicate tab |

The original PRD suggested a workspace extension; the first showcase uses a simpler GitHub navigation provider to prove the same independent-provider boundary.

## Acceptance criteria

The first milestone succeeds when:

- A developer adds PWA support with a small integration.
- The same command appears in the local palette and global launcher.
- Commands appear or disappear as context changes.
- A separate extension exposes capabilities to the launcher.
- Browser commands coexist with app-specific commands.
- The system works without a backend.
- Adding a new first-party app does not require changes to launcher core.

## Phase 2 — evaluate adapters

Once the local loop works, evaluate WebMCP translation and a small number of stable legacy integrations. Validate compatibility and maintenance assumptions before expanding coverage.

## Later possibilities

The registry could serve agents, voice commands, automation, mobile remotes, or external devices such as an ESP32 controller. Optional services could support metadata, updates, adapter distribution, or synchronization.

These are opportunities, not commitments. The core registry must earn them by proving useful first.

## Outside the initial release

A public marketplace, cloud accounts, cloud sync, billing, AI recommendations, general website automation, a large adapter catalogue, a remote backend, and a workflow automation engine are explicitly out of scope.
