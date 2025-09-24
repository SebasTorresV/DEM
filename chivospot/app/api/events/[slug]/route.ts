import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/events";
import { auth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);
  if (!event) {
    return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
  }

  if (event.status !== "published") {
    const session = await auth();
    if (!session?.user || !["admin", "organizer"].includes(session.user.role ?? "")) {
      return NextResponse.json({ message: "Evento no disponible" }, { status: 403 });
    }
  }

  return NextResponse.json(event);
}
