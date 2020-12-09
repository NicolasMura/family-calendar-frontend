import { CalendarEvent } from './calendar-event.model';

export class Day {
  momentObject: moment.Moment;
  nb: number;
  label: string;
  events?: CalendarEvent[];

  constructor(momentObject: moment.Moment, nb: number, label: string, events?: CalendarEvent[]) {
    this.momentObject = momentObject;
    this.nb = nb;
    this.label = label;
    this.events = events;
  }
}
