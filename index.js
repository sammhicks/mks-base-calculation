"use strict";

angular.module("mksCalculation", ["ngStorage", "dndLists"]).controller("mksCalculationController", function($scope, $http, $localStorage, $sessionStorage) {
	loadData($scope, $http, $localStorage).then(function() {
		$scope.baseParts = [];
	}, console.error);
});
