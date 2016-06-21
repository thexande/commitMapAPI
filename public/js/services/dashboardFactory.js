angular.module('commitMap.services', [])
.factory('userFactory', function($http){
  return{
    // user variables
    profileData : {},
    repoData : {},
    webHookData : {},
    getUserWithToken : (token) => {

      // fetch profile data and store in factory.
      $http.defaults.headers.get = {'authorization': ''}
      $http.defaults.headers.get = {'Authorization': ''}

      $http({
        url: '/userData',
        method: "GET",
        headers: {
          Accept: "*/*",
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {access_token: token},
      })
      .catch((e) => {console.log(e)})
      .then((res) => {
        console.log(res);
        this.repoData = res.data
        console.log(this.repoData);
      })

    },
    test: function(){
      return "woot"
    }
  }
})
