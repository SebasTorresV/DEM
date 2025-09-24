import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminModerationCard } from "@/components/AdminModerationCard";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const events = await prisma.event.findMany({
    where: { status: { in: ["pending", "approved"] } },
    include: { organizer: { include: { user: true } }, venue: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moderación</h1>
      <div className="space-y-4">
        {events.map((event) => (
          <AdminModerationCard key={event.id} event={event} />
        ))}
        {events.length === 0 && <p className="text-sm text-slate-600">No hay eventos pendientes por aprobar.</p>}
      </div>
    </div>
  );
}
