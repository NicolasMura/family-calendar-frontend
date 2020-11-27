import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { environment } from 'projects/tools/src/environments/environment';
import { GlobalService } from './global-service.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';

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

  constructor(
    private http: HttpClient,
    protected notificationService: NotificationService,
    protected errorHandlingService: ErrorHandlingService
  ) {
    super(errorHandlingService);
  }

  /**
   * Retrieve the list of calendar events
   */
  public getAllEvents(): Observable<CalendarEvent[]> {
    const url = `${this.baseUrlCalendarEvent}`;
    // const url = CALENDAR_EVENTS_MOCK_URL;
    return this.http.get<CalendarEvent[]>(url)
      .pipe(
        delay(1000),
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
        delay(1000),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create new calendar event
   */
  public postEvent(event: CalendarEvent): Observable<CalendarEvent> {
    const url = `${this.baseUrlCalendarEvent}`;
    const body = {
      title: event.title,
      startDate: event.startDate,
      endtDate: event.endtDate
    };
    return this.http.post<CalendarEvent>(url, body)
      .pipe(
        delay(1000),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update existing calendar event
   */
  public updateEvent(event: CalendarEvent): Observable<CalendarEvent> {
    const url = `${this.baseUrlCalendarEvent}`;
    const body = {
      title: event.title,
      startDate: event.startDate,
      endtDate: event.endtDate
    };
    return this.http.put<CalendarEvent>(url, body)
      .pipe(
        delay(1000),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete existing calendar event
   */
  public deleteEventById(eventId: string): Observable<any> {
    const url = `${this.baseUrlCalendarEvent}/${eventId}`;
    return this.http.delete<any>(url)
      .pipe(
        delay(1000),
        catchError(error => this.handleError(error))
      );
  }
}
