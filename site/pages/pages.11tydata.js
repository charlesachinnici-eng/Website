// Every file in site/pages becomes a page at the top level of the site, e.g. News.md -> News.html
// (the file's own name is used, so index.md -> index.html)
import path from "node:path";
export default {
  layout: "page.njk",
  permalink: (data) => `${path.basename(data.page.inputPath, ".md")}.html`,
};
