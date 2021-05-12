import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import * as moment from 'moment';
import { environment } from 'projects/tools/src/environments/environment';
import { catchError, delay, retryWhen, takeUntil, tap } from 'rxjs/operators';
import { Subject, Observable, EMPTY, BehaviorSubject } from 'rxjs';
import { WebSocketMessage } from 'projects/tools/src/lib/models/websocket-message.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
export const WS_ENDPOINT = environment.wsEndpoint;
const RECONNECT_INTERVAL = 5000;

/**
 * WebSocket Service
 * https://javascript-conference.com/blog/real-time-in-angular-a-journey-into-websocket-and-rxjs
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  /**
   * RxJS WebSocket Subject
   */
  private socket$: WebSocketSubject<WebSocketMessage> = undefined as any;
  /**
   * Private websocket message, as a subject
   * Nobody outside the WebSocketService should have access to this Subject
   */
  private messageSubject: Subject<CalendarEvent> = new Subject();
  /**
   * Expose the observable$ part of the messageSubject subject (read only stream)
   */
  public readonly message$: Observable<CalendarEvent> = this.messageSubject.asObservable();
  /**
   * Subject completed when Websocket connection is destroyed
   */
  destroyed$ = new Subject();

  /**
   * True if WebSocket succesfully reconnect after lost, which means that we must fetch events again
   */
  needToFetchEvents = false;
  /**
   * Private needToFetchEvents boolean, as a subject
   * Nobody outside the WebSocketService should have access to this BehaviorSubject
   * True if WebSocket succesfully reconnect after lost, which means that we must fetch events again
   */
  private needToFetchEventsSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Expose the observable$ part of the needToFetchEvents subject (read only stream)
   */
  public readonly needToFetchEvents$: Observable<boolean> = this.needToFetchEventsSubject.asObservable();
  /**
   * Used to display error message to user
   */
  public lostConnection = false;

  /**
   * Connection method to instanciate WebSocket communication
   */
  public connect(cfg: { reconnect: boolean } = { reconnect: false }): void {

    if (!this.socket$ || this.socket$.closed) {
      console.log(this.socket$);
      this.socket$ = this.getNewWebSocket();
      this.socket$.pipe(
        retryWhen(errors =>
          errors.pipe(
            tap(err => {
              console.error('Got error', err);
              console.log('[WebSocketService] (connect()) Try to reconnect');
              this.lostConnection = true;
            }),
            delay(RECONNECT_INTERVAL)
          )
        ),
        tap({
          error: error => {
            console.error('Socket error');
            console.log(error);
          },
        }),
        takeUntil(this.destroyed$),
        catchError(error => {
          console.log('[WebSocketService] catchError:', error);
          return EMPTY;
        })
      )
      .subscribe((msg: WebSocketMessage) => {
        this.getMessage(msg);
      });
    }
  }

  /**
   * Create a new WebSocket subject
   */
  private getNewWebSocket(): WebSocketSubject<WebSocketMessage> {
    console.log('getNewWebSocket() : ', WS_ENDPOINT);

    return webSocket({
      url: WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('[WebSocketService (getNewWebSocket())]: connection opened');
          if (this.needToFetchEvents) {
            console.log('Reconnexion réussie => récupération des events');
            this.needToFetchEventsSubject.next(true);
          } else {
            console.log('Connexion réussie => pas besoin de récupérer des events');
            this.needToFetchEvents = true;
          }
          this.lostConnection = false;
        }
      },
      // intercepts the closure event
      closeObserver: {
        next: () => {
          console.log('[WebSocketService (getNewWebSocket())]: connection closed');
          this.lostConnection = true;
        }
      },
    });
  }

  /**
   * Get and process a message received from the socket
   */
   private getMessage(msg: WebSocketMessage): void {
    console.log(msg);
    if (msg.data && msg.data.type === 'event') {
      const eventWellFormatted = new CalendarEvent({
        title: msg.data.content.title,
        startDate: msg.data.content.startDate,
        endDate: msg.data.content.endDate,
        usersEmails: msg.data.content.usersEmails,
        reminders: msg.data.content.reminders,
        color: msg.data.content.color,
        category: msg.data.content.category,
        humanStartDate: msg.data.content.humanStartDate
          || moment.unix(Number(msg.data.content.startDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
        humanEndDate: msg.data.content.humanEndDate || moment.unix(Number(msg.data.content.endDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
        _id: msg.data.content._id,
        _deleted: msg.data.content._deleted
      });
      this.messageSubject.next(eventWellFormatted);
    }
  }

  /**
   * Send a message to the socket
   */
  public sendMessage(msg: WebSocketMessage): void {
    this.socket$.next(msg);
  }

  /**
   * Closes the connection by completing the subject
   */
  close(): void {
    this.socket$.complete();
  }

  /**
   * OnDestroy life cycle
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
