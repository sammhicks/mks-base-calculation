"use strict";

angular.module("mksCalculation").controller("mksCalculationController", ["$scope", "loadData", function($scope, loadData) {
	loadData($scope).then(function() {
		$scope.baseParts = [];
	}, console.error);
}]);
