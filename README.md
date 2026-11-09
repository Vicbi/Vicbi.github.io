# vicbi-website

This is the personal website of Vasiliki (Vicky) Bikia. It's plain HTML, CSS and JS, with no build step and no dependencies, and GitHub Pages serves it as-is.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home page: About, Selected publications, Teaching |
| `publications.html` | Full publication list with search, year filter and a "selected only" toggle |
| `data/publications.json` | **All publications.** Both pages render from this file |
| `css/style.css` | Styling. Colors and fonts are set as variables at the top of the file |
| `js/main.js` | Dark-mode toggle, mobile menu and publication rendering |
| `assets/img/` | Profile photo (`profile.jpg`) and publication thumbnails (`pubs/`) |
| `assets/pdf/` | Paper PDFs |
| `.nojekyll` | Tells GitHub Pages to serve the files directly, without Jekyll |

## Common edits

**Add a publication:** add an object to `data/publications.json`:

```json
{
  "key": "bikia2026example",
  "title": "Paper title",
  "authors": ["Vasiliki Bikia", "Co Author"],
  "venue": "Journal or conference",
  "year": 2026,
  "doi": "10.xxxx/xxxxx",
  "url": "https://doi.org/10.xxxx/xxxxx",
  "pdf": "file-in-assets-pdf.pdf",
  "preview": "image-in-assets-img-pubs.png",
  "code": "https://github.com/...",
  "selected": true,
  "bibtex": "@article{...}"
}
```

Any field can be `null`. Entries marked `"selected": true` appear on the home page, which shows the first 8 in file order. To change that number, edit `data-limit` in `index.html`. Keep the list ordered newest first.

**Change bio or teaching text:** edit `index.html` directly.

**Change colors or fonts:** edit the variables under `:root` in `css/style.css`. The dark-mode values are in the two blocks below it.

## Preview locally

```bash
cd ~/Desktop/vicbi-website
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` by double-clicking won't load the publications, because browsers block `fetch` on `file://`. Use the local server instead.

## Deploy to https://vicbi.github.io

GitHub allows only one user site per account, so this repo takes over the existing `Vicbi/Vicbi.github.io` repo.

1. Archive the old al-folio site so nothing is lost:
   ```bash
   cd ~/Desktop/Vicbi.github.io
   git push origin master:al-folio-archive
   ```
2. Push this site to the same repo:
   ```bash
   cd ~/Desktop/vicbi-website
   git remote add origin git@github.com:Vicbi/Vicbi.github.io.git
   git push --force origin main:master
   ```
3. In GitHub, go to **Settings → Pages** and set **Source** to *Deploy from a branch*, with branch `master` and folder `/ (root)`. The old site was deployed by a GitHub Action to a `gh-pages` branch, so this setting is what switches it over.
4. Wait a minute, then visit https://vicbi.github.io.

To use a custom domain later, add a `CNAME` file containing the domain and configure DNS as described in GitHub's Pages docs.
