---
title: Help shape Web Relay
description: Contribute use cases, protocol feedback, documentation, and early implementation ideas.
---

Web Relay begins with a proposal. The most useful early contributions are concrete workflows, careful protocol design, and a small implementation that tests the MVP assumptions.

## Bring a real workflow

[Open an issue](https://github.com/web-relay/web-relay.github.io/issues/new) with:

- The application or extension you use or own.
- The action you want to expose.
- The context the application already has.
- How you perform that action today.
- The permissions or trust boundaries involved.

Good examples include saving a podcast timestamp, opening the current customer in a support portal, and restoring a development workspace.

## Review the design

Feedback is especially useful on the capability schema, provider identity, bridge lifecycle, context updates, availability rules, and local palette fallback. Start with the [architecture](/design/architecture/) and [security requirements](/design/security/).

## Develop the local workspace

The [runtime monorepo](https://github.com/web-relay/web-relay) uses pnpm and TypeScript, with a demo PWA, launcher extension, and an independent web-app provider extension. Its README explains building and loading the development starters.

The initial development target is Chromium. Headless Chromium is available on the development machine for UI checks; extension integration tests must also exercise full Chromium with both extensions loaded.

## Keep decisions current

Record accepted changes in the [decision log](/project/decisions/) as implementation discovers constraints. Include the reason, status, and what remains open. Update affected architecture, capability, security, or roadmap pages alongside the decision.

## Improve these docs

The documentation lives in [web-relay/web-relay.github.io](https://github.com/web-relay/web-relay.github.io). Markdown and MDX pages are in `src/content/docs/`. Use the edit link on a page or submit a pull request.

```sh
git clone https://github.com/web-relay/web-relay.github.io.git
cd web-relay.github.io
pnpm install
pnpm dev
```

Use Node.js 22.12 or newer; CI uses Node.js 24. The repository pins pnpm in `package.json`. If your pnpm installation does not select that version automatically, install the pinned pnpm release before running the commands.

Before submitting:

```sh
pnpm check
pnpm build
```

## Keep the distinction clear

Describe proposed behavior as proposed until implementation exists. Avoid publishing install instructions for placeholder SDK packages. Link decisions to the MVP acceptance criteria and keep the first useful workflow small.
