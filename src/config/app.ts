/**
 * Anchor for the daily "Build #N" number shown on the shareable result card.
 * Build #1 is the date of the first daily poll, so the number equals the age of
 * the daily poll in calendar days.
 *
 * TODO(marciano): set this to the real earliest `daily_polls.date`:
 *   SELECT min(date) FROM daily_polls;
 */
export const DEVVOTED_LAUNCH_DATE = "2026-04-27";
