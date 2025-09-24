const WEEKEND_DAYS = [5, 6];

export function formatDateRange(start: Date, end?: Date) {
  const formatter = new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!end || start.toDateString() === end.toDateString()) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function getNowRange() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (WEEKEND_DAYS.includes(now.getDay())) {
    const diff = 6 - now.getDay();
    end.setDate(end.getDate() + diff);
    end.setHours(23, 59, 59, 999);
  } else {
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

export function getUpcomingRange(days: number) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
