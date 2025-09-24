# ChivoSpot

ChivoSpot es una plataforma local para descubrir eventos en El Salvador con foco en la ejecución 100 % offline/cloudless. Incluye frontend y backend en Next.js 14, autenticación local con NextAuth y base de datos SQLite via Prisma.

## Quickstart Local

Requisitos: Node.js 20+ y npm.

1. Instala dependencias
   ```bash
   npm install
   ```
2. Aplica el esquema a SQLite
   ```bash
   npx prisma db push
   ```
3. Ejecuta la semilla con datos demo
   ```bash
   npm run seed
   ```
4. Inicia el entorno de desarrollo
   ```bash
   npm run dev
   ```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Credenciales demo

| Rol | Email | Contraseña |
| --- | --- | --- |
| Admin | `admin@demo.local` | `Passw0rd!` |
| Organizador | `org@demo.local` | `Passw0rd!` |

## Características principales

- **Vistas Ahora y Próximos** con filtro por texto, municipio y rangos rápidos.
- **Mapa interactivo Leaflet** con marcadores por evento usando datos locales.
- **Ficha de evento** con métricas, favoritos y recordatorios locales.
- **Panel de organizador** para crear/editar eventos y ver estadísticas simples.
- **Panel admin** para moderar estados de publicación.
- **Autenticación local** con NextAuth + Credentials Provider y contraseñas hasheadas.
- **Base de datos SQLite** manejada con Prisma y script de seed.
- **Validaciones** con Zod y sanitización de descripciones HTML.
- **SEO** básico: metadata, `sitemap.xml`, `robots.txt` y JSON-LD para eventos.
- **Tests incluidos**: Vitest (unitarios) y Playwright (smoke E2E).

## Scripts útiles

| Comando | Descripción |
| ------- | ----------- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera build de producción. |
| `npm run start` | Sirve el build generado. |
| `npm run lint` | Ejecuta análisis estático con ESLint. |
| `npm run db:push` | Sincroniza el esquema Prisma con SQLite. |
| `npm run seed` | Carga usuarios demo, venues y eventos de ejemplo. |
| `npm run test` | Corre los unit tests con Vitest. |
| `npm run test:e2e` | Ejecuta las pruebas de Playwright (requiere `npx playwright install`). |

## Notas

- La variable `NEXTAUTH_SECRET` debe establecerse para producción.
- La base de datos por defecto es `prisma/dev.db`; se puede ajustar en `.env`.
- Leaflet consume tiles públicos de OpenStreetMap (sin claves).
- El endpoint `/api` aplica rate limiting básico en memoria.
