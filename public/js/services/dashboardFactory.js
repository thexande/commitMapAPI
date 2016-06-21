angular.module('commitMap.services', [])
.factory('userFactory', function($http){
  return{
    // user variables
    profileData : {},
    repoData : {},
    webHookData : {},
    getReposFromGitHub : (passedToken) => {
      return $http({
        url: '/getReposFromGitHub',
        method: "POST",
        data: {token: passedToken}
      })
    },

    getProfileData: () => {return this.profileData},
    setProfileData: (data) => {this.profileData = data},

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
    },
    test: function(){
      return "woot"
    }
  }
})
