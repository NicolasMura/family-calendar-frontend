import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';


/**
 * Notification Service
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: SimpleSnackBar[] = [];
  // snackBarRef: SimpleSnackBar;
  snackBarRef: any;
  private readonly notification = new BehaviorSubject<string>('');
  readonly notification$: Observable<any> = this.notification.asObservable();

  constructor(private snackBar: MatSnackBar) { }

  sendNotification(
    message: string,
    action?: string | undefined,
    options: MatSnackBarConfig = { duration: 5000 }
  ): MatSnackBarRef<SimpleSnackBar> {
    // console.log('Notifications queue :');
    // console.log(this.notifications);
    if (this.notifications.length > 0) {
      // console.log('Notif à prendre en compte !');
      // console.log(this.notifications.slice(-1)[0].snackBarRef.containerInstance.snackBarConfig.duration);
      // @TODO: queue system...
    }
    this.notification.next(message);
    const newNotification = this.snackBar.open(
      this.notification.getValue(),
      action,
      {
        duration: options.duration ? options.duration : undefined,
        panelClass: options.panelClass ?
          (options.panelClass instanceof Array ? ['mycloud-theme', options.panelClass.join(' ')] : ['mycloud-theme', options.panelClass])
          : ['mycloud-theme']
      }
    );
    this.snackBarRef = newNotification.instance;
    this.notifications.push(this.snackBarRef);
    // console.log('New notification stored (' + message + ') :');
    // console.log(this.notifications);
    return newNotification;
  }

  // @TODO cas important de priorité à gérer : pex sur la modification de souscription :
  // - SubscriptionEditComponent ngOnInit() : if notFoundedOriginProperties.length > 0 => notif error n°1
  // - SubscriptionFormComponent getUpdatedServicePrice() : si price not defined       => notif error n°2
  // il faut que la notif n°2 soit prioritaire car elle bloque le formulaire
}
