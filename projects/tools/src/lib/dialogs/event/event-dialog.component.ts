import { Component, OnInit, OnDestroy, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';


/**
 * Interface for event dialog datas
 */
export interface EventData  {
  event: CalendarEvent;
}

/**
 * Component that displays app selector
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
  // public eventForm: FormGroup = new FormGroup({});
  public eventForm: FormGroup = null as any;
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
   * Event start date in Unix Date format (ex.: '1601555477') for backend
   */
  unixStartDate: string | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EventData,
    private eventDialogRef: MatDialogRef<EventDialogComponent>,
    private notificationService: NotificationService,
    private calendarEventService: CalendarEventService
  ) { }

  ngOnInit(): void {
    if (this.data.event) {
      const event = new CalendarEvent(
        this.data.event.title,
        this.data.event.startDate,
        this.data.event.endDate,
        this.data.event.usersEmails,
        this.data.event.reminders,
        this.data.event.color,
        this.data.event.category,
        this.data.event.humanStartDate,
        this.data.event.humanEndDate,
        this.data.event._id
      );
      console.log(event);
      this.unixStartDate = event.startDate;

      // format startDate for DateTimePicker
      this.standardStartDate = new Date(Number(event.startDate) * 1000);

      // build form
      this.eventForm = new FormGroup({
        title: new FormControl(event.title),
        startDate: new FormControl(event.endDate),
        endDate: new FormControl(event.endDate),
        usersEmails: new FormControl(event.usersEmails),
        reminders: new FormControl(event.reminders),
        color: new FormControl(event.color),
        category: new FormControl(event.category),
        standardStartDate: new FormControl(this.standardStartDate) // standard Date format for DateTime Picker
      });
    } else {
      // build form
      this.eventForm = new FormGroup({
        title: new FormControl(''),
        startDate: new FormControl(''),
        endDate: new FormControl(''),
        usersEmails: new FormControl([]),
        reminders: new FormControl([]),
        color: new FormControl(''),
        category: new FormControl(''),
        standardStartDate: new FormControl('') // standard Date format for DateTime Picker
      });
    }
  }

  /**
   * Real-time startDate form value update
   */
  onStartDateChange(event: MatDatepickerInputEvent<any>): void {
    if (event.value) {
      this.unixStartDate = Math.round(event.value.valueOf() / 1000).toString();
      console.log(this.unixStartDate);
    }
  }

  /**
   * Save event
   */
  public save(): void {
    this.submitLoadingSpinner = true;
    const event = new CalendarEvent(
      this.eventForm.get('title')?.value,
      // this.eventForm.get('startDate')?.value,
      this.unixStartDate as string,
      this.eventForm.get('endDate')?.value,
      this.eventForm.get('usersEmails')?.value,
      this.eventForm.get('reminders')?.value,
      this.eventForm.get('color')?.value,
      this.eventForm.get('category')?.value,
      this.data.event.humanStartDate,
      this.data.event.humanEndDate,
      this.data.event ? this.data.event._id : ''
    );

    if (this.data.event) {
      this.update(event);
    } else {
      this.create(event);
    }
  }

  /**
   * Create new event
   */
  public create(event: CalendarEvent): void {
    this.calendarEventService.createEvent(event)
      .subscribe((e: CalendarEvent) => {
        this.submitLoadingSpinner = false;
        this.notificationService.sendNotification('Événement enregistré !');
      }, error => {
        console.error(error);
        this.submitLoadingSpinner = false;
      });
  }

  /**
   * Update existing event
   */
  public update(event: CalendarEvent): void {
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

  /*
   * Handle form errors
   */
  public errorHandling = (control: string, error: string) => {
    return this.eventForm?.controls[control]?.hasError(error);
  }
}
