import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';
// import { buildInfo } from 'projects/public/src/build';
// import { fadeInOutAnimation } from 'projects/lib-mycloud/src/lib/shared/animations/animations';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);

  fillerContent = Array.from({length: 50}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

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
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {
    // this.buildInfo = buildInfo;

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
    swUpdate.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);

      this.notificationService.sendNotification('New version available. Load New Version?', 'OK', {
        duration: 0,
      })
        .onAction().subscribe(() => {
          window.location.reload();
        });
    });

    swUpdate.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });

    /* iOS specific - HAS TO BE TESTED */
    // See https://itnext.io/part-1-building-a-progressive-web-application-pwa-with-angular-material-and-aws-amplify-5c741c957259
    // Detects if device is on iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test( userAgent );
    };
    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in (window as any).navigator) && ((window as any).navigator.standalone);

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
      this.snackBar.openFromComponent(IosInstallComponent, {
        duration: 0,
        horizontalPosition: 'start',
        panelClass: ['mat-elevation-z3']
      });
    }
    /* iOS specific */
  }

  public onIndexChange(index: number): void {
    console.log('Swiper index: ', index);
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
