---
title: Run the local showcase
description: Try the notes PWA, GitHub provider, launcher extension, and browser commands together.
---

The [runtime monorepo](https://github.com/web-relay/web-relay) now contains a working local showcase. It demonstrates real discovery and invocation across a PWA and two independently loaded Chromium extensions, without a backend.

## Build and start

Use Node.js 22.12 or newer and pnpm 12.8.1. CI uses Node.js 24.

```sh
git clone https://github.com/web-relay/web-relay.git
cd web-relay
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev:pwa
```

Open `http://localhost:4173`. The demo PWA stores notes locally and includes an offline shell. Rebuild after code changes; the development server does not hot-reload.

## Load both extensions

In Chromium, open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked** for each directory:

```text
apps/launcher-extension/dist
apps/webapp-extension/dist
```

The second extension is named **Web Relay GitHub Provider**. Both manifests include public development keys so their IDs remain stable across machines. This allows explicit pairing without manual ID entry.

Pin the launcher in the toolbar. Open it with the toolbar button or `Alt + Shift + Space`; check `chrome://extensions/shortcuts` if another application intercepts the shortcut.

## Try the PWA SDK

1. In the local palette, choose **Create note**.
2. Open the browser launcher on the same PWA tab. It discovers **Create note** and **Pin selected note** from the app.
3. Execute **Pin selected note** in the browser launcher. The PWA updates and the command disappears because that note is now pinned.
4. Execute **Create note** from the browser launcher. It invokes the same app-owned function as the local palette.

Selecting an unpinned note makes pinning available. The PWA owns this state; the launcher sees currently available metadata. `Ctrl / Cmd + K` focuses the local palette search.

## Try the GitHub provider

Visit [the runtime repository](https://github.com/web-relay/web-relay) and open the launcher. The independent provider offers:

- Open current repository
- Open repository issues
- Open repository pull requests

The provider also exposes **Open Web Relay repository** from any tab. These actions navigate GitHub URLs; they do not write account data, call an authenticated API, or depend on DOM selectors.

## Try browser actions

The launcher includes **Copy current URL**, **Open new tab**, **Open downloads**, and **Duplicate current tab**. Copy and duplication appear for HTTP(S) tabs.

Expand **Capability sources** to inspect provider status or disable the GitHub provider. Disabling it removes its actions and blocks their execution. Re-enable it to discover them again.

## Refresh and failure behavior

Discovery runs when opening or refreshing the launcher and after invocation. A visible command can become stale if app state changes. Execution checks availability again and reports an error instead of running an unavailable action.

Tab navigation invalidates old tab snapshots. Missing providers and timeouts appear in source status or the action result. A timeout does not cancel execution; inspect the app before retrying.

## Run integration checks

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

The test starts the local server if needed and loads both real extensions in persistent full Chromium. Set `CHROMIUM_PATH` to reuse an installed full Chromium binary.

Tests exercise SDK and local palette execution, content-script discovery, cross-extension messaging, contextual availability, stale requests, provider disabling, clipboard writes, browser navigation, persistence, and offline loading.

GitHub tests intercept navigation with URL fixtures, so they do not interact with an account. Headless tests open the real popup document in a tab; they do not inspect the browser-toolbar popup through Playwright. Screenshots are saved in `test-results/`.

## Development limits

The SDK packages are private workspace packages. The bridge trusts only the demo origins and the known `demo-notes` provider. Generic provider registration, input arguments, continuously pushed discovery, fuzzy search ranking, production permission onboarding, and workflow composition remain future work.

Read the [implemented contract](/design/protocol/) and [trust controls](/design/security/) before extending the integration.
