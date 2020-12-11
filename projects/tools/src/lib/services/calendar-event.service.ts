import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import * as moment from 'moment';
import { environment } from 'projects/tools/src/environments/environment';
import { GlobalService } from './global-service.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
import { Week } from 'projects/tools/src/lib/models/week.model';
import { Day } from 'projects/tools/src/lib/models/day.model';

// Mocks
const CALENDAR_EVENTS_MOCK_URL = './assets/json-mocks/calendar-events.json';
const CALENDAR_EVENT_MOCK_URL  = './assets/json-mocks/calendar-event.json';


/**
 * Calendar Event Service
 */
@Injectable({
  providedIn: 'root'
})
export class CalendarEventService extends GlobalService {
  protected baseUrlCalendarEvent = environment.backendApi.baseUrlCalendarEvent;

  /**
   * Private currentMoment, as a behavior subject so we can provide a default value
   * Nobody outside the CalendarEventService should have access to this BehaviorSubject
   */
  private readonly currentMoment = new BehaviorSubject<moment.Moment>(null as any);
  /**
   * Expose the observable$ part of the currentMoment subject (read only stream)
   */
  readonly currentMoment$: Observable<moment.Moment> = this.currentMoment.asObservable();
  /**
   * Weeks slides
   */
  public weeksSlides: Week[] = [
    {
      weekNumber: -1,
      days: [0 as unknown as Day, 1 as unknown as Day, 2 as unknown as Day, 3 as unknown as Day,
        4 as unknown as Day, 5 as unknown as Day, 6 as unknown as Day]
    }
  ];
  /**
   * Saved Slider Swiper current index
   */
  public sliderIndexSaved: number = null as any;

  constructor(
    private http: HttpClient,
    protected notificationService: NotificationService,
    protected errorHandlingService: ErrorHandlingService
  ) {
    super(errorHandlingService);
  }

  /**
   * @TODO
   */
  public getCurrentMoment(): moment.Moment {
    return this.currentMoment.getValue();
  }

  /**
   * @TODO
   */
  public setCurrentMoment(currentMoment: moment.Moment): void {
    this.currentMoment.next(currentMoment);
    // this.currentMoment$.next(currentMoment);
  }

  /**
   * Retrieve the list of calendar events
   */
  public getAllEvents(minDate?: string, maxDate?: string): Observable<CalendarEvent[]> {
    let url = `${this.baseUrlCalendarEvent}`;
    if (minDate || maxDate) {
      url += '?';
      if (minDate) {
        url += 'minDate=' + minDate + '&';
      }
      if (maxDate) {
        url += 'maxDate=' + maxDate;
      }
    }
    // const url = CALENDAR_EVENTS_MOCK_URL;
    return this.http.get<CalendarEvent[]>(url)
      .pipe(
        // delay(1000),
        map((events: CalendarEvent[]) => {
          const eventsWellFormatted = events.map((event: CalendarEvent) => new CalendarEvent(
            event.title,
            event.startDate,
            event.endDate,
            event.usersEmails,
            event.reminders,
            event.color || 'blue',
            event.category,
            event.humanStartDate || moment.unix(Number(event.startDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            event.humanEndDate || moment.unix(Number(event.endDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            event._id
          ));
          return eventsWellFormatted;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Retrieve an event calendar given its id
   */
  public getEventsById(eventId: string): Observable<CalendarEvent> {
    const url = `${this.baseUrlCalendarEvent}/${eventId}`;
    // const url = CALENDAR_EVENT_MOCK_URL;
    return this.http.get<CalendarEvent>(url)
      .pipe(
        // delay(1000),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create new calendar event
   */
  public createEvent(event: CalendarEvent): Observable<CalendarEvent> {
    const url = `${this.baseUrlCalendarEvent}`;
    const body = {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      usersEmails: event.usersEmails,
      reminders: event.reminders,
      color: event.color,
      category: event.category
    };
    return this.http.post<CalendarEvent>(url, body)
      .pipe(
        // delay(1000),
        map((newEvent: CalendarEvent) => {
          const eventWellFormatted = new CalendarEvent(
            newEvent.title,
            newEvent.startDate,
            newEvent.endDate,
            newEvent.usersEmails,
            newEvent.reminders,
            newEvent.color,
            newEvent.category,
            newEvent.humanStartDate || moment.unix(Number(newEvent.startDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            newEvent.humanEndDate || moment.unix(Number(newEvent.endDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            newEvent._id
          );
          return eventWellFormatted;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update existing calendar event
   */
  public updateEvent(event: CalendarEvent): Observable<CalendarEvent> {
    const url = `${this.baseUrlCalendarEvent}/${event._id}`;
    const body = {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      usersEmails: event.usersEmails,
      reminders: event.reminders,
      color: event.color,
      category: event.category
    };
    return this.http.put<CalendarEvent>(url, body)
      .pipe(
        // delay(1000),
        map((updatedEvent: CalendarEvent) => {
          const eventWellFormatted = new CalendarEvent(
            updatedEvent.title,
            updatedEvent.startDate,
            updatedEvent.endDate,
            updatedEvent.usersEmails,
            updatedEvent.reminders,
            updatedEvent.color,
            updatedEvent.category,
            updatedEvent.humanStartDate || moment.unix(Number(updatedEvent.startDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            updatedEvent.humanEndDate || moment.unix(Number(updatedEvent.endDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            updatedEvent._id
          );
          return eventWellFormatted;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete existing calendar event
   */
  public deleteEventById(eventId: string): Observable<CalendarEvent> {
    const url = `${this.baseUrlCalendarEvent}/${eventId}`;
    return this.http.delete<CalendarEvent>(url)
      .pipe(
        // delay(1000),
        map((deletedEvent: CalendarEvent) => {
          const eventWellFormatted = new CalendarEvent(
            deletedEvent.title,
            deletedEvent.startDate,
            deletedEvent.endDate,
            deletedEvent.usersEmails,
            deletedEvent.reminders,
            deletedEvent.color,
            deletedEvent.category,
            deletedEvent.humanStartDate || moment.unix(Number(deletedEvent.startDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            deletedEvent.humanEndDate || moment.unix(Number(deletedEvent.endDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            deletedEvent._id,
            true
          );
          return eventWellFormatted;
        }),
        catchError(error => this.handleError(error))
      );
  }
}
