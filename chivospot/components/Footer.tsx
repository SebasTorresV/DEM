export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} ChivoSpot. Eventos hechos en El Salvador.</p>
        <p>
          Datos locales · Tiles por <span className="font-semibold text-primary-500">OpenStreetMap</span>
        </p>
      </div>
    </footer>
  );
}
