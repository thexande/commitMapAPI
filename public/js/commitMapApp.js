// Angular declaration to handle routing.
var commitMap = angular.module('commitMap',
  ['commitMap.controllers', 'commitMap.services', 'ui.router', 'satellizer'])

// attempt at SPA config
commitMap.config(function($stateProvider, $urlRouterProvider, $authProvider) {

  // $urlRouterProvider.otherwise('dashboard')
  // GitHub
  $authProvider.github({
    url: '/auth/github',
    clientId:'79c1a9391aa406e3f0a5',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    redirectUri: 'http://localhost:3000/#/dash',
    optionalUrlParams: ['scope'],
    scope: ['user:email'],
    scopeDelimiter: ' ',
    type: '2.0',
    popupOptions: { width: 1020, height: 618 }
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
