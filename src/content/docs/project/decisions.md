---
title: Decisions and discoveries
description: Accepted project decisions, their consequences, and unresolved implementation details.
---

This log tracks what we have decided as the project moves from the PRD to running software. Accepted architecture decisions are distinct from implemented functionality.

## 001 — Local development in a pnpm monorepo

**Status:** Accepted · **Date:** 3 October 2026

Start with PWAs and extensions we own and run locally. Keep the demo PWA, global launcher extension, independent web-app provider extension, and shared TypeScript packages in [one pnpm monorepo](https://github.com/web-relay/web-relay).

This makes contracts, coordinated changes, and local testing easier. The browser still treats apps and extensions as separate origins and identities. Local ownership does not replace approval, permissions, validation, or lifecycle handling.

**Implementation:** The scaffold has progressed into the working notes PWA and GitHub-provider showcase described in decisions 004 and 005 below.

**Resolved:** Use a notes PWA and GitHub.com navigation provider first. Exact local origins and fixed development extension IDs make discovery explicit. Broader provider enrollment remains open.

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


## 004 — Notes PWA and GitHub.com provider first

**Status:** Implemented development showcase · **Date:** 3 October 2026

Use a simple notes PWA to show the same SDK registrations in local and browser palettes. Start with “Create note” and “Pin selected note”; pinning is context-sensitive and disappears after execution.

Use an independent GitHub.com extension to prove provider discovery and cross-extension invocation. It offers project navigation globally and repository, issues, and pull-request navigation for the active repository. Derive context from URLs and keep actions read-only.

Include browser URL copy, downloads, new tab, and duplication in the same launcher. This gives the first demonstration all three source kinds while keeping application behavior small.

## 005 — Version 1 pull discovery and explicit development pairing

**Status:** Implemented development contract · **Date:** 3 October 2026

Use JSON-only, versioned `discover` and `execute` requests with correlated result envelopes. Providers own functions and live context. Discover on launcher open, refresh, and after execution; check active-tab context and provider availability again before invoking.

PWA requests cross a top-frame content script and same-origin page bridge at exactly `http://localhost:4173` or `http://127.0.0.1:4173`. Fixed manifest public keys stabilize development extension IDs. The launcher targets the known GitHub provider; the provider accepts only the paired launcher.

This reduces enrollment complexity in the owned local environment while preserving browser identities and validation. Development keys do not defend against someone modifying the unpacked source. Production onboarding and arbitrary provider registration remain open.

Timeouts produce errors without automatic retries or cancellation. Search uses substrings, and commands take no input arguments in this first contract. Read the [protocol](/design/protocol/) for exact behavior.

**Validation:** Registry and protocol unit tests plus full Chromium integration checks with both real extensions. GitHub navigation uses intercepted URL fixtures. Headless tests open the real popup document as a tab, so toolbar-popup presentation still needs a manual smoke check. The original proposed `Alt + Space` shortcut becomes `Alt + Shift + Space` in the development manifest.


## 006 — Injected launcher and optional-result delivery

**Status:** Implemented local prototype · **Date:** 3 October 2026

For local unpacked extensions, deliver actions from a dialog injected into the active page. Use a toolbar click or shortcut with `activeTab` and `scripting`; do not request automatic access to every site. Dismiss on Escape, backdrop click, focus loss, tab switching, or navigation.

The worker remains a small event-driven broker for browser APIs and cross-extension messages. It holds no live capability registry. Closing the UI does not cancel an invocation. Results are optional, returned errors are shown while the UI is present, and post-action refresh failures must not be described as execution failures.

The core registry normalizes void results to null. Missing execution replies are unconfirmed handoffs, not proof of success. Generalized production enrollment and store distribution are deferred for this local slice.

**Validation:** Actual toolbar-triggered injection in Chromium, including GitHub through `activeTab`; SDK actions, contextual availability, synthetic-click rejection, Escape, backdrop dismissal, and tab-focus dismissal.

## 007 — AI web-app handoffs without automatic submission

**Status:** Implemented first handoff · **Date:** 3 October 2026

Add bounded text input for “Prepare question for a new ChatGPT chat.” Copy the question, open ChatGPT, and let the user paste and send it. “Share current link with Gemini” copies the source URL and opens Gemini for pasting.

This first version does not depend on an undocumented web prompt-submission URL, request AI-app host permissions, or automate account UI. Automatic submission remains a possible app-specific integration rather than claimed current behavior.

**Validation:** Real clipboard and tab navigation against ChatGPT/Gemini destination fixtures. No prompts are submitted to an account.

## 008 — Reference workspace and independent real integrations

**Status:** Accepted direction · **Date:** 3 October 2026

Use the main monorepo for the reference implementation, small examples, and integration tests. Keep real provider extensions and PWAs in separate folders or repositories. Their integration boundary is the versioned protocol and SDK, rather than a shared filesystem location. The launcher is an independently installable extension even while its source is maintained in the reference workspace.

The notes PWA and GitHub navigation provider remain fixtures for validating discovery, invocation, and browser behavior. This refines decision 001 without moving the existing examples.

**Remaining work:** Make SDK packages usable outside the pnpm workspace and provide explicit configuration for additional PWA origins and extension provider IDs. The current development pairing is still fixed; arbitrary external providers are not automatically discovered.

## 009 — Independent LLM provider using the extension SDK

**Status:** Implemented local integration · **Date:** 3 October 2026

Build the LLM provider in a separate `llm-provider-extension` folder beside the reference workspace. Add `createExtensionProvider` at `@web-relay/sdk/extension` to handle provider registration, launcher identity validation, fresh active-tab context, and versioned responses. The provider bundles this SDK from the sibling checkout while packages remain unpublished.

Offer “New ChatGPT chat with current page” and “New Gemini chat with current page.” Each action opens a separate tab and submits one first message containing the source URL. Gemini explicitly selects New chat before filling the composer. Share the URL only; do not extract page contents or claim the model can access private or local links.

The destination content script consumes a tab-bound, expiring session handoff. Ordinary chats are untouched, and reloads do not replay submissions. If login or changed controls prevent submission, show the prompt and a copy button on the destination page. A send-button click is delivery to the web interface, not confirmation that a response was generated. Never retry a potentially submitted message automatically.

The launcher explicitly pairs this additional development provider ID. The provider requests access only to ChatGPT and Gemini, and accepts cross-extension requests only from the launcher. General provider enrollment remains deferred. This adds an app-specific integration alongside decision 007's existing clipboard handoffs.

**Validation:** Full Chromium with both independently installed extensions and controlled destination fixtures; discovery, routing, fresh chat, URL preservation, one submission, reload replay prevention, ordinary-chat isolation, and login fallback. Live logged-in account behavior still needs manual verification because selectors can change.

## 010 — Provider-owned AI actions, system theme, and current-window tabs

**Status:** Implemented local integration · **Date:** 3 October 2026

Remove the launcher's built-in ChatGPT and Gemini handoffs. AI actions belong to the separate LLM provider. Its ChatGPT action now copies the page-context prompt and opens ChatGPT for user paste/send because automatic filling was unreliable and a supported prompt deep link has not been verified. Remove ChatGPT content-script matches and host permission. Retain Gemini's working fresh-chat and single-submission behavior. This supersedes the current behavior described in decisions 007 and 009.

Follow the system light/dark theme in both the injected dialog and diagnostic document. Discover tabs in the source tab's window; present them as searchable local capabilities and support keyboard switching. Exclude other windows, re-discover before execution, and reject vanished or moved targets. No extra permissions are required.

Search matches every word across title, description, and provider ID, allowing `tabs github` and `llm gemini`. A Raycast-style provider scope entered by typing `llm` and pressing Tab remains a proposal. The proposed scope would preserve the original page context, show only that provider's commands, and return to global search with Escape or Backspace. It needs a separate UX decision before implementation.

**Validation:** Registry/protocol checks and full Chromium tests for actual toolbar injection, dark/light styles, AI command removal, exclusion of other-window tabs, keyboard switching, ChatGPT clipboard handoff without submission, and retained Gemini delivery/fallback. Destination sites remain fixtures, not real-account automation tests.

## 011 — Standalone SDK distribution and explicit integration guides

**Status:** Implemented development package · **Date:** 3 October 2026

Build `@web-relay/sdk` 0.1.0 as bundled ESM JavaScript and TypeScript declarations for PWA and extension entry points. Share runtime classes between entry points so typed errors retain their identity. Pack a tarball with no runtime npm dependencies, MIT license, API README, and portable coding-agent skill. Verify it in an isolated consumer rather than relying only on workspace compilation. npm publication has not occurred and remains a separate release step.

Move local extension IDs, provider IDs, optional context-origin filters, and PWA exact origins into `apps/launcher-extension/src/providers.ts`. Discovery and routing use those entries; the existing trusted sources stay unchanged. New PWA hosts also require explicit manifest host permissions/content-script matches. SDK installation does not automatically enroll a provider. This replaces the fixed per-provider routing implementation while preserving explicit local trust.

Provide current extension/PWA integration guides and a reusable `web-relay-integration` coding-agent skill. Real integrations retain their own app state, functions, folders, permissions, and builds. Use the LLM provider as a packed-SDK consumer. This supersedes the earlier source-alias requirement in decision 009 and the separately consumable package gap in decision 008.

**Validation:** Standalone declaration build, isolated tarball install/typecheck, both SDK transport APIs and sender rejection, cross-entry error identity, registry/protocol tests, and full Chromium PWA/extension showcase and LLM provider checks. CI distributes package artifacts; it does not publish to npm.

## 012 — Async registration with provider-owned saved configuration

**Status:** Implemented SDK 0.1.2 · **Date:** 3 October 2026

Keep `createExtensionProvider` synchronous at service-worker startup so Chromium can deliver external messages immediately. Allow its `register` callback to return `void` or `Promise<void>` and await it for discovery and execution. Each request creates a fresh registry so an extension can load saved configuration, describe enabled workspaces, and reject commands removed since discovery. Registration errors retain the existing response/error contract.

Check supplied active-tab context before and after registration, since asynchronous loading can outlive that snapshot. Providers still own state validation and action side effects. Registration only loads/describes capabilities; it does not execute them. Keep it within the existing three-second response budget. The 50-command descriptor limit and explicit pairing remain in effect.

**Implementation:** [SDK extension transport](https://github.com/web-relay/web-relay/blob/main/packages/sdk/src/extension.ts), [isolated package verification](https://github.com/web-relay/web-relay/blob/main/tests/sdk-package.mjs), and [Chromium async registration test](https://github.com/web-relay/web-relay/blob/main/tests/sdk-extension.mjs). See the [integration guide](/guides/extensions/#commands-from-saved-configuration). SDK 0.1.2 introduces async registration; synchronous registrations remain supported.

**Remaining work:** Pairing diagnostics, searchable structured choices, and durable invocation/status contracts are separate improvements. The launcher does not continuously receive configuration changes.

## 013 — User-approved extension pairing in launcher settings

**Status:** Implemented launcher 0.0.2 and SDK 0.1.3 · **Date:** 3 October 2026

Allow additional installed extensions to be paired without editing/rebuilding the launcher. A privileged extension Options page checks an entered extension ID, displays the reported identity, and asks for explicit approval. A short-lived, settings-document-bound proposal is rechecked at approval. Persist approved pairings locally, serialize changes, reserve built-in IDs, and support disable/removal. URL-context sharing is off by default and explicitly selectable at approval. No new launcher permissions are required. Existing bundled defaults remain available.

Add an optional `name` and context-free `describe` request to the extension SDK's version 1 protocol. Validate the paired sender, then return identity without registration or action execution, allowing empty providers to pair. Older providers can use validated nonempty discovery. The provider must still allow the actual launcher ID. PWA enrollment and new-origin manifest handling remain separate.

**Implementation:** [Pairing manager](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/pairing.ts), [settings UI](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/options.ts), and [Chromium pairing checks](https://github.com/web-relay/web-relay/blob/main/tests/pairing.mjs). See [pairing instructions](/guides/extensions/#pair-it-with-the-launcher).

**Validation:** Real Chromium discovery/invocation after user approval, empty-provider identity, older discovery fallback, disabled/removed stale commands, default context privacy and approved sharing, duplicate/reserved/changed identities, settings-only management, synthetic-click rejection, and persistence across browser/worker restart. Isolated package tests verify the new SDK response and declarations.


## 014 — Explicit PWA settings pairing and shared-origin routing

**Status:** Implemented launcher 0.0.3 and SDK 0.1.4 · **Date:** 4 October 2026

Extend settings enrollment to web apps. Ask for optional HTTP(S) host access only on a trusted user settings action, probe one matching open app tab, review its reported identity and origin/path, then revalidate a short-lived document-bound proposal on explicit approval. Save pairings locally and support disable/removal. Host permission remains independently revocable in browser settings; permission alone never enrolls an app. Keep bundled defaults, exact-origin checks, top-frame messaging and stale-context rejection.

Root scopes match only the home page; other path scopes include subpages at segment boundaries. This lets the Personal Hub and independent child apps share a GitHub Pages origin. Address bridge requests by providerId; SDK 0.1.4 registries ignore other identities. Published SDK 0.1.3 supports nonempty discovery pairing for apps on separate paths. Same-origin paths are routing scopes, not security isolation.

Validate provider/capability metadata and the 50-command/300-character description limits during registration. Browser-owned tab actions retain their larger local registry. Document that disposal does not cancel pending work, request IDs are not deduplicated, and navigation timers do not acknowledge result delivery. SDK 0.1.4 contains these API and validation changes; its [release notes](https://github.com/web-relay/web-relay/blob/main/packages/sdk/CHANGELOG.md) describe compatibility and limits.

**Implementation:** [PWA pairing and transport](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/pwa-pairing.ts), [PWA SDK](https://github.com/web-relay/web-relay/blob/main/packages/sdk/src/index.ts), and [committed Chromium pairing/hub test](https://github.com/web-relay/web-relay/blob/main/tests/pwa-pairing.mjs). See the [PWA setup guide](/guides/pwa/). Headless tests pregrant only the fixture host in a disposable launcher copy; Chromium's native interactive permission prompt requires manual verification.


## WebMCP preview adapter

Native WebMCP tools are a launcher-local source, independent of the SDK protocol. The user enables preview discovery and explicitly reviews JSON arguments before each invocation. Use existing activeTab access, discover only top-page tools, bind selections to document identity, and recheck name/schema before execution. Page output is bounded plain text and cannot become launcher clipboard/navigation directives. Feature-detect current document.modelContext and the earlier modelContextTesting surface; choose the documented execution signature by Chrome version without retrying writes. See the [guide](/guides/webmcp/) and [implementation](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/webmcp.ts).


## Saved WebMCP sites

User-approved exact page URLs and tool catalogs persist independently of page lifetimes. List catalogs globally without opening pages; resolve the owning tab only when checking, refreshing, approving, or invoking. Reuse exactly one matching tab or open a background tab, reject duplicate tabs and redirects, and revalidate live metadata/schema before executing once. Cached descriptors never authorize execution after disabling/removing a site or losing browser access. A changed tool refreshes metadata and requires the user to review a fresh selection. Keep the source tab active and do not share its URL with the provider page. See [saved-site routing](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/webmcp-sites.ts) and the [guide](/guides/webmcp/).
