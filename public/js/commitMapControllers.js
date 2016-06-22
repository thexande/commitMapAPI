angular.module('commitMap.controllers', [])

  .controller('dashController', function($scope, $http, $auth,  userFactory){
    console.log("in dash controller")
    $scope.profileData = userFactory.getFromLocalStorage('userProfile')
    console.log($scope.profileData);
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
          userFactory.getUserWithToken(response.data.token.access_token)
          .then((response2) => {
            console.log(response2);
            userFactory.setToLocalStorage('userProfile', response2.data)
            // get repo data and store in factory
            userFactory.getAvailableUserRepos(response.data.token.access_token)
              .catch((e) => {console.log(e)})
              .then((res) => {
                console.log(res)
                userFactory.setToLocalStorage('currentReposFromGithub', res.data)
              })
            // load user dash home
            $state.transitionTo('dash.home')
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
  .controller('repoSelectController', function($scope, $http, $state, userFactory){
    // github api call to get repos.
    $scope.reposFromGithubData = userFactory.getFromLocalStorage('currentReposFromGithub')
    console.log($scope.reposFromGithubData);


    // set up data for ng-repeat in tables.

  })
