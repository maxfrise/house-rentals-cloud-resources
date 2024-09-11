export function getJobDates(startDate: string, term: string) {
  const dates = [];
  let currDate = new Date(startDate);
  currDate.setUTCHours(0, 0, 0, 0); // Set time to midnight

  const originalFirstDay = currDate.getDate();

  // Add the start date to the list
  dates.push(currDate);

  let count = 1;

  while (count < parseInt(term)) {
    let nextDate = new Date(currDate);
    let daysAdded = 0;
    nextDate.setMonth(currDate.getMonth() + 1); // Move to the next month

    // Ensure last day is always used
    nextDate = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      originalFirstDay,
    );

    const monthDiff = nextDate.getMonth() - currDate.getMonth();

    // This check makes sure when moving to a month with less days than the original first day,
    // the date gets adjusted, to use the last day available on the next month
    if (monthDiff !== 1 && monthDiff !== -11) {
      nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 0); // Set to last day of the new month
    }

    // adjust date for weekends
    if (nextDate.getDay() === 6) {
      // if it's Saturday
      nextDate.setDate(nextDate.getDate() + 2); // move to Monday
      daysAdded = 2;
    } else if (nextDate.getDay() === 0) {
      // if it's Sunday
      nextDate.setDate(nextDate.getDate() + 1); // move to Monday
      daysAdded = 1;
    }

    nextDate.setUTCHours(0, 0, 0, 0); // Set time to midnight
    dates.push(new Date(nextDate));

    // Restore the days once added to the list
    nextDate.setDate(nextDate.getDate() - daysAdded);

    currDate = nextDate; // Update current date

    count++;
  }

  return dates.map((date) => date.toISOString()); // convert dates to ISO strings without time
}
