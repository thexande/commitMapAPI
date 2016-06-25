angular.module('commitMap.services', [])
.factory('userFactory', function($http, localStorageService){
  return{
    // local storage methods
    getFromLocalStorage: (key) => {
      return localStorageService.get(key)
    },
    setToLocalStorage: (key, value) => {
      return localStorageService.set(key, value)
    },
    // user variables
    profileData : {},
    reposFromGithubData : {},
    repoData : {},
    webHookData : {},
    getReposFromGitHub : (passedToken) => {
      return $http({
        url: '/getReposFromGitHub',
        method: "POST",
        data: {token: passedToken}
      })
    },
    getAvailableUserRepos : (passedToken) => {
      return $http({
        url: '/userAvailableRepos',
        method: "GET",
        params: {access_token: passedToken}
      })
    },
    // setAvailableUserRepos : (repoId) => {
    //   return $http({
    //     url: '/getReposFromGitHub',
    //     method: "POST",
    //     data: {
    //       access_token: this.getFromLocalStorage('bearer_token'),
    //       selected_repo_id : repoId
    //     }
    //   })
    // },

    // watched user repo methods
    getWatchedUserRepos : (passedToken) => {
      return $http({
        url: '/userWatchedRepos',
        method: "GET",
        params: {access_token: passedToken}
      })
    },
    addToWatchedUserRepos : (repo) => {
      return $http({
        url: '/userWatchedRepos',
        method: "POST",
        data: {
          access_token: localStorageService.get('bearer_token'),
          selected_repo : repo
        }
      })
    },
    removeFromWatchedUserRepos : (repo) => {
      return $http({
        url: '/removeFromWatchedUserRepos',
        method: "POST",
        data: {
          access_token: localStorageService.get('bearer_token'),
          selected_repo: repo
        }
      })
    },



    getUserWithToken : (token) => {
      $http.defaults.headers.get = {'authorization': ''}
      $http.defaults.headers.get = {'Authorization': ''}
      // fetch profile data and store in factory.
      return $http({
        url: '/userData',
        method: "GET",
        headers: {
          Accept: "*/*",
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {access_token: token},
      })
    }
  }
})
