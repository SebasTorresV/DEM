import { PrismaClient, EventStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.eventMetric.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.venue.deleteMany();

  const categories = await prisma.$transaction(
    [
      { slug: "musica", name: "Música" },
      { slug: "teatro", name: "Teatro" },
      { slug: "ferias", name: "Ferias" },
      { slug: "deportes", name: "Deportes" },
      { slug: "conferencias", name: "Conferencias" },
      { slug: "familia", name: "Familia" },
    ].map((category) => prisma.category.create({ data: category }))
  );

  const venues = await prisma.$transaction(
    [
      {
        name: "Teatro Nacional de San Salvador",
        municipality: "San Salvador",
        latitude: 13.6989,
        longitude: -89.1914,
        address: "6a Avenida Sur",
      },
      {
        name: "Parque Cuscatlán",
        municipality: "San Salvador",
        latitude: 13.6923,
        longitude: -89.2079,
        address: "Av. Roosevelt",
      },
      {
        name: "Plaza Futura",
        municipality: "Antiguo Cuscatlán",
        latitude: 13.6769,
        longitude: -89.2797,
        address: "Calle El Mirador",
      },
      {
        name: "Estadio Las Delicias",
        municipality: "Santa Tecla",
        latitude: 13.6762,
        longitude: -89.279,
        address: "Calle Chiltiupán",
      },
      {
        name: "Centro Comercial Metrocentro",
        municipality: "San Miguel",
        latitude: 13.4792,
        longitude: -88.1757,
        address: "Carretera Panamericana",
      },
      {
        name: "Parque Central de Santa Ana",
        municipality: "Santa Ana",
        latitude: 13.9937,
        longitude: -89.5581,
        address: "1a Avenida Sur",
      },
      {
        name: "Multiplaza",
        municipality: "Antiguo Cuscatlán",
        latitude: 13.6753,
        longitude: -89.2541,
        address: "Calle Chiltiupán",
      },
      {
        name: "Estadio Cuscatlán",
        municipality: "San Salvador",
        latitude: 13.6769,
        longitude: -89.2563,
        address: "Boulevard Los Próceres",
      },
    ].map((venue) => prisma.venue.create({ data: venue }))
  );

  const [adminUser, organizerUser] = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Admin Demo",
        email: "admin@demo.local",
        password: await hash("Passw0rd!", 10),
        role: "admin",
      },
    }),
    prisma.user.create({
      data: {
        name: "Organizador Demo",
        email: "org@demo.local",
        password: await hash("Passw0rd!", 10),
        role: "organizer",
      },
    }),
  ]);

  const organizer = await prisma.organizer.create({
    data: {
      userId: organizerUser.id,
      displayName: "Eventos Cuscatlecos",
      website: "https://ejemplo.local",
      verified: true,
    },
  });

  const now = new Date();

  const eventsData = [
    {
      slug: "festival-de-cafe",
      title: "Festival del Café Artesanal",
      summary: "Degusta cafés de altura con productores locales y talleres de barismo.",
      description: "<p>Un encuentro para amantes del café con degustaciones, música y charlas de productores.</p>",
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0),
      priceMin: 5,
      priceMax: 10,
      venue: venues[1],
      categories: ["ferias", "familia"],
      status: EventStatus.published,
    },
    {
      slug: "noche-jazz",
      title: "Noche de Jazz en Plaza Futura",
      summary: "Bandas salvadoreñas interpretan clásicos y composiciones originales.",
      description: "<p>Concierto gratuito con zona gastronómica y bebidas artesanales.</p>",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 30),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0),
      priceMin: 0,
      priceMax: 0,
      venue: venues[2],
      categories: ["musica"],
      status: EventStatus.published,
    },
    {
      slug: "teatro-luna",
      title: "Obra \"La Luna Roja\"",
      summary: "Drama contemporáneo sobre la memoria histórica.",
      description: "<p>Dirección de Carla López con elenco nacional. Apto para mayores de 15 años.</p>",
      imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 30),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 20, 30),
      priceMin: 12,
      priceMax: 18,
      venue: venues[0],
      categories: ["teatro"],
      status: EventStatus.published,
    },
    {
      slug: "carrera-nocturna",
      title: "Carrera Nocturna Santa Tecla",
      summary: "Recorrido de 5K con luces y música en vivo.",
      description: "<p>Incluye kit del corredor, hidratación y medalla de participación.</p>",
      imageUrl: "https://images.unsplash.com/photo-1546484959-fcc74afcc064",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 20, 0),
      priceMin: 15,
      priceMax: 20,
      venue: venues[3],
      categories: ["deportes"],
      status: EventStatus.published,
    },
    {
      slug: "feria-innovacion",
      title: "Feria de Innovación y Tecnología",
      summary: "Startups salvadoreñas presentan soluciones tecnológicas.",
      description: "<p>Charlas, networking y zona de demostraciones para estudiantes y profesionales.</p>",
      imageUrl: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 9, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 17, 0),
      priceMin: 0,
      priceMax: 0,
      venue: venues[6],
      categories: ["conferencias"],
      status: EventStatus.published,
    },
    {
      slug: "festival-gastronomico",
      title: "Festival Gastronómico Soyapango",
      summary: "Sabores urbanos con chefs emergentes y música en vivo.",
      description: "<p>Más de 20 propuestas gastronómicas, zona familiar y presentaciones artísticas.</p>",
      imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9, 11, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9, 20, 0),
      priceMin: 2,
      priceMax: 15,
      venue: venues[1],
      categories: ["ferias", "familia"],
      status: EventStatus.published,
    },
    {
      slug: "taller-fotografia",
      title: "Taller de Fotografía Urbana",
      summary: "Aprende técnicas de composición y edición en el centro histórico.",
      description: "<p>Incluye recorrido guiado y sesión práctica con fotógrafos profesionales.</p>",
      imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 8, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 12, 0),
      priceMin: 25,
      priceMax: 25,
      venue: venues[0],
      categories: ["conferencias"],
      status: EventStatus.published,
    },
    {
      slug: "cine-al-parque",
      title: "Cine al Parque: Clásicos Latinos",
      summary: "Proyección gratuita al aire libre con palomitas incluidas.",
      description: "<p>Llega temprano para disfrutar de la zona de picnic y música acústica.</p>",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 16, 18, 30),
      venue: venues[1],
      categories: ["familia", "teatro"],
      status: EventStatus.published,
    },
    {
      slug: "expo-artesanos-santa-ana",
      title: "Expo Artesanos Santa Ana",
      summary: "Más de 50 expositores de artesanías, textiles y alimentos.",
      description: "<p>Apoya emprendimientos de la región occidental con actividades culturales.</p>",
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21, 10, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21, 18, 0),
      priceMin: 1,
      priceMax: 5,
      venue: venues[5],
      categories: ["ferias"],
      status: EventStatus.published,
    },
    {
      slug: "encuentro-startups",
      title: "Encuentro de Startups Oriente",
      summary: "Pitch de emprendimientos tecnológicos de San Miguel.",
      description: "<p>Paneles con mentores e inversionistas, más sesiones de networking.</p>",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25, 9, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25, 15, 0),
      priceMin: 10,
      priceMax: 10,
      venue: venues[4],
      categories: ["conferencias"],
      status: EventStatus.approved,
    },
    {
      slug: "campamento-familiar",
      title: "Campamento Familiar en Lago de Coatepeque",
      summary: "Fin de semana con actividades al aire libre para toda la familia.",
      description: "<p>Incluye hospedaje en glamping, kayaks y fogata nocturna.</p>",
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 32, 8, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 34, 12, 0),
      priceMin: 80,
      priceMax: 120,
      venue: venues[5],
      categories: ["familia"],
      status: EventStatus.pending,
    },
    {
      slug: "liga-escolar",
      title: "Liga Escolar de Baloncesto",
      summary: "Jornada clasificatoria con colegios de San Salvador.",
      description: "<p>Entrada gratuita con actividades deportivas para niñas y niños.</p>",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 35, 9, 0),
      priceMin: 0,
      priceMax: 0,
      venue: venues[7],
      categories: ["deportes", "familia"],
      status: EventStatus.pending,
    },
    {
      slug: "encuentro-poesia",
      title: "Encuentro de Poesía Centroamericana",
      summary: "Lecturas, talleres y micrófono abierto con poetas invitados.",
      description: "<p>Sesiones de escritura creativa y feria de editoriales independientes.</p>",
      imageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 45, 16, 0),
      priceMin: 8,
      priceMax: 12,
      venue: venues[0],
      categories: ["teatro", "conferencias"],
      status: EventStatus.approved,
    },
  ];

  for (const event of eventsData) {
    const created = await prisma.event.create({
      data: {
        title: event.title,
        slug: event.slug,
        summary: event.summary,
        description: event.description,
        imageUrl: event.imageUrl,
        startTime: event.startTime,
        endTime: event.endTime ?? null,
        priceMin: event.priceMin ?? null,
        priceMax: event.priceMax ?? null,
        status: event.status,
        venue: { connect: { id: event.venue.id } },
        organizer: { connect: { id: organizer.id } },
        categories: {
          create: event.categories.map((slug) => ({ category: { connect: { slug } } })),
        },
        metrics: { create: { views: 0, clicksMap: 0, saves: 0 } },
      },
    });

    if (event.priceMin === 0) {
      await prisma.eventMetric.update({
        where: { eventId: created.id },
        data: { views: 15 },
      });
    }
  }

  console.log("Seed completado: usuarios demo y eventos cargados.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
