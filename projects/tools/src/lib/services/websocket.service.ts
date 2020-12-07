import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import * as moment from 'moment';
import { environment } from 'projects/tools/src/environments/environment';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { Subject, Observable, EMPTY } from 'rxjs';
import { WebSocketMessage } from 'projects/tools/src/lib/models/websocket-message.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
export const WS_ENDPOINT = environment.wsEndpoint;


/**
 * https://javascript-conference.com/blog/real-time-in-angular-a-journey-into-websocket-and-rxjs/
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket$: WebSocketSubject<WebSocketMessage> = null as any;
  private messagesSubject$: Subject<CalendarEvent> = new Subject();
  public messages$: Observable<CalendarEvent> = this.messagesSubject$.asObservable();
  destroyed$ = new Subject();

  public connect(): void {

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      console.log(this.socket$);
      this.socket$.pipe(
        tap({
          error: error => console.log(error),
        }),
        takeUntil(this.destroyed$),
        catchError(_ => EMPTY)
      )
      .subscribe((msg: WebSocketMessage) => {
        console.log(msg);
        if (msg.data && msg.data.type === 'event') {
          const eventWellFormatted = new CalendarEvent(
            msg.data.content.title,
            msg.data.content.startDate,
            msg.data.content.endDate,
            msg.data.content.usersEmails,
            msg.data.content.reminders,
            msg.data.content.color,
            msg.data.content.category,
            msg.data.content.humanStartDate || moment.unix(Number(msg.data.content.startDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            msg.data.content.humanEndDate || moment.unix(Number(msg.data.content.endDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
            msg.data.content._id,
            msg.data.content._deleted
          );
          this.messagesSubject$.next(eventWellFormatted);
        }
      });
    }
  }

  private getNewWebSocket(): WebSocketSubject<WebSocketMessage> {
    return webSocket(WS_ENDPOINT);
  }

  sendMessage(msg: WebSocketMessage): void {
    this.socket$.next(msg);
  }

  close(): void {
    this.socket$.complete();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}
