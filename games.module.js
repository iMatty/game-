angular.module("games", ["ngRoute", "loadingIcon", "firebaseuiAuth", "observed", "datatables", "gamesTable", "gameDetailsFetcher"])
	.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix("");
        $routeProvider
            .when("/", {
                templateUrl: "" //"<x-search></x-search>"
            })
			.when("/profile", {
                templateUrl: "" //"<x-profile></x-profile>"
            })
            .otherwise({
                redirectTo: "/"
            });
    }])
	.run(["$rootScope", "auth", "observedList", function($rootScope, auth, observedList) {
		$rootScope.user = {
			auth: auth,
			observedList: observedList
		};
	}])
	.controller("tableCtrl", function ($scope, $http, $q, $timeout, $filter, gameDetailsFetcher) {
        $scope.gameDetFetch = new gameDetailsFetcher();

        $scope.$watch("search", function(searchTerm) {
            if(searchTerm.length >= 3)
                $scope.gameDetFetch.fetchBySearchTerm(searchTerm);
        });
	});