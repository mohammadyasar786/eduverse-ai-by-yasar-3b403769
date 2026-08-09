// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://eduverse-ai-by-yasar.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/tutor", changefreq: "weekly", priority: "0.9" },
  { path: "/ar-learning", changefreq: "weekly", priority: "0.9" },
  { path: "/mindpulse", changefreq: "monthly", priority: "0.8" },
  { path: "/talk2code", changefreq: "weekly", priority: "0.9" },
  { path: "/learnflow", changefreq: "monthly", priority: "0.8" },
  { path: "/adaptive-learning", changefreq: "monthly", priority: "0.8" },
  { path: "/select-role", changefreq: "yearly", priority: "0.4" },
  { path: "/auth", changefreq: "yearly", priority: "0.3" },
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
