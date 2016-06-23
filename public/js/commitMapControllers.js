angular.module('commitMap.controllers', [])

  .controller('dashController', function($scope, $http, $auth,  userFactory){
    console.log("in dash controller")
    $scope.profileData = userFactory.getFromLocalStorage('userProfile')
    console.log($scope.profileData);
  })

  .controller('loginController', function($scope, $http, $state, $auth, userFactory){
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
            userFactory.setToLocalStorage('bearer_token', response2.data.bearer_token)
            // get available repo data and store in factory
            userFactory.getAvailableUserRepos(response.data.token.access_token)
              .catch((e) => {console.log(e)})
              .then((res) => {
                console.log(res)
                // assign scope var for available repo ids
                $scope.availableUserRepoIds = res.data.split(',')
                userFactory.setToLocalStorage('availableUserRepoIds', $scope.availableUserRepoIds)
                // get Latest repos from github
              })
              // get user watching repos
              userFactory.getWatchedUserRepos(response.data.token.access_token)
                .then((res) => {
                  // console.log(res.data.selected_repos.split(','));
                  var sanitizedRepoList
                  res.data.selected_repos == undefined || null ? sanitizedRepoList = '' : sanitizedRepoList = res.data.selected_repos.split(',')
                  userFactory.setToLocalStorage('watchingUserRepoIds', sanitizedRepoList)
                })
              userFactory.getReposFromGitHub(response.data.token.access_token).then((res) => {
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
    $scope.availableUserRepoIds = userFactory.getFromLocalStorage('availableUserRepoIds')
    $scope.watchingUserRepoIds = userFactory.getFromLocalStorage('watchingUserRepoIds')
    console.log($scope.availableUserRepoIds);
    // add repo to watch with api call
    $scope.addRepoToWatch = (repoId) => {
      userFactory.setWatchedUserRepos(repoId)
      .then((res) => {
        // console.log("RES HERE @@@@@@@@@@@@@@@@@@@@@@@@@");
        // console.log(res);
        // now update user watching repos.


        userFactory.getWatchedUserRepos(userFactory.getFromLocalStorage('bearer_token'))
        .then((res) => {
          $scope.watchingUserRepoIds = res.data.selected_repos.split(',')
        }).then(()=> {
          // after update, reload availableUserRepoIds
          userFactory.getAvailableUserRepos(userFactory.getFromLocalStorage('bearer_token'))
          .then((res) => {
            $scope.availableUserRepoIds = res.data.split(',')
          })
        })





      })

      console.log(repoId);
    }


    // set up data for ng-repeat in tables.

  })
