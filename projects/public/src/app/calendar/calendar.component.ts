import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { SwiperEvent } from 'ngx-swiper-wrapper/lib/swiper.interfaces';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import * as moment from 'moment';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { User } from 'projects/tools/src/lib/models/user.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
import { Week } from 'projects/tools/src/lib/models/week.model';
import { Day } from 'projects/tools/src/lib/models/day.model';


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
  @ViewChild(SwiperDirective, { static: false }) swiperDirectiveRef?: SwiperDirective;

  constructor(
    private activatedRoute: ActivatedRoute,
    private swUpdate: SwUpdate,
    public userService: UserService,
    public calendarEventService: CalendarEventService
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
        this.calendarEventService.weeksSlides = [];
        this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(previousMoment.unix()));
        this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(initMoment.unix()));
        this.calendarEventService.weeksSlides.push(this.constructWeeksSlides(nextMoment.unix()));

        // get all events between (current Week - 1) and (current Week +1)
        console.log('Fetch event for weeks ' + this.calendarEventService.weeksSlides[this.sliderIndex - 1].weekNumber +
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
      days.push({
        momentObject: day,
        nb: day.date(),
        label: day.format('dddd'),
        events: []
      });
      day = day.clone().add(1, 'day');
    }

    const week: Week = new Week(startOfWeek.isoWeek(), days);
    return week;
  }
}
