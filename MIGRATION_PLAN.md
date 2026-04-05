# Migration Plan: Lektor → 11ty + Netlify

## Overview

The site is a good candidate for 11ty — Jinja2 templates map almost directly to Nunjucks, and content converts cleanly from `.lr` to `.md` with YAML frontmatter. The main complexity points are the D3 visualization, image thumbnails, and the Disqus/Mailjet integrations.

---

## Phase 0 — Backup

Before making any changes, back up the existing Lektor site so the migration can proceed freely without risk of losing work.

- [ ] Copy the entire `zanderle/` directory to `zanderle-lektor-backup/` at the repo root
- [ ] Commit the backup to git with message `"Backup Lektor site before 11ty migration"`
- [ ] Optionally tag the commit: `git tag lektor-backup`

This preserves the full working Lektor site as a reference and safety net throughout the migration.

---

## Phase 1 — Project Setup

- [ ] Initialize a new 11ty project alongside the existing Lektor one (keep Lektor intact until migration is complete)
- [ ] Configure `.eleventy.js` with:
  - Input: `src/`, output: `_site/`
  - Nunjucks as the default template engine
  - Passthrough copy for static assets (`assets/`, `content/` images)
- [ ] Migrate webpack config to work with the 11ty build — update `package.json` to run both `webpack` and `eleventy` together (e.g., via `npm-run-all` or `concurrently`)
- [ ] Set up `netlify.toml` with the build command and publish directory

---

## Phase 2 — Content Migration

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

- [ ] **Blog posts** — Convert 8 posts, preserving date-based slugs (`/musings/YYYY/M/slug`) via `permalink` in frontmatter
- [ ] **Work/portfolio** — Convert ~16 client/project items. Images currently stored as attachments need to be moved to a predictable path (e.g., `assets/img/work/[slug]/`)
- [ ] **Special case: Intro page flow blocks** — Represent the tabbed panels as a YAML data file (`src/_data/intro.yaml`) and render via a Nunjucks loop

---

## Phase 3 — Templates

Convert Jinja2 → Nunjucks (syntax is ~95% compatible):

| Template                            | Notes                                              |
|-------------------------------------|----------------------------------------------------|
| `layout.html`                       | Base layout — straightforward port                 |
| `blog.html`                         | Add 11ty pagination (`pagination:` in frontmatter) |
| `blog-post.html`                    | Add Disqus embed, social meta tags                 |
| `work.html`                         | Use 11ty collections filtered by tag/content type  |
| `project.html` / `client.html`      | Minor differences between the two                  |
| `intro.html`                        | Nunjucks loop over `_data/intro.yaml` panels       |
| `macros/pagination.html` → Nunjucks | Direct port                                        |

Key 11ty concepts to use:
- **Collections** to replace Lektor's child model filtering (`collections.work`, `collections.musings`)
- **`pagination`** frontmatter for the blog listing page
- **`permalink`** for custom URL slugs on blog posts
- **Nunjucks macros** for the pagination component

- [ ] Port `layout.html`
- [ ] Port static pages (`page.html`, `contact`, `hire-me`)
- [ ] Port `blog.html` and `blog-post.html`
- [ ] Port `work.html`, `project.html`, `client.html`
- [ ] Port `intro.html` (tabbed layout + D3 wiring)
- [ ] Port pagination macro

---

## Phase 4 — Assets & Build Pipeline

- [ ] Keep the existing webpack setup, update output paths if needed
- [ ] Add `@11ty/eleventy-img` for image optimization/thumbnail generation (replaces Lektor's `.thumbnail(640)` filter — add a custom Nunjucks filter in `.eleventy.js`)
- [ ] Migrate from bower → npm for PureCSS, Font Awesome, normalize-css (bower is deprecated)
- [ ] Preserve the D3 visualization (`shiny.js` + `intro-graph.json`) — ensure the JSON is accessible via passthrough copy or `_data/`

---

## Phase 5 — Integrations

- [ ] **Syntax highlighting** — Replace `lektor-markdown-highlighter` (Pygments/tango) with `eleventy-plugin-syntaxhighlight` (Prism) or a custom markdown-it plugin
- [ ] **Disqus** — Embed the Disqus script directly in `blog-post.html` (no plugin needed, shortname: `zanderle`)
- [ ] **Mailjet** — Keep the iframe embed as-is
- [ ] **Plausible analytics** — Keep the script tag in `layout.html`

---

## Phase 6 — Netlify Deployment

- [ ] Create `netlify.toml`:
  ```toml
  [build]
    command = "npm run build"
    publish = "_site"

  [build.environment]
    NODE_VERSION = "20"
  ```

- [ ] Add build scripts to `package.json`:
  ```json
  "build": "webpack --mode production && eleventy",
  "start": "npm-run-all --parallel webpack:watch eleventy:serve"
  ```

- [ ] Connect the GitHub repo to Netlify — every push to `master` triggers a deploy automatically (replaces the current `rsync` deploy to `zanderle.com`)
- [ ] Configure the custom domain (`zanderle.com`) in Netlify

---

## Suggested Order

1. Phase 0 — backup
2. Phase 1 — get a blank 11ty site building and deploying to Netlify
3. Phase 3 — port layout and static pages, confirm styling works
4. Phase 2 — migrate content section by section, verify URLs
5. Phase 4 — wire up webpack and image handling
6. Phase 5 — add syntax highlighting, Disqus
7. Flip DNS to Netlify, decommission rsync deploy

---

## Key Risks

| Risk | Severity | Notes |
|---|---|---|
| Image thumbnails | Medium | `eleventy-img` works differently than Lektor's attachment system; needs a custom filter |
| Flow blocks → YAML data | Low | Intro page only; one use of this pattern |
| Date-based blog slugs | Low | Handled via `permalink` in frontmatter |
| D3 visualization | Low | JS is self-contained; just needs correct asset paths |
