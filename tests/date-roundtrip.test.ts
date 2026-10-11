/**
 * Unit tests for the Dispatch Date picker round-trip.
 * Run with: node --experimental-strip-types tests/date-roundtrip.test.ts
 *
 * The app operates from India (UTC+5:30), so the tests pin that timezone to
 * reproduce the exact off-by-one bug: a date picked with `<input type="date">`
 * was converted to a UTC ISO timestamp, and `toInputDate` then read the UTC
 * date back — one day behind the local calendar. The fixed helpers must keep
 * the picked calendar date unchanged through save → reload → display.
 */
process.env.TZ = "Asia/Kolkata";
import assert from "node:assert/strict";
import { toInputDate, fromInputDate, toDateKey, formatDate } from "../src/lib/format.ts";

// Picker round-trip: the date shown in the field after reload must equal the
// date the user picked, in a positive-UTC-offset timezone.
assert.equal(toInputDate(fromInputDate("2026-10-15")), "2026-10-15");

// fromInputDate must store a stable date-only value — never a UTC timestamp
// whose UTC date differs from the local calendar date.
assert.equal(fromInputDate("2026-10-15"), "2026-10-15");
assert.equal(fromInputDate(""), "");

// The stored value must agree with every display helper.
assert.equal(toDateKey(fromInputDate("2026-10-15")), "2026-10-15");
assert.equal(formatDate(fromInputDate("2026-10-15")), "15/10/2026");

// The picker and the row/display must always agree on the calendar date, even
// for legacy values stored as UTC timestamps (IST midnight = previous day UTC).
assert.equal(toInputDate("2026-10-14T18:30:00.000Z"), "2026-10-15");
assert.equal(toInputDate("2026-10-14T18:30:00.000Z"), toDateKey("2026-10-14T18:30:00.000Z"));

// The "today" default (from new-memo emptyForm → toDateKey(new Date())) must
// show the current local day in the picker.
assert.equal(toInputDate(new Date().toISOString()), toDateKey(new Date()));

console.log("date round-trip tests: all passed");