export type Coverage = {
  status: string;
  due_date: string;
  coverage_start?: string | null;
  coverage_end?: string | null;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
function cycle(year: number, month: number, day: number) {
  return new Date(
    Date.UTC(
      year,
      month,
      Math.min(day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()),
    ),
  );
}
export function billingMonths(
  due: string,
  payments: Coverage[],
  now = new Date(),
) {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(due) ? Number(due.slice(8, 10)) : 1;
  return Array.from({ length: 5 }, (_, i) => {
    const month = now.getUTCMonth() + i - 2,
      start = cycle(now.getUTCFullYear(), month, day),
      next = cycle(now.getUTCFullYear(), month + 1, day),
      end = new Date(next.getTime() - 86400000);
    const a = iso(start),
      b = iso(end);
    const ranges = payments
      .filter(
        (p) =>
          ["paid", "waived"].includes(p.status) &&
          p.coverage_start &&
          p.coverage_end,
      )
      .map((p) => [p.coverage_start!, p.coverage_end!] as const)
      .sort((x, y) => x[0].localeCompare(y[0]));
    let coveredUntil = a;
    let covered = false;
    for (const [from, to] of ranges) {
      if (from > coveredUntil) break;
      if (to >= coveredUntil) {
        if (to >= b) {
          covered = true;
          break;
        }
        coveredUntil = iso(new Date(Date.parse(to) + 86400000));
      }
    }
    const legacy = payments.some(
      (p) =>
        ["paid", "waived"].includes(p.status) &&
        !p.coverage_start &&
        p.due_date.slice(0, 7) === a.slice(0, 7),
    );
    return {
      start: a,
      end: b,
      label: start.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC",
      }),
      year: start.getUTCFullYear(),
      paid: covered || legacy,
    };
  });
}
