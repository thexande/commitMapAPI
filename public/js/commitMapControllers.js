angular.module('commitMap.controllers', [])

  .controller('dashController', function($scope, $http, $auth,  userFactory){
    console.log("in dash controller")
    $scope.profileData = userFactory.getProfileData()
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
          // userFactory.getUserWithToken(response.data.token.access_token)
          userFactory.getUserWithToken('72cb79fd4cb424038809074f42a167763739ae58')
          .then((response) => {
            console.log(response);
            userFactory.setProfileData(response.data)
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
    $scope.ProfileData = userFactory.getProfileData()
    console.log($scope.ProfileData);
    userFactory.getReposFromGitHub($scope.ProfileData.bearer_token)
    userFactory.getReposFromGitHub('555b8a025f4b7f5660686559c0f3264add859a8d')
      .catch((e) => {console.log(e)})
      .then((res) => {console.log(res)})



    // datatable initialization
    $('#repoListTable').DataTable({
    "language": {
      "emptyTable": "Add some items to your order!"
    },
    searching: false,
    ordering: false,
    paging: false,
    info: false,
    // "aaData": itemsOrdered.data,
    "aoColumns": [
      { "title": 'Qty', "mDataProp": "qty" },
      { "title": "Food Item", "mDataProp": "name" },
      { "title": "price", "mDataProp": "price" },
      { "title": "type", "mDataProp": "type" }
    ]
  })

  })
