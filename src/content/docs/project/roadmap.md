---
title: MVP and roadmap
description: The smallest useful proof, its acceptance criteria, and deliberately deferred work.
---

The project is currently in **proposal and documentation**. The phases below describe a proposed sequence, not committed delivery dates.

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
| Personal PWA | Create note, search notes, sync data |
| Tab Workspace Manager extension | Open AI workspace, restore coding workspace, save current workspace |
| Browser | Copy current URL, open downloads, close current tab |

“Sync data” is an example of app-owned behavior; it does not introduce a backend dependency into the launcher.

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
