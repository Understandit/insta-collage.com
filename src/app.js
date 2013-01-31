'use strict';

var instaCollage = angular.module('instaCollage', []);
 
instaCollage.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {templateUrl: 'src/partials/login.html', controller: LoginCtrl}).
    when('/access_token=:accessToken', {templateUrl: 'src/partials/setup.html', controller: SetupCtrl}).
    when('/collage/:accessToken/:tag', {templateUrl: 'src/partials/collage.html', controller: CollageCtrl}).
    otherwise({redirectTo: '/'});
}]);

instaCollage.filter('timeago', function() {
  return function(input) {
    return $.timeago(parseInt(input) * 1000);
  }
}); 

function LoginCtrl($scope) {
  $scope.redirect_uri = InstaCollageConfig.redirect_uri;
  $scope.client_id = InstaCollageConfig.client_id;
}

function SetupCtrl($scope, $routeParams, $location) {
  $scope.tag = '';
  $scope.submit = function() {
    $location.path('/collage/' + $routeParams.accessToken + '/' + $scope.tag);
  }
}

function CollageCtrl($scope, $http, $timeout, $location, $routeParams) {
  
  var delay = 5000,
    start_delay = 1000,
    between_delay = 500,
    end_delay = 1000;

  $scope.accessToken = $routeParams.accessToken;
  $scope.tag = $routeParams.tag;
  
  $scope.showSlides = false;
  $scope.activeSlideIndex = null;
  
  function getRandomNumber() {
    return Math.floor((Math.random() * 10)) + 1 ;
  }
  
  function focusOnSlide() {
    $timeout(function(){
      if($scope.instagrams.length > $scope.activeSlideIndex+1) {
	      $scope.instagrams[$scope.activeSlideIndex].z_index+= $scope.activeSlideIndex+1;
        $scope.activeSlideIndex -= 1000;
        $timeout(function(){
          $scope.activeSlideIndex += 1001;
          focusOnSlide();
        }, between_delay);
      } else {
        $scope.showSlides = false;
        $scope.activeSlideIndex = null;
        
        $timeout(function() {
          $scope.instagrams = [];
          getNewData();
        }, end_delay);
        
      }
    }, delay)
  }

  function getNewData() {
    /* $http.get('server.php?tag=' + $scope.tag + '&accessToken=' + $scope.accessToken)*/
    
    var api_endpoint = 'https://api.instagram.com/v1/tags/' + $scope.tag + '/media/recent?access_token=' + $scope.accessToken + '&count=18&callback=JSON_CALLBACK';    
    $http.jsonp(api_endpoint)
      .success(function(response) {
        if (response && response.data)
          $scope.instagrams = response.data;
        if (!$scope.instagrams.length) {
          $timeout(function() {
            getNewData();
          }, 2000);
          console.log('No data given!!');
          return;
        }
    
        // initialize the data set
        for (var i = 0; i < $scope.instagrams.length; i++) {
          $scope.instagrams[i].rotation_index = getRandomNumber();      
          $scope.instagrams[i].size_index = getRandomNumber();     
          $scope.instagrams[i].z_index = 20;
        }

        $timeout(function() {
          $scope.showSlides = true;
            var instagram = $scope.instagrams[0];
            // set focus on delay
            $timeout(function() {
              $scope.activeSlideIndex = 0;
              focusOnSlide();
            }, start_delay);       
          }, 1000);
    
        }) // end success method
        .error(function() {
          /*$timeout(function() {
            getNewData();
          }, 10000);*/
          console.log('Error!!');
        }); 
  }
  
  $scope.instagrams = [];
  getNewData();
} 
