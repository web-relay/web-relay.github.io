---
title: What is Web Relay?
description: The proposal, intended users, and first experience for Web Relay.
---

Web Relay is the working project name for **Browser Capability Launcher**: a local-first command launcher and capability runtime for the browser.

The idea is simple: applications expose useful actions through a common interface. A registry makes those capabilities discoverable, context-aware, and reusable across different interaction surfaces.

:::caution[Project status]
A working local showcase now connects a notes PWA, launcher extension, GitHub provider extension, and browser actions. The standalone SDK is published on npm, and additional extensions can be approved in launcher settings. The broader platform design remains a proposal. Follow the [showcase guide](/project/showcase/) to run it.
:::

## The first experience

Open the launcher, search for an action, and execute it. The development extension uses `Alt + Shift + Space`, or its toolbar button. The original brief suggested `Alt + Space`; browser shortcut constraints and conflicts motivated the development combination. Check `chrome://extensions/shortcuts` if your environment intercepts it.

Inside a podcast PWA, the launcher might offer:

- Save current timestamp
- Create episode note
- Add episode to queue
- Restore coding workspace
- Copy current URL

The first three come from the app, the workspace action comes from another extension, and the last comes from the browser. All appear in one place, with their sources identified.

## Who is it for?

The initial audience is developers and technical power users who build personal PWAs, maintain extensions, work in internal tools, and want keyboard-driven browser workflows. Internal application teams are a secondary audience.

## What makes the idea useful?

An application already understands its data and authenticated session. Instead of recreating its behavior through generic automation, it exposes an explicit action. Web Relay supplies discovery and invocation while the application keeps ownership of the actual logic.

A shared capability can appear in an app’s own palette and the global launcher. Future adapters could expose the same model to WebMCP, agents, voice, or devices.

## What we want to prove first

One personal PWA, a launcher extension, and a workspace extension should expose useful commands through the same registry, with active-tab context and no backend.

Read the [vision](/concepts/vision/), explore the [architecture](/design/architecture/), or help define the [MVP](/project/roadmap/).
