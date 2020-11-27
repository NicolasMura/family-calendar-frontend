import { Component, OnInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { User } from 'projects/tools/src/lib/models/user.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  fillerContent = Array.from({length: 3}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 1,
    keyboard: true,
    mousewheel: true,
    scrollbar: false,
    navigation: true,
    pagination: false
  };
  public slides = [
    'First slide',
    'Second slide',
    'Third slide',
    'Fourth slide',
    'Fifth slide',
    'Sixth slide'
  ];
  public index = 0;

  constructor(
    private userService: UserService,
    private calendarEventService: CalendarEventService
  ) { }

  ngOnInit(): void {
    // get all users & events
    this.userService.getAllUsers().subscribe((users: User[]) => {
      console.log(users);
    });
    this.calendarEventService.getAllEvents().subscribe((events: CalendarEvent[]) => {
      console.log(events);
    });
  }

  public onIndexChange(index: number): void {
    console.log('Swiper index: ', index);
  }
}
