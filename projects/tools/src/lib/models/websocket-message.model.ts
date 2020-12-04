import { CalendarEvent } from './calendar-event.model';


export class WebSocketMessage {
  constructor(
    public content: string,
    public isBroadcast: boolean = false,
    public sender: string,
    public data: { type: string, content: CalendarEvent}
  ) { }
}
