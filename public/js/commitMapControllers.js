angular.module('commitMap.controllers', [])
// dashboard controller
  .controller('dashController', function($scope, $http, $auth){
    console.log("in dash controller");
    $scope.logTest = () => {console.log("controllerConnected")}
  })
  .controller('loginController', function($scope, $http, $state, $auth, $httpParamSerializerJQLike){
    console.log("in login controller");
    // login controller for github auth
    $scope.GitHubAuth = (provider) => {
      $auth.authenticate(provider)
        .catch((e) => {console.log(e)})
        .then((response) => {
          console.log(response);
          // fetch profile data and store in factory.
          $http({
            url: '/userData',
            method: "GET",
            headers: {
              Accept: "*/*",
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            paramSerializer: '$httpParamSerializerJQLike',
            params: {access_token: '7fd2cbb5c818e85186e8fe01d4b5bf859db9a057'},
          })
          .catch((e) => {console.log(e)})
          .then((res) => {
            console.log(res);
          })
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
