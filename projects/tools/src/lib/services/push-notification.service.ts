import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalStorage } from 'ngx-webstorage';
import { GlobalService } from './global-service.service';
import { UserService } from './user.service';
import { ErrorHandlingService } from 'projects/tools/src/lib/services/error-handling.service';
import { NotificationService } from 'projects/tools/src/lib/services/notification.service';


/**
 * Push Notifications Service
 * Providing user permission, user susbscription management and display notification utilities
 */
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService extends GlobalService {
  // protected baseUrlAuth = environment.backendApi.baseUrlAuth;

  /**
   * Store token in local storage, allowing to retrieve credentials when application starts
   */
  @LocalStorage('notificationPermissionAlreadyAsked') private notificationPermissionAlreadyAsked!: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private userService: UserService,
    protected notificationService: NotificationService,
    protected errorHandlingService: ErrorHandlingService
  ) {
    super(errorHandlingService);

    console.log(this.notificationPermissionAlreadyAsked);
    if (!this.notificationPermissionAlreadyAsked) {
      this.askForNotificationPermission();
    }

    // TESTS Firebase
    fetch('https://pwagram-44b72.firebaseio.com/subscriptions.json')
      .then((res: any) => {
        if (res.ok) {
          res.json().then((subscriptions: any) => {
            // console.log(subscriptions);
            for (const subscription in subscriptions) {
              if (subscriptions.hasOwnProperty(subscription)) {
                console.log(subscriptions[subscription]);
              }
            }
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  public askForNotificationPermission(): void {
    // test 'Notification' in window for iOS devices
    if (!('serviceWorker' in navigator && 'Notification' in window)) {
      console.log('No support for serviceWorker / Notification, too bad...');
      return;
    }

    Notification.requestPermission((result) => {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else {
        this.configurePushSub();
        console.log('Notification permission granted!');
      }
      this.notificationPermissionAlreadyAsked = true;
    });
  }

  public configurePushSub(): void {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    console.log('configuring Push Subscription...');
    let reg: ServiceWorkerRegistration;
    navigator.serviceWorker.ready
      .then((swReg: ServiceWorkerRegistration) => {
        reg = swReg;
        return swReg.pushManager.getSubscription();
      })
      .then((pushSubscription: PushSubscription | null) => {
        console.log(pushSubscription);
        if (pushSubscription === null) {
          // Create a new subscription
          const vapidPublicKey = 'BHt5Vvq_7jdl0flnWQTe7-gDVZLSuK862a8qy9eoAjzjAjL911ko5LllzW3DTiN5kqczdLoOAnJOIiQ7O-DIvxE';
          const convertedVapidPublicKey = this.urlBase64ToUint8Array(vapidPublicKey);
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          });
        } else {
          // We have a subscription (et elle doit être enregistrée sur Firebase, sinon on est bloqué :)
          return null;
        }
      })
      .then((newSub: PushSubscription | null) => {
        console.log(newSub);
        return fetch('https://pwagram-44b72.firebaseio.com/subscriptions.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(newSub)
        });
      })
      .then((response: Response) => {
        if (response.ok) {
          this.displayConfirmNotification();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public displayConfirmNotification(): void {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const options = {
        body: 'You successfully subscribed to our Notification service!',
        data: {
          url: '/settings'
        },
        icon: '/assets/icons/icon-96x96.png',
        image: '/assets/icons/icon-96x96.png',
        // dir: 'ltr',
        lang: 'en-US', // BCP 47,
        vibrate: [100, 50, 200],
        badge: '/assets/icons/icon-96x96.png',
        tag: 'confirm-notification',
        renotify: true,
        actions: [
          { action: 'confirm', title: 'Okay', icon: '/assets/icons/icon-96x96.png' },
          { action: 'cancel', title: 'Cancel', icon: '/assets/icons/icon-96x96.png' }
        ]
      };

      navigator.serviceWorker.ready
        .then((swReg: ServiceWorkerRegistration) => {
          swReg.showNotification('Successfully subscribed!', options);
        });
    }
  }
}
