// Angular declaration to handle routing.
var commitMap = angular.module('commitMap',
  ['commitMap.controllers', 'commitMap.services', 'ui.router', 'satellizer'])

// attempt at SPA config
commitMap.config(function($stateProvider, $urlRouterProvider, $authProvider) {

  // $urlRouterProvider.otherwise('dashboard')
  // GitHub
  $authProvider.github({
    url: '/auth/github',
    authorizationEndpoint: 'http://localhost:3000/auth/github',
    redirectUri: window.location.origin,
    optionalUrlParams: ['scope'],
    scope: ['user:email'],
    scopeDelimiter: ' ',
    type: '2.0',
    popupOptions: { width: 618, height: 618 }
  });

  $stateProvider
    .state('root', {
      url: '/',
      templateUrl: 'build/root.html'
      // controller: 'loginController'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'build/login.html',
      controller: 'loginController'
    })
    .state('dashboard', {
      url: '/dash',
      templateUrl: 'build/dash.html',
      controller: 'dashController'
    });
});
