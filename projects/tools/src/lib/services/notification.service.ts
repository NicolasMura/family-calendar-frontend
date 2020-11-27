import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';


/**
 * Notification Service
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // snackBarRef: SimpleSnackBar;
  snackBarRef: any;

  constructor(
    private snackBar: MatSnackBar
  ) { }

  sendNotification(message: string, action?: string | undefined, options?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    const newNotification = this.snackBar.open(
      message,
      action,
      {
        duration: action ? 0 : (options && options.duration ? options.duration : 5000),
        panelClass: options && options.panelClass ?
          (options.panelClass instanceof Array ?
            ['mycloud-theme', options.panelClass.join(' ')] : ['mycloud-theme', options.panelClass])
          : ['mycloud-theme']
      }
    );
    return newNotification;
  }
}
