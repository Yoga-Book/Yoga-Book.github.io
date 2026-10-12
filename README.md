# Yoga Book Linux site

This repository builds the official [Yoga Book Linux](https://github.com/Yoga-Book) website with [Antora](https://antora.org/).

## Local build

Use Node.js 24 (the active LTS release targeted by CI), then run:

```console
npm ci
task build
task check
task preview
```

The generated site is written to `build/site` and the preview is served at <http://localhost:8080>.
`task check` performs the strict Antora build and verifies generated internal links and anchors; the Pages workflow runs the same check before deployment.

Antora reads the active Git worktree, so local content edits are included in the next build without committing them first.

## Content structure

- `antora-playbook.yml` configures the site and its content sources.
- `antora.yml` defines the organization-level Antora component.
- `modules/ROOT/pages/` contains the site pages.
- `modules/ROOT/nav.adoc` defines navigation.
- `supplemental-ui/` contains Yoga Book styling layered over the upstream default UI.

This repository currently builds a self-contained, curated handbook without project documentation submodules. Project-specific implementation details remain authoritative in the repository that owns them; handbook pages summarize cross-project workflows, link their sources, and record when those sources were reviewed.

## Publishing

Pushes to `main` build and deploy through `.github/workflows/pages.yml`. In the repository settings, configure **Pages → Build and deployment → Source** to **GitHub Actions**.

