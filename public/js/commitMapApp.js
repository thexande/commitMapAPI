// Angular declaration to handle routing.
var commitMap = angular.module('commitMap',
  ['commitMap.controllers', 'commitMap.services', 'ui.router'])

// attempt at SPA config
commitMap.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'views/login'
    })
    .state('dashboard', {
      url: '/dash',
      templateUrl: 'views/dash'
    })
})
