import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://web-relay.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'Web Relay',
    description: 'A proposed local-first capability runtime for the browser. Define an action once and expose it across applications, extensions, and future interfaces.',
    favicon: '/favicon.svg',
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/web-relay' }],
    editLink: { baseUrl: 'https://github.com/web-relay/web-relay.github.io/edit/main/' },
    customCss: ['./src/styles/custom.css'],
    sidebar: [
      { label: 'Start here', items: [
        { label: 'Overview', slug: 'overview' },
        { label: 'Why Web Relay?', slug: 'concepts/vision' },
      ] },
      { label: 'System design', items: [
        { label: 'Architecture', slug: 'design/architecture' },
        { label: 'Capabilities & context', slug: 'design/capabilities' },
        { label: 'Integration paths', slug: 'design/integrations' },
        { label: 'Trust & permissions', slug: 'design/security' },
      ] },
      { label: 'Build with us', items: [
        { label: 'MVP & roadmap', slug: 'project/roadmap' },
        { label: 'Contributing', slug: 'project/contributing' },
        { label: 'Original product brief', slug: 'project/product-brief' },
      ] },
    ],
  })],
});
