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
