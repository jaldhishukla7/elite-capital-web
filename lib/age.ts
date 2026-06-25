/**
 * Validates that a given date of birth corresponds to someone who is
 * at least 18 years old as of today.
 */
export function isAtLeast18(dateOfBirth: Date | string): boolean {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth

  if (isNaN(dob.getTime())) return false

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()

  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())

  if (!hasHadBirthdayThisYear) {
    age -= 1
  }

  return age >= 18
}

/**
 * Returns the maximum valid date of birth for an 18-year-old today,
 * useful as the `max` attribute on a date input.
 */
export function getMaxDobFor18Plus(): string {
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return maxDate.toISOString().split('T')[0]
}
