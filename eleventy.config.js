// Eleventy build configuration for the Reno Chess Club site.
//
// Editors change the files in site/ through Pages CMS (see .pages.yml).
// This build turns them into plain HTML pages in _site/, which is what gets published.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Chess } = require("chess.js");
const yaml = require("js-yaml");

// ------------------------------------------------------------
// Load the same PGN parser the Game Viewer uses, so a game that
// passes this check is guaranteed to load in the viewer.
// ------------------------------------------------------------
const parserContext = vm.createContext({ Chess, console });
vm.runInContext(fs.readFileSync("site/assets/js/pgn-parser.js", "utf8"), parserContext);

function checkGame(pgn) {
  const root = vm.runInContext("parsePGNMoves", parserContext)(pgn || "");
  let plies = 0;
  for (let n = root; n.children.length; n = n.children[0]) plies++;
  return { plies, errors: root.errors.map((e) => ({ label: e.label, inVariation: e.inVariation })) };
}

// ------------------------------------------------------------
// Colour helpers: pick whichever text colour is more readable
// on a given background (WCAG contrast ratio).
// ------------------------------------------------------------
function luminance(hex) {
  const v = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(v.substr(i, 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const LIGHT_TEXT = "#F7F3EE";
const DARK_TEXT = "#1E1410";
function readableOn(bg) {
  return contrast(bg, LIGHT_TEXT) >= contrast(bg, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT;
}

// Page file name (or a path to it) -> "Name.html"
function pageHref(ref) {
  if (!ref) return "";
  const base = path.basename(String(ref)).replace(/\.md$/i, "").replace(/\.html$/i, "");
  return base + ".html";
}

// Dates are written as yyyy-mm-dd; read them as calendar dates (no time-zone shifts)
function ymd(d) {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d || "").slice(0, 10);
}

export default function (eleventyConfig) {
  // Games (site/_data/games/*.yml) are YAML files
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // --- Files copied as-is -------------------------------------------------
  eleventyConfig.addPassthroughCopy("site/assets");
  eleventyConfig.addPassthroughCopy("site/images");
  eleventyConfig.addWatchTarget("site/assets/");

  // Editors' text must never be treated as template code.
  eleventyConfig.setFrontMatterParsingOptions({ excerpt: false });

  // --- Collections ---------------------------------------------------------
  eleventyConfig.addCollection("newsPosts", (api) =>
    api.getFilteredByGlob("site/news/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("clubEvents", (api) =>
    api
      .getFilteredByGlob("site/events/*.md")
      .sort((a, b) => ymd(a.data.start).localeCompare(ymd(b.data.start)))
  );

  // --- Filters --------------------------------------------------------------
  eleventyConfig.addFilter("pageHref", pageHref);
  // A page's own file name without ".md" (e.g. "index", "News")
  eleventyConfig.addFilter("pageSlug", (p) => path.basename(String((p && p.inputPath) || p), ".md"));

  // Where a button goes: another page on this site, or an outside web address
  eleventyConfig.addFilter("buttonHref", (b) => (b && b.page ? pageHref(b.page) : (b && b.url) || "#"));

  // "/images/x.jpg" -> "images/x.jpg" so the site works at any web address or sub-folder
  eleventyConfig.addFilter("rel", (p) => String(p || "").replace(/^\/+/, ""));

  eleventyConfig.addFilter("readableOn", readableOn);
  eleventyConfig.addFilter("contrast", contrast);

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  eleventyConfig.addFilter("ymd", ymd);
  eleventyConfig.addFilter("niceDate", (d) => {
    const [y, m, day] = ymd(d).split("-").map(Number);
    if (!y || !m || !day) return "";
    return `${MONTHS[m - 1]} ${day}, ${y}`;
  });

  eleventyConfig.addFilter("checkGame", checkGame);
  eleventyConfig.addFilter("values", (o) => Object.values(o || {}));

  // Games list for the viewer: sorted, and only games that read without problems
  eleventyConfig.addFilter("viewerGames", (games) =>
    Object.values(games || {})
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.name).localeCompare(String(b.name)))
      .filter((g) => g.pgn && checkGame(g.pgn).errors.length === 0 && checkGame(g.pgn).plies > 0)
      .map((g) => ({ name: g.name, pgn: String(g.pgn).trim() }))
  );

  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));

  // All pages live at the top level, so make root-relative links ("/images/...") relative.
  // This keeps the site movable to any host or sub-folder (e.g. github.io/Website/).
  eleventyConfig.addTransform("relative-links", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/(\s(?:src|href)=["'])\/(?!\/)/g, "$1");
  });

  return {
    dir: { input: "site", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false, // editors' text is never run as template code
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
