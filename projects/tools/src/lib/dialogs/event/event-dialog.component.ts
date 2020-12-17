import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { UtilitiesService } from 'projects/tools/src/lib/services/utilities.service';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';
import { Day } from 'projects/tools/src/lib/models/day.model';
import { User } from 'projects/tools/src/lib/models/user.model';


/**
 * Interface for event dialog datas
 */
export interface EventData  {
  existingEvent?: CalendarEvent;
  newEvent?: {
    day: Day,
    users?: User[]
  };
}

/**
 * Component that displays event dialog
 */
@Component({
  selector: 'lib-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit {
  /**
   * Event form
   */
  public eventForm: FormGroup = null as any;
  /**
   * Real-time saved event
   */
  public savedEvent!: CalendarEvent;
  /**
   * Boolean that allows to display a loading spinner on submit button if form is being submitted
   */
  public submitLoadingSpinner = false;
  /**
   * Current timestamp date to be compared to banner notification endDate to make it visible or not
   */
  todayTimestamp = Math.round(new Date().valueOf() / 1000).toString();
  /**
   * Event start date in standard Date format (ex.: '9/4/2020, 16:45:16') for DateTime Picker
   */
  standardStartDate: Date | undefined;
  /**
   * Event end date in standard Date format (ex.: '9/4/2020, 16:45:16') for DateTime Picker
   */
  standardEndDate: Date | undefined;
  /**
   * Event start date in Unix Date format (ex.: '1601555477') for backend
   */
  unixStartDate: string | undefined;
  /**
   * Event end date in Unix Date format (ex.: '1601555477') for backend
   */
  unixEndDate: string | undefined;
  /**
   * Reference to title input for autofocus (desktop mode)
   */
  @ViewChild('titleInput', { static: true }) titleInput!: ElementRef;
  /**
   * Available reminders
   */
  availableReminders: { duration: number, durationHumanized: string }[] = [
    {
      duration: 0,
      durationHumanized: 'Au moment de l\'événement'
    },
    {
      duration: moment.duration({ minutes: 5 }).asMilliseconds(),
      durationHumanized: moment.duration({ minutes: 5 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ minutes: 15 }).asMilliseconds(),
      durationHumanized: moment.duration({ minutes: 15 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ minutes: 30 }).asMilliseconds(),
      durationHumanized: moment.duration({ minutes: 30 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ hours: 1 }).asMilliseconds(),
      durationHumanized: moment.duration({ hours: 1 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ hours: 2 }).asMilliseconds(),
      durationHumanized: moment.duration({ hours: 2 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ days: 1 }).asMilliseconds(),
      durationHumanized: moment.duration({ days: 1 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ days: 2 }).asMilliseconds(),
      durationHumanized: moment.duration({ days: 2 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ weeks: 1 }).asMilliseconds(),
      durationHumanized: moment.duration({ weeks: 1 }).humanize() + ' avant'
    },
    {
      duration: moment.duration({ weeks: 2 }).asMilliseconds(),
      durationHumanized: moment.duration({ weeks: 2 }).humanize() + ' avant'
    }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EventData,
    private eventDialogRef: MatDialogRef<EventDialogComponent>,
    private notificationService: NotificationService,
    private calendarEventService: CalendarEventService,
    public userService: UserService,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    const event: CalendarEvent = new CalendarEvent('', '', '', [], [], '', '', '', '');

    if (this.data.existingEvent) {
      event.title = this.data.existingEvent.title;
      event.startDate = this.data.existingEvent.startDate;
      event.endDate = this.data.existingEvent.endDate;
      event.usersEmails = this.data.existingEvent.usersEmails;
      event.reminders = this.data.existingEvent.reminders;
      event.color = this.data.existingEvent.color;
      event.category = this.data.existingEvent.category;
      event.humanStartDate = this.data.existingEvent.humanStartDate;
      event.humanEndDate = this.data.existingEvent.humanEndDate;
      event._id = this.data.existingEvent._id;
      event._deleted = this.data.existingEvent._deleted;

      console.log(event);
    }
    else if (this.data.newEvent) {
      const start: moment.Moment = moment().set('date', this.data.newEvent.day.nb);
      const remaindingTime = 30 - (start.minute() % 30);
      const startDate = moment(start).add(remaindingTime, 'minute');
      const endDate = moment(start).add(remaindingTime + 120, 'minute');

      event.title = '';
      event.startDate = startDate.unix().toString();
      event.endDate = endDate.clone().unix().toString();
      event.usersEmails = this.data.newEvent.users ? this.data.newEvent.users.map((user: User) => user.email) : [];
      event.reminders = [moment.duration({ hours: 2 }).asMilliseconds().toString()];
      event.color = 'blue';
      event.category = '';
      event.humanStartDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      event.humanEndDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');

      console.log(event);
    }

    else {
      console.log('Problème... :/');
      this.notificationService.sendNotification('Aïe aïe aïe ! Aïe oune pétite problème...');
    }

    this.unixStartDate = event.startDate;
    this.unixEndDate = event.endDate;

    // format startDate and endDate for DateTimePicker
    this.standardStartDate = new Date(Number(event.startDate) * 1000);
    this.standardEndDate = new Date(Number(event.endDate) * 1000);

    // build form
    this.eventForm = new FormGroup({
      title: new FormControl(event.title, Validators.required),
      usersEmails: new FormControl(event.usersEmails, [this.validateArrayNotEmpty]),
      reminders: new FormControl(event.reminders?.map((reminder: string) => {
        return {
          duration: Number(reminder),
          durationHumanized: Number(reminder) !== 0 ? moment.duration(Number(reminder)).humanize() + ' avant' : 'Au moment de l\'événement'
        };
      })),
      color: new FormControl(event.color),
      category: new FormControl(event.category),
      standardStartDate: new FormControl(this.standardStartDate), // standard Date format for DateTime Picker
      standardEndDate: new FormControl(this.standardEndDate),  // standard Date format for DateTime Picker
      isAllDayEvent: new FormControl(false) // true if event is a full-day event, false otherwise
    });

    console.log('isInStandaloneModeTest() : ', this.utilitiesService.isInStandaloneModeiOS());
    console.log('isInStandaloneModeChrome : ', this.utilitiesService.isInStandaloneModeChrome());
    if (!this.utilitiesService.isInStandaloneModeChrome()) {
      this.titleInput.nativeElement.focus();
    }

    // save event
    this.savedEvent = event;
  }

  /**
   * Real-time startDate form value update
   */
  onStartDateChange(event: MatDatepickerInputEvent<any>): void {
    if (event.value) {
      this.unixStartDate = Math.round(event.value.valueOf() / 1000).toString();
      this.savedEvent.startDate = this.unixStartDate;
    }
  }

  /**
   * Real-time endDate form value update
   */
  onEndDateChange(event: MatDatepickerInputEvent<any>): void {
    console.log(event.value);
    if (event.value) {
      this.unixEndDate = Math.round(event.value.valueOf() / 1000).toString();
      this.savedEvent.endDate = this.unixEndDate;
    }
  }

  /**
   * Comparison function for reminders mat-select
   */
  compareRemindersWith(
    reminder1: { duration: number, durationHumanized: string },
    reminder2: { duration: number, durationHumanized: string }
  ): boolean {
    return reminder1 && reminder2 && reminder1.duration === reminder2.duration;
  }

  /**
   * Remove existing reminder
   */
  removeReminder(reminder: { duration: number, durationHumanized: string }): void {
    console.log(this.eventForm.get('reminders')?.value);

    const updatedReminders = this.eventForm.get('reminders')?.value.filter(
      (r: { duration: number, durationHumanized: string }) => r.duration !== reminder.duration);
    console.log(updatedReminders);

    this.eventForm.patchValue({
      reminders: updatedReminders
    });
  }

  /**
   * Update startTime and endTime when event is all day, otherwise restore saved values
   */
  allDayToggleChange(): void {
    console.log(this.savedEvent);

    if (this.eventForm.get('isAllDayEvent')?.value) {
      const startDate = moment(this.eventForm.get('standardStartDate')?.value).set('hour', 0).set('minute', 0);
      const endDate = moment(this.eventForm.get('standardEndDate')?.value).set('hour', 23).set('minute', 59);

      // patch form values
      this.eventForm.patchValue({
        standardStartDate: new Date(Number(startDate.unix()) * 1000),
        standardEndDate: new Date(Number(endDate.unix()) * 1000)
      });
    } else {
      // patch form values
      this.eventForm.patchValue({
        standardStartDate: new Date(Number(this.savedEvent.startDate) * 1000),
        standardEndDate: new Date(Number(this.savedEvent.endDate) * 1000)
      });
    }
  }

  /**
   * Save event
   */
  public save(): void {
    if (this.eventForm.valid) {
      this.submitLoadingSpinner = true;
      const event = new CalendarEvent(
        this.eventForm.get('title')?.value,
        // this.eventForm.get('startDate')?.value,
        this.unixStartDate as string,
        this.unixEndDate as string,
        this.eventForm.get('usersEmails')?.value,
        this.eventForm.get('reminders')?.value.map((reminder: { duration: number, durationHumanized: string }) => {
          return reminder.duration.toString();
        }),
        this.eventForm.get('color')?.value,
        this.eventForm.get('category')?.value,
        moment.unix(Number(this.unixStartDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
        moment.unix(Number(this.unixEndDate)).format('YYYY-MM-DDTHH:mm:ssZ'),
        this.data.existingEvent ? this.data.existingEvent._id : ''
      );

      if (this.data.existingEvent) {
        this.update(event);
      } else {
        this.create(event);
      }
    }
  }

  /**
   * Create new event
   */
  public create(event: CalendarEvent): void {
    if (this.eventForm.valid) {
      console.log('event to create :', event);
      this.calendarEventService.createEvent(event)
      .subscribe((newEvent: CalendarEvent) => {
        this.submitLoadingSpinner = false;
        this.notificationService.sendNotification('Événement enregistré !');
        this.eventDialogRef.close(newEvent);
      }, error => {
        console.error(error);
        this.submitLoadingSpinner = false;
      });
    }
  }

  /**
   * Update existing event
   */
  public update(event: CalendarEvent): void {
    if (this.eventForm.valid) {
      console.log('event to update :', event);
      this.calendarEventService.updateEvent(event)
        .subscribe((updatedEvent: CalendarEvent) => {
          this.submitLoadingSpinner = false;
          this.notificationService.sendNotification('Événement mis à jour !');
          this.eventDialogRef.close(updatedEvent);
        }, error => {
          console.error(error);
          this.submitLoadingSpinner = false;
        });
    }
  }

  /**
   * Delete existing event
   */
  public remove(): void {
    if (this.eventForm.valid) {
      console.log('event to delete :', this.data.existingEvent);
      this.calendarEventService.deleteEventById(this.data.existingEvent?._id as string)
        .subscribe((deletedEvent: CalendarEvent) => {
          this.submitLoadingSpinner = false;
          this.notificationService.sendNotification('Événement supprimé !');
          this.eventDialogRef.close(deletedEvent);
        }, error => {
          console.error(error);
          this.submitLoadingSpinner = false;
        });
    }
  }

  /**
   * Close dialog
   */
  public cancel(): void {
    this.eventDialogRef.close();
  }

  /*
   * Handle form errors
   */
  public errorHandling = (control: string, error: string) => {
    return this.eventForm?.controls[control]?.hasError(error);
  }

  /**
   * Custom validator for emails list
   * Error is returned if email list is empty
   */
  public validateArrayNotEmpty: ValidatorFn = (control: AbstractControl): {[key: string]: any} | null => {
    if (control.value && control.value.length === 0) {
      return {
        validateArrayNotEmpty: { valid: false }
      };
    }
    return null;
  }
}
