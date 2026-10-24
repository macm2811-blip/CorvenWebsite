import { test } from "node:test";
import assert from "node:assert/strict";
import { billingMonths } from "../src/lib/lms/billing.ts";
test("billing periods follow the account due day and future coverage", () => {
  const items = billingMonths(
    "2026-10-15",
    [
      {
        status: "paid",
        due_date: "2026-10-15",
        coverage_start: "2026-10-15",
        coverage_end: "2026-12-14",
      },
    ],
    new Date("2026-10-24T12:00:00Z"),
  );
  assert.deepEqual(
    items.slice(2).map((m) => [m.start, m.end, m.paid]),
    [
      ["2026-10-15", "2026-11-14", true],
      ["2026-11-15", "2026-12-14", true],
      ["2026-12-15", "2027-01-14", false],
    ],
  );
});
test("partial coverage does not mark a whole period as paid", () => {
  assert.equal(
    billingMonths(
      "2026-10-01",
      [
        {
          status: "paid",
          due_date: "2026-10-01",
          coverage_start: "2026-10-01",
          coverage_end: "2026-10-05",
        },
      ],
      new Date("2026-10-24T12:00:00Z"),
    )[2].paid,
    false,
  );
});
test("adjacent approved payments combine and month ends clamp", () => {
  const items = billingMonths(
    "2026-01-31",
    [
      {
        status: "paid",
        due_date: "2026-02-28",
        coverage_start: "2026-02-28",
        coverage_end: "2026-03-10",
      },
      {
        status: "paid",
        due_date: "2026-03-11",
        coverage_start: "2026-03-11",
        coverage_end: "2026-03-30",
      },
    ],
    new Date("2026-02-01T00:00:00Z"),
  );
  assert.equal(items[2].start, "2026-02-28");
  assert.equal(items[2].end, "2026-03-30");
  assert.equal(items[2].paid, true);
});
