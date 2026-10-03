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
