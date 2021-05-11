/**
 * Environment used to develop application and access to the backend on dev remote
 */
// const appVersion = 'prod';
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
  serviceWorkerScript: (window as any)['__env']['serviceWorkerScript'] || 'sw-master.js',

  wsEndpoint: (window as any)['__env']['wsEndpoint'] || 'wss://family-calendar.nicolasmura.com',
  backendApi: {
    baseUrlAuth:          (window as any)['__env']['backendApi']['baseUrlAuth'] || 'https://family-calendar.nicolasmura.com/auth',
    baseUrlUser:          (window as any)['__env']['backendApi']['baseUrlUser'] || 'https://family-calendar.nicolasmura.com' + apiPath + '/users',
    baseUrlCalendarEvent: (window as any)['__env']['backendApi']['baseUrlCalendarEvent'] || 'https://family-calendar.nicolasmura.com' + apiPath + '/events',
  },
};
