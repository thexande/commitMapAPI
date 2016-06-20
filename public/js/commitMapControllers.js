angular.module('commitMap.controllers', [])
// dashboard controller
  .controller('dashController', function($scope, $http, $auth){
    console.log("in dash controller");
    $scope.logTest = () => {console.log("controllerConnected")}
  })
  .controller('loginController', function($scope, $http, $state, $auth){
    console.log("in login controller");
    // login controller for github auth
    $scope.GitHubAuth = (provider) => {
      console.log("authenticateing")

      $auth.authenticate(provider)
        .then((response) => {
          console.log("success");
          console.log(response);
        })
    }


    // login controller for local auth
    // $scope.localAuth = () => {
    //   // enable loading modal
    //   $http.post('http://localhost:3000/localAuth', $scope.loginData)
    //     .catch((e) => {console.log('error authentcating:' + e)})
    //     .then((result) => {
    //       // disable loading modal
    //       // store user data in factory for later access
    //       // go to dash state
    //       $scope.go('dash')
    //     })
    // }
  })
