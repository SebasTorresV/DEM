"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  eventId: number;
}

export function ReminderButton({ eventId }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      const remindAt = new Date();
      remindAt.setHours(remindAt.getHours() + 1);
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, remindAt: remindAt.toISOString() }),
      });
      if (res.ok) {
        setCreated(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-70"
    >
      {created ? "Recordatorio listo" : "Recordarme"}
    </button>
  );
}
