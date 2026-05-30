/**
 * Add calendar months to a yyyy-MM-dd date (local calendar, no UTC shift).
 * Keeps the same day-of-month when possible (e.g. May 1 → Jun 1).
 * If the target month is shorter, uses the last day (e.g. Jan 31 → Feb 28).
 */
export function addMonthsToDateString(dateStr, monthsToAdd) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || "").trim());
  if (!match) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  let year = parseInt(match[1], 10);
  let month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  month += monthsToAdd;
  year += Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(day, lastDayOfMonth);

  const mm = String(month + 1).padStart(2, "0");
  const dd = String(clampedDay).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** Build monthly payment due dates from a start date (inclusive of start month). */
export function buildMonthlyPaymentDates(startDateStr, monthCount) {
  const count = Number(monthCount);
  if (!count || count < 1) {
    return [];
  }
  const dates = [];
  for (let i = 0; i < count; i += 1) {
    dates.push(addMonthsToDateString(startDateStr, i));
  }
  return dates;
}
