# Migration Plan: Lektor → 11ty + Netlify

## Overview

The site is a good candidate for 11ty — Jinja2 templates map almost directly to Nunjucks, and content converts cleanly from `.lr` to `.md` with YAML frontmatter. The main complexity points are the D3 visualization, image thumbnails, and the Disqus/Mailjet integrations.

---

## Phase 0 — Backup ✅

Before making any changes, back up the existing Lektor site so the migration can proceed freely without risk of losing work.

- [x] Copy the entire `zanderle/` directory to `zanderle-lektor-backup/` at the repo root
- [x] Commit the backup to git

This preserves the full working Lektor site as a reference and safety net throughout the migration.

---

## Phase 1 — Project Setup ✅

- [x] Initialize a new 11ty project alongside the existing Lektor one (keep Lektor intact until migration is complete)
- [x] Configure `.eleventy.js` with:
  - Input: `src/`, output: `_site/`
  - Nunjucks as the default template engine
  - Passthrough copy for static assets (`assets/`, `content/` images)
- [x] Migrate webpack config to work with the 11ty build — updated `package.json` with `npm-run-all`, webpack 5 replacing webpack 1
- [x] Set up `netlify.toml` with the build command and publish directory

---

## Phase 2 — Content Migration ✅

Convert `.lr` files → `.md` with YAML frontmatter.

Each content type maps cleanly:

| Lektor field       | 11ty frontmatter |
|--------------------|------------------|
| `title`            | `title:`         |
| `pub_date`         | `date:`          |
| `meta_description` | `description:`   |
| `excerpt`          | `excerpt:`       |
| `tags`             | `tags:`          |
| `website`          | `website:`       |
| `sort_key`         | `order:`         |
| `show_details`     | `showDetails:`   |

- [x] **Blog posts** — 6 posts converted with date-based permalink slugs (`/musings/YYYY/M/slug`)
- [x] **Work/portfolio** — 10 client/project items converted, images moved to `src/assets/work/[slug]/`
- [x] **Workshops** — 2 workshops converted
- [x] **Static pages** — contact, hire-me
- [x] **Intro page** — content embedded directly in `src/index.njk`

---

## Phase 3 — Templates ✅

Converted Jinja2 → Nunjucks:

| Template | Notes |
|---|---|
| `layout.html` | Full port: PureCSS/Font Awesome/Pace via CDN, social meta, Plausible |
| `blog-post.html` | Article layout, Disqus embed, Mailjet subscribe |
| `work-detail.html` | Two-column layout with image for `showDetails` items |
| `index.njk` | Full intro/homepage with services, testimonials, D3 wiring |
| `musings/index.njk` | Blog listing with 11ty pagination |
| `work/index.njk` | Portfolio listing using `collections.work` |
| `workshops/index.njk` | Workshop listing using `collections.workshops` |

- [x] Port `layout.html`
- [x] Port static pages (`contact`, `hire-me`)
- [x] Port `blog.html` and `blog-post.html`
- [x] Port `work.html`, `project.html`, `client.html` → unified `work-detail.html`
- [x] Port `intro.html` with D3 wiring

---

## Phase 4 — Assets & Build Pipeline ✅

- [x] Webpack 5 config replacing old webpack 1 config
- [x] `@11ty/eleventy-img` available as `{% image %}` shortcode
- [x] PureCSS, Font Awesome, Pace.js moved from bower → CDN links
- [x] D3 visualization preserved (`webpack/js/shiny.js` + `src/assets/data/intro-graph.json`)
- [x] `grey.png` background served at `/static/grey.png` via passthrough copy mapping

---

## Phase 5 — Integrations ✅

- [x] **Syntax highlighting** — `eleventy-plugin-syntaxhighlight` (Prism/tomorrow theme) replaces Pygments/tango
- [x] **Disqus** — embedded directly in `blog-post.html` (shortname: `zanderle`)
- [x] **Mailjet** — iframe embeds preserved in `blog-post.html` and `index.njk`
- [x] **Plausible analytics** — script in `layout.html`

---

## Phase 6 — Netlify Deployment

- [x] `netlify.toml` created with build command, publish dir, Node 20
- [x] `package.json` build scripts: `npm run build`, `npm start`
- [ ] **Connect the GitHub repo to Netlify** — go to app.netlify.com → "Add new site" → "Import an existing project" → select this repo, branch `eleventy-migration`
- [ ] **Merge `eleventy-migration` branch to `master`** once Netlify deploy is confirmed working
- [ ] **Configure the custom domain** (`zanderle.com`) in Netlify site settings → Domain management
- [ ] **Flip DNS** — update DNS records to point to Netlify's load balancer, decommission rsync deploy

---

## Key Notes

- All 25 pages build cleanly: `npm run build` passes (webpack 5 + eleventy)
- Blog post URLs exactly match the old Lektor format: `/musings/YYYY/M/slug/`
- Work item anchor IDs (`#client-pretix`, etc.) are preserved in `work/index.njk`
- The D3 force-directed graph data is at `src/assets/data/intro-graph.json` (passthrough copied to `_site/`)
- `src/static/gen/` is gitignored (webpack output); it's generated at build time
