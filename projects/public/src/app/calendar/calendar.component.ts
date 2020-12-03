import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { SwiperEvent } from 'ngx-swiper-wrapper/lib/swiper.interfaces';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import * as moment from 'moment';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { User } from 'projects/tools/src/lib/models/user.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
import { Week } from 'projects/tools/src/lib/models/week.model';
import { Day } from 'projects/tools/src/lib/models/day.model';
import { EventData, EventDialogComponent } from 'projects/tools/src/lib/dialogs/event/event-dialog.component';


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
  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 1,
    keyboard: true,
    mousewheel: false,
    scrollbar: false,
    navigation: true,
    pagination: true
  };
  /**
   * Slider Swiper current index
   */
  public sliderIndex = 1;
  /**
   * Slider Swiper disabled state
   */
  public isSliderDisabled = false;
  /**
   * Reference to slider
   */
  @ViewChild(SwiperDirective, { static: false }) private swiperDirectiveRef?: SwiperDirective;
  /**
   * Reference to event dialog
   */
  public eventDialogRef: MatDialogRef<EventDialogComponent> | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private swUpdate: SwUpdate,
    private dialog: MatDialog,
    public userService: UserService,
    public calendarEventService: CalendarEventService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // subscribe to current user observable
    this.currentUser$ = this.userService.currentUser$;

    // get all family members (if not already done)
    if (this.userService.users[0]._id === '') {
      this.userService.getAllUsers().subscribe((users: User[]) => {
        console.log(users);
      });
    }

    this.calendarEventService.currentMoment$
      .pipe(skip(1))
      .subscribe((updatedCurrentMoment: moment.Moment) => {
        // console.log('updatedCurrentMoment', updatedCurrentMoment);
    });

    // Initialize current Week view - Get possible unix date in query params
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      const initUnixDate = params.init_unix_date;
      let initMoment: moment.Moment;
      let previousMoment: moment.Moment;
      let nextMoment: moment.Moment;

      if (initUnixDate) {
        initMoment = moment.unix(Number(initUnixDate));
      } else {
        initMoment = moment();
      }

      previousMoment = initMoment.clone().add(-7, 'day');
      nextMoment = initMoment.clone().add(7, 'day');

      // populate weeks (if not already done)
      if (this.calendarEventService.weeksSlides[0].weekNumber === -1) {
        console.log('populate 3 first weeks');

        this.calendarEventService.weeksSlides = [];
        this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(previousMoment.unix()));
        this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(initMoment.unix()));
        this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(nextMoment.unix()));

        // get all events between (current Week - 1) and (current Week +1)
        console.log('Fetch events for weeks ' + this.calendarEventService.weeksSlides[this.sliderIndex - 1].weekNumber +
        ' to ' + this.calendarEventService.weeksSlides[this.sliderIndex + 1].weekNumber);
        const minDate: string = moment(previousMoment).startOf('week').unix().toString();
        const maxDate: string = moment(nextMoment).endOf('week').unix().toString();
        this.getEvents(minDate, maxDate);
      } else {
        // otherwise just restore last stored week view from sliderIndex
        this.sliderIndex = this.calendarEventService.sliderIndexSaved;
      }
    });

    // update currentMoment
    this.calendarEventService.setCurrentMoment(this.calendarEventService.weeksSlides[this.sliderIndex].days[0].momentObject);

    // TESTS
    // const monday = moment().startOf('week');
    // const sunday = moment().endOf('week');
    // const unixForWeekDebug: number[] = [];
    // let day: moment.Moment = monday;
    // while (day <= sunday) {
    //   unixForWeekDebug.push(day.unix());
    //   day = day.clone().add(1, 'day');
    // }
    // console.log(unixForWeekDebug);
  }

  ngAfterViewInit(): void {
    // Init slider for resize
    setTimeout(() => {
      this.swiperDirectiveRef?.update();
    }, 100);
  }

  /**
   * @TODO
   */
  public getEvents(minDate?: string, maxDate?: string): void {
    this.calendarEventService.getAllEvents(minDate, maxDate).subscribe((events: CalendarEvent[]) => {
      console.log(events);

      events.forEach((event: CalendarEvent) => {
        this.calendarEventService.weeksSlides.forEach((w: Week) => {
          w.days.forEach((d: Day) => {
            if (moment.unix(Number(event.startDate)).format('DDD') === d.momentObject.format('DDD')) {
              d.events?.push(event);
            }
          });
        });
      });
      console.log(this.calendarEventService.weeksSlides);

      // save current Slider index
      this.calendarEventService.sliderIndexSaved = this.sliderIndex;
    });
  }

  /**
   * @TODO
   */
  public onIndexChange(index: number): void {
    // console.log('Swiper index: ', index);
    // save current Slider index
    this.calendarEventService.sliderIndexSaved = this.sliderIndex;
    // console.log('Checking for Service Workers update...');
    // this.swUpdate.checkForUpdate();
  }

  /**
   * @TODO
   */
  public onSlideChangeTransitionEnd(event: SwiperEvent): void {
    // console.log('Swiper slideChangeTransitionEnd: ', event);

    // update currentMoment
    this.calendarEventService.setCurrentMoment(this.calendarEventService.weeksSlides[this.sliderIndex].days[0].momentObject);

    const initMoment: moment.Moment = this.calendarEventService.getCurrentMoment();
    let newMoment: moment.Moment = null as any;

    // reach left end of Weeks Slides: add one more to the left!
    if (this.sliderIndex === 0) {
      const previousMoment = initMoment.clone().add(-7, 'day');
      newMoment = previousMoment;
      this.calendarEventService.weeksSlides.unshift(this.constructWeeksSlides(previousMoment.unix()));
      // Attention - GROSSE triksounette
      this.config.speed = 0;
      this.sliderIndex = 1;
      setTimeout(() => {
        this.config.speed = 300;
      }, 1);
    }

    // reach right end of Weeks Slides: add one more to the right!
    if (this.sliderIndex === this.calendarEventService.weeksSlides.length - 1) {
      const nextMoment = initMoment.clone().add(7, 'day');
      newMoment = nextMoment;
      this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(nextMoment.unix()));
    }

    if (newMoment) {
      // get all new Week events
      const minDate: string = moment(newMoment).startOf('week').unix().toString();
      const maxDate: string = moment(newMoment).endOf('week').unix().toString();
      this.getEvents(minDate, maxDate);
    }

    // update currentMoment
    this.calendarEventService.setCurrentMoment(this.calendarEventService.weeksSlides[this.sliderIndex - 1].days[0].momentObject);
  }

  /**
   * Construct a Week Slide from a Unix formatted date
   */
  private constructWeeksSlides(fromUnixDate: number): Week {
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
   * Open event detail view dialog =
   * - create view if input is a day
   * - detail view if input is an event
   */
  public openEventDetailDialog(input: Day | CalendarEvent, user?: User): void {
    console.log(input);
    console.log(user);
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
      console.log('click !');

      const data: EventData = {
        existingEvent: input
      };
      dialogConfig.data = data;
    }

    else if (input instanceof Day) {
      console.log('double click !');

      const data: EventData = {
        newEvent: {
          day: input,
          user: user as User
        }
      };
      dialogConfig.data = data;
    }

    else {
      console.log('Problème... :/');
      this.notificationService.sendNotification('Aïe aïe aïe ! Aïe oune pétite problème...');
    }

    this.eventDialogRef = this.dialog.open(EventDialogComponent, dialogConfig);
    this.eventDialogRef.afterClosed().subscribe((ev: CalendarEvent) => {
      console.log(ev);

      // update event in view
      if (ev) {
        // first remove old event if necessary
        if (input instanceof CalendarEvent) {
          let dayIndex = -1;
          let eventIndex = -1;
          const updatedDay: Day = this.calendarEventService.weeksSlides[this.calendarEventService.sliderIndexSaved].days
            .find((day: Day, index: number) => {
              dayIndex = index;
              return day.nb === moment.unix(Number(input.startDate)).date();
            }) as Day;
          console.log(updatedDay);
          const updatedEvent: CalendarEvent = updatedDay?.events?.find((e: CalendarEvent, index: number) => {
            eventIndex = index;
            return e._id === ev._id;
          }) as CalendarEvent;

          this.calendarEventService.weeksSlides[this.calendarEventService.sliderIndexSaved].days[dayIndex].events?.splice(eventIndex, 1);
        }

        // then, update by inserting ev (if not deleted)
        if (!ev._deleted) {
          this.calendarEventService.weeksSlides.forEach((week: Week) => {
            console.log(this.isEventInWeek(ev, week));
            if (this.isEventInWeek(ev, week)) {
              week.days.forEach((day: Day) => {
                if (day.nb === moment.unix(Number(ev.startDate)).date()) {
                  // console.log('Gooooo : ', day.nb);
                  day.events?.push(ev);
                }
              });
            }
          });
        }

        console.log(this.calendarEventService.weeksSlides);
      }
    });
  }

  /**
   * Open event creation view dialog
   */
  public createEventDetailDialog(day: Day): void {
    console.log('dbClick !');
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

  testPress(event: any): void {
    console.log(event);
  }
}
