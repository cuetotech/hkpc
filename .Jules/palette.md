## 2023-10-24 - Legacy Site Crawler Accessibility Patching
**Learning:** When preserving old websites that lack basic accessibility standards (like missing `alt` attributes on images or `lang` attributes on the HTML document), the preservation crawler is the perfect place to automatically patch these issues. This ensures the archived version is actually more accessible to screen readers than the original legacy site.
**Action:** Implemented automatic injection of `lang="ko"` on HTML tags and `alt=""` on decorative/unlabeled images during the static generation phase.
