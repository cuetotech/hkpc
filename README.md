# HKPC website preservation and preview

Source website: https://vahope.net/

Intended preview domain: `vahopechurch.org` (purchase reported by Jeffrey on October 7, 2026).

## Immediate objective

Produce a faithful, independently hosted copy of the existing public website for pastor review before redesigning it. Preserve the existing Korean content, layout, navigation, imagery, downloadable documents, and public archives. Do not confuse creating a capture workflow with completing the website migration.

This repository owns the website work. The separate `cuetotech/cts` repository remains the translation-service/project-status location.

## Capture workflow

`.github/workflows/capture-vahope.yml` runs a bounded, unauthenticated capture on a GitHub-hosted runner. It can be invoked through **Actions -> Capture legacy vahope website -> Run workflow**. Changes to that workflow also trigger a capture.

The job probes HTTPS and HTTP, then uses GNU Wget to collect linked public pages and same-site resources. It saves connectivity evidence, the crawl log, a file/hash manifest, and an external-reference inventory in a `vahope-public-capture-<run-id>` Actions artifact. Artifacts are retained for 14 days; a reviewed archive must be preserved separately before expiry.

The first run was triggered by commit `27c697f8440bbc48047d1b4051c1596475da45c2`:
https://github.com/cuetotech/hkpc/actions/runs/37713473407

### Capture is not completeness

- The first pass follows only `vahope.net` and `www.vahope.net`; externally hosted assets are inventoried for a separate pass.
- Wget does not execute browser JavaScript. Script-generated navigation, lazy loading, and API-driven content require additional inspection.
- Crawl depth, duration, robots rules, and size limits can leave omissions.
- Public HTML cannot supply private pages, administrative functionality, unpublished uploads, or a hosting database backup.
- Existing video/map embeds should retain their external service links unless an authorized media export is separately supplied.
- A successful Actions job is not proof that all pages were captured or that the preview works.

## Acceptance gates before showing the pastor

1. Inventory every public navigation target, archive/pagination route, attachment, and referenced asset; record unresolved items explicitly.
2. Normalize query-string page variants to collision-free static paths and rewrite internal links.
3. Preserve original text and visual assets. Verify Korean encoding, desktop layout, mobile layout, menus, galleries, and downloads against the original.
4. Test the copy with the old website and vendor asset hosts blocked. Ordinary site content must not depend on them; explicitly retained third-party embeds are documented exceptions.
5. Disable or replace live form submissions, vendor administration links, and tracking that should not run in the preview.
6. Deploy a separate preview with search indexing discouraged. Keep the existing website, domain, and email unchanged. Password protection is separate from `noindex` when access restriction is required.
7. Connect `vahopechurch.org` only after the preview is ready and the deployment/DNS configuration is confirmed.

## Fallback input when remote capture is insufficient

Provide one ZIP containing the public-site mirror, original HTML, referenced images/CSS/JavaScript/fonts/documents, a URL inventory, and the crawl log. Full-page desktop/mobile screenshots are useful visual references. A Church-Love export is preferable for unlinked archives or content a public crawler cannot discover.

Do not place passwords, tokens, browser cookies, authenticated HAR files, membership records, or private church data in this repository. The repository is public. Review any vendor export before committing it.

## Deployment status

Cloudflare Workers is the canonical deployment target.

- **Production domain:** `https://vahopechurch.org/`
- **Worker:** `hkpc`
- **Source branch:** `main`
- **Static assets:** `public/`
- **Configuration:** `wrangler.jsonc`
- **Deployment:** Cloudflare Workers Builds via the connected GitHub integration.
- **Verification:** GitHub independently verified that `https://vahopechurch.org/` returns HTML with HTTP 200 after the Cloudflare deployment.
- **Legacy production:** `vahope.net`, its email/DNS, and Church-Love hosting remain unchanged.
- **GitHub Pages:** deprecated for this project; the old `cueto.tech/hkpc/` preview is no longer the deployment authority.
- **Visual status:** the current preservation snapshot is technically deployed but has been rejected for visual fidelity. It must not be treated as pastor-ready until the presentation layer is rebuilt and validated against the legacy site on desktop and mobile.

The repository retains the recovered public corpus as the source material for the visual remediation pass. The Cloudflare deployment path is now working; the remaining website work is presentation quality and content validation, not hosting plumbing.
