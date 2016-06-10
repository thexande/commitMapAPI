angular.module('commitMap.controllers', [])
// dashboard controller
  .controller('dashController', function($scope, $http){
    $scope.logTest = () => {console.log("controllerConnected")}
  })
  .controller('loginController', function($scope, $http, $state){
    // $scope.logTest = () => {console.log("controllerConnected")}
    $scope.stateTest = () => { $state.go('dashboard') }
  })

console.log("in controller");
