"use strict";

angular.module("mksCalculation").controller("mksCalculationController", ["$scope", "loadData", "parts", function($scope, loadData, parts) {
	loadData($scope).then(function() {
		$scope.baseParts = [];
		
		$scope.dropPart = function(part) {
			return parts.Part.reconstruct(part);
		}
	}, console.error);
}]);
