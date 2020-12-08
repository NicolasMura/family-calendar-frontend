import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { Day } from 'projects/tools/src/lib/models/day.model';
import { User } from 'projects/tools/src/lib/models/user.model';
import { CalendarEvent } from 'projects/tools/src/lib/models/calendar-event.model';


/**
 * Interface for show more events dialog datas
 */
export interface ShowMoreEventsData  {
  day: Day;
  user: User;
}

/**
 * Component that displays show more events dialog
 */
@Component({
  selector: 'lib-show-more-events-dialog',
  templateUrl: './show-more-events-dialog.component.html',
  styleUrls: ['./show-more-events-dialog.component.scss']
})
export class ShowMoreEventsDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShowMoreEventsData,
    private eventDialogRef: MatDialogRef<ShowMoreEventsDialogComponent>,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  /**
   * Close dialog
   */
  public cancel(): void {
    this.eventDialogRef.close();
  }

  /**
   * Close dialog and open event dialog for update
   */
  public openEventDetailDialog(event: CalendarEvent): void {
    console.log(event);
  }

  /**
   * Returns true if any family child is in @param event, false otherwise
   */
  public isAnyChildInEvent(event: CalendarEvent): boolean {
    return event.usersEmails.some((email: string) => this.userService.childrenEmails.includes(email));
  }
}
