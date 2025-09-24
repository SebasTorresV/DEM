import type { MetadataRoute } from "next";

export function GET(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
      },
    ],
    sitemap: "http://localhost:3000/sitemap.xml",
  };
}
