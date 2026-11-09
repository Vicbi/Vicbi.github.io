// ---------- Theme toggle ----------
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);
  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme")
        ? root.getAttribute("data-theme") === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }
})();

// ---------- Mobile menu ----------
(function () {
  const btn = document.getElementById("menu-toggle");
  const list = document.querySelector(".nav ul");
  if (!btn || !list) return;
  btn.addEventListener("click", () => list.classList.toggle("open"));
  list.addEventListener("click", (e) => { if (e.target.tagName === "A") list.classList.remove("open"); });
})();

// ---------- Active nav link on scroll ----------
(function () {
  const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => l.classList.remove("active"));
        map.get(en.target.id)?.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
})();

// ---------- Publications ----------
const ME = /Bikia/;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function pubCard(p) {
  const MAX = 10;
  let names = p.authors.filter((a) => a !== "et al.");
  const truncated = names.length > MAX || p.authors.includes("et al.");
  if (names.length > MAX) {
    const meIdx = names.findIndex((a) => ME.test(a));
    names = meIdx >= MAX ? [...names.slice(0, MAX - 1), names[meIdx]] : names.slice(0, MAX);
  }
  const authors = names.map((a) => (ME.test(a) ? `<b>${esc(a)}</b>` : esc(a))).join(", ") + (truncated ? ", et al." : "");
  const thumb = p.preview
    ? `<img class="thumb" src="assets/img/pubs/${esc(p.preview)}" alt="" loading="lazy">`
    : `<div class="thumb empty" aria-hidden="true">${p.year}</div>`;
  const links = [
    p.pdf && `<a href="assets/pdf/${esc(p.pdf)}" target="_blank" rel="noopener">PDF</a>`,
    p.url && `<a href="${esc(p.url)}" target="_blank" rel="noopener">${p.doi ? "DOI" : "Link"}</a>`,
    p.code && `<a href="${esc(p.code)}" target="_blank" rel="noopener">Code</a>`,
    p.bibtex && `<button type="button" data-bib>BibTeX</button>`,
  ].filter(Boolean).join("");
  const el = document.createElement("article");
  el.className = "pub";
  el.innerHTML = `${thumb}
    <div>
      <p class="title">${esc(p.title)}</p>
      <p class="authors">${authors}</p>
      <p class="venue">${esc(p.venue)}${p.venue ? ", " : ""}${p.year}</p>
      <div class="links">${links}</div>
    </div>`;
  const bibBtn = el.querySelector("[data-bib]");
  if (bibBtn) {
    bibBtn.addEventListener("click", () => {
      let pre = el.querySelector("pre");
      if (pre) { pre.remove(); return; }
      pre = document.createElement("pre");
      pre.textContent = p.bibtex;
      el.appendChild(pre);
      navigator.clipboard?.writeText(p.bibtex).then(() => {
        bibBtn.textContent = "Copied";
        setTimeout(() => (bibBtn.textContent = "BibTeX"), 1500);
      }).catch(() => {});
    });
  }
  return el;
}

async function loadPubs() {
  const res = await fetch("data/publications.json");
  return res.json();
}

// Home page: selected publications
(async function () {
  const box = document.getElementById("selected-pubs");
  if (!box) return;
  try {
    const pubs = (await loadPubs()).filter((p) => p.selected);
    const limit = Number(box.dataset.limit || 8);
    pubs.slice(0, limit).forEach((p) => box.appendChild(pubCard(p)));
  } catch (e) {
    box.innerHTML = '<p>Could not load publications. See <a href="publications.html">the full list</a>.</p>';
  }
})();

// Publications page: full list with search / year / selected filters
(async function () {
  const box = document.getElementById("all-pubs");
  if (!box) return;
  const pubs = await loadPubs();
  const search = document.getElementById("pub-search");
  const selBtn = document.getElementById("pub-selected");
  const yearBox = document.getElementById("pub-years");
  const count = document.getElementById("pub-count");
  let year = "all";

  const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a);
  ["all", ...years].forEach((y) => {
    const b = document.createElement("button");
    b.className = "chip"; b.type = "button"; b.textContent = y === "all" ? "All years" : y;
    b.setAttribute("aria-pressed", y === "all");
    b.addEventListener("click", () => {
      year = y;
      yearBox.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
      render();
    });
    yearBox.appendChild(b);
  });
  selBtn.addEventListener("click", () => {
    selBtn.setAttribute("aria-pressed", selBtn.getAttribute("aria-pressed") !== "true");
    render();
  });
  search.addEventListener("input", render);

  function render() {
    const q = search.value.trim().toLowerCase();
    const onlySel = selBtn.getAttribute("aria-pressed") === "true";
    const list = pubs.filter((p) =>
      (year === "all" || p.year === year) &&
      (!onlySel || p.selected) &&
      (!q || [p.title, p.venue, p.authors.join(" ")].join(" ").toLowerCase().includes(q)));
    box.innerHTML = "";
    let current = null;
    list.forEach((p) => {
      if (p.year !== current) {
        current = p.year;
        const h = document.createElement("h3");
        h.className = "year-head"; h.textContent = current;
        box.appendChild(h);
      }
      box.appendChild(pubCard(p));
    });
    count.textContent = `${list.length} of ${pubs.length} publications`;
  }
  render();
})();

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
