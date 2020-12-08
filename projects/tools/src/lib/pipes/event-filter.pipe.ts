import { Pipe, PipeTransform } from '@angular/core';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
import { User } from 'projects/tools/src/lib/models/user.model';


/**
 * Filter an array of events by user's email
 */
@Pipe({
  name: 'eventsFilter',
  pure: false
})
export class EventsFilterPipe implements PipeTransform {
transform(events: CalendarEvent[], filter: {user: User, childrenEmails: string[]}): any {
  if (!events || !filter) {
    return events;
  }
  let filteredEvents: CalendarEvent[];

  if (filter.user.schtroumpfs) {
    filteredEvents = events.filter((event: CalendarEvent) =>
      event.usersEmails.some((email: string) => filter.childrenEmails.includes(email)));
  } else {
    filteredEvents = events.filter((event: CalendarEvent) => event.usersEmails.includes(filter.user.email));
  }

  return filteredEvents;
}
}
