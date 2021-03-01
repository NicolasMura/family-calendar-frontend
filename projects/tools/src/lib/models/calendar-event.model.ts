import * as moment from 'moment';

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
  _deleted?: boolean;

  constructor(
    event: CalendarEvent
    // title: string,
    // startDate: string,
    // endDate: string,
    // usersEmails: string[],
    // reminders?: string[],
    // color?: string,
    // category?: string,
    // humanStartDate?: string,
    // humanEndDate?: string,
    // // tslint:disable-next-line: variable-name
    // _id?: string,
    // // tslint:disable-next-line: variable-name
    // _deleted: boolean = false
  ) {
    // this.title = title;
    // this.startDate = startDate;
    // this.endDate = endDate;
    // this.usersEmails = usersEmails;
    // this.reminders = reminders;
    // this.color = color;
    // this.category = category;
    // this.humanStartDate = humanStartDate;
    // this.humanEndDate = humanEndDate;
    // this._id = _id;
    // this._deleted = _deleted;
    this.title = event.title;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.usersEmails = event.usersEmails;
    this.reminders = event.reminders;
    this.color = event.color;
    this.category = event.category;
    this.humanStartDate = event.humanStartDate || moment.unix(Number(event.startDate)).format('YYYY-MM-DDTHH:mm:ssZ');
    this.humanEndDate = event.humanEndDate || moment.unix(Number(event.endDate)).format('YYYY-MM-DDTHH:mm:ssZ');
    this._id = event._id;
    this._deleted = typeof event._deleted === 'boolean' ? event._deleted : false;
  }
}
