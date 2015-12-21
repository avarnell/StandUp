var standUP = angular.module('standUP', ["ngRoute"])

.controller('homeCtrl', ["$scope", function($scope){
  $scope.working = "Giddy-up"
}])

.config(function ($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: '../partials/home.html',
    controller: 'homeCtrl'
  })

  $locationProvider.html5Mode(true);
})