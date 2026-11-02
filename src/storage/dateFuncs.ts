/** Returns the given date as a string in the local timezone in the format YYYY-MM-DD */
export const getDateString = (now: Date = new Date()): string => {
  /*
   * toISOString always prints UTC, which can be a different day than here (e.g. 0:30 in Berlin
   * is still the previous day in UTC). Shifting the moment by the offset makes its UTC fields
   * show what the local clock showed. So `adjustedDate` is a different moment than `now`:
   * use it only for this formatting, never for comparisons or arithmetic.
   */
  const offset = now.getTimezoneOffset() // Minutes, positive west of UTC (Berlin: -60 or -120)
  const adjustedDate = new Date(now.getTime() - offset * 60 * 1000)
  return adjustedDate.toISOString().split('T')[0]!
}
