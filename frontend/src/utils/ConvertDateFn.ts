// Function to get the start of the day in ISO 8601 format
export function getStartOfDayISO (date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0); // Set to 00:00:00.000
  return start.toISOString();
};

// Function to get the end of the day in ISO 8601 format
export function getEndOfDayISO (date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() + 1); // Add one day
  start.setHours(0, 0, 0, 0); // Set to 00:00:00.000
  return start.toISOString();
};
