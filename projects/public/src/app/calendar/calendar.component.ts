import { Component, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
// import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
// import { SwiperEvent } from 'ngx-swiper-wrapper/lib/swiper.interfaces';
import { Observable } from 'rxjs';
import { catchError, first, skip, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { WebSocketService } from 'projects/tools/src/lib/services/websocket.service';
import { User } from 'projects/tools/src/lib/models/user.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
import { Week } from 'projects/tools/src/lib/models/week.model';
import { Day } from 'projects/tools/src/lib/models/day.model';
import { WebSocketMessage } from 'projects/tools/src/lib/models/websocket-message.model';
import { EventData, EventDialogComponent } from 'projects/tools/src/lib/components/dialogs/event/event-dialog.component';
import { ShowMoreEventsData, ShowMoreEventsDialogComponent } from 'projects/tools/src/lib/components/dialogs/event/show-more-events-dialog.component';
import { environment } from 'projects/tools/src/environments/environment';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  /**
   * Observable that gives current user
   */
  currentUser$?: Observable<User>;
  /**
   * Slider Swiper configuration
   */
  // public config: SwiperConfigInterface = {
  public config: any = {
    direction: 'horizontal',
    slidesPerView: 1,
    keyboard: true,
    mousewheel: false,
    scrollbar: false,
    // navigation: true,
    pagination: environment.production ? false : true
  };
  /**
   * Slider Swiper current index
   */
  public sliderIndex = 1;
  /**
   * Slider Swiper disabled state
   */
  // public isSliderDisabled = false;
  /**
   * Reference to slider
   */
  // @ViewChild(SwiperDirective, { static: false }) private swiperDirectiveRef?: SwiperDirective;
  /**
   * Reference to event dialog
   */
  public eventDialogRef: MatDialogRef<EventDialogComponent> | undefined;
  /**
   * Reference to show more events dialog
   */
  public showMoreEventsDialogRef: MatDialogRef<ShowMoreEventsDialogComponent> | undefined;

  // tests WS
  // public serverMessages = new Array<Message>();
  public clientMessage = '';
  public isBroadcast = false;
  public sender = '';
  // private socket$: WebSocketSubject<MessageTest>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private swUpdate: SwUpdate,
    private dialog: MatDialog,
    public userService: UserService,
    public calendarEventService: CalendarEventService,
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    // restore last stored week view from sliderIndex
    if (this.calendarEventService.sliderIndexSaved) {

      this.sliderIndex = this.calendarEventService.sliderIndexSaved;

      // update url query params
      const queryParams: Params = { init_unix_date: this.calendarEventService.getCurrentMoment().unix().toString() };
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams,
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
    }

    // subscribe to current user observable
    this.currentUser$ = this.userService.currentUser$;

    // subscribe to WebSocket messages
    this.webSocketService.message$.pipe(
      tap({
        error: error => console.log('[CalendarComponent] Error:', error),
        complete: () => console.log('[CalendarComponent] Connection Closed')
      }),
      catchError(error => {
        console.log('[CalendarComponent] catchError:', error);
        throw error;
      })
    ).subscribe((message: CalendarEvent) => {
      console.log(message);
      if (message) {
        this.updateView(message);
      }
    });

    // Initialize current Week view - Get possible unix date in query params
    this.activatedRoute.queryParams.pipe(first()).subscribe(async (params: Params) => {

      // populate weeks (if not already done)
      if (this.calendarEventService.weeksSlides[0].weekNumber === -1) {
        const initUnixDate = params.init_unix_date;

        this.calendarEventService.weeksSlides = await this.buildAndPopulateThreeWeeks(
          this.calendarEventService.weeksSlides,
          Number(initUnixDate),
          params.openEventId || undefined
        );
      }
    });

    // subscribe to currentMoment$ to update view
    this.calendarEventService.currentMoment$.pipe(skip(1)).subscribe(async (updatedCurrentMoment: moment.Moment) => {
      // update url query params
      const queryParams: Params = { init_unix_date: updatedCurrentMoment.unix().toString() };
      this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });

      // find potential existing slider index that corresponds to updatedCurrentMoment
      let targetWeek: Week = null as any;
      this.calendarEventService.weeksSlides.forEach((week: Week, index: number) => {
        if (week.weekNumber === updatedCurrentMoment.startOf('week').isoWeek()) {
          targetWeek = week;
          // week already in weeksSlides
          if (index !== this.sliderIndex) {
            this.sliderIndex = index;
            // next => see onSlideChangeTransitionEnd()
          }
        }
      });

      // week not yet in weeksSlides
      if (!targetWeek) {
        // on va la faire simple
        this.sliderIndex = 1;
        this.calendarEventService.weeksSlides = await this.buildAndPopulateThreeWeeks(
          this.calendarEventService.weeksSlides,
          updatedCurrentMoment.unix()
        );
      }
    });

    // subscribe to WebSocket reconnection to update view
    this.webSocketService.needToFetchEvents$.subscribe((reconnect: boolean) => {
      if (reconnect) {
        // rebuild and populate all loaded weeks
        const weeks = this.calendarEventService.weeksSlides;
        const minUnixDate: number = weeks[0].days[0].momentObject.startOf('week').unix();
        const maxUnixDate: number = weeks[weeks.length - 1].days[0].momentObject.endOf('week').unix();
        const minDate: string = minUnixDate.toString();
        const maxDate: string = maxUnixDate.toString();
        this.getEvents(minDate, maxDate, true);
      }
    });
  }

  ngAfterViewInit(): void {
    // Init slider for correct resize on iOS
    // @TODO : à priori ne sert à rien, voir comment faire mieux pour iOS
    setTimeout(() => {
      // this.swiperDirectiveRef?.update();
      // this.swiperDirectiveRef?.init();
    }, 100);
  }

  /**
   * Scan for CTRL + F event
   * Scan for CTRL + SUPPR event
   */
  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent): void {
    if (($event.ctrlKey || $event.metaKey) && $event.code === 'KeyF') {
      $event.preventDefault(); // to prevent the browser from opening its own default search box
      // @TODO...
    }
    if (($event.ctrlKey || $event.metaKey) && $event.code === 'Delete') {
      // @TODO...
    }
    if (($event.ctrlKey || $event.metaKey) && $event.code === 'KeyT') {
      console.log($event);
    }
  }

  /**
   * Shortcut to populate three Weeks
   */
  async buildAndPopulateThreeWeeks(weeks: Week[], unixDate: number, openEventId?: string): Promise<Week[]> {
    let initMoment: moment.Moment;
    let previousMoment: moment.Moment;
    let nextMoment: moment.Moment;

    if (unixDate) {
      initMoment = moment.unix(unixDate);
    } else {
      initMoment = moment();
    }

    previousMoment = initMoment.clone().add(-7, 'day');
    nextMoment = initMoment.clone().add(7, 'day');

    weeks[this.sliderIndex - 1] = this.buildEmptyWeek(previousMoment.unix());
    weeks[this.sliderIndex]     = this.buildEmptyWeek(initMoment.unix());
    weeks[this.sliderIndex + 1] = this.buildEmptyWeek(nextMoment.unix());

    // get all events between (current Week - 1) and (current Week +1)
    console.log(this.sliderIndex);
    console.log('Fetch events for weeks ' + weeks[this.sliderIndex - 1].weekNumber +
    ' to ' + weeks[this.sliderIndex + 1].weekNumber);
    const minDate: string = moment(previousMoment).startOf('week').unix().toString();
    const maxDate: string = moment(nextMoment).endOf('week').unix().toString();
    await this.getEvents(minDate, maxDate);

    // save current Slider index
    this.calendarEventService.sliderIndexSaved = this.sliderIndex;

    // update currentMoment
    this.calendarEventService.setCurrentMoment(this.calendarEventService.weeksSlides[this.sliderIndex].days[0].momentObject);

    if (openEventId) {
      let event: CalendarEvent = null as any;
      console.log(this.calendarEventService.weeksSlides[this.sliderIndex]);
      this.calendarEventService.weeksSlides[this.sliderIndex].days.some((day: Day) => {
        return day.events?.find((ev: CalendarEvent) => {
          if (ev._id === openEventId) {
            event = ev;
            return true;
          }
          return false;
        }) as CalendarEvent;
      });

      if (event) { // test to make app robust between DEV and PROD modes (or event could have been deleted...)
        setTimeout(() => {
          this.openEventDetailDialog(event);
        }, 100);
      } else {
        this.notificationService.sendNotification('Désolé, l\'événément en question est dans les choux...');
      }

      // remove openEventId from url
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          openEventId: null,
        },
        queryParamsHandling: 'merge'
      });
    }

    return new Promise((resolve, reject) => {
      resolve(weeks);
    });
  }

  /**
   * Populate a single Week
   */
  populateWeek(momentObject: moment.Moment): void {
    const minUnixDate: number = momentObject.startOf('week').unix();
    const maxUnixDate: number = momentObject.endOf('week').unix();
    const minDate: string = minUnixDate.toString();
    const maxDate: string = maxUnixDate.toString();

    this.getEvents(minDate, maxDate);
  }

  /**
   * Get all Events occuring between a minDate and a maxDate, and populate weeks
   * @TODO: use async to get rid of direct access to this.calendarEventService.weeks
   */
  async getEvents(minDate?: string, maxDate?: string, repopulate = false): Promise<void> {
    // First promise returns an array after a delay
    const getUsers = () => {
      return new Promise((resolve, reject) => {
        return this.userService.getAllUsers().subscribe((users: User[]) => {
          resolve(users);
        });
      });
    };

    // get all family members (if not already done)
    if (this.userService.users[0]._id === '') {
      console.log('await getUsers()...');
      await getUsers();
    }

    return new Promise((resolve, reject) => {
      this.calendarEventService.getAllEvents(minDate, maxDate).subscribe((events: CalendarEvent[]) => {
        console.log(events);
        // console.log(this.userService.childrenEmails);

        this.calendarEventService.weeksSlides.forEach((w: Week) => {
          w.days.forEach((d: Day) => {
            if (repopulate) {
              d.events = [];
            }
            events.forEach((event: CalendarEvent) => {
              if (moment.unix(Number(event.startDate)).format('DDD') === d.momentObject.format('DDD')) {
                (d.events as CalendarEvent[]).push(event);
              }
            });
          });
        });
        console.log(this.calendarEventService.weeksSlides);
        resolve();
      });
    });
  }

  /**
   * @TODO
   */
  public onIndexChange(index: number): void {
    // console.log('onIndexChange - Swiper index: ', index);
    // save current Slider index
    this.calendarEventService.sliderIndexSaved = this.sliderIndex;

    // console.log('Checking for Service Workers update...');
    this.swUpdate.checkForUpdate();
  }

  /**
   * @TODO
   */
  // public onSlideChangeTransitionEnd(event: SwiperEvent): void {
  public onSlideChangeTransitionEnd(event: any): void {
    // console.log('onSlideChangeTransitionEnd');

    // update currentMoment
    this.calendarEventService.setCurrentMoment(this.calendarEventService.weeksSlides[this.sliderIndex].days[0].momentObject);

    const initMoment: moment.Moment = this.calendarEventService.getCurrentMoment();
    let newMoment: moment.Moment = null as any;

    // reach left end of Slider: add one more to the left!
    if (this.sliderIndex === 0) {
      // console.log('reached left end of Slider: add one more week to the left!');

      const previousMoment = initMoment.clone().add(-7, 'day');
      newMoment = previousMoment;
      this.calendarEventService.weeksSlides.unshift(this.buildEmptyWeek(previousMoment.unix()));
      // Attention - GROSSE triksounette
      this.config.speed = 0;
      this.sliderIndex = 1;
      setTimeout(() => {
        this.config.speed = 300;
      }, 1);
    }

    // reach right end of Slider: add one more to the right!
    if (this.sliderIndex === this.calendarEventService.weeksSlides.length - 1) {
      // console.log('reached right end of Slider: add one more week to the right!');
      const nextMoment = initMoment.clone().add(7, 'day');
      newMoment = nextMoment;
      this.calendarEventService.weeksSlides.push(this.buildEmptyWeek(nextMoment.unix()));
    }

    if (newMoment) {
      // get all new Week events
      const minDate: string = moment(newMoment).startOf('week').unix().toString();
      const maxDate: string = moment(newMoment).endOf('week').unix().toString();
      this.getEvents(minDate, maxDate);

      // save current Slider index
      this.calendarEventService.sliderIndexSaved = this.sliderIndex;
    }

    // update url query params
    const queryParams: Params = { init_unix_date: this.calendarEventService.getCurrentMoment().unix() };
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  /**
   * Build an empty Week from a Unix formatted date
   */
  private buildEmptyWeek(fromUnixDate: number): Week {
    const startOfWeek = moment.unix(fromUnixDate).startOf('week');
    const endOfWeek = moment.unix(fromUnixDate).endOf('week');

    const days: Day[] = [];
    let day: moment.Moment = startOfWeek;

    while (day <= endOfWeek) {
      days.push(new Day(
        day,
        day.date(),
        day.format('dddd'),
        []
      ));
      day = day.clone().add(1, 'day');
    }

    const week: Week = new Week(startOfWeek.isoWeek(), days);
    return week;
  }

  /**
   * Open event detail view dialog via add button
   */
  public createEvent(): void {
    const day: Day = this.calendarEventService.weeksSlides[this.sliderIndex].days[0];

    this.openEventDetailDialog(day);
  }

  /**
   * Open event detail view dialog =
   * - create view if input is a day + pass day / user data
   * - detail view if input is an event + pass event data
   */
  public openEventDetailDialog(input: Day | CalendarEvent, user?: User): void {
    // console.log(input);
    // console.log(user);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.id = 'modal-openEventDetailDialog';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.maxHeight = '100vh';
    dialogConfig.height = '100%';
    dialogConfig.width = '100%';
    dialogConfig.panelClass = 'custom-theme'; // @TODO

    if (input instanceof CalendarEvent) {
      const data: EventData = {
        existingEvent: input
      };
      dialogConfig.data = data;
    }

    else if (input instanceof Day) {
      const data: EventData = {
        newEvent: {
          day: input,
          users: user ? (user.schtroumpfs ? user.schtroumpfs : [user]) : [this.userService.getCurrentUser()]
        }
      };
      dialogConfig.data = data;
    }

    else {
      console.log('Problème... :/');
      this.notificationService.sendNotification('Aïe aïe aïe ! Aïe oune pétite problème...');
    }

    this.eventDialogRef = this.dialog.open(EventDialogComponent, dialogConfig);
    this.eventDialogRef.afterClosed().subscribe((event: CalendarEvent) => {
      console.log(event);

      // update event in view
      if (event) {
        this.webSocketService.sendMessage(new WebSocketMessage(
          'bob',
          true,
          this.userService.getCurrentUser().email,
          { type: 'event', content: event }
        ));
        this.updateView(event);
      }
    });
  }

  /**
   * Update view following event user CRUD action
   */
  public updateView(event: CalendarEvent): void {
    let firstUpdatedWeekIndex: number = undefined as any;
    let firstUpdatedDay: Day = undefined as any;
    let firstUpdatedDayIndex: number = undefined as any;
    let existingEventIndex: number | undefined;

    let secondUpdatedWeekIndex: number = undefined as any;
    let secondUpdatedDay: Day = undefined as any;
    let secondUpdatedDayIndex: number = undefined as any;

    this.calendarEventService.weeksSlides.forEach((week: Week, indexWeek: number) => {
      week.days.forEach((day: Day, indexDay: number) => {

        const i = day.events?.findIndex((e: CalendarEvent, indexEv: number) => e._id === event._id);
        if (i !== -1) {
          firstUpdatedWeekIndex = indexWeek;
          firstUpdatedDayIndex = indexDay;
          firstUpdatedDay = day;
          existingEventIndex = i;
        }

        if (day.momentObject.dayOfYear() === moment.unix(Number(event.startDate)).dayOfYear()
            && day.momentObject.year() === moment.unix(Number(event.startDate)).year()) {
          secondUpdatedWeekIndex = indexWeek;
          secondUpdatedDayIndex = indexDay;
          secondUpdatedDay = day;
        }
      });
    });

    // first, remove "old" event from view if existing
    if (Number.isInteger(existingEventIndex)) {
      // console.log('found "old" event to remove from view');
      (firstUpdatedDay.events as CalendarEvent[]).splice(existingEventIndex as number, 1);

      if (!event._deleted) {
        // if event has same date
        if (firstUpdatedWeekIndex === secondUpdatedWeekIndex && firstUpdatedDayIndex === secondUpdatedDayIndex) {
          // console.log('update case - same day');
          (firstUpdatedDay.events as CalendarEvent[])[existingEventIndex as number] = event;
        // otherwise, it means that event was moved to another date
        } else {
          // console.log('update case - move to new day');
          if (secondUpdatedDay) {
            (secondUpdatedDay.events as CalendarEvent[]).push(event);
          }
        }
      }
    // create case
    } else {
      // console.log('create case');
      if (secondUpdatedDay.events) {
        secondUpdatedDay.events.push(event);
      } else {
        secondUpdatedDay.events = [event];
      }
    }

    console.log(this.calendarEventService.weeksSlides);
  }

  /**
   * Returns true if @param event belongs to @param week, false otherwise
   */
  public isEventInWeek(event: CalendarEvent, week: Week): boolean {
    let isEventInWeek = false;
    if ((moment.unix(Number(event.startDate)) >= week.days[0].momentObject)
         && (moment.unix(Number(event.startDate)) <= week.days[6].momentObject.clone().add(1, 'day').add(-1, 'second'))) {
      isEventInWeek = true;
    }

    return isEventInWeek;
  }

  /**
   * Returns true if any family child is in @param event, false otherwise
   */
  public isAnyChildInEvent(event: CalendarEvent): boolean {
    return event.usersEmails.some((email: string) => this.userService.childrenEmails.includes(email));
  }

  /**
   * Returns true if day is today, false otherwise
   * @TODO: à améliorer car s'applique à tous les mois actuellement... :)
   */
  public isToday(day: Day): boolean {
    const today: moment.Moment = moment();
    return day.momentObject.get('date') === today.get('date') && day.momentObject.get('date') === today.get('date') && day.momentObject.get('date') === today.get('date');
  }

  /**
   * Returns number of @param user's events in a given @param day
   */
  public getDayEventsForUser(day: Day, user: User): number {
    let userEventsCount = 0;

    day.events?.forEach((event: CalendarEvent) => {
      if (user.schtroumpfs) {
        if (this.isAnyChildInEvent(event)) {
          userEventsCount++;
        }
      } else {
        if (event.usersEmails.includes(user.email)) {
          userEventsCount++;
        }
      }
    });

    return userEventsCount;
  }

  /**
   * Show more events modal for a given day / user
   */
  public showMoreEvents(day: Day, user: User): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.id = 'modal-openShowMoreEventsDialog';
    dialogConfig.width = '250px';
    dialogConfig.panelClass = 'custom-theme'; // @TODO

    const data: ShowMoreEventsData = {
      day,
      user
    };
    dialogConfig.data = data;

    this.showMoreEventsDialogRef = this.dialog.open(ShowMoreEventsDialogComponent, dialogConfig);
    this.showMoreEventsDialogRef.afterClosed().subscribe((event: CalendarEvent) => {
      if (event) {
        this.openEventDetailDialog(event, user);
      }
    });
  }

  // tests WS
  public toggleIsBroadcast(): void {
    this.isBroadcast = !this.isBroadcast;
  }

  public send(): void {
    // const message = new Message(this.sender, this.clientMessage, this.isBroadcast);

    // this.serverMessages.push(message);
    // // this.socket$.next(message);
    // this.webSocketService.sendMessage(message);
    // this.clientMessage = '';
  }

  public isMine(message: WebSocketMessage): boolean {
    return message && message.sender === this.sender;
  }

  public getSenderInitials(sender: string): string {
    return sender && sender.substring(0, 2).toLocaleUpperCase();
  }

  public getSenderColor(sender: string): string {
    const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ';
    const initials = this.getSenderInitials(sender);
    const value = Math.ceil((alpha.indexOf(initials[0]) + alpha.indexOf(initials[1])) * 255 * 255 * 255 / 70);
    return '#' + value.toString(16).padEnd(6, '0');
  }
}
