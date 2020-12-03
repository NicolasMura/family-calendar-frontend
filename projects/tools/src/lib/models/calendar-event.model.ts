export class CalendarEvent {
  title: string;
  startDate: string;
  endDate: string;
  usersEmails: string[];
  reminders?: string[];
  color?: string;
  category?: string;
  humanStartDate?: string;
  humanEndDate?: string;
  // tslint:disable-next-line: variable-name
  _id?: string;
  // tslint:disable-next-line: variable-name
  _deleted = false;

  constructor(
    title: string,
    startDate: string,
    endDate: string,
    usersEmails: string[],
    reminders?: string[],
    color?: string,
    category?: string,
    humanStartDate?: string,
    humanEndDate?: string,
    // tslint:disable-next-line: variable-name
    _id?: string,
    // tslint:disable-next-line: variable-name
    _deleted: boolean = false
  ) {
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.usersEmails = usersEmails;
    this.reminders = reminders;
    this.color = color;
    this.category = category;
    this.humanStartDate = humanStartDate;
    this.humanEndDate = humanEndDate;
    this._id = _id;
    this._deleted = _deleted;
  }
}
