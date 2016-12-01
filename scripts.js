angular.module("mks-calculation", []).controller("mks-calculation-controller", ["$scope", "$http", function($scope, $http) {
	config_crawler.set_http($http);
	
	config_crawler.get_version().then((response) => {
		$scope.version = response.VERSION; 
		$scope.ksp_version = response.KSP_VERSION;
		$scope.$apply();
	});
	
	config_crawler.load_configs().then((parts) => {
		$scope.parts = parts;
		$scope.$apply();
	});
}]);