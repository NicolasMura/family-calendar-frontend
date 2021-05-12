(function(window) {
  window.__env = window.__env || {};

  const apiPath      = '/v1';

  // Environment variables
  window.__env.production = false;
  window.__env.bob = 'bobby';
  window.__env.serviceWorkerScript = 'sw-sync.js';
  window.__env.wsEndpoint = 'ws://localhost:3000';
  window.__env.backendApi = {};
  window.__env.backendApi.baseUrlAuth = 'http://localhost:3000/auth';
  window.__env.backendApi.baseUrlUser = 'http://localhost:3000' + apiPath + '/users';
  window.__env.backendApi.baseUrlCalendarEvent = 'http://localhost:3000' + apiPath + '/events';
})(this);
