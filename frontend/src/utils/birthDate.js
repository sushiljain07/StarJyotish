// A birth date is valid when it exists on the calendar (no 31 February)
// and is not after today. Month is 1-based, as the form shows it.
export function isValidBirthDate(year, month, day, today = new Date()) {
  const d = new Date(year, month - 1, day)
  const exists = d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
  if (!exists) return false
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return d <= endOfToday
}
