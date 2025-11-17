import type { TimetableEntry } from '../types';

let permissionGranted: boolean | null = null;

export const requestPermission = async () => {
  if (!('Notification' in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }
  
  if (permissionGranted === null) {
      const permission = await Notification.requestPermission();
      permissionGranted = permission === 'granted';
  }
};

const getDayIndex = (day: TimetableEntry['day']): number => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
}

export const scheduleTimetableReminder = async (entry: TimetableEntry) => {
  await requestPermission();
  if (!permissionGranted || !entry.reminder || !navigator.serviceWorker.ready) {
    return;
  }

  const [hours, minutes] = entry.startTime.split(':').map(Number);
  const now = new Date();
  const entryDate = new Date();
  
  // Find the next occurrence of the event's day
  const todayIndex = now.getDay();
  const eventDayIndex = getDayIndex(entry.day);
  let dayDifference = eventDayIndex - todayIndex;
  if (dayDifference < 0 || (dayDifference === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)))) {
    // If the event for this week has already passed, schedule for next week
    dayDifference += 7;
  }
  
  entryDate.setDate(now.getDate() + dayDifference);
  entryDate.setHours(hours, minutes, 0, 0);

  const reminderTime = new Date(entryDate.getTime() - entry.reminder * 60 * 1000);
  const delay = reminderTime.getTime() - Date.now();
  
  if (delay > 0) {
    const registration = await navigator.serviceWorker.ready;
    // FIX: postMessage should be called on the active service worker, not the registration object.
    registration.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: {
            title: entry.subject,
            options: {
                body: `Starts at ${entry.startTime}${entry.location ? ` in ${entry.location}` : ''}.`,
                icon: 'https://picsum.photos/192',
                tag: `timetable-${entry.id}`
            },
            delay: delay
        }
    });
  }
};

export const cancelTimetableReminder = async (entryId: number) => {
  // Note: There's no direct API to cancel a scheduled setTimeout in a service worker from the main thread.
  // A more robust implementation would involve the service worker managing a list of notifications in IndexedDB.
  // For this implementation, we assume that re-scheduling (by saving the entry without a reminder) will be sufficient.
  console.log(`Cancelling reminders for entry ${entryId} would require a more complex SW setup.`);
};
