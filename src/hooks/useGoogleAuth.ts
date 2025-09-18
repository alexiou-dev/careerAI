// useCalendar.ts
export function useCalendar() {
  const createCalendarLink = (jobTitle: string, reminderDate: number) => {
    const start = new Date(reminderDate).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(reminderDate + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, ''); // +1h

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Interview: ${jobTitle}`
    )}&dates=${start}/${end}&details=${encodeURIComponent(
      'Reminder from CareerAI'
    )}&ctz=Europe/Athens`;

    return gcalUrl;
  };

  const setLocalReminder = (jobTitle: string, reminderDate: number) => {
    const now = new Date().getTime();
    const delay = reminderDate - now;
    if (delay > 0) {
      setTimeout(() => {
        alert(`Reminder: ${jobTitle} interview today!`);
      }, delay);
    }
  };

  return { createCalendarLink, setLocalReminder };
}
