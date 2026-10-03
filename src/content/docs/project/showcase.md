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

Pin the launcher in the toolbar. Its toolbar button injects a command dialog into the active HTTP(S) page. Open it with the button or `Alt + Shift + Space`; check `chrome://extensions/shortcuts` if another application intercepts the shortcut.

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

## Send a question or link to an AI web app

**Prepare question for a new ChatGPT chat** opens a small input form. Enter a question, then choose **Copy question & open ChatGPT**. The launcher copies the question and opens `https://chatgpt.com/`. Paste and send it in ChatGPT.

**Share current link with Gemini** copies the active page URL and opens `https://gemini.google.com/app`. Paste the link there and add your question.

These are copy-and-open handoffs. They do not submit prompts automatically or claim a supported prompt-submission URL API. No ChatGPT or Gemini host permissions, API keys, or DOM automation are used. See the official [ChatGPT web guide](https://learn.chatgpt.com/docs/web) and [Gemini guide](https://support.google.com/gemini/answer/13275745?hl=en) for sending messages in those apps.

## Dismissal and action delivery

The injected dialog closes with Escape, a backdrop click, window focus loss, tab switching, or navigation. Closing it does not cancel an already-sent action. Returned errors appear while the UI is present; actions may return no result.

Missing execution replies are reported as unconfirmed handoffs rather than proof of completion. A refresh failure after successful delivery does not replace the delivery message with an action error.

The Manifest V3 service worker remains a small broker for toolbar clicks, browser APIs, and cross-extension messaging. It does not keep a live capability registry. The current launcher tab ID is stored in session storage only to dismiss the UI on tab switches.

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

GitHub tests intercept navigation with URL fixtures, so they do not interact with an account. The injected-UI suite triggers the actual toolbar action using Chromium’s extension debugging API and tests the dialog on the host page. It covers `activeTab` injection on GitHub, question input, clipboard handoffs, and dismissal. The earlier diagnostic-document suite still tests core routing and browser actions. ChatGPT and Gemini destination pages are also fixtures; no prompts are submitted. Screenshots are saved in `test-results/`.

## Development limits

The SDK packages are private workspace packages. Question actions support bounded text input; ordinary actions need no arguments. Injection is blocked on browser internal pages such as `chrome://` and other protected pages. The extension shows a badge if it cannot inject; try on an ordinary website. The bridge trusts only the demo origins and the known `demo-notes` provider. Generic provider registration, general input schemas, continuously pushed discovery, fuzzy search ranking, production permission onboarding, and workflow composition remain future work.

Read the [implemented contract](/design/protocol/) and [trust controls](/design/security/) before extending the integration.
