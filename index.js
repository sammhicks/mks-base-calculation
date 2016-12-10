"use strict";

angular.module("mksCalculation", ["ngStorage", "dndLists"]).controller("mksCalculationController", ["$scope", "$http", "$localStorage", "$sessionStorage", function($scope, $http, $localStorage, $sessionStorage) {
	loadData($scope, $http, $localStorage).then(function() {
		$scope.baseParts = [];
	}, console.error);
}]);
