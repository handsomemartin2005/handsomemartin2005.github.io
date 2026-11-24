# Zidu Zhang · Academic homepage

The site uses the [PRISM](https://github.com/xyjoey/PRISM) template and is published at [handsomemartin2005.github.io](https://handsomemartin2005.github.io/).

## Edit the site

- `content/` contains the English site settings, Markdown and BibTeX records.
- `content_zh/` contains the corresponding Chinese content. Keep record keys, titles and author names aligned in the two BibTeX files. Use `status` for publication status and `targetvenue` for submitted or planned venues.
- Replace `public/assets/zidu_zhang_phd_cv.pdf` to update the downloadable CV while preserving its URL.

## Preview and deploy

```sh
npm ci
npm run dev
npm run lint
npm run build
```

Use Node.js 22 or newer. The production build exports static files to `out/`. Pushes to `main` trigger GitHub Actions to rebuild and deploy the site to GitHub Pages.
