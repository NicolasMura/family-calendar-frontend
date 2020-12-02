export class CalendarEvent {
  // tslint:disable-next-line: variable-name
  _id: string;
  title: string;
  startDate: string;
  humanStartDate: string;
  endDate: string;
  humanEndDate: string;
  usersEmails: string[];
  reminders?: string[];
  color?: string;
  category?: string;

  constructor(
    // tslint:disable-next-line: variable-name
    _id: string,
    title: string,
    startDate: string,
    humanStartDate: string,
    endDate: string,
    humanEndDate: string,
    usersEmails: string[],
    reminders?: string[],
    color?: string,
    category?: string
  ) {
    this._id = _id;
    this.title = title;
    this.startDate = startDate;
    this.humanStartDate = humanStartDate;
    this.endDate = endDate;
    this.humanEndDate = humanEndDate;
    this.usersEmails = usersEmails;
    this.reminders = reminders;
    this.color = color;
    this.category = category;
  }
}
