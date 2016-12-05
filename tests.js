"use strict";

angular.module("mks-calculation", ["ngStorage"]).controller("mks-calculation-controller", function($scope, $http, $localStorage, $sessionStorage) {
	loadData($scope, $http, $localStorage);
});
