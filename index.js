"use strict";

angular.module("mks-calculation", ["ngStorage", "dndLists"]).controller("mks-calculation-controller", function($scope, $http, $localStorage, $sessionStorage) {
	loadData($scope, $http, $localStorage);
	
	$scope.baseParts = [];
	
	$scope.dropPart = function(index, item) {
		console.log("Dropped", index, item);
		
		$scope.baseParts.splice(index, 0, item);
		
		return true;
	}
});
