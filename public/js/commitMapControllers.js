angular.module('commitMap.controllers', [])

  .controller('dashController', function($scope, $http, $auth){
    console.log("in dash controller");
  })

  .controller('loginController', function($scope, $http, $state, $auth, userFactory){

    // userFactory.getUserWithToken()


    // login controller for github auth
    $scope.GitHubAuth = (provider) => {
      $auth.authenticate(provider)
        .catch((e) => {console.log(e)})
        .then((response) => {
          console.log(response)

          // get user data
          // userFactory.getUserWithToken(response.data.token.access_token)
          userFactory.getUserWithToken('72cb79fd4cb424038809074f42a167763739ae58')
          $state.go('dash')

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
