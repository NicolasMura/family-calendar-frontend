// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/**
 * Environment used to develop application and access to the backend on dev remote
 */
// const appVersion = 'local';
// const apiVersion = '2.1';
const apiPath      = '/v1';
// const apiPath      = '/rest/api/v1';
// const apiPathAdmin = '/admin' + apiPath;
// const apiPathPublic = '/public' + apiPath;

export const environment = {
  production: (window as any)['__env']['production'],
  bob: (window as any)['__env']['bob'] || 'marley',
  // hmr: true,
  // envName: 'local',
  // appVersion,
  // buildVersion: 'dev local',
  // docApiUrl : '/swagger-ui.html',
  // logsApiUrl: '/api/logs',
  // enabledCache: false, // enable cache management (application + localStorage)
  serviceWorkerScript: (window as any)['__env']['serviceWorkerScript'] || 'sw-sync.js',

  wsEndpoint: (window as any)['__env']['wsEndpoint'] || 'ws://localhost:3000',
  backendApi: {
    baseUrlAuth:          (window as any)['__env']['backendApi']['baseUrlAuth'] || 'http://localhost:3000/auth',
    baseUrlUser:          (window as any)['__env']['backendApi']['baseUrlUser'] || 'http://localhost:3000' + apiPath + '/users',
    baseUrlCalendarEvent: (window as any)['__env']['backendApi']['baseUrlCalendarEvent'] || 'http://localhost:3000' + apiPath + '/events',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
