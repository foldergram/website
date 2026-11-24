# Foldergram Website

The official website for [Foldergram](https://github.com/foldergram/foldergram), a self-hosted photo and video gallery.

**[foldergram.app](https://foldergram.app/)** · [Documentation](https://docs.foldergram.app/) · [Live demo](https://demo.foldergram.app/)

## Development

Built with [Astro](https://astro.build/). Requires Node.js 22.23.4 or later and pnpm 10.33.2.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

The production website is generated in `dist/` and can be served by any static web host.

## Deployment

Pushes to `main` build and deploy the website automatically through GitHub Actions.
