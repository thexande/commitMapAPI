angular.module('commitMap.services', [])
.factory('userFactory', function($http, localStorageService){
  return{
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
    // setAvailableUserRepos : (passedToken) => {
    //   return $http({
    //     url: '/getReposFromGitHub',
    //     method: "POST",
    //     data: {
    //       access_token: passedToken,
    //       selected_repo_id :
    //     }
    //   })
    // },

    getWatchedUserRepos : (passedToken) => {
      return $http({
        url: '/userWatchedRepos',
        method: "GET",
        params: {access_token: passedToken}
      })
    },
    setWatchedUserRepos : (passedToken, repoId) => {
      return $http({
        url: '/getReposFromGitHub',
        method: "POST",
        data: {
          access_token: passedToken,
          selected_repo_id : repoId
        }
      })
    },

    getFromLocalStorage: (key) => {
      return localStorageService.get(key)
    },
    setToLocalStorage: (key, value) => {
      return localStorageService.set(key, value)
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
