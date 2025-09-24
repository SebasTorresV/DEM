import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await prisma.event.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });

  const baseUrl = "http://localhost:3000";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    { url: `${baseUrl}/perfil`, lastModified: new Date() },
    ...events.map((event) => ({
      url: `${baseUrl}/evento/${event.slug}`,
      lastModified: event.updatedAt,
    })),
  ];
}
