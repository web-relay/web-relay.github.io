# Web Relay documentation

The public idea and design documentation for **Web Relay**, a proposed local-first browser capability runtime. The original proposal calls the product “Browser Capability Launcher.” This repository contains the documentation site; the runtime and SDK are not released yet.

**Website:** https://web-relay.github.io

Built with Astro 7.3.5, Starlight 0.42.5, strict TypeScript, and pnpm 12.8.1. Versions were checked against the npm registry when this site was created.

## Local development

Use Node.js >=22.12 (CI uses Node.js 24) and pnpm 12.8.1.

```sh
pnpm install
pnpm dev
```

```sh
pnpm check
pnpm build
pnpm preview
```

## Editing

- `src/content/docs/`: Markdown and MDX documentation.
- `src/content/docs/index.mdx`: project homepage and illustrative launcher.
- `src/styles/custom.css`: colors and responsive homepage presentation.
- `astro.config.mjs`: navigation, metadata, and site URL.
- `src/content/docs/project/product-brief.md`: original source proposal.

Starlight provides navigation, full-text search, syntax highlighting, light/dark themes, and mobile documentation layouts. The homepage preview is an illustration, not an executable browser launcher.

## Deployment

GitHub Pages must use **GitHub Actions** as its source. `.github/workflows/deploy.yml` checks and builds pull requests, then publishes pushes to `main`. The special `web-relay.github.io` repository publishes at the organization’s root URL, so no Astro `base` prefix is needed. Commit the pnpm lockfile for reproducible builds.

## Contributing

Open an issue with a concrete browser workflow or propose changes in a pull request. See the website’s contributing page for design topics and check commands. Keep planned APIs clearly marked as proposals.

## License

MIT; see `LICENSE`.
