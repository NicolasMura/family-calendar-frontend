/**
 * Environment used to develop application and access to the backend on dev remote
 */
// const appVersion = 'prod';
// const apiVersion = '2.1';
const apiPath      = '/rest/api/v1';
// const apiPathAdmin = '/admin' + apiPath;
// const apiPathPublic = '/public' + apiPath;

export const environment = {
  production: true,
  // hmr: false,
  // envName: 'prod',
  // appVersion,
  // buildVersion: '0.0.1',
  // docApiUrl : '/swagger-ui.html',
  // logsApiUrl: '/api/logs',
  // enabledCache: false, // enable cache management (application + localStorage)
  serviceWorkerScript: 'sw-master.js',

  backendApi: {
    baseUrlAuth:          'https://<@TODO>/auth',
    baseUrlUser:          'https://<@TODO>' + apiPath,
    baseUrlCalendarEvent: 'https://<@TODO>' + apiPath,
  },
};