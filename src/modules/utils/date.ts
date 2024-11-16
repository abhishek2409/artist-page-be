/* eslint-disable import/prefer-default-export */
export function addDaysToTimestamp({ timestamp, days }: { timestamp: number; days: number }) {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/**
 * Checks if createdAt + 60 days is less than one day from today.
 *
 * @param {Date | string} createdAt - The creation date.
 * @returns {boolean} - Returns true if (createdAt + 60 days) < (today + 1 day), else false.
 */
export function isCreatedAtPlus60DaysLessThanOneDayFromToday(createdAt: Date) {
  // Ensure createdAt is a Date object
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate)) {
    throw new Error('Invalid createdAt date');
  }

  // Add 60 days to createdAt
  const sixtyDaysLater = new Date(createdDate);
  sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

  // Get current date and add 1 day
  const today = new Date();
  const oneDayFromToday = new Date(today);
  oneDayFromToday.setDate(oneDayFromToday.getDate() + 1);

  // Compare the two dates
  return sixtyDaysLater < oneDayFromToday;
}
