export class CalendarEvent {
  title: string;
  startDate: string;
  endtDate: string;

  constructor(title: string, startDate: string, endtDate: string) {
    this.title = title;
    this.startDate = startDate;
    this.endtDate = endtDate;
  }
}
