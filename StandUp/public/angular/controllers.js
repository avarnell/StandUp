var standUP = angular.module('standUP', ["ngRoute"])

.controller('homeCtrl', ["$scope", function($scope){
  $scope.working = "Giddy-up"
}])

.controller('signUpCtrl', ['$scope', function($scope){

}])

.config(function ($routeProvider, $locationProvider){
  $routeProvider

  .when('/', {
    templateUrl: '../partials/home.html',
    controller: 'homeCtrl'
  })
  .when('/signup', {
    templateUrl: '../partials/signUp.html',
    controller: 'signUpCtrl'
  })

  $locationProvider.html5Mode(true);
})