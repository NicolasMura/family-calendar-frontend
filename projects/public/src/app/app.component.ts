import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { skip } from 'rxjs/operators';
import * as moment from 'moment';
import { CoreConstants } from 'projects/tools/src/lib/core-constants';
import { AuthService } from 'projects/tools/src/lib/services/auth.service';
import { UserService } from 'projects/tools/src/lib/services/user.service';
import { CalendarEventService } from 'projects/tools/src/lib/services/calendar-event.service';
import { PushNotificationService } from 'projects/tools/src/lib/services/push-notification.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
import { WebSocketService } from 'projects/tools/src/lib/services/websocket.service';
import { UtilitiesService } from 'projects/tools/src/lib/services/utilities.service';
import { Observable } from 'rxjs';
import { User } from 'projects/tools/src/lib/models/user.model';
// import { buildInfo } from 'projects/public/src/build';
// import { fadeInOutAnimation } from 'projects/lib-mycloud/src/lib/shared/animations/animations';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {
  /**
   * Observable that gives current user
   */
  currentUser$: Observable<User> = null as any;
  /**
   * Observable that gives current moment
   */
  currentMoment$: Observable<moment.Moment> = null as any;
  /**
   * Current moment
   */
  currentMoment: moment.Moment = null as any;
  /**
   * Current moment
   */
  currentMonth = '';
  /**
   * Current week number
   */
  weekNumber = 0;
  /**
   * IBuildInfo interface and typings
   */
  // interface IBuildInfo {
  //   hash?: string; // Latest commit hash
  //   timestamp?: string; // Timestamp on when the build was made
  //   user?: string; // Current git user
  //   version?: string; // `version` from package.json
  //   jenkinsBuildNumber?: number; // `version` from ${BUILD_ID} Jenkins variable
  //   message?: string; // Custom build message
  // }

  constructor(
    public router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private userService: UserService,
    private calendarEventService: CalendarEventService,
    public pushNotificationService: PushNotificationService,
    private notificationService: NotificationService,
    public webSocketService: WebSocketService,
    private utilitiesService: UtilitiesService
  ) {
    // this.buildInfo = buildInfo;

    // try to lock screen orientation to portrait mode (not supported in Safari & iOS)
    console.log('try to lock screen orientation to portrait mode');
    const screenOrientation = window.screen.orientation;
    console.log(screenOrientation);
    if (screenOrientation) {
      screenOrientation.lock('portrait')
        .then(res => {
          console.log(res);
        })
        .catch(error => console.log(error));
    } else {
      console.log('window.screen.orientation not available... snif...');
      document.addEventListener('orientationchange', (bob) => {
        console.log(bob);
      });
    }

    // use fr locale for moment
    moment.locale('fr');

    // connect to WebSocket Server
    this.webSocketService.connect();

    // console.log(
    //   `\n%cBuild Info:\n\n` +
    //     `%c ❯ Environment: %c${
    //       environment.production ? "production 🏭" : "development 🚧"
    //     }\n` +
    //     `%c ❯ Build Version: ${buildInfo.jenkinsBuildNumber}\n` +
    //     ` ❯ Hash: ${buildInfo.hash}\n` +
    //     // ` ❯ User: ${buildInfo.user}\n` +
    //     ` ❯ Build Timestamp: ${buildInfo.timestamp}\n`,
    //   "font-size: 14px; color: #7c7c7b;",
    //   "font-size: 12px; color: #7c7c7b",
    //   environment.production
    //     ? "font-size: 12px; color: #95c230;"
    //     : "font-size: 12px; color: #e26565;",
    //   "font-size: 12px; color: #7c7c7b"
    // );

    // Service Workers
    this.swUpdate.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);

      this.notificationService.sendNotification('Nouvelle version disponible ! Mettre à jour ?', 'OK')
        .onAction().subscribe(() => {
          window.location.reload();
        });
    });

    this.swUpdate.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });

    /* iOS specific */
    // See https://itnext.io/part-1-building-a-progressive-web-application-pwa-with-angular-material-and-aws-amplify-5c741c957259
    // Checks if should display install popup notification:
    if (this.utilitiesService.isIos() && !this.utilitiesService.isInStandaloneModeiOS()) {
      this.snackBar.openFromComponent(IosInstallComponent, {
        duration: 0,
        horizontalPosition: 'start',
        panelClass: ['mat-elevation-z3']
      });
    }
    /* iOS specific */
  }

  ngOnInit(): void {
    // check if app is in maintenance mode
    this.utilitiesService.isAppInMaintenanceMode().subscribe((inMaintenance: boolean) => {
      if (!inMaintenance) {
        this.authService.checkForExistingToken();
      }
    }, error => {
      console.error(error);
    });

    // subscribe to current user observable
    this.currentUser$ = this.userService.currentUser$;

    // subscribe to current moment observable
    // this.currentMoment$ = this.calendarEventService.currentMoment$;
    this.calendarEventService.currentMoment$
      .pipe(skip(1))
      .subscribe((updatedCurrentMoment: moment.Moment) => {
        this.currentMonth = updatedCurrentMoment.format('MMMM');
        this.weekNumber = updatedCurrentMoment.startOf('week').isoWeek();
      });
  }

  ngAfterViewChecked(): void {
    // To avoid ExpressionChangedAfterItHasBeenCheckedError for currentMonth
    this.changeDetectorRef.detectChanges();
  }

  public logout(): void {
    this.authService.logout();
  }

  public goToToday(): void {
    this.calendarEventService.setCurrentMoment(moment());
  }

  public goToMainCalendar(): void {
    // const navigationExtras: NavigationExtras = {
    //   queryParams: { init_unix_date: this.calendarEventService.getCurrentMoment()?.unix() }
    // };
    this.router.navigate([CoreConstants.routePath.root]);
  }

  public goToSettings(): void {
    this.router.navigate([CoreConstants.routePath.settings]);
  }

  public refreshApp(): void {
    window.location.reload();
  }
}

@Component({
  // selector: 'app-ios-install',
  template: `
    <style>
      :host {
        opacity: 0.8;
      }
      .content {
        margin: 0.5em;
        text-align: center;
      }
      .full-width {
        margin-top: 1em;
        width: 100%;
        text-align: center;
      }
      .link-close {
        color: red;
        font-variant-caps: all-petite-caps;
        font-weight: bold;
      }
      .btn-close {
        position: absolute;
        top: 1em;
        right: 1em;
      }
    </style>
    <div class="content">
      Install this app on your device.
      <br/>Tap the share icon and then <br/><strong>Add to homescreen</strong>.
      <div class="full-width"><mat-icon>arrow_downward</mat-icon></div>
    </div>
    <button class="btn-close" mat-icon-button (click)="close()" aria-label="Close">
      <mat-icon>close</mat-icon>
    </button>
  `
})
export class IosInstallComponent {
  constructor(
    private snackBarRef: MatSnackBarRef<IosInstallComponent>
  ) {}

  close(): void {
    this.snackBarRef.dismiss();
  }
}
